import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {validateOsqueryConfig,inspectNative} from '../../collectors/osquery/native-readiness.mjs';
test('both native osquery configs validate strictly; unsafe view/options/content fail closed',async()=>{
 for(const ecosystem of ['deb','rpm']){
  const config=JSON.parse(await readFile(`collectors/osquery/osquery.${ecosystem}.conf`,'utf8'));
  assert.equal(validateOsqueryConfig(config,ecosystem).logicalTableCount,6);
  for(const changed of [{...config,extra:{}},{...config,options:{disable_events:'false'}},{...config,views:{packages:'SELECT * FROM processes'}},{...config,views:{packages:config.views.packages+'; SELECT cmdline FROM processes'}}])assert.throws(()=>validateOsqueryConfig(changed,ecosystem));
 }
});
test('native availability never pretends execution and current-platform CLI is network-free',async()=>{
 let inspected=0;
 const windows=await inspectNative({platform:'win32',fileCheck:async()=>{inspected++;}});assert.equal(windows.status,'NATIVE_NOT_AVAILABLE');assert.equal(inspected,0);
 const missing=await inspectNative({platform:'linux',fileCheck:async()=>{throw Error('synthetic missing');}});assert.equal(missing.status,'NATIVE_NOT_AVAILABLE');
 const candidate=await inspectNative({platform:'linux',fileCheck:async()=>{}});assert.equal(candidate.status,'NATIVE_CANDIDATE_PRESENT');assert.equal(candidate.nativeExecuted,false);
 const child=spawnSync(process.execPath,['--import',pathToFileURL(resolve('backend/test/support/network-sentinel.mjs')).href,'collectors/osquery/native-readiness.mjs'],{encoding:'utf8',timeout:10000,windowsHide:true});
 const output=child.stdout.trim().split('\n').map(JSON.parse);const report=output.find(item=>item.event==='osquery_native_readiness');
 assert.equal(child.status,report.status==='NATIVE_NOT_AVAILABLE'?2:0);assert.equal(report.binaryExecuted,false);assert.equal(report.tokenRead,false);assert.equal(report.networkRequests,0);assert.ok(output.some(item=>item.event==='network_sentinel'&&item.attempts===0));
 console.log('NATIVE_READINESS_ACTUAL',JSON.stringify({exitCode:child.status,report,audit:output.find(item=>item.event==='network_sentinel')}));
});
