import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {generateKeyPair,exportJWK,SignJWT} from 'jose';
import {createInventoryAuthorizer} from '../src/auth/oidc.mjs';

test('synthetic OIDC verifier uses configured HTTP JWKS and denies missing token and unsupported role',async()=>{
 const {publicKey,privateKey}=await generateKeyPair('RS256');const jwk={...await exportJWK(publicKey),kid:'synthetic-key',alg:'RS256',use:'sig'};let gets=0;
 const fixture=createServer((req,res)=>{gets++;assert.equal(req.url,'/jwks');res.setHeader('Content-Type','application/json');res.end(JSON.stringify({keys:[jwk]}));});
 await new Promise(resolve=>fixture.listen(0,'127.0.0.1',resolve));const issuer=`http://127.0.0.1:${fixture.address().port}`;
 try{
  const authorize=createInventoryAuthorizer({issuer,audience:'synthetic-inventory',jwksUri:issuer+'/jwks',algorithm:'RS256'});
  const sign=role=>new SignJWT({realm_access:{roles:[role]}}).setProtectedHeader({alg:'RS256',kid:'synthetic-key',typ:'at+jwt'}).setIssuer(issuer).setAudience('synthetic-inventory').setSubject('synthetic-user').setIssuedAt().setExpirationTime('5m').sign(privateKey);
  await assert.rejects(authorize({headers:{}}),e=>e.status===401);
  assert.deepEqual(await authorize({headers:{authorization:'Bearer '+await sign('Viewer')}}),{subject:'synthetic-user'});
  await assert.rejects(authorize({headers:{authorization:'Bearer '+await sign('Service Owner')}}),e=>e.status===403);
  assert.equal(gets,1);console.log('OIDC_INITIAL_PROOF',JSON.stringify({synthetic:true,jwksGets:gets,validViewer:true,missing401:true,serviceOwner403:true}));
 }finally{await new Promise(resolve=>fixture.close(resolve));}
});
