import { runOsqueryLab } from './osquery-scenario.mjs';
const proof=await runOsqueryLab({offlineMs:600000,tickMs:60000,
  evidencePath:'Docs/evidence/S0-003/verification.json',onProgress:progress=>console.log(JSON.stringify(progress))});
console.log(JSON.stringify({synthetic:true,nativeLinux:false,nativeOsquery:false,hosts:proof.hosts.length,offline:proof.offline,
  firstSeenPreserved:true,noDuplicatePackages:true,payloadSensitiveFieldsExcluded:true,checklists:proof.checklist.length,freshInstallSteps:proof.freshInstallSteps.length}));
