import { createRemoteJWKSet, customFetch, jwtVerify } from 'jose';

export class AuthError extends Error {
  constructor(status=401) { super('Access denied'); this.status=status; this.code=status===403?'FORBIDDEN':'UNAUTHORIZED'; }
}
export const inventoryReadRoles=Object.freeze(['Admin','Security Analyst','Infra Engineer','Viewer','Auditor']);
function trustedURL(value) {
  const url=new URL(value);
  if(url.username||url.password||url.search||url.hash||!(url.protocol==='https:'||(url.protocol==='http:'&&['127.0.0.1','[::1]'].includes(url.hostname))))throw Error('OIDC_CONFIG');
  return url;
}
export function createInventoryAuthorizer({issuer,audience,jwksUri,algorithm}) {
  let issuerURL,jwksURL;
  try {issuerURL=trustedURL(issuer);jwksURL=trustedURL(jwksUri);} catch {throw Error('OIDC_CONFIG');}
  if(jwksURL.origin!==issuerURL.origin||typeof audience!=='string'||!audience.trim()||!['RS256','ES256'].includes(algorithm))throw Error('OIDC_CONFIG');
  let fetchNotBefore=0;
  const keys=createRemoteJWKSet(jwksURL,{timeoutDuration:2000,cooldownDuration:30000,cacheMaxAge:60000,
    [customFetch]:async(url,options)=>{
      if(Date.now()<fetchNotBefore)throw Error('JWKS_COOLDOWN');
      fetchNotBefore=Date.now()+30000;
      const response=await fetch(url,{...options,redirect:'error'});
      if(response.status!==200)throw Error('JWKS_UNAVAILABLE');
      const reader=response.body.getReader();const chunks=[];let bytes=0;
      try {for(;;){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>65536)throw Error('JWKS_TOO_LARGE');chunks.push(value);}}
      finally {await reader.cancel();}
      const body=Buffer.concat(chunks);const parsed=JSON.parse(body.toString('utf8'));
      if(!Array.isArray(parsed.keys)||parsed.keys.length>20)throw Error('JWKS_INVALID');
      return new Response(body,{status:200,headers:{'Content-Type':'application/json'}});
    }});
  return async request=>{
    const header=request.headers.authorization;
    if(typeof header!=='string'||header.length>8192||!/^Bearer [A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(header))throw new AuthError();
    let payload;
    try {({payload}=await jwtVerify(header.slice(7),keys,{issuer,audience,algorithms:[algorithm],typ:'at+jwt',requiredClaims:['sub','exp','iat'],maxTokenAge:'15m',clockTolerance:0}));}
    catch {throw new AuthError();}
    if(typeof payload.sub!=='string'||!payload.sub.trim())throw new AuthError();
    const roles=payload.realm_access?.roles;
    if(!Array.isArray(roles)||!roles.some(role=>inventoryReadRoles.includes(role)))throw new AuthError(403);
    return {subject:payload.sub};
  };
}
