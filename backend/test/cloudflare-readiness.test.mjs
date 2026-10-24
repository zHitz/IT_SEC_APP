import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,dirname,basename} from 'node:path';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {validateReadiness} from '../../collectors/cloudflare/readiness.mjs';
const config=()=>({synthetic:false,baseUrl:'https://api.cloudflare.com/client/v4',zoneIds:['00000000000000000000000000000001'],knownCidrs:['192.0.2.0/24','2001:db8:1::/48'],cidrVersion:'synthetic-readiness-v3',intervalMs:60000,rawDirectory:'var/unused-readiness-test',environment:'synthetic-readiness-test'});
test('readiness fails closed for missing token/zone/CIDR and invalid real configuration',()=>{
 for(const[change,token,code]of [[{zoneIds:[]},'fixture-only-marker','ZONE_IDS_REQUIRED'],[{knownCidrs:[]},'fixture-only-marker','KNOWN_CIDRS_REQUIRED'],[{},'', 'CLOUDFLARE_API_TOKEN_REQUIRED'],[{baseUrl:'https://other.example.test/client/v4'},'fixture-only-marker','REAL_CONFIG_REQUIRED'],[{knownCidrs:['192.0.2.1/24']},'fixture-only-marker','CONFIG_CIDR_HOST_BITS'],[{knownCidrs:['2001:db8:1::1/48']},'fixture-only-marker','CONFIG_CIDR_HOST_BITS'],[{token:'must-not-be-in-config'},'fixture-only-marker','READINESS_CONFIG_KEYS']])assert.throws(()=>validateReadiness({...config(),...change},{mode:'check',token}),e=>e.code===code);
 assert.equal(validateReadiness(config(),{mode:'dry-run'}).credentialPresenceChecked,false);
});
test('standalone preflight and actual worker dry-run/check never attempt network or DB',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'atlas-readiness-'));
 try{
  const file=join(directory,'config.json');await writeFile(file,JSON.stringify(config()));
  const env={...process.env,CLOUDFLARE_CONFIG:file,CLOUDFLARE_API_TOKEN:'',DATABASE_URL:'deliberately-not-a-database-url'};
  for(const[entry,args]of [['collectors/cloudflare/preflight.mjs',['--dry-run']],['collectors/cloudflare/main.mjs',['--dry-run']]]){
   const result=spawnSync(process.execPath,['--import',pathToFileURL(resolve('backend/test/support/network-sentinel.mjs')).href,entry,...args],{env,encoding:'utf8',timeout:10000,windowsHide:true});
   assert.equal(result.status,0,result.stderr);const lines=result.stdout.trim().split('\n').map(JSON.parse);
   assert.ok(lines.some(line=>line.event==='cloudflare_readiness'&&line.status==='pass'&&line.networkRequests===0));
   assert.ok(lines.some(line=>line.event==='network_sentinel'&&line.attempts===0));
   console.log('READINESS_NO_NETWORK',JSON.stringify({entry,mode:args[0],status:result.status,audit:lines}));
  }
  for(const token of ['', 'synthetic-readiness-test-not-real']){
   const result=spawnSync(process.execPath,['--import',pathToFileURL(resolve('backend/test/support/network-sentinel.mjs')).href,'collectors/cloudflare/preflight.mjs','--check'],{env:{...env,CLOUDFLARE_API_TOKEN:token},encoding:'utf8',timeout:10000,windowsHide:true});
   assert.equal(result.status,token?0:1);assert.match(result.stdout,/"attempts":0/);if(token)assert.ok(!result.stdout.includes(token));
   console.log('READINESS_CREDENTIAL_CHECK',JSON.stringify({hasToken:!!token,status:result.status,networkAttempts:0,error:token?null:JSON.parse(result.stderr.trim()).code}));
  }
  for(const [change,code] of [[{zoneIds:[]},'ZONE_IDS_REQUIRED'],[{knownCidrs:[]},'KNOWN_CIDRS_REQUIRED']]){
   await writeFile(file,JSON.stringify({...config(),...change}));
   const result=spawnSync(process.execPath,['--import',pathToFileURL(resolve('backend/test/support/network-sentinel.mjs')).href,'collectors/cloudflare/preflight.mjs','--check'],{env:{...env,CLOUDFLARE_API_TOKEN:'synthetic-readiness-test-not-real'},encoding:'utf8',timeout:10000,windowsHide:true});
   assert.equal(result.status,1);assert.equal(JSON.parse(result.stderr.trim()).code,code);assert.match(result.stdout,/"attempts":0/);
   console.log('READINESS_INPUT_REJECTED',JSON.stringify({code,status:result.status,networkAttempts:0}));
  }
  const template=JSON.parse(await readFile('collectors/cloudflare/config.real.example.json','utf8'));assert.deepEqual(template.zoneIds,[]);assert.deepEqual(template.knownCidrs,[]);
 }finally{if(dirname(resolve(directory))!==resolve(tmpdir())||!basename(directory).startsWith('atlas-readiness-'))throw Error('UNSAFE_TEMP_CLEANUP');await rm(directory,{recursive:true,force:true});}
});
