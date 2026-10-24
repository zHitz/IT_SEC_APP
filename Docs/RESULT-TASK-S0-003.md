# Result — TASK-S0-003: Osquery collector inventory PoC

| Field | Value |
|---|---|
| Task ID | TASK-S0-003 |
| Result version | v3 |
| Status | PARTIAL |
| Spec version followed | SRS v1.0 FR-01; TASK-S0-003; accepted v2PARTIALPoCbasis; Lead native-readiness assignment01:36 on2026-10-25 |
| Dev agent | Codex — Dev AI Agent |
| Submitted at | 2026-10-25 01:58 +07:00 |
| Work period | Current run after reading the concrete v3assignment; no repeat of accepted10minute experiment |
| Source/evidence commit | 54776b778bc035417209c5ec78f004c6a7766f44 |

## 1. Summary

Completed all three newly assigned native-readiness deliverables: strict deb/rpm osquery config validation, fail-closed current-platform script, compact native operator runbook and detailed follow-up checklist/commands. Actual current-machine execution returns exit2/NATIVE_NOT_AVAILABLE/PLATFORM_NOT_LINUX with nativeExecuted=false,binaryExecuted=false,tokenRead=false,networkRequests0,distributionInstalled=false. Final22/22tests, lint44modules/schema parity and build pass, with no schema/entity change or native/production operation. Overall TASK status remainsPARTIAL because original native AC-1/3/4 evidence is still missing; the new readiness requirements themselves pass completely. V2ACCEPT at the disclosed simulator PoC basis remains intact; this is executed readiness work, not a renewed technicalBLOCKED request.

## 2. Acceptance criteria

Original TASK §8criteria retain their IDs and accepted v2evidence boundaries. R-1..R-3 are the explicit01:36native-readiness assignment, not invented native acceptance.

| ID | Criterion / assignment | Result | Evidence |
|---|---|---|---|
| AC-1 | At least3Linux test hosts with real hostname/OS/package/version inventory. | Native portion not verified | Accepted v2verification.json has3distinct SQLite Linux-inventory simulations, not Linux kernels/osquery binaries. V3 explicitly detects current native unavailability; no fixture is relabelled. |
| AC-2 | Actual10minute backend outage, persistent queue/restart recovery and correct last_seen update. | Pass for implemented queue/API | V2actual600010ms/60batches/69processruns/pending0proof retained, accepted01:30. V3runs only fast regression, not a replacement/duplicate ten-minute run. |
| AC-3 | Native before/after checklist proves no host changes outside approved agent/collector setup. | Native portion not verified | V2simulator hashes retained; v3adds exact package/service/network/firewall checklist commands for approved native hosts, without fabricating completed native output. |
| AC-4 | Fresh native installation in exactly5steps brings a host into inventory. | Native portion not verified | V2five-step fresh fourth-source simulator evidence retained. V3compact native runbook has5operator stages/commands, but no actual native install is claimed. |
| AC-5 | Approved entity/provenance mapping, idempotent replay and preserved first_seen/advanced last_seen. | Pass under approved PoC mapping | Existing PostgreSQL/HTTP regression and all-entity timestamp/stale-replay tests pass in final22test suite. Schema remains22business+2junction/114FK. |
| AC-6 | Fixed5logical SELECT datasets, excluded sensitive data and safe actual payload. | Pass for implemented source path; native compatibility unverified | Existing query/projection/auth/privacy tests pass; v3strictly validates packages views and event disablement. No native query execution claim. |
| R-1 | Validate osquery.deb.conf/rpm.conf syntax/content; current machine must clearly report NATIVE_NOT_AVAILABLE, with no fake native run/install/host choice/token search. | Pass | native-check-v3.txt/native-readiness-v3.json:valid views/logicalTableCount5,exit2,NATIVE_NOT_AVAILABLE,PLATFORM_NOT_LINUX. Native/binary execution,token read,network,installation allfalse/0. Tests reject unsafe extra config keys/options/views/query content. |
| R-2 | Compact native runbook with exact commands/expected outputs on3approved future Linux/osquery hosts and native AC-1/3/4checklist. | Pass for documentation deliverable | collectors/osquery/NATIVE-RUNBOOK.md:5stages covering explicit target/baseline, config/query checks, collection/delivery, native checklist/recovery and fresh verification. No future run described as performed. |
| R-3 | Docs/evidence/S0-003/followup-readiness.md lists remaining native work and exact verification commands. | Pass | Requested path includes current exit codes, approved-target prerequisites, parameterized scope-specific SQL, filled-checklist requirements and distinctions from existing simulator evidence. |

## 3. Work completed

Read the concrete Lead01:36assignment without refreshing ClickUp, after submitting the separately assigned Cloudflare v3pack. Implemented local-only strict config/readiness inspection: no binary is spawned, no network client or credential reader exists. Added tests for both actual config files, unsafe content, unavailable platforms/missing executables and explicit candidate-only results; audited actual CLI under the existing network sentinel. Wrote the compact future runbook and detailed readiness/checklist guide. Ran actual current-platform check, lint→tests→build, extracted the observed native status, scanned source and committed. No distribution/host/token was chosen or installed and no v2PoC evidence was repeated as native.

## 4. Files changed

Relative to IT_SEC_APP. Source/evidence commit54776b7contains these12files; this canonical RESULT is the additional report update. Accepted schema/TASK/SRS and v2proof files remain unchanged.

| File | Change | Specific purpose |
|---|---|---|
| collectors/osquery/native-readiness.mjs | Added | Validates exact deb/rpm config and five logical SELECT projections, checks actual platform/executable-file availability without execution, emits explicit fail-closed status. |
| collectors/osquery/NATIVE-RUNBOOK.md | Added | Compact5stage future approved-host operator runbook with exact commands/expected outputs/native evidence boundaries. |
| collectors/osquery/README.md | Updated | Links readiness command/runbooks and clarifies current Windows exit2 and candidate-only behavior. |
| backend/test/osquery-native-readiness.test.mjs | Added | Strict config/unsafe-view tests, unavailable-platform/binary cases and actualCLI zero-network/binary/token audit. |
| package.json | Updated | Adds osquery:native-check command; dependencies/lockfile unchanged. |
| Docs/evidence/S0-003/followup-readiness.md | Added | Requested detailed native follow-up steps, per-ACSQL/commands/checklists, approval/privacy/fail-closed rules. |
| Docs/evidence/S0-003/native-check-v3.txt | Added | Actual current-machineCLI JSON:win32,NATIVE_NOT_AVAILABLE,exit2expected,no native execution. |
| Docs/evidence/S0-003/native-readiness-v3.json | Added | Structured copy of that actual output, expected exit code and source attribution. |
| Docs/evidence/S0-003/test-v3.txt | Added | Actual final22/22test output including native readiness/current-platform sentinel and prior collector/Cloudflare regressions. |
| Docs/evidence/S0-003/lint-v3.txt | Added | Actual lint44modules/schema22+2/114FKparity. |
| Docs/evidence/S0-003/build-v3.txt | Added | Actual app/migration packaging output. |
| Docs/evidence/S0-003/secret-scan-v3.json | Added | Heuristic148tracked-text scan,findings[], limitations stated. |
| Docs/RESULT-TASK-S0-003.md | Updated | Same canonical v3report,6originalACs plus3readiness requirements, version history, actual evidence and native gaps. |

## 5. Run and verify

From root with Node24 and existing lockfile dependencies:

```powershell
node --test backend/test/osquery-native-readiness.test.mjs
npm run osquery:native-check
npm run lint
npm test
npm run build
```

On this Windows machine, native-check is expected to exit2 and emit NATIVE_NOT_AVAILABLE. Treating that as a native pass would be wrong; it is a successful fail-closed readiness behavior. Invalid config gives exit1/CONFIG_INVALID. On a future approved Linux host, `npm run osquery:native-check -- --binary /usr/bin/osqueryi` can only return NATIVE_CANDIDATE_PRESENT after an executable-file check; it still reports binaryExecuted=false and is not evidence of actual osquery queries/installation.

The exact future native commands/checklists are in NATIVE-RUNBOOK.md and the requested followup-readiness.md. They require explicit approved lab targets/credentials already provisioned; no production choice, SSH, token lookup, distribution install or firewall write is automated. Later native collection uses the same existing collector/config/API without a schema change. Dependency clean install/native pg/Docker/remote CI were not run here.

## 6. Tests and actual results

| Test | Command / approach | Result | Actual output |
|---|---|---|---|
| Current native availability | node collectors/osquery/native-readiness.mjs | Intended fail-closed result | exit2,NATIVE_NOT_AVAILABLE,reasonPLATFORM_NOT_LINUX; both config checks pass, nativeExecuted/binaryExecuted/tokenRead/distributionInstalled=false,networkRequests0. native-check-v3.txt. |
| Strict config/content validation | Native readiness unit tests | Pass | Both actual deb/rpmconfigs parse; only SELECTname/version package views accepted; unexpected keys, enabled events, SELECT-star or injected statements rejected. |
| ActualCLI audit | Child process with fetch/TCP/TLS sentinel | Pass | NATIVE_READINESS_ACTUAL in test-v3.txt shows current win32report plus sentinel attempts0 and no native/binary execution. Positive Linux candidate unit branch is mocked and explicitly not actual native proof. |
| Full regression | npm test | Pass | tests22,pass22,fail0,duration_ms7643.0715. Includes collector source/auth/privacy/queue/timestamps, CloudflareGET/readiness and schema/shell tests. |
| Lint/schema parity | npm run lint | Pass |44modules;22entities+2junctions/114nativeFKs unchanged. |
| App packaging | npm run build | Pass | Backend/frontendESM and migration assets packaged. No Docker/native bootstrap claim. |
| Secret hygiene | node scripts/scan-secrets.mjs using bundled Git | Pass for heuristic scope |148trackedfiles,findings[]. New code contains no token reader/native binary execution; images/PDFs excluded, not a security audit. |

No new native-readiness test failure occurred. Exit2 is deliberate and preserved as evidence, not hidden or converted into a fictitious native run. Earlier v2harness failures/interrupted experiment remain recorded in Git/v2history and are not erased by this report. Full regression uses synthetic/localHTTP fixtures; zero-network claims apply specifically to native-readiness inspection/sentinel child, not every test. Existing ten-minute evidence remains600010ms and was not rerun.

## 7. Issues and implementation decisions

History: v1BLOCKEDschema mismatch→v2PARTIALimplemented collector/queue/API with disclosed simulators, ACCEPTED01:30→v3native-readiness extension explicitly assigned01:36, superseding only the old no-immediate-v3 instruction. V2ACCEPT and native gaps remain. All three v3readiness requirements are complete; overall status staysPARTIAL rather than claiming originally missing native AC-1/3/4are now met.

The readiness script is deliberately non-executing. It validates local config JSON/content before platform checks, rejects unavailable/relative/non-executable candidates, and never imports child_process/network clients or reads environment secrets. NATIVE_CANDIDATE_PRESENT means only file presence/executability, not binary authenticity, version, permissions, approved host status or osquery compatibility. Actual operator checks are explicit future steps. This avoids installing a distribution or silently using production merely to make a check green.

The accepted packages logical view remains SELECTname/version over deb_packages/rpm_packages with events disabled; no new discovery data/table. Documentation distinguishes manual approved-host checklist read commands from collector discovery queries. English report headings keep10numbered sections and unchanged requirement/entity IDs.

## 8. Not done, limitations and technical debt

Native Linux/osquery execution, real3host OS/package proof, actual native before/after checklists and fresh native install remain unverified. Readiness/runbooks are preparations, not their replacement. No existing simulation is renamed native or counted as a Linux kernel. Binary authenticity/real query success cannot be established by a file executable check.

No production/token/host access, new schema/entity, installer/distribution, SSH, service/network/firewall write, SSO/RBAC, discovery extension or unrelated feature. Native pg/Docker/remote CI and prior queue/power-loss/multi-process/retention limits remain as disclosed in v2. The native operator procedure must retain sensitive full host output privately and review/redact before attachment.

## 9. Blockers and decisions required

None for the newly assigned readiness deliverables; expected NATIVE_NOT_AVAILABLE is the explicitly requested truthful current-machine outcome. No renewed technicalBLOCKED/helpdesk question was sent. Original native acceptance evidence remains outstanding under the already accepted PARTIALPoCbasis. Future actual native/production/credential operations require the previously defined approved environment and authorization, not an inference from this readiness report. Do not self-close/change status/dependencies.

## 10. Next step and self-check

Review v3readiness code/output/runbooks and act on any concrete next assignment or specific review findings. When approved native targets exist, follow the exact documented procedure and record genuine outputs in the same RESULT history, with no schema/scope expansion. Do not rerun accepted simulator proof just for a checkpoint or post waiting-only task comments.

- [x]6originalACs retain honest native gaps;3newreadinessrequirements individuallypasswithcode/docs/output.
- [x]10sections,onecanonicalRESULT,v1→v2→v3history and precise12filedelta plus report.
- [x]ActualWindowsNATIVE_NOT_AVAILABLE/exit2andzero-attemptauditpreserved;22/22regressionpass.
- [x]No token/native binary execution,distribution/production/system change,new schema or taskstatusedit.
- [x]Attach actual RESULT and supporting readiness/evidence on the exact assigned task with one version/status summary.
