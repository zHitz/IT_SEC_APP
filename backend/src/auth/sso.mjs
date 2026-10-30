import * as oidc from 'openid-client';
import { decodeJwt } from 'jose';
import { randomUUID,randomBytes } from 'node:crypto';
import {createSessionStore} from './sessions.mjs';
const opaque=()=>randomBytes(32).toString('base64url');
function safeURL(value){const u=new URL(value);if(u.username||u.password||u.search||u.hash||!(u.protocol==='https:'||(u.protocol==='http:'&&['127.0.0.1','[::1]'].includes(u.hostname))))throw Error('SSO_CONFIG');return u;}

export function createSso({origin,issuer,authorizationEndpoint,tokenEndpoint,jwksUri,clientId,authorizeToken,now=Date.now}){
 const app=safeURL(origin),provider=safeURL(issuer),authorization=safeURL(authorizationEndpoint),token=safeURL(tokenEndpoint),jwks=safeURL(jwksUri);
 if(app.pathname!=='/'||[authorization,token,jwks].some(u=>u.origin!==provider.origin)||typeof clientId!=='string'||!clientId||typeof authorizeToken!=='function')throw Error('SSO_CONFIG');
 const redirectUri=new URL('/auth/callback',app).href,secure=app.protocol==='https:',txName=secure?'__Host-atlas_login':'atlas_login';
 const config=new oidc.Configuration({issuer,authorization_endpoint:authorization.href,token_endpoint:token.href,jwks_uri:jwks.href,response_types_supported:['code'],code_challenge_methods_supported:['S256'],id_token_signing_alg_values_supported:['RS256']},clientId,{token_endpoint_auth_method:'none',id_token_signed_response_alg:'RS256'},oidc.None());
 if(provider.protocol==='http:')oidc.allowInsecureRequests(config);
 oidc.enableNonRepudiationChecks(config);
 config.timeout=2;
 config[oidc.customFetch]=async(url,options)=>{if(![token.href,jwks.href].includes(String(url)))throw Error('SSO_DESTINATION');const r=await fetch(url,{...options,redirect:'error'});const reader=r.body.getReader(),chunks=[];let size=0;try{for(;;){const v=await reader.read();if(v.done)break;size+=v.value.length;if(size>131072)throw Error('SSO_RESPONSE_LIMIT');chunks.push(v.value);}}finally{await reader.cancel();}return new Response(Buffer.concat(chunks),{status:r.status,headers:r.headers});};
 const sessions=createSessionStore({origin:app.origin,now}),pending=new Map();
 const txCookie=(id,age)=>`${txName}=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${secure?'; Secure':''}`;
 const transaction=request=>{const entries=(request.headers.cookie??'').split(';').map(s=>s.trim()).filter(s=>s.startsWith(txName+'='));return entries.length===1?entries[0].slice(txName.length+1):null;};
 return {
  authorize:async request=>{if(request.headers.authorization)return authorizeToken(request);const accessToken=sessions.accessToken(request);if(!accessToken)throw Object.assign(Error('UNAUTHORIZED'),{status:401});return authorizeToken({headers:{authorization:'Bearer '+accessToken}});},
  async handle(request,response){
   const current=new URL(request.url,app),path=current.pathname;if(!['/auth/login','/auth/callback','/auth/session','/auth/logout'].includes(path))return false;
   const fail=status=>response.writeHead(status).end(JSON.stringify({error:{code:status===403?'FORBIDDEN':'UNAUTHORIZED',message:'Session request denied',request_id:response.getHeader('X-Request-Id')??randomUUID()}}));
   response.setHeader('Cache-Control','no-store');response.setHeader('Referrer-Policy','no-referrer');
   try{
    if(current.origin!==app.origin)throw Error('SSO_ORIGIN');
    if(path==='/auth/login'){
     if(request.method!=='POST'||request.headers.origin!==app.origin||current.search) {fail(403);return true;}
     for(const [id,tx]of pending)if(tx.expires<=now())pending.delete(id);
     if(pending.size>=1000)throw Error('SSO_CAPACITY');
     const id=opaque(),state=oidc.randomState(),nonce=oidc.randomNonce(),verifier=oidc.randomPKCECodeVerifier();
     pending.set(id,{state,nonce,verifier,expires:now()+300000});
     const url=oidc.buildAuthorizationUrl(config,{redirect_uri:redirectUri,scope:'openid',state,nonce,code_challenge:await oidc.calculatePKCECodeChallenge(verifier),code_challenge_method:'S256'});
     response.setHeader('Set-Cookie',txCookie(id,300));response.writeHead(303,{Location:url.href}).end();
    }else if(path==='/auth/callback'){
     if(request.method!=='GET')throw Error('SSO_METHOD');
     const id=transaction(request),tx=pending.get(id);pending.delete(id);response.setHeader('Set-Cookie',txCookie('',0));
     if(!tx||tx.expires<=now()||current.origin!==app.origin||current.searchParams.has('redirect_uri'))throw Error('SSO_TRANSACTION');
     const tokens=await oidc.authorizationCodeGrant(config,current,{expectedState:tx.state,expectedNonce:tx.nonce,pkceCodeVerifier:tx.verifier,idTokenExpected:true});
     const claims=tokens.claims();await authorizeToken({headers:{authorization:'Bearer '+tokens.access_token}});
     const access=decodeJwt(tokens.access_token);if(access.sub!==claims.sub)throw Error('SSO_SUBJECT');
     if(access.realm_access?.roles?.some(r=>['Admin','Security Analyst'].includes(r))&&(!Array.isArray(claims.amr)||!claims.amr.includes('mfa')))throw Error('SSO_MFA');
     const session=sessions.create({accessToken:tokens.access_token,expiresAt:Math.min(access.exp,claims.exp)*1000},request);
     response.setHeader('Set-Cookie',[txCookie('',0),session.cookie]);response.writeHead(303,{Location:'/inventory/hosts'}).end();
    }else if(path==='/auth/session'){
     if(request.method!=='GET') {fail(403);return true;}response.writeHead(200).end(JSON.stringify(sessions.info(request)));
    }else{response.setHeader('Set-Cookie',sessions.logout(request));response.writeHead(200).end(JSON.stringify({authenticated:false}));}
   }catch(error){fail(error.status===403?403:401);}
   return true;
  }
 };
}
