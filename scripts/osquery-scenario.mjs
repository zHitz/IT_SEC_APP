import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join, dirname, basename } from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { once } from 'node:events';
import { PGlite } from '@electric-sql/pglite';
import { migrate } from '../backend/db/migrate.mjs';
import { createApp } from '../backend/src/app.mjs';
import { createOsqueryStore } from '../backend/src/ingest/osquery-store.mjs';
import { createOsqueryRoute } from '../backend/src/ingest/osquery-route.mjs';
import { readSource, buildBatches } from '../collectors/osquery/source.mjs';
import { DurableQueue } from '../collectors/osquery/queue.mjs';
import { queries, excluded } from '../collectors/osquery/queries.mjs';
import { createLabHost, labFingerprint } from '../backend/test/support/osquery-lab.mjs';

const inventorySql = `SELECT h.host_uuid,h.hostname,h.os,h.os_version,h.source,h.first_seen_at,h.last_seen_at,
  h.confidence,count(DISTINCT p.id)::int AS packages,count(DISTINCT l.id)::int AS listening_ports
  FROM asset_inventory.host h LEFT JOIN asset_inventory.package p ON p.source_host_id=h.id
  LEFT JOIN asset_inventory.listening_port l ON l.host_id=h.id GROUP BY h.id ORDER BY h.host_uuid`;

export async function runOsqueryLab({ offlineMs = 100, tickMs = 60000, onProgress = () => {}, evidencePath } = {}) {
  const directory = await mkdtemp(join(tmpdir(),'atlas-osquery-')), db = new PGlite();
  const logs = [], hosts = [], queriesRun = [], processRuns = [];
  let app, online = true;
  try {
    await migrate(db,'up');
    const tokens = {};
    for (let i=1;i<=3;i++) {
      const file = join(directory,`host-${i}.sqlite`), descriptor = createLabHost(file,i);
      tokens[descriptor.uuid] = `synthetic-host-token-${i}`;
      hosts.push({ ...descriptor, file, baseline: await labFingerprint(file), queueDirectory: join(directory,`queue-${i}`) });
    }
    const store = createOsqueryStore({ db, rawDirectory: join(directory,'raw'), environment: 'synthetic-lab' });
    const route = createOsqueryRoute({ store, tokens, log: value => logs.push(value) });
    app = createApp({ ingestOsquery: async request => { if (!online) throw Error('synthetic offline backend'); return route(request); } });
    app.listen(0,'127.0.0.1'); await once(app,'listening');
    const endpoint = `http://127.0.0.1:${app.address().port}/api/v1/ingest/osquery`;
    for (const host of hosts) {
      host.config = { sourceMode:'sqlite-lab', labDatabase:host.file, ecosystem:'deb', endpoint,
        queueDirectory:host.queueDirectory, maxQueueBytes:67108864, maxBatchRows:2,
        collectIntervalMs:60000, sendIntervalMs:15000, queryTimeoutMs:5000, timeoutMs:3000, backoffMs:10, attempts:1 };
      host.configPath = join(directory,`${host.uuid}.json`); await writeFile(host.configPath,JSON.stringify(host.config));
    }
    const child = async (host, mode) => {
      const proc = spawn(process.execPath,['collectors/osquery/main.mjs',mode],{ cwd:resolve('.'),windowsHide:true,
        env:{ ...process.env,OSQUERY_COLLECTOR_CONFIG:host.configPath,OSQUERY_INGEST_TOKEN:tokens[host.uuid] },stdio:['ignore','pipe','pipe'] });
      let stdout='',stderr=''; proc.stdout.on('data',chunk=>{stdout+=chunk;});proc.stderr.on('data',chunk=>{stderr+=chunk;});
      const [code]=await once(proc,'exit');
      processRuns.push({pid:proc.pid,host:host.uuid,mode,code,at:new Date().toISOString()});
      assert.equal(code,0,`collector child failed; mode=${mode}; stderr suppressed`);
      for (const line of stdout.trim().split('\n').filter(Boolean)) logs.push(JSON.parse(line));
    };
    for (const host of hosts) {
      const data = await readSource(host.config,(table,sql)=>queriesRun.push({host:host.uuid,table,sql}));
      const batches = buildBatches(data,host.config);
      assert.ok(!JSON.stringify(batches).includes('FORBIDDEN_SYNTHETIC_CANARY'));
      await child(host,'--collect-once'); await child(host,'--flush-once');
    }
    const before=(await db.query(inventorySql)).rows;
    assert.equal(before.length,3);assert.ok(before.every(h=>h.packages===2&&h.listening_ports===1&&h.source==='osquery'));
    // Begin a REAL duration outage. Collector processes exit/restart every tick;
    // each fresh child must recover the exact disk queue left by its predecessor.
    online=false;const offlineStartedAt=new Date().toISOString(),start=Date.now();
    let cycles=0;
    do {
      for (const host of hosts) { await child(host,'--collect-once'); await child(host,'--flush-once'); }
      cycles++;
      onProgress({event:'offline_cycle',elapsedMs:Date.now()-start,cycles,at:new Date().toISOString()});
      const remaining=offlineMs-(Date.now()-start);if(remaining>0)await sleep(Math.min(tickMs,remaining));
    } while(Date.now()-start<offlineMs);
    const offlineFinishedAt=new Date().toISOString(),actualOfflineMs=Date.now()-start;
    const queueBeforeRestore=[];
    for(const host of hosts) {
      const queue=new DurableQueue({directory:host.queueDirectory});const files=await queue.files();
      assert.equal(files.length,cycles*2);
      for(const file of files) queueBeforeRestore.push(JSON.parse(await readFile(join(host.queueDirectory,file),'utf8')));
    }
    assert.equal(JSON.stringify((await db.query(inventorySql)).rows),JSON.stringify(before));
    online=true;
    for(const host of hosts)await child(host,'--flush-once');
    const after=(await db.query(inventorySql)).rows;
    for(const row of after) {
      const old=before.find(h=>h.host_uuid===row.host_uuid);
      assert.equal(+row.first_seen_at,+old.first_seen_at);assert.ok(+row.last_seen_at>+old.last_seen_at);
      assert.equal(row.packages,2);assert.equal(row.listening_ports,1);
    }
    const accepted=new Set(logs.filter(log=>log.event==='osquery_batch_accepted').map(log=>log.batch_id));
    assert.ok(queueBeforeRestore.every(batch=>accepted.has(batch.batch_id)));
    for(const host of hosts)assert.equal((await new DurableQueue({directory:host.queueDirectory}).files()).length,0);
    // Retry an already acknowledged batch: natural IDs must keep counts/timestamps stable.
    const repeated=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${tokens[queueBeforeRestore[0].host.host_uuid]}`},body:JSON.stringify(queueBeforeRestore[0])});
    assert.equal(repeated.status,200);assert.equal((await db.query(inventorySql)).rows.length,3);
    const pkgRows=(await db.query('SELECT name,version,source,first_seen_at,last_seen_at,confidence FROM asset_inventory.package ORDER BY name')).rows;
    const ports=(await db.query('SELECT port,pid,process,source FROM asset_inventory.listening_port ORDER BY port')).rows;
    assert.equal(pkgRows.length,6);assert.equal(ports.length,3);
    const payloadSample=queueBeforeRestore[0];
    // Five explicit fresh-lab installation/reproduction stages for a fourth host.
    const steps=[];const fourthFile=join(directory,'host-4.sqlite');
    const fourth=createLabHost(fourthFile,4);steps.push({step:1,result:'Created distinct fresh simulator; no agent/queue',host:fourth.hostname});
    const fourthBefore=await labFingerprint(fourthFile);steps.push({step:2,result:'Captured baseline immutable simulated host state',sha256:fourthBefore});
    const fourthConfig={...hosts[0].config,labDatabase:fourthFile,queueDirectory:join(directory,'queue-4')};
    const fourthToken='synthetic-host-token-4';
    // Explicitly create a new API handler registration for fresh-lab enrollment;
    // nothing is exposed externally and no live identity is enrolled.
    const fourthRoute=createOsqueryRoute({store,tokens:{[fourth.uuid]:fourthToken},log:value=>logs.push(value)});
    const fourthApp=createApp({ingestOsquery:fourthRoute});fourthApp.listen(0,'127.0.0.1');await once(fourthApp,'listening');
    try {
      fourthConfig.endpoint=`http://127.0.0.1:${fourthApp.address().port}/api/v1/ingest/osquery`;
      steps.push({step:3,result:'Configured own queue, authenticated test identity, batch/interval limits'});
      const queue=new DurableQueue({directory:fourthConfig.queueDirectory});
      for(const batch of buildBatches(await readSource(fourthConfig),fourthConfig))await queue.enqueue(batch);
      await queue.flush({endpoint:fourthConfig.endpoint,token:fourthToken,attempts:1});
      steps.push({step:4,result:'Ran SELECT-only source, queued and delivered real HTTP batches'});
      const inventory=(await db.query(inventorySql)).rows;assert.equal(inventory.length,4);assert.equal(await labFingerprint(fourthFile),fourthBefore);
      steps.push({step:5,result:'Fresh host appears with2packages/1port; simulated host fingerprint unchanged',inventory:inventory.find(h=>h.host_uuid===fourth.uuid)});
    } finally {fourthApp.closeAllConnections();await new Promise(resolve=>fourthApp.close(resolve));}
    const checklist=[];
    for(const host of hosts) {const final=await labFingerprint(host.file);assert.equal(final,host.baseline);checklist.push({host:host.hostname,type:host.type,before:host.baseline,after:final,unchanged:true,scope:'Entire immutable simulator database, including packages/services/network/firewall/system_config; NOT real Linux state'});}
    const tables=(await db.query("SELECT count(*)::int AS n FROM pg_tables WHERE schemaname='asset_inventory'")).rows[0].n;assert.equal(tables,24);
    const proof={synthetic:true,nativeLinux:false,nativeOsquery:false,environment:'Windows Node24 + three distinct read-only SQLite Linux inventory simulations; real HTTP backend + PostgreSQL17.5 WASM',
      engine:(await db.query('SELECT version() AS version')).rows[0].version,tables,
      hosts:hosts.map(({hostname,uuid,type,os_version})=>({hostname,uuid,type,os_version})),before,after,packages:pkgRows,ports,
      offline:{requestedMs:offlineMs,actualMs:actualOfflineMs,offlineStartedAt,offlineFinishedAt,cycles,batchesQueued:queueBeforeRestore.length,allDelivered:true,pending:0},
      processRuns,queries:queriesRun,excluded,payloadSample,checklist,freshInstallSteps:steps,logs};
    if(evidencePath){await mkdir(dirname(resolve(evidencePath)),{recursive:true});await writeFile(evidencePath,JSON.stringify(proof,null,2)+'\n');}
    return proof;
  } finally {
    if(app){app.closeAllConnections();await new Promise(resolve=>app.close(resolve));}await db.close();
    if(dirname(resolve(directory))!==resolve(tmpdir())||!basename(directory).startsWith('atlas-osquery-'))throw Error('UNSAFE_TEMP_CLEANUP');
    await rm(directory,{recursive:true,force:true});
  }
}
