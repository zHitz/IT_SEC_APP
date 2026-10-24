import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

// Dependency-free baseline: syntax lint plus unsafe-code rules, not a substitute for future type checking.
let count = 0;
for (const root of ['backend', 'frontend', 'collectors', 'scripts']) await walk(root);
async function walk(path) {
  for (const entry of await readdir(path, { withFileTypes: true })) {
    if (['dist', 'node_modules'].includes(entry.name)) continue;
    const file = join(path, entry.name);
    if (entry.isDirectory()) { await walk(file); continue; }
    if (!entry.name.endsWith('.mjs')) continue;
    const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    if (result.status !== 0) throw new Error(`${file}: ${result.stderr}`);
    const text = await readFile(file, 'utf8');
    if (file.endsWith('check.mjs')) continue;
    for (const rule of [/\beval\s*\(/, /\bnew Function\s*\(/, /\.innerHTML\s*=/, /\bdebugger\s*;/]) {
      if (rule.test(text)) throw new Error(`${file}: forbidden dynamic code or unsafe HTML`);
    }
    count++;
  }
}
console.log(`lint PASS: ${count} modules; syntax and unsafe-code rules`);
