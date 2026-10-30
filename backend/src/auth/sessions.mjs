import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';
const key=id=>createHash('sha256').update(id).digest('hex');
const opaque=()=>randomBytes(32).toString('base64url');

// Process-local session state: no access/refresh tokens are serialized to the browser.
export function createSessionStore({origin,ttlMs=900000,maxSessions=1000,now=Date.now}={}) {
  const url=new URL(origin);
  if(url.username||url.password||url.pathname!=='/'||url.search||url.hash||!(url.protocol==='https:'||(url.protocol==='http:'&&['127.0.0.1','[::1]'].includes(url.hostname)))||!Number.isInteger(ttlMs)||ttlMs<1000||ttlMs>900000||!Number.isInteger(maxSessions)||maxSessions<1||maxSessions>10000)throw Error('SESSION_CONFIG');
  const secure=url.protocol==='https:',name=secure?'__Host-atlas_session':'atlas_session',sessions=new Map();
  const cookie=(id,seconds)=>`${name}=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${seconds}${secure?'; Secure':''}`;
  function prune(){for(const [id,session]of sessions)if(session.expires<=now())sessions.delete(id);}
  function idFrom(request){const entries=(request.headers.cookie??'').split(';').map(s=>s.trim()).filter(s=>s.startsWith(name+'='));if(entries.length!==1)return null;const id=entries[0].slice(name.length+1);return /^[A-Za-z0-9_-]{43}$/.test(id)?id:null;}
  function lookup(request){prune();const id=idFrom(request);return id?sessions.get(key(id)):undefined;}
  return {
    create({accessToken,expiresAt},previousRequest){
      prune();const old=previousRequest&&idFrom(previousRequest);if(old)sessions.delete(key(old));
      const expires=Math.min(now()+ttlMs,expiresAt);
      if(typeof accessToken!=='string'||!accessToken||!Number.isFinite(expires)||expires<=now()||sessions.size>=maxSessions)throw Error('SESSION_UNAVAILABLE');
      const id=opaque(),csrf=opaque();sessions.set(key(id),{accessToken,csrf,expires});
      return {cookie:cookie(id,Math.max(0,Math.floor((expires-now())/1000))),csrf};
    },
    accessToken(request){return lookup(request)?.accessToken;},
    info(request){const session=lookup(request);return session?{authenticated:true,csrf:session.csrf,expiresAt:session.expires}:{authenticated:false};},
    logout(request){
      const session=lookup(request),csrf=request.headers['x-csrf-token'];
      if(request.method!=='POST'||request.headers.origin!==url.origin||!session||typeof csrf!=='string'||Buffer.byteLength(csrf)!==Buffer.byteLength(session.csrf)||!timingSafeEqual(Buffer.from(csrf),Buffer.from(session.csrf)))throw Object.assign(Error('CSRF_REJECTED'),{status:403});
      sessions.delete(key(idFrom(request)));return cookie('',0);
    }
  };
}
