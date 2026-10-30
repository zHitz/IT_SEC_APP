import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {generateKeyPair,exportJWK,SignJWT} from 'jose';
import {createInventoryAuthorizer} from '../src/auth/oidc.mjs';

test('actual JWKS rotation, unknown key, bounded failure cache and token URL isolation',async t=>{
 const first=await generateKeyPair('RS256'),second=await generateKeyPair('RS256');
 const jwk=async(pair,kid)=>({...await exportJWK(pair.publicKey),kid,alg:'RS256',use:'sig'});
 let keys=[await jwk(first,'old')],failure=false,gets=0,untrustedGets=0;
 const server=createServer((req,res)=>{if(req.url!=='/jwks'){untrustedGets++;res.writeHead(404).end();return;}gets++;if(failure){res.writeHead(503).end();return;}res.setHeader('Content-Type','application/json');res.end(JSON.stringify({keys}));});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const issuer=`http://127.0.0.1:${server.address().port}`;
 const config={issuer,audience:'rotation-lab',algorithm:'RS256',jwksUri:issuer+'/jwks'};
 t.mock.timers.enable({apis:['Date'],now:Date.now()});
 const sign=(pair,kid)=>new SignJWT({realm_access:{roles:['Viewer']}}).setProtectedHeader({alg:'RS256',kid,typ:'at+jwt',jku:issuer+'/untrusted',x5u:issuer+'/untrusted'}).setIssuer(issuer).setAudience('rotation-lab').setSubject('synthetic-rotation').setIssuedAt().setExpirationTime('10m').sign(pair.privateKey);
 const req=async(pair,kid)=>({headers:{authorization:'Bearer '+await sign(pair,kid)}});
 try{
  const authorize=createInventoryAuthorizer(config);await authorize(await req(first,'old'));assert.equal(gets,1);
  keys=[await jwk(second,'new')];await assert.rejects(authorize(await req(second,'new')),e=>e.status===401);assert.equal(gets,1);
  t.mock.timers.tick(30001);await authorize(await req(second,'new'));assert.equal(gets,2);
  await assert.rejects(authorize(await req(first,'old')),e=>e.status===401);assert.equal(gets,2);
  t.mock.timers.tick(60001);failure=true;
  await assert.rejects(authorize(await req(second,'new')),e=>e.status===401);assert.equal(gets,3);
  await assert.rejects(authorize(await req(second,'new')),e=>e.status===401);assert.equal(gets,3);
  t.mock.timers.tick(30001);failure=false;await authorize(await req(second,'new'));assert.equal(gets,4);assert.equal(untrustedGets,0);
  console.log('OIDC_ROTATION_PROOF',JSON.stringify({synthetic:true,clock:'isolated Date mock; no real elapsed claim',jwksGets:gets,rotation:true,unknownKey401:true,expiredCacheProviderFailure401:true,failureCooldown:true,untrustedUrlRequests:untrustedGets}));
 }finally{t.mock.timers.reset();await new Promise(r=>server.close(r));}
});

test('OIDC configuration rejects unsafe URLs, cross-origin JWKS, absent audience and symmetric algorithms',()=>{
 const valid={issuer:'http://127.0.0.1:1234',jwksUri:'http://127.0.0.1:1234/jwks',audience:'lab',algorithm:'RS256'};
 for(const change of [{issuer:undefined},{issuer:'http://example.test'},{jwksUri:'https://other.example.test/jwks'},{jwksUri:'http://user:pass@127.0.0.1:1234/jwks'},{audience:''},{algorithm:'HS256'},{algorithm:'none'}])assert.throws(()=>createInventoryAuthorizer({...valid,...change}),/OIDC_CONFIG/);
});
