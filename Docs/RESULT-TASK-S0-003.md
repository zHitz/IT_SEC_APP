# Result — TASK-S0-003: Osquery collector inventory PoC

| Field | Value |
|---|---|
| Task ID | TASK-S0-003 |
| Result version | v2 |
| Status | PARTIAL |
| Spec version followed | SRS v1.0 FR-01; TASK-S0-003; S0-002 v2 ACCEPT; Lead B-03-01/self-resolution decision at00:38 on2026-10-25 |
| Dev agent | Codex — Dev AI Agent |
| Submitted at | 2026-10-25 01:16 +07:00 |
| Work period | Continued after Lead decision; original test interrupted by accidental user stop; successful actual outage01:01:07–01:11:07 +07:00 on2026-10-25 |
| Source / evidence commit | 04395e670a33aa82a0bab34a35bf30662daa4b76 (implementation85725032db2db4056bcfe8163f5eaf5349e55f72 plus temporal-test follow-up) |

## 1. Summary

Implemented the fixed SELECT-only collector, safe payload projection, durable disk queue, per-host authenticated batch endpoint and transactional Host/Package/ListeningPort upsert without changing the accepted schema. Three separate SQLite Linux-inventory simulations sent actual HTTP batches into PostgreSQL17.5WASM; a real600010ms backend outage accumulated60batches, all recovered after repeated collector process exits/restarts, with no duplicates and no pending queue. All18tests, lint38modules/schema parity and application build pass; a separate five-step fresh fourth-source simulator setup also passed. PARTIAL is intentional: this Windows SQLite source simulation is not a running Linux kernel or real osquery binary, and cannot prove native Linux installation or host services/network/firewall state. The mapping blocker is resolved, implementation/lab work was executed rather than returned BLOCKED, but native AC evidence is not invented and the task is not self-ACCEPTED.

## 2. Acceptance criteria

English translations preserve TASK §8 AC IDs. Lead mapping applies: Port=ListeningPort; process/pid only for listening processes; non-listening PID/name/count stays in raw evidence. The Lead permits disclosed lab simulation; the evidence below identifies exactly what that simulator does and does not prove.

| AC | Acceptance criterion | Result | Evidence |
|---|---|---|---|
| AC-1 | At least3test Linux servers appear in backend inventory with hostname, OS/version and package names/versions; backend query/API output lists each host and package count. | Native portion not verified | verification.json before/after has3distinct simulated hosts, versions12.1/12.2/12.3,2packages each, separate system_info/source databases. Actual PostgreSQL queries pass, but nativeLinux=false/nativeOsquery=false. These are Windows SQLite fixtures, not3Linux kernels or real osquery agents. |
| AC-2 | Stop agent/disconnect backend10minutes, then restore without losing buffered observations; update last_seen correctly; logs and before/after queries required. | Pass for implemented queue/API | Actual outage600010ms,01:01:07.199–01:11:07.209 +07:00;10collection cycles,60queued batches,69collector child executions across baseline/outage/recovery,allDelivered=true,pending=0. Actual disk queues survive process exits/restarts; before/after host first_seen unchanged, latest observation last_seen advances. verify-v2.txt/verification.json. This is actual duration, not the short CI test. |
| AC-3 | No test-host changes except osquery/collector installation; filled before/after package/service/network/firewall checklist per host. | Native portion not verified | Three full simulator file hashes match before/after, including synthetic packages/services/network/firewall/config data; checklist scopes explicitly say NOT real Linux state. This cannot substantiate a native Linux host checklist or real agent installation. |
| AC-4 | Exactly5installation steps, executed fresh end-to-end, bring a new host into inventory without extra Dev assistance. | Native portion not verified | INSTALL-LAB.md has exactly5numbered commands; install-v2.txt shows all5PASS, fresh-install.json queries a fourth fresh simulated host with2packages/1port and matching state hash. No real osquery/Linux installation was run; native adapter/config-view compatibility remains unverified. |
| AC-5 | Data maps to the required entities with provenance/time fields; retries/recollection produce no duplicates, preserve first_seen and advance last_seen. | Pass under approved mapping | Host/Package/ListeningPort tables follow Lead mapping,source=osquery,confidence=confirmed. After outage:3hosts/6packages/3ports; replay does not increase counts. test-v2.txt OSQUERY_ALL_ENTITY_TIMESTAMPS queries all3entity types after4batches including repeated/stale replay: same first_seen_at, monotonic last_seen_at. No Process table added; schema remains24physicaltables. |
| AC-6 | Collector is SELECT-only over5allowed logical tables; excluded sensitive data is documented and an actual sent payload contains no credentials/environment/file data. | Pass for implemented source path; native compatibility unverified | queries.mjs uses exactly5fixed SELECT projections. Safety test rejects unknown/sensitive payload fields; source fixtures contain cmdline/environ canaries that never enter payloads. verification.json queries/payloadSample and fresh-install-raw.json are actual sent safe batches. Native Linux package view/runtime was not executed, so this is not a native osquery compatibility claim. |

No DONE claim: native parts of AC-1/3/4 remain unverified. Simulator checks are useful evidence but are not relabelled as real Linux/osquery. The previous contract blocker is not repeated or treated as a reason to wait before implementation.

## 3. Work completed

1. Read Lead's live00:38decision without refreshing ClickUp and acknowledged resume. Kept schema unchanged and implemented ListeningPort process enrichment plus raw-only non-listening evidence.
2. Checked existing WSL: sandbox access failure, then scoped retry did not return a usable distribution and was stopped; Docker/osquery were absent from PATH/known program locations. Did not install a distribution or choose a production host. Built3distinct disclosed source simulators instead.
3. Added fixed-query source adapters and strict nested payload validation, bounded batching, independent collect/send loops, fsynced disk queue with no eviction, finite retry/backoff and exact batch acknowledgment.
4. Added optional POST /api/v1/ingest/osquery using environment-supplied token-to-host registrations, request IDs, body/time/array bounds and sanitized errors. Missing registration leaves route disabled. Store serializes transactions and uses stable natural-key IDs; no new tables/entities.
5. Ran actual HTTP/PostgreSQL lab with3isolatedsources, then restarted the real ten-minute experiment after the user's accidental stop. Fresh collector processes repeatedly recovered each queue; after600010ms all60batches were delivered and queried counts stayed stable.
6. Executed all5fresh simulator setup commands and saved immutable-state checks and actual raw non-listening evidence. Added source/auth/queue/timestamp tests, preserved shell/Cloudflare regression and recorded final lint/test/build/secret-scan evidence.

## 4. Files changed

Relative to IT_SEC_APP. Listed source/evidence delta is cf25264→04395e670a33aa82a0bab34a35bf30662daa4b76; this canonical RESULT is the only additional report update. No TASK/SRS or accepted migration was edited. Every file has a specific description.

| File | Change | Specific role |
|---|---|---|
| .env.example | Updated | Adds blank/config-only osquery token/identity/raw-directory/environment variable names; no real credential. |
| Docs/evidence/S0-003/build-v2.txt | Added | Actual final application build stdout. |
| Docs/evidence/S0-003/fresh-install-raw.json | Added | Actual sanitized raw batches from the fourth-source install; includes non-listening PID/name evidence without canaries. |
| Docs/evidence/S0-003/fresh-install.json | Added | Actual queried fresh host/package/port counts and before/after simulator fingerprint. |
| Docs/evidence/S0-003/install-v2.txt | Added | Actual stdout from each of the five fresh-install commands. |
| Docs/evidence/S0-003/lint-v2.txt | Added | Actual syntax/safety lint and accepted-schema parity output. |
| Docs/evidence/S0-003/secret-scan-v2.json | Added | Final tracked-text heuristic scan:128files,findings[], with scope limitations. |
| Docs/evidence/S0-003/targeted-tests-v2.txt | Added | Actual four targeted safety/flow tests before the added all-entity timestamp case. |
| Docs/evidence/S0-003/test-v2.txt | Added | Final18/18test stdout, including source/auth/queue flow and all-entity timestamp query evidence. |
| Docs/evidence/S0-003/verification.json | Added | Actual600010ms outage,60queued/recovered batches,69collector process runs, queried rows, logs, safe payload and simulated host checklists. |
| Docs/evidence/S0-003/verify-v2.txt | Added | Actual ten-minute test progress/final output; interrupted earlier run is not counted. |
| README.md | Updated | Links the collector/API/five-step guide and distinguishes simulated Linux from native Linux evidence. |
| backend/README.md | Updated | Documents the optional authenticated ingest route, bootstrap conditions and runtime limits. |
| backend/src/app.mjs | Updated | Adds the optional POST ingest boundary, request IDs, sanitized errors and bounded HTTP timeouts; preserves health/unknown-route behavior. |
| backend/src/ingest/osquery-model.mjs | Added | Strict nested batch validation, required identity/version fields, time/array/IP bounds, rejection of unknown/sensitive fields. |
| backend/src/ingest/osquery-route.mjs | Added | Constant-time hashed bearer comparison, token-to-host binding, bounded JSON request and count-only acceptance audit. |
| backend/src/ingest/osquery-store.mjs | Added | Serialized batch transaction, natural-key-derived UUIDs, Host/Package/ListeningPort upsert and raw evidence outside inventory. |
| backend/src/server.mjs | Updated | Wires optional native-pg store and per-host tokens from environment; disables ingest when unconfigured and closes the DB on shutdown. |
| backend/test/osquery-safety.test.mjs | Added | Rejects forged identity, bad auth/body/sensitive fields, oversized batches, queue overflow and unsafe destination; asserts SELECT projections. |
| backend/test/osquery.test.mjs | Added | Real HTTP/PostgreSQL simulator flow and all-entity first/last-seen preservation across repeated/stale batches. |
| backend/test/support/osquery-lab.mjs | Added | Creates distinct SQLite source fixtures with secret-field canaries and immutable simulated host state for before/after hashes. |
| collectors/osquery/API.md | Added | Method/path/auth/request/response/errors, host identification, dedupe and retry contract. |
| collectors/osquery/INSTALL-LAB.md | Added | Exactly five runnable fresh simulator installation stages with expected outputs and native-evidence disclaimer. |
| collectors/osquery/README.md | Updated | Collector operation, native adapter setup, simulator disclosure, packages-view mapping, queue policy and privacy limits. |
| collectors/osquery/config.example.json | Added | Collector source/endpoint/queue/batch/interval/retry settings without a token. |
| collectors/osquery/config.mjs | Added | Validates source modes, ecosystem, paths and bounded operational limits. |
| collectors/osquery/main.mjs | Added | Source collection and delivery loops, one-shot modes, signal stop and sanitized collection/retry/count logs. |
| collectors/osquery/osquery.deb.conf | Added | Read-only packages view over native deb_packages and event collection disabled; native execution not claimed. |
| collectors/osquery/osquery.rpm.conf | Added | Equivalent read-only packages view over rpm_packages; native execution not claimed. |
| collectors/osquery/queries.mjs | Added | Fixed five SELECT projections and explicit exclusion list; no commandline/environment/file queries. |
| collectors/osquery/queue.mjs | Added | Fsynced temporary write + rename, disk recovery, finite HTTP retries, exact acknowledgment and no eviction on overflow. |
| collectors/osquery/source.mjs | Added | Read-only SQLite lab/native osqueryi adapters; safe projection, process enrichment and bounded row batching. |
| deploy/docker/backend.Dockerfile | Updated | Prepares an evidence directory owned by the non-root container user; Docker execution not claimed. |
| deploy/docker/compose.yaml | Updated | Optional ingest identity/environment forwarding and raw evidence volume; default empty registration leaves API disabled. |
| package.json | Updated | Adds osquery:verify and start:osquery scripts; dependency set/lockfile unchanged. |
| scripts/osquery-install-lab.mjs | Added | Executes the five fresh-install simulator stages using persistent local PostgreSQLWASM and an actual collector child. |
| scripts/osquery-scenario.mjs | Added | Three-source real HTTP/PostgreSQL acceptance harness, actual timed outage, collector restarts, recovery queries and guarded cleanup. |
| scripts/verify-osquery.mjs | Added | Runs the required actual600000ms outage and saves verification JSON/progress output. |
| Docs/RESULT-TASK-S0-003.md | Updated | Canonical v2 report, per-AC evidence, version history and explicit native Linux/osquery gaps. |

## 5. Run and verify

Node24/dependencies from lockfile are prerequisites. From repo root:

```powershell
npm ci
npm run lint
npm test
npm run build
npm run osquery:verify
```

The final verifier takes at least10actual minutes and creates its own isolated source files, temporary HTTP backend and PostgreSQLWASM; it does not access a real host/token. It writes verification.json and cleans up only its guarded temporary fixture directory. CI uses a short outage explicitly labelled fast; it is not the ten-minute proof. A clean dependency install was not repeated here; the dependency set is unchanged.

For a fresh persistent simulator setup, execute the5commands in collectors/osquery/INSTALL-LAB.md. The dedicated var/osquery/fresh-install-lab directory must not already exist; the runner refuses overwrite. Existing evidence is retained under Docs/evidence and var/ is Git-ignored. The persistent fresh-lab raw batches were copied into fresh-install-raw.json before handoff.

Native configuration is documented in collectors/osquery/README.md/API.md. Supply OSQUERY_AGENT_TOKENS, DATABASE_URL, OSQUERY_RAW_DIRECTORY/environment at backend and OSQUERY_COLLECTOR_CONFIG plus OSQUERY_INGEST_TOKEN at collector; token values belong in secret environment, never results/ClickUp. Native osqueryi needs a read-only packages view appropriate to deb/rpm. Commands start:backend/start:osquery and optional Docker wiring exist, but native Linux/osquery/Docker bootstrap is not claimed as executed.

## 6. Tests and actual results

| Test | Actual command / approach | Result | Evidence |
|---|---|---|---|
| Syntax/safety/schema parity | npm run lint | Pass | lint-v2.txt:38modules;22entities+2junctions/114nativeFK parity. |
| Full regression | npm test | Pass | test-v2.txt:tests18,pass18,fail0,duration_ms7853.3602. Includes Cloudflare GET-only regression, shell/model, osquery auth/privacy/queue/source/timestamps. |
| Actual ten-minute recovery | npm run osquery:verify | Pass for implemented queue/API | verify-v2.txt/verification.json:600010ms,10cycles,60queued batches,allDelivered=true,pending0. All69collector child process exits succeeded. No accelerated clock used for this experiment. |
| All-entity idempotent timestamps | PostgreSQL queries after4synthetic batches, including repeat/stale replay | Pass | test-v2.txt OSQUERY_ALL_ENTITY_TIMESTAMPS:Host/Package/ListeningPort each retains first_seen_at18:13:04.733Z, last_seen_at18:14:04.733Z. Observation timestamps deliberately60s apart; this test does not claim a60s wall wait. |
| Fresh simulator install | node scripts/osquery-install-lab.mjs1..5, separate sequential commands | Pass for simulator | install-v2.txt all5PASS; fresh-install.json1host/2packages/1port with identical baseline/after hash. |
| Host-state/source privacy | Read-only source + before/after immutable hashes + canary projection checks | Pass for simulator | Three checklist entries; no canary in outgoing payload. Does not verify native Linux state. |
| Authentication/validation/queue overflow | Targeted security tests then final suite | Pass | Bad token/forged host/invalid JSON/sensitive fields/oversized body rejected with0storewrites; re-instantiated queue retains bytes, full queue refuses without eviction. |
| Application build | npm run build | Pass | build-v2.txt packages backend/frontend ESM and migration assets. Native collector is source-run; no Docker build claim. |
| Secret hygiene | node scripts/scan-secrets.mjs with bundled Git | Pass for heuristic scope | secret-scan-v2.json:128trackedfiles,findings[]. Manual new-source/config review found only labelled public synthetic test markers. Images/PDFs excluded, not a security audit. |

Initial fast integration test failed an overly strict test-only expected child-count>=18; the actual minimum was15 (6baseline+6offline+3recovery). Corrected that assertion and reran, then added the separate all-entity temporal case; final18/18passes. The original long run was interrupted after1cycle by the accidental user stop and is not counted; the complete resumed experiment is the one above. After resume, F:repo writes returnedEPERM because session permissions changed; scoped escalation allowed authorized writes/local tests without changing approval policy. The Node SQLite experimental warning is retained in actual output. No native Linux/osquery/server token, production, Docker or remote CI run is claimed.

## 7. Issues and implementation decisions

Version history: v1BLOCKED reported schema entity mismatch before code. Lead00:38resolved it and instructed technical/lab self-resolution. V2 implements the collector/API/queue/evidence under that mapping, resolving the old blocker; it does not repeat old repo/SRS/ACCEPT gates. English prose/headings follow the Product Owner's latest instruction, with10sections in the required numbered order and unchanged requirement/entity IDs.

`packages` is a logical SELECT-only view: native Debian/RPM osquery uses deb_packages/rpm_packages underneath. The collector still selects the5TASK logical tables; this documented technical mapping avoids inventing a non-existent standard generic Linux table or expanding to unrelated discovery datasets. The native config-view path is untested here.

Simulation is intentionally conservative:3separate SQLite files contain independent system_info/OS/package data. They are not one fixture reported3times, but also not3Linux kernels. Before/after hashes cover synthetic host state only. This distinction is why the result staysPARTIAL instead of making a false native AC claim. No technical permission question or renewed BLOCKED was sent to Lead.

Host identity is stable host_uuid authenticated by a per-host bearer registration. Package identity includes name/version/ecosystem+host; ListeningPort includes protocol/address/port+host. UUIDv8 is SHA256-derived. Original version text is preserved in normalized_version pending a separate fingerprint task. First_seen_at never changes on conflict; stale Host/ListeningPort updates do not overwrite newer observations. Time validation accepts observations up to30days old and5minutes into the future; logs avoid tokens/raw exceptions.

Queue policy: one collector per queue directory; one serialized backend DB connection. Atomic rename and fsync cover process-restart tests, not arbitrary power loss. Capacity refusal preserves existing batches but cannot promise infinite storage for new observations. Failed/mismatched/permanent-error deliveries retain files; the next configured cycle can retry, never an unbounded tight loop. Partial .tmp files are not silently imported. Raw non-listening PID/name/count is written outside inventory; no Process table. Only SELECT source queries run, and event collection is disabled for native config.

## 8. Not done, limitations and technical debt

- Native Linux/osquery execution, real3host OS/package evidence, real per-host service/network/firewall before/after checklists and fresh native agent installation remain unverified. This is an evidence gap, not a repeated schema blocker. Windows SQLite fixtures cannot substitute for those claims.
- Native osquery packages-view/permission behavior, existing Linux Node runtime and resource impact need a real lab run. No unrelated software/system/network/firewall/service changes were performed to manufacture that environment.
- Native pg bootstrap, Docker/Compose deployment and remote CI are unverified. The tested store uses real PostgreSQL17.5WASM through the same query/transaction boundary.
- No multi-process queue/DB coordination, power-loss guarantee, load benchmark, automatic enrollment/deploy, Windows/macOS discovery, container discovery, SSO/RBAC, CVE matching or inventory UI.
- Raw evidence retention, operational alerts and Windows deployment ACL hardening are later policy/hardening work. Simulator .tmp/queue/raw cleanup is limited to explicitly created fixture paths; persistent fresh-install var/ data remains for inspection.
- Non-listening processes are intentionally absent from DB under Lead decision; safe count/raw evidence remains. No extra entity/migration or commandline/environment collection.

## 9. Blockers and decisions required

No unresolved B-03-01 contract blocker; no request for Lead to debug technical details. Implemented and tested all feasible local code/lab paths in this run. PARTIAL identifies missing native Linux/osquery acceptance evidence, rather than declaring allACs satisfied using differently labelled fixtures. Lead may review the delivered implementation and exact simulator scope; any later native/production verification must use an explicitly authorized environment and truthful evidence. Do not self-ACCEPT/close or change task status/dependencies, and do not infer production/credential permission from this report.

## 10. Next step and self-check

Review v2implementation, actual10minuteproof and exact native gaps. Run the same collector on3approved native Linux/osquery lab hosts when such an executable environment is available; finish native checklists/install evidence without changing the accepted schema or expanding discovery scope. Rework specific review findings in this same RESULT version history; do not rerun completed10minuteproof without a code/failure reason.

- [x] All6ACs individually addressed; simulator/native boundaries explicit, statusPARTIAL.
- [x] All code/test claims have real commands/output/query/log/file evidence; complete38file source/evidence delta described plus this RESULT.
- [x] Original interrupted run and early failed test disclosed; actual600010ms recovery proven separately.
- [x] No secret/production data, schema edit, DNS mutation or task status/dependency change.
- [x] One canonical RESULT,10sections, v1→v2history, actual attachment submission on the correct task with one status/version comment.
