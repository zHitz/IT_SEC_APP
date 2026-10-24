# Result — TASK-S0-003: Host inventory page

| Field | Value |
|---|---|
| Task ID | TASK-S0-003 |
| Result version | v5 |
| Status | PARTIAL |
| Spec version followed | SRS v1.0; TASK-S0-003; Lead02:52 on2026-10-25 frontend assignment; v4 ACCEPT retained |
| Dev agent | Codex — Dev AI Agent |
| Submitted at | 2026-10-25, current execution after03:14 start (+07:00) |
| Source/evidence commit | 50e4e0c829f4de69b3f371aba0823bc18fed2327 |

## 1. Summary

Completed all newly assigned Host frontend requirements: one local page showing Host OS/version, Package version and ListeningPort process/PID via accepted v4GET APIs, hostname/package search, pages/totals and existing Atlas visual concept. Actual DOM tests, real synthetic HTTP/PostgreSQL integration and browser checks pass; full33/33tests,lint55modules/schema parity,build pass. Overall PARTIAL retains native AC1/3/4 gaps; new v5work itself is complete. V4 ACCEPT02:52 retained. No Cloudflare collector, schema/entity, native or production change.

## 2. Acceptance criteria

| ID | Criterion | Result / actual evidence |
|---|---|---|
| AC-1 | Three native Linux hosts with OS/packages | Native portion unverified; accepted v2 simulator evidence retained; v4 adds no native claim. |
| AC-2 | Actual ten-minute outage/recovery without loss | Previously accepted actual 600010 ms/60 batches/69 executions/pending0 retained in verification.json; not rerun. Fast regression remains green. |
| AC-3 | Native host changes limited to agent | Native portion unverified; v3 readiness/runbook retained, accepted. |
| AC-4 | Five-step native install works | Native portion unverified; accepted fresh simulator evidence and future native runbook retained. |
| AC-5 | Correct entity/upsert/timestamps | Accepted v2 evidence and full-suite regression pass; v4 reads existing schema only. |
| AC-6 | SELECT-only source and safe payload | Accepted source/privacy regression passes; v4 fixed field projections exclude raw payload and sensitive fields. |
| V4-1 | GET Host with OS/version, Package with version, ListeningPort with process/PID | Pass: actual ephemeral HTTP server and PostgreSQL17.5 WASM assertions in inventory.test.mjs; inventory-v4.json and test-v4.txt. |
| V4-2 | Hostname/package search, pagination and counts | Pass: case-insensitive literal substring (including %/_ and injection-shaped text), filtered/global totals, empty results, out-of-range pages and non-overlapping ordered pages. |
| V4-3 | Tests and endpoint documentation | Pass: HOST-INVENTORY-API.md covers methods, paths, query bounds, examples, fields, response/count semantics, errors, enabling and security boundary. 25/25 complete suite. |
| V4-4 | No schema/entity/Cloudflare/UI changes; synthetic only | Pass: scoped source commit lists only inventory reader, backend wiring, tests, guide and evidence; schema checker 22+2/114 FK. Actual integration queries execute inside BEGIN READ ONLY. |

| V5-1 | One frontend page showing Host OS/version, Package version, ListeningPort process/PID from accepted v4API | Pass: hosts.html/shared inventory-table/controller and real HTTP/PostgreSQL/browser screenshots. |
| V5-2 | Hostname/package search, pagination/counts, existing frame style | Pass: actual DOM tests, accepted API proxy tests and browser26hosts/10rows/page2/hostname1match/package1match/25listeners; Atlas tokens/shell/theme retained. |
| V5-3 | Local opt-in, no native/production/auth/schema/Cloudflare expansion | Pass: default404, explicit loopback page/proxy; accepted schema22+2/114FK unchanged, no collector/backend schema changes. |
| V5-4 | Frontend tests/docs and full checks | Pass:33/33tests,lint55modules,build pass; HOST-INVENTORY-UI.md exact commands/boundaries/behavior/limits. |

## 3. Work completed

Read Lead02:52 ACCEPT/v5assignment; completed/submitted active Domain v5first, then built Host frontend on the same shared table/controller and posted [DEV][START]03:14 with actual code/test evidence. Added opt-in fixed Host GET routes, extracted reusable renderer with compatibility wrapper preserving Domain tests, added declared host fixture lab, UI tests/guide and actual browser screenshots. Full lint->test->build pass, known-pattern scan and source commit. No ten-minute outage repeat, native binary/token/production access or Cloudflare call.

## 4. Files changed

Source commit50e4e0c contains the following20files; canonical RESULT is additional report-only update.

| File | Specific change |
|---|---|
| .gitignore | Exact hosts.html source exception only; saved HTML remains excluded. |
| Docs/DOMAIN-INVENTORY-UI.md | Clarifies shared proxy now also allows separately assigned Host inventory routes. |
| Docs/HOST-INVENTORY-UI.md | Host local setup/UI/proxy/reproduction guide, declared fixture and native limits. |
| Docs/evidence/S0-003/build-v5.txt | Actual ESM/database packaging output. |
| Docs/evidence/S0-003/lint-v5.txt | Actual55module/schema parity output. |
| Docs/evidence/S0-003/secret-scan-v5.json | Actual tracked text known-pattern scan; binary files excluded. |
| Docs/evidence/S0-003/test-v5.txt | Actual full33test output. |
| Docs/evidence/S0-003/ui-v5-hosts.png | Actual Host page2 browser screenshot. |
| Docs/evidence/S0-003/ui-v5-packages.png | Actual package search/version screenshot. |
| Docs/evidence/S0-003/ui-v5-ports.png | Actual listener/process/PID screenshot. |
| Docs/evidence/S0-003/ui-v5.json | Actual browser/HTTP/test proof, hashes and failure disclosure. |
| frontend/server.mjs | Adds opt-in Host page/bootstrap/shared controller and fixed GET Host/Package/Port proxy routes; conditional navigation includes both pages. |
| frontend/src/domain-inventory.mjs | Compatibility wrapper now delegates to extracted shared table; Domain behavior/tests preserved. |
| frontend/src/domains.html | Adds working Host navigation alongside existing Domain navigation. |
| frontend/src/host-page.mjs | Host mode bootstrap and shared theme preference. |
| frontend/src/hosts.html | New semantic English Host page in existing Atlas shell, three resources, counts/search/pages. |
| frontend/src/inventory-table.mjs | Shared safe table/controller; Host/Package/Port field projections, numeric PID/port validation, per-resource labels/search and page reset. |
| frontend/test/domain-proxy.test.mjs | Unknown-route404 assertion now uses unapproved unknown path; Package GET became explicitly authorized in S0-003v5. |
| frontend/test/host-inventory.test.mjs | Actual DOM and HTTP/PostgreSQL tests for Host/Package/Port fields/search/pages/totals and opt-in404. |
| scripts/inventory-ui-lab.mjs | Optional--hosts fixture profile:26hosts/24host packages/25ports; accepted required normalized_version obeyed. |
| Docs/RESULT-TASK-S0-003.md | Canonical v5ten-section RESULT; original native gaps and accepted v2/v3/v4 history preserved. |

## 5. Run and verify

From IT_SEC_APP with Node24: `npm ci`; `node scripts/inventory-ui-lab.mjs --hosts`; open printed loopback /inventory/hosts. Explicit lab creates disposable PostgreSQL17.5WASM fixtures, no Linux/osquery claim. Ctrl+C closes it. Existing approved synthetic DB mode requires backend INVENTORY_READ_ENABLED=true, frontend INVENTORY_UI_ENABLED=true and explicit loopback hosts/upstream as HOST-INVENTORY-UI.md describes. Run `node --test frontend/test/host-inventory.test.mjs`, `npm run lint`, `npm test`, `npm run build`. No production rollout or automatic fixture fallback.

## 6. Tests and actual results

Targeted final2/2pass; full required sequence all exit0:33tests/pass33/fail0/duration8390.5721ms; lint55modules/schema22entities+2junctions/114FK; build backend/frontend ESM/database assets PASS. Actual DOM test covers OS/version, Host search/page reset, Package version/name search and listener process/PID. Actual HTTP/PostgreSQL proof:26hosts,24host packages,25host ports, stable pages/search/field values/counts/default404; Domain regressions remain green including safe text/error/empty/retry/race handling. Actual browser:10rows/page Next->page2of3,HOST-01=>1host,package-01=>1package version1.2.3,Listeningports=>25 with synthetic-listener and integerPID. Screenshots/ui-v5.json saved. Initial synthetic package fixture failed accepted normalized_version NOT NULL; fixture corrected, schema unchanged. No failed final test hidden. NativeLinux/osquery=false; no repeat of accepted600010ms experiment.

## 7. Issues and implementation decisions

Extracted shared inventory-table.mjs rather than duplicate UI behavior; Domain module keeps compatibility wrapper and tests. Uses same Atlas design tokens/theme/CSS/layout and accepted API only. Resource switching clears search/page; listener search disabled because v4does not accept it. Typed port/PID values validated separately from strings/nulls. Host package/image and host/container listener boundaries follow accepted API, not new business logic. Shared proxy extends explicit resource whitelist; no arbitrary target/auth/cookie forwarding. Exact hosts.html gitignore exception preserves saved artifacts. Updated Domain proxy docs/test to reflect now-authorized Host routes. No product/scope/security decision needed.

## 8. Not done, limitations and technical debt

Original nativeLinux/osquery AC1/3/4 remain unverified. Existing actual outage/queue experiment and simulator evidence retained, not rerun/relabelled. No real host/token/production/Cloudflare source change, schema/entity, authRBAC, nativePG/Docker or remote-native verification. Exact390/1024/1440viewport and reduced-motion runtime emulation unavailable; CSS responsive/focus/reduced-motion rules retained and actual viewport screenshots captured. No large-scale performance/assistive technology certification or live discovery claim. PostgreSQL17.5WASM fixture data is explicit.

## 9. Blockers and decisions required

No hard blocker for assigned v5frontend; all new requirements pass. Future original native acceptance still requires approved real Linux/osquery inputs per runbook. That remains separate from completed local UI scope and accepted PoC.

## 10. Next step and self-check

Attach actual canonical v5RESULT, guide, proof/logs/screenshots and publish one [DEV][SUBMISSION]PARTIAL comment: v5frontend complete, original native gaps retained. Push to existing QA branch/PR without merge/status/dependency changes; act on concrete Lead/QA feedback.

- [x] Exact TASK/version/status/spec and10orderedsections.
- [x] Original ACs, accepted V4 scope and every V5 requirement mapped separately.
- [x] Every changed file and real output/failure/assumption/limit included.
- [x] No secrets/production/native claims; original completed experiment preserved.
- [x] One canonical RESULT, previous accepted versions retained in Git/ClickUp.

History: v1BLOCKEDmapping; v2PARTIALsimulatorPoC ACCEPT01:30; v3PARTIALreadinesscomplete ACCEPT02:03; v4PARTIALinventoryAPIcomplete ACCEPT02:52; v5PARTIALoverall/assignedHostfrontendcomplete. V5is new work, not v4REWORK.

