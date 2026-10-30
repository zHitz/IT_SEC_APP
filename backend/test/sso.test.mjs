import{test}from'node:test';import assert from'node:assert/strict';import{createServer}from'node:http';import{randomUUID}from'node:crypto';import{generateKeyPair,exportJWK,SignJWT}from'jose';import{calculatePKCECodeChallenge}from'openid-client';import{createApp}from'../src/app.mjs';import{createInventoryAuthorizer}from'../src/auth/oidc.mjs';import{createSso}from'../src/auth/sso.mjs';

test('actual local code+PKCE roundtrip creates opaque session, authorizes inventory and logs out',async()=>{
 const pair=await generateKeyPair('RS256'),publicJwk={...await exportJWK(pair.publicKey),kid:'synthetic-sso',alg:'RS256',use:'sig'},codes=new Map();let callback,issuer,tokenCalls=0,mode='normal',clock=Date.now();
 const provider=createServer(async(req,res)=>{
  const url=new URL(req.url,issuer);res.setHeader('Content-Type','application/json');
  if(url.pathname==='/jwks'){res.end(JSON.stringify({keys:[publicJwk]}));return;}
  if(url.pathname==='/authorize'){
   if(url.searchParams.get('redirect_uri')!==callback||url.searchParams.get('code_challenge_method')!=='S256'){res.writeHead(400).end('{}');return;}
   const code=randomUUID();codes.set(code,{challenge:url.searchParams.get('code_challenge'),nonce:url.searchParams.get('nonce'),mode});const target=new URL(callback);target.searchParams.set('code',code);target.searchParams.set('state',url.searchParams.get('state'));res.writeHead(302,{Location:target.href}).end();return;
  }
  if(url.pathname==='/token'){
   tokenCalls++;let body='';for await(const chunk of req)body+=chunk;const params=new URLSearchParams(body),stored=codes.get(params.get('code'));codes.delete(params.get('code'));
   if(!stored||params.get('redirect_uri')!==callback||await calculatePKCECodeChallenge(params.get('code_verifier')??'')!==stored.challenge){res.writeHead(400).end(JSON.stringify({error:'invalid_grant'}));return;}
   const base={iss:issuer,sub:'synthetic-user',iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+300};const sign=(payload,typ)=>new SignJWT(payload).setProtectedHeader({alg:'RS256',kid:'synthetic-sso',typ}).sign(pair.privateKey);
   res.end(JSON.stringify({token_type:'Bearer',expires_in:300,access_token:await sign({...base,aud:'inventory-lab',realm_access:{roles:[stored.mode.startsWith('admin')?'Admin':stored.mode.startsWith('analyst')?'Security Analyst':'Viewer']}},'at+jwt'),id_token:await sign({...base,aud:'synthetic-client',nonce:stored.mode==='nonce'?'invalid-nonce':stored.nonce,amr:stored.mode.endsWith('-mfa')&&!stored.mode.endsWith('no-mfa')?['pwd','mfa']:['pwd']},'JWT')}));return;
  }res.writeHead(404).end('{}');
 });
 await new Promise(r=>provider.listen(0,'127.0.0.1',r));issuer=`http://127.0.0.1:${provider.address().port}`;
 const authorize=createInventoryAuthorizer({issuer,audience:'inventory-lab',algorithm:'RS256',jwksUri:issuer+'/jwks'});let sso;
 const app=createApp({sso:{handle:(...args)=>sso.handle(...args)},authorizeInventory:request=>sso.authorize(request),readInventory:async()=>({data:[{hostname:'synthetic-session.test'}]})});
 await new Promise(r=>app.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${app.address().port}`;callback=origin+'/auth/callback';sso=createSso({origin,issuer,authorizationEndpoint:issuer+'/authorize',tokenEndpoint:issuer+'/token',jwksUri:issuer+'/jwks',clientId:'synthetic-client',authorizeToken:authorize,now:()=>clock});
 try{
  const login=await fetch(origin+'/auth/login',{method:'POST',headers:{origin},redirect:'manual'});assert.equal(login.status,303);const tx=login.headers.getSetCookie()[0].split(';')[0];
  const authorization=await fetch(login.headers.get('location'),{redirect:'manual'});assert.equal(authorization.status,302);
  const complete=await fetch(authorization.headers.get('location'),{headers:{cookie:tx},redirect:'manual'});assert.equal(complete.status,303);assert.equal(complete.headers.get('location'),'/inventory/hosts');const cookie=complete.headers.getSetCookie().find(c=>c.startsWith('atlas_session=')).split(';')[0];
  const inventory=await fetch(origin+'/api/v1/inventory/hosts',{headers:{cookie}});assert.equal(inventory.status,200);assert.equal((await inventory.json()).data[0].hostname,'synthetic-session.test');
  const info=await(await fetch(origin+'/auth/session',{headers:{cookie}})).json();assert.equal(info.authenticated,true);assert.ok(!('access_token'in info));assert.equal(tokenCalls,1);
  const logout=await fetch(origin+'/auth/logout',{method:'POST',headers:{cookie,origin,'x-csrf-token':info.csrf}});assert.equal(logout.status,200);assert.equal((await fetch(origin+'/api/v1/inventory/hosts',{headers:{cookie}})).status,401);
  async function attempt(kind,change){
   mode=kind;
   const start=await fetch(origin+'/auth/login',{method:'POST',headers:{origin},redirect:'manual'});
   const tx=start.headers.getSetCookie()[0].split(';')[0],target=new URL(start.headers.get('location'));
   if(change==='pkce')target.searchParams.set('code_challenge','synthetic-invalid-challenge');
   if(change==='redirect')target.searchParams.set('redirect_uri','http://127.0.0.1:1/not-allowed');
   const auth=await fetch(target,{redirect:'manual'});if(change==='redirect'){assert.equal(auth.status,400);return;}
   const cb=new URL(auth.headers.get('location'));
   if(change==='state')cb.searchParams.set('state','synthetic-wrong-state');
   if(change==='callback-redirect')cb.searchParams.set('redirect_uri','https://untrusted.example.test');
   const result=await fetch(cb,{headers:{cookie:tx},redirect:'manual'});
   return {result,cb,tx};
  }
  for(const [kind,change] of [['normal','state'],['nonce',null],['normal','pkce'],['admin-no-mfa',null],['analyst-no-mfa',null],['normal','callback-redirect']]){
   const {result}=await attempt(kind,change);assert.equal(result.status,401,kind+':'+change);assert.ok(!result.headers.getSetCookie().some(c=>c.startsWith('atlas_session=')));const body=await result.json();assert.ok(body.error.request_id);assert.ok(!JSON.stringify(body).includes('access_token'));
  }
  await attempt('normal','redirect');
  const replay=await attempt('normal');assert.equal(replay.result.status,303);
  assert.equal((await fetch(replay.cb,{headers:{cookie:replay.tx},redirect:'manual'})).status,401);
  const reused=await fetch(issuer+'/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({code:replay.cb.searchParams.get('code'),redirect_uri:callback,code_verifier:'synthetic-replay-verifier'})});assert.equal(reused.status,400);
  const analyst=await attempt('analyst-mfa');assert.equal(analyst.result.status,303);
  const mfa=await attempt('admin-mfa');assert.equal(mfa.result.status,303);const mfaCookie=mfa.result.headers.getSetCookie().find(c=>c.startsWith('atlas_session=')).split(';')[0];assert.equal((await fetch(origin+'/api/v1/inventory/hosts',{headers:{cookie:mfaCookie}})).status,200);
  clock+=301000;assert.equal((await fetch(origin+'/api/v1/inventory/hosts',{headers:{cookie:mfaCookie}})).status,401);
  assert.equal((await fetch(origin+'/auth/login',{method:'POST',headers:{origin:'https://untrusted.example.test'},redirect:'manual'})).status,403);
  console.log('SSO_NEGATIVE_PROOF',JSON.stringify({invalidState401:true,invalidNonce401:true,pkceMismatch401:true,invalidRedirect400:true,callbackRedirect401:true,codeReplay401:true,providerCodeReplay400:true,adminMissingMfa401:true,adminMfa200:true,analystMissingMfa401:true,analystMfa303:true,sessionExpiry401:true,crossOriginLogin403:true,clock:'injected session clock only'}));
  console.log('SSO_ROUNDTRIP_PROOF',JSON.stringify({syntheticProvider:true,actualHttp:true,codePkce:true,stateNonceVerified:true,sessionInventory200:true,logout401:true,tokenEndpointCalls:tokenCalls,browserNative:false}));
 }finally{await new Promise(r=>app.close(r));await new Promise(r=>provider.close(r));}
});
