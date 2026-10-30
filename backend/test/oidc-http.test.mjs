import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {generateKeyPair,exportJWK,SignJWT,UnsecuredJWT} from 'jose';
import {createApp} from '../src/app.mjs';
import {createInventoryAuthorizer,inventoryReadRoles} from '../src/auth/oidc.mjs';
import {createOsqueryRoute} from '../src/ingest/osquery-route.mjs';

test('HTTP inventory enforces signed access tokens and deny-by-default roles without leaking credentials',async()=>{
 const pair=await generateKeyPair('RS256'),wrong=await generateKeyPair('RS256');let jwksGets=0,reads=0;
 const key={...await exportJWK(pair.publicKey),kid:'synthetic-main',alg:'RS256',use:'sig'};
 const provider=createServer((req,res)=>{jwksGets++;assert.equal(req.url,'/jwks');res.setHeader('Content-Type','application/json');res.end(JSON.stringify({keys:[key]}));});
 await new Promise(r=>provider.listen(0,'127.0.0.1',r));const issuer=`http://127.0.0.1:${provider.address().port}`;
 const authorize=createInventoryAuthorizer({issuer,audience:'inventory-lab',algorithm:'RS256',jwksUri:issuer+'/jwks'});
 const collector='synthetic-collector-only-marker';
 const ingest=createOsqueryRoute({tokens:{'synthetic-host':collector},store:async()=>{throw Error('must not write');},log:()=>{}});
 const app=createApp({authorizeInventory:authorize,readInventory:async()=>{reads++;return {data:[{hostname:'synthetic.test'}]};},readExactInventory:async()=>{reads++;return {data:{hostname:'synthetic.test'}};},ingestOsquery:ingest});
 await new Promise(r=>app.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${app.address().port}`;
 const now=Math.floor(Date.now()/1000);
 const sign=(overrides={},header={},privateKey=pair.privateKey)=>new SignJWT({iss:issuer,aud:'inventory-lab',sub:'synthetic-user',iat:now,exp:now+300,realm_access:{roles:['Viewer']},...overrides}).setProtectedHeader({alg:'RS256',kid:'synthetic-main',typ:'at+jwt',...header}).sign(privateKey);
 const request=async(token,path='/api/v1/inventory/hosts')=>{const response=await fetch(base+path,{headers:token?{authorization:'Bearer '+token}:{}});const body=await response.json();if(token)assert.ok(!JSON.stringify(body).includes(token));assert.ok(!JSON.stringify(body).includes('PRIVATE KEY'));return {response,body};};
 try{
  for(const role of inventoryReadRoles){const {response,body}=await request(await sign({realm_access:{roles:[role]}}));assert.equal(response.status,200);assert.equal(body.data[0].hostname,'synthetic.test');}
  assert.equal((await request(await sign(),'/api/v1/inventory/hosts/synthetic-id')).response.status,200);
  const denied=[['missing',null],['malformed','bad'],['expired',await sign({exp:now-1})],['issuer',await sign({iss:issuer+'/other'})],['audience',await sign({aud:'other'})],['tampered',await sign({}, {},wrong.privateKey)],['unsigned',new UnsecuredJWT({iss:issuer,aud:'inventory-lab'}).encode()],['algorithm-confusion',await new SignJWT({iss:issuer,aud:'inventory-lab'}).setProtectedHeader({alg:'HS256',kid:'synthetic-main',typ:'at+jwt'}).sign(new TextEncoder().encode('synthetic-hmac-marker-long-enough'))],['ID-token-type',await sign({}, {typ:'JWT'})],['collector',collector]];
  for(const [label,token]of denied){const {response,body}=await request(token);assert.equal(response.status,401,label);assert.equal(body.error.code,'UNAUTHORIZED');assert.equal(body.error.request_id,response.headers.get('x-request-id'));assert.ok(!body.data);}
  for(const roles of [undefined,[],['Unmapped'],['Service Owner']]){const {response,body}=await request(await sign({realm_access:roles?{roles}:undefined}));assert.equal(response.status,403);assert.equal(body.error.code,'FORBIDDEN');assert.ok(body.error.request_id);assert.ok(!body.data);}
  const userToken=await sign();const rejected=await fetch(base+'/api/v1/ingest/osquery',{method:'POST',headers:{authorization:'Bearer '+userToken,'content-type':'application/json'},body:'{}'});assert.equal(rejected.status,401);
  assert.equal((await fetch(base+'/health')).status,200);assert.equal(reads,6);assert.equal(jwksGets,1);
  console.log('OIDC_HTTP_PROOF',JSON.stringify({authorization:'[REDACTED]',validRoles:inventoryReadRoles,status200:6,status401:denied.map(([label])=>label),status403:['absent','empty','unmapped','Service Owner'],userIngest401:true,health200:true,jwksGets,fixtureResponse:{data:[{hostname:'synthetic.test'}]}}));
 }finally{await new Promise(r=>app.close(r));await new Promise(r=>provider.close(r));}
});

test('inventory without verifier fails closed while health remains public',async()=>{
 const app=createApp({readInventory:async()=>{throw Error('must not read');}});await new Promise(r=>app.listen(0,'127.0.0.1',r));
 try{const base=`http://127.0.0.1:${app.address().port}`;assert.equal((await fetch(base+'/api/v1/inventory/hosts')).status,401);assert.equal((await fetch(base+'/health')).status,200);}finally{await new Promise(r=>app.close(r));}
});
