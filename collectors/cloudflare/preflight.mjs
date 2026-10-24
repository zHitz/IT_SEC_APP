import { inspectReadiness, readinessError } from './readiness.mjs';
try{
 const args=process.argv.slice(2);
 if(args.length!==1||!['--dry-run','--check'].includes(args[0]))throw Object.assign(new Error(),{code:'READINESS_MODE_REQUIRED'});
 const report=await inspectReadiness({configPath:process.env.CLOUDFLARE_CONFIG,token:process.env.CLOUDFLARE_API_TOKEN,mode:args[0].slice(2)});
 console.log(JSON.stringify(report));
}catch(error){console.error(JSON.stringify({event:'cloudflare_readiness',status:'fail',code:readinessError(error),networkRequests:0,databaseWrites:0}));process.exitCode=1;}
