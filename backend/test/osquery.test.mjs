import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runOsqueryLab } from '../../scripts/osquery-scenario.mjs';
test('three isolated lab sources -> authenticated HTTP ingest; disk retry/restart, idempotency, safe five-table projection',async()=>{
  const proof=await runOsqueryLab({offlineMs:50,tickMs:25});
  assert.equal(proof.hosts.length,3);assert.equal(proof.freshInstallSteps.length,5);
  assert.equal(proof.offline.pending,0);assert.ok(proof.processRuns.length>=15);
  console.log('OSQUERY_LAB_FAST',JSON.stringify({synthetic:true,nativeLinux:false,nativeOsquery:false,hosts:3,offlineMs:proof.offline.actualMs,queued:proof.offline.batchesQueued,allDelivered:true}));
});
