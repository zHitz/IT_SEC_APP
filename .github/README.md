# GitHub and QA workflow

Remote: https://github.com/zHitz/IT_SEC_APP

The initial main branch contains the original skeleton baseline. The first review branch, dev/sprint0-inventory, contains the completed Sprint 0 work and the assigned host/Domain/DNS inventory prototypes, with canonical RESULT files and actual evidence. Local master history is retained; no force push or history rewrite is required.

For each subsequent assigned task, create a task branch from the agreed reviewed base, commit only scoped changes, and open a pull request to main. Include the named ClickUp task, canonical RESULT, reproduction commands, observed tests and limitations. QA reviews the diff and run results; the developer addresses feedback on the same branch. Do not merge without QA approval. Do not change task status/dependencies or self-ACCEPT on ClickUp. Developer comments use [DEV][START], [DEV][SUBMISSION] or [DEV][BLOCKED].

QA clean-clone commands (Node24): npm ci, npm run lint, npm test, npm run build. CI runs the same lint -> test -> build sequence on push/pull_request with contents:read only. Tests use synthetic data and PostgreSQL17.5 WASM; they do not prove native Docker/PostgreSQL/osquery, live Cloudflare or production deployment. Actual current local suite:27tests passing. See Docs/RESULT-TASK-S0-003.md and RESULT-TASK-S0-004.md plus endpoint guides for exact scope and known native gaps.

Repository owner setup: keep the repository private as intended, grant the QA GitHub account appropriate repository access, and configure a main branch rule requiring pull requests, at least one QA approval and the verify CI check. These GitHub settings are not automatically established by pushing Git commits. No collaborator is invited without a specified account/permission request. Avoid committing .env, tokens, raw private infrastructure artifacts, node_modules or dist.
