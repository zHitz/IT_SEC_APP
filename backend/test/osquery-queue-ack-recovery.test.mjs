import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, dirname, basename } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { DurableQueue } from '../../collectors/osquery/queue.mjs';

const batch = at => ({batch_id:randomUUID(),collected_at:at,host:{hostname:'synthetic.test',host_uuid:'synthetic-ack-host',os:'Synthetic Linux',os_version:'1'},packages:[],listening_ports:[],process_evidence:{non_listening_count:0,records:[]}});
const cases = [
 ['wrong batch_id',200,JSON.stringify({accepted:true,batch_id:randomUUID()}),3],
 ['accepted false',200,JSON.stringify({accepted:false}),3],
 ['malformed JSON',200,'{invalid',3],
 ['unauthorized',401,JSON.stringify({error:'synthetic rejection'}),1],
 ['forbidden',403,JSON.stringify({error:'synthetic rejection'}),1]
];
for (const [label,status,reply,expectedRequests] of cases) {
 test(`queue retains FIFO after ${label} and recovers with exact ACK after re-instantiation`,async()=>{
  const directory=await mkdtemp(join(tmpdir(),'atlas-queue-ack-'));
  const requests=[],accepted=[],events=[];let recover=false,waits=0;
  const server=createServer(async(req,res)=>{
   let body='';for await(const chunk of req)body+=chunk;
   const value=JSON.parse(body);requests.push(value.batch_id);
   assert.equal(req.method,'POST');assert.equal(req.url,'/api/v1/ingest/osquery');
   res.setHeader('Content-Type','application/json');
   if(recover){accepted.push(value.batch_id);res.end(JSON.stringify({accepted:true,batch_id:value.batch_id}));}
   else{res.statusCode=status;res.end(reply);}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const options={endpoint:`http://127.0.0.1:${server.address().port}/api/v1/ingest/osquery`,token:'synthetic-ack-marker',attempts:3,wait:async()=>{waits++;},log:event=>events.push(event)};
  try{
   const first=batch('2026-10-30T00:00:00.000Z'),later=batch('2026-10-30T00:00:01.000Z');
   const queue=new DurableQueue({directory});await queue.enqueue(first);await queue.enqueue(later);
   const files=await queue.files();const before=await Promise.all(files.map(file=>readFile(join(directory,file),'utf8')));
   assert.equal((await queue.flush(options)).pending,2);
   assert.deepEqual(requests,Array(expectedRequests).fill(first.batch_id));
   assert.equal(waits,expectedRequests-1);assert.deepEqual(accepted,[]);
   assert.deepEqual(await queue.files(),files);
   assert.deepEqual(await Promise.all(files.map(file=>readFile(join(directory,file),'utf8'))),before);
   if(status>=400)assert.deepEqual(events.map(e=>e.event),['delivery_rejected']);
   const restarted=new DurableQueue({directory});assert.deepEqual(await restarted.files(),files);
   recover=true;
   assert.equal((await restarted.flush(options)).pending,0);
   assert.deepEqual(accepted,[first.batch_id,later.batch_id]);
   assert.deepEqual(requests.slice(expectedRequests),[first.batch_id,later.batch_id]);
   assert.equal((await restarted.flush(options)).pending,0);
   assert.equal(requests.length,expectedRequests+2);
   console.log('QUEUE_ACK_RECOVERY',JSON.stringify({case:label,failedRequests:expectedRequests,retryWaits:waits,retainedUnchanged:2,recoveredExactAcks:2,pending:0}));
  }finally{
   await new Promise(resolve=>server.close(resolve));
   if(dirname(resolve(directory))!==resolve(tmpdir())||!basename(directory).startsWith('atlas-queue-ack-'))throw Error('UNSAFE_TEMP_CLEANUP');
   await rm(directory,{recursive:true,force:true});
  }
 });
}
