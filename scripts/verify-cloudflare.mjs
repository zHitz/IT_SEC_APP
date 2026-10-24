import { mkdir, writeFile } from 'node:fs/promises';
import { verifyCloudflare } from './cloudflare-scenario.mjs';
const proof = await verifyCloudflare();
await mkdir('Docs/evidence/S0-004', { recursive: true });
await writeFile('Docs/evidence/S0-004/verification.json', JSON.stringify(proof, null, 2) + '\n');
console.log(JSON.stringify({ synthetic: true, engine: proof.engine, requests: proof.requests.length, assertions: proof.assertions }, null, 2));
