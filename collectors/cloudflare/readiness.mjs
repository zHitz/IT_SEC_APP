// Config-only checks. This module imports no HTTP client, database or worker job.
import { readFile } from 'node:fs/promises';
import { isIP } from 'node:net';
import { validateConfig } from './config.mjs';
const allowed = ['synthetic','baseUrl','zoneIds','knownCidrs','cidrVersion','intervalMs','rawDirectory','environment'];
function fail(code){const error=new Error(code);error.code=code;throw error;}
export function readinessError(error){return /^[A-Z][A-Z0-9_]{1,79}$/.test(error?.code??'')?error.code:'READINESS_CONFIG_INVALID';}
function addressNumber(address){
 if(isIP(address)===4)return address.split('.').reduce((n,octet)=>(n<<8n)+BigInt(octet),0n);
 let value=address;
 if(value.includes('.')){const i=value.lastIndexOf(':');const v=addressNumber(value.slice(i+1));value=value.slice(0,i+1)+(v>>16n).toString(16)+':'+(v&65535n).toString(16);}
 const [left,right]=value.split('::');const a=left?left.split(':'):[],b=right?right.split(':'):[];
 const groups=right===undefined?a:[...a,...Array(8-a.length-b.length).fill('0'),...b];
 return BigInt('0x'+groups.map(part=>part.padStart(4,'0')).join(''));
}
export function validateReadiness(input,{token,mode='dry-run',realOnly=true}={}){
 if(!['dry-run','check'].includes(mode))fail('READINESS_MODE_INVALID');
 if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(key=>!allowed.includes(key)))fail('READINESS_CONFIG_KEYS');
 if(!Array.isArray(input.zoneIds)||!input.zoneIds.length)fail('ZONE_IDS_REQUIRED');
 if(!Array.isArray(input.knownCidrs)||!input.knownCidrs.length)fail('KNOWN_CIDRS_REQUIRED');
 let config;try{config=validateConfig(input);}catch(error){fail(/^CONFIG_[A-Z_]+$/.test(error.message)?error.message:'READINESS_CONFIG_INVALID');}
 if(realOnly&&(config.synthetic!==false||config.baseUrl!=='https://api.cloudflare.com/client/v4'))fail('REAL_CONFIG_REQUIRED');
 if(config.environment.includes('REPLACE')||config.cidrVersion.includes('REPLACE'))fail('CONFIG_PLACEHOLDERS_REMAIN');
 for(const cidr of config.knownCidrs){
  const[address,prefix]=cidr.split('/');const hostBits=BigInt((isIP(address)===4?32:128)-Number(prefix));
  if((addressNumber(address)&((1n<<hostBits)-1n))!==0n)fail('CONFIG_CIDR_HOST_BITS');
 }
 if(mode==='check'&&(typeof token!=='string'||!token.trim()||token!==token.trim()||/[\r\n]/.test(token)||token.length>4096))fail('CLOUDFLARE_API_TOKEN_REQUIRED');
 if(mode==='check'&&realOnly&&token==='synthetic-test-marker')fail('SYNTHETIC_TOKEN_NOT_REAL');
 return {event:'cloudflare_readiness',mode,status:'pass',synthetic:config.synthetic,zoneCount:config.zoneIds.length,cidrCount:config.knownCidrs.length,
  cidrVersion:config.cidrVersion,credentialPresenceChecked:mode==='check',networkRequests:0,databaseWrites:0,
  limitation:'Local validation only; does not verify token permissions, zone authorization or live API reachability'};
}
export async function inspectReadiness({configPath,token,mode='dry-run'}){
 if(typeof configPath!=='string'||!configPath.trim())fail('CLOUDFLARE_CONFIG_REQUIRED');
 let text;try{text=await readFile(configPath,'utf8');}catch{fail('CONFIG_FILE_UNREADABLE');}
 let config;try{config=JSON.parse(text);}catch{fail('CONFIG_JSON_INVALID');}
 return validateReadiness(config,{token,mode});
}
