import { cp, mkdir } from 'node:fs/promises';

for (const part of ['backend', 'frontend']) {
  await mkdir(`${part}/dist`, { recursive: true });
  await cp(`${part}/src`, `${part}/dist`, { recursive: true });
  console.log(`build PASS: ${part}/src -> ${part}/dist (native ESM, no transpilation)`);
}
