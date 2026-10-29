import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { DurableQueue } from '../../collectors/osquery/queue.mjs';
const batch = () => ({ batch_id: randomUUID(), collected_at: new Date().toISOString(), host: {hostname:'synthetic.test',host_uuid:'synthetic-queue',os:'Synthetic Linux',os_version:'1'}, packages:[],listening_ports:[],process_evidence:{non_listening_count:0,records:[]} });
test('enqueue survives acknowledged flush between enumeration and capacity stat without losing new batch', async () => {
 const directory=await mkdtemp(join(tmpdir(),'atlas-queue-race-'));
 const seen=[];
 const server=createServer(async(req,res)=>{let body='';for await(const chunk of req)body+=chunk;const value=JSON.parse(body);seen.push(value.batch_id);res.setHeader('Content-Type','application/json');res.end(JSON.stringify({accepted:true,batch_id:value.batch_id}));});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const options={endpoint:`http://127.0.0.1:${server.address().port}/api/v1/ingest/osquery`,token:'synthetic-queue-marker',attempts:1};
 class OrderedQueue extends DurableQueue {
  async files(){const snapshot=await super.files();if(this.flushAfterEnumeration){this.flushAfterEnumeration=false;assert.equal((await this.flush(options)).pending,0);}return snapshot;}
 }
 const q=new OrderedQueue({directory});const old=batch(),fresh=batch();
 try{
  await q.enqueue(old);q.flushAfterEnumeration=true;
  await q.enqueue(fresh);
  const pending=await q.files();assert.equal(pending.length,1);assert.equal(JSON.parse(await readFile(join(directory,pending[0]),'utf8')).batch_id,fresh.batch_id);assert.deepEqual(seen,[old.batch_id]);
  assert.equal((await q.flush(options)).pending,0);assert.deepEqual(seen,[old.batch_id,fresh.batch_id]);
  q.maxBytes=1;await assert.rejects(q.enqueue(batch()),/QUEUE_FULL_BACKPRESSURE/);assert.equal((await q.files()).length,0);
 }finally{await new Promise(resolve=>server.close(resolve));await rm(directory,{recursive:true,force:true});}
});
