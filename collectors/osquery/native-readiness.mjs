// Native readiness is local inspection only: never execute a binary, install a
// distribution, connect to a host, read tokens, or collect native inventory here.
import {readFile,access,stat} from 'node:fs/promises';
import {constants} from 'node:fs';
import {resolve,isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {queries} from './queries.mjs';
function fail(code){throw Object.assign(new Error(code),{code});}
export function validateOsqueryConfig(config,ecosystem){
 const table=ecosystem==='deb'?'deb_packages':ecosystem==='rpm'?'rpm_packages':null;
 if(!table||!config||typeof config!=='object'||Object.keys(config).sort().join(',')!=='options,views')fail('OSQUERY_CONFIG_KEYS');
 if(!config.options||Object.keys(config.options).join(',')!=='disable_events'||config.options.disable_events!=='true')fail('OSQUERY_EVENTS_NOT_DISABLED');
 if(!config.views||Object.keys(config.views).join(',')!=='packages'||config.views.packages!==`SELECT name, version FROM ${table}`)fail('OSQUERY_PACKAGES_VIEW_INVALID');
 for(const[tableName,query]of Object.entries(queries))if(!new RegExp(`^SELECT [a-z_, ]+ FROM ${tableName}$`).test(query)||/\*|;|cmdline|environ|password|token/i.test(query))fail('OSQUERY_QUERY_UNSAFE');
 return {ecosystem,packagesView:config.views.packages,eventsDisabled:true,logicalTableCount:Object.keys(queries).length};
}
export async function inspectNative({platform=process.platform,binaryPath='/usr/bin/osqueryi',fileCheck=async path=>{if(!(await stat(path)).isFile())throw Error();await access(path,constants.X_OK);}}={}){
 const configs=[];
 for(const ecosystem of ['deb','rpm']){
  let parsed;try{parsed=JSON.parse(await readFile(new URL(`./osquery.${ecosystem}.conf`,import.meta.url),'utf8'));}catch{fail('OSQUERY_CONFIG_JSON_INVALID');}
  configs.push(validateOsqueryConfig(parsed,ecosystem));
 }
 const common={event:'osquery_native_readiness',platform,configs,nativeExecuted:false,binaryExecuted:false,networkRequests:0,tokenRead:false,distributionInstalled:false};
 if(platform!=='linux')return {...common,status:'NATIVE_NOT_AVAILABLE',reason:'PLATFORM_NOT_LINUX'};
 if(!isAbsolute(binaryPath))return {...common,status:'NATIVE_NOT_AVAILABLE',reason:'ABSOLUTE_BINARY_PATH_REQUIRED'};
 try{await fileCheck(binaryPath);}catch{return {...common,status:'NATIVE_NOT_AVAILABLE',reason:'OSQUERY_BINARY_NOT_EXECUTABLE'};}
 return {...common,status:'NATIVE_CANDIDATE_PRESENT',reason:'Executable file exists; actual osquery version/queries/host checks are still required on an approved lab host'};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const args=process.argv.slice(2);if(args.length&&!(args.length===2&&args[0]==='--binary'))fail('NATIVE_CHECK_ARGUMENTS');
  const result=await inspectNative({binaryPath:args[1]||'/usr/bin/osqueryi'});console.log(JSON.stringify(result));
  if(result.status==='NATIVE_NOT_AVAILABLE')process.exitCode=2;
 }catch(error){console.error(JSON.stringify({event:'osquery_native_readiness',status:'CONFIG_INVALID',code:/^[A-Z_]+$/.test(error.code??'')?error.code:'NATIVE_READINESS_FAILED',nativeExecuted:false,networkRequests:0,tokenRead:false}));process.exitCode=1;}
}
