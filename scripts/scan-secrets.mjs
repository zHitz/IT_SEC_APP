import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';

const git = process.env.GIT_BIN || 'git';
const files = execFileSync(git, ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
const rules = [
  ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['github-token', /gh[pousr]_[A-Za-z0-9]{30,}/],
  ['aws-access-key', /AKIA[0-9A-Z]{16}/],
  ['credential-url', /(?:postgres(?:ql)?|mysql|mongodb):\/\/[^\s:]+:[^\s@]+@/i],
];
const findings = [];
for (const file of files) {
  const bytes = await readFile(file);
  if (bytes.includes(0) || /\.(pdf|png|docx)$/i.test(file) || file === 'scripts/scan-secrets.mjs') continue;
  const text = bytes.toString('utf8');
  for (const [rule, pattern] of rules) if (pattern.test(text)) findings.push({ file, rule });
}
console.log(JSON.stringify({ scope: 'git tracked text; known credential patterns only', trackedFiles: files.length, findings, limitations: 'Heuristic scan; PDFs/images excluded; manual review of source/env/config required.' }, null, 2));
if (findings.length) process.exitCode = 1;
