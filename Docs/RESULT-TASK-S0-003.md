# Result — TASK-S0-003: Host inventory prototype

| Field | Value |
|---|---|
| Task ID | TASK-S0-003 |
| Result version | v4 |
| Status | PARTIAL |
| Spec version followed | SRS v1.0; TASK-S0-003; Lead 02:03 on 2026-10-25 inventory assignment; v3 ACCEPT retained |
| Dev agent | Codex — Dev AI Agent |
| Submitted at | 2026-10-25, current execution after 02:36 start (+07:00) |
| Source/evidence commit | 44675ad824eaa1fc957c7f3b77aa263297794233 |

## 1. Summary

Completed the newly assigned v4 host inventory prototype: three GET endpoints for Host/OS/version, host Package/version and host ListeningPort/process/PID; literal case-insensitive search, optional host scope, stable bounded pagination and filtered counts. Added actual HTTP/PostgreSQL tests and endpoint documentation. Final 25/25 tests, lint 46 modules/schema parity, build pass. Overall PARTIAL preserves the original native AC-1/3/4 gaps; all newly assigned v4 requirements pass. V3 was ACCEPTED at 02:03, not reworked. No schema/entity, UI, collector or Cloudflare source change.

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

## 3. Work completed

Read Lead's live 02:03 ACCEPT/new assignment, implemented query layer, posted start with actual code evidence at 02:36, then added routing/server integration/tests/docs. Inventory is opt-in; disabled routes return 404. Enabled local prototype refuses non-loopback bind, uses a separate pool with database read-only default and 5-second statement timeout. Count/page come from a single SQL statement to avoid mismatched snapshots. Query identifiers are whitelisted, caller data is parameterized, query size/page sizes are bounded and failures sanitized. No native experiment or accepted ten-minute run was repeated.

## 4. Files changed

| File | Specific change |
|---|---|
| backend/src/inventory/reader.mjs | Fixed Host/host-Package/host-Port projections, parameter validation, literal search, optional host UUID filter, stable ordering, one-statement count/page response. |
| backend/src/app.mjs | Optional GET inventory dispatch, 405/Allow for known routes, sanitized 400/503 errors and request IDs; existing health/ingest preserved. |
| backend/src/server.mjs | Opt-in inventory enable flag, explicit loopback boundary, isolated read-only pg pool with timeout, cleanup and sanitized startup errors. |
| backend/test/inventory.test.mjs | Three tests: actual HTTP/SQL synthetic read-only integration; invalid bounds/error sanitization; refused non-loopback startup. |
| Docs/HOST-INVENTORY-API.md | Full local endpoint contract, examples, count semantics, boundary and reproduction guide. |
| Docs/evidence/S0-003/inventory-v4.json | Actual proof summary and SHA256 of changed source/docs/logs. |
| Docs/evidence/S0-003/test-v4.txt | Full real 25-test output, including inventory proof. |
| Docs/evidence/S0-003/lint-v4.txt | Actual 46-module and schema parity output. |
| Docs/evidence/S0-003/build-v4.txt | Actual ESM/backend/frontend/database packaging output. |
| Docs/RESULT-TASK-S0-003.md | This canonical v4 report, preserving original AC limits and prior acceptance history. |

## 5. Run and verify

From IT_SEC_APP: `node --test backend/test/inventory.test.mjs`; then `npm run lint`, `npm test`, `npm run build`. Tests create fresh synthetic PostgreSQL WASM state and ephemeral loopback HTTP; no DATABASE_URL/token/production host needed. Manual daemon configuration is documented in HOST-INVENTORY-API.md: approved local synthetic DATABASE_URL, BACKEND_HOST=127.0.0.1, BACKEND_PORT, INVENTORY_READ_ENABLED=true; `npm run start:backend`. Default is disabled; do not expose this unauthenticated prototype externally. No real service connection was made.

## 6. Tests and actual results

Actual commands: targeted inventory tests initially 2/2 passed; added startup-boundary test, then full `npm run lint` -> `npm test` -> `npm run build`, all exit0. Full output: tests25, pass25, fail0, duration8207.5861ms. Lint PASS46 modules; schema check PASS22 entities,2 junctions,114 native FKs. Build PASSbackend/src -> backend/dist; frontend/src -> frontend/dist; database assets packaged. No test failure in this v4 implementation.

Actual inventory proof: 3 synthetic hosts,2 host packages (image seed package excluded),2 host listening ports;12 read SELECT/CTE statements completed inside PostgreSQL BEGIN READ ONLY. Assertions verify OS/version, package version, process/PID, literal/case-insensitive search, same-response totals, stable page boundaries, empty/beyond-end cases, input rejection, GET-only methods, no-store headers and sanitized 503. Snapshot host count unchanged. Startup subprocess rejects external bind before any inventory database connection. This proves the implemented query path; it is not native pg/real Linux deployment evidence.

## 7. Issues and implementation decisions

No scope/AC decision needed. Chose separate resource endpoints so package/port fanout cannot silently truncate a Host card. Host packages filter accepted source_kind=host; image packages and container-only ports belong to separate future scope. Counts mean filtered totals and are returned on every page, avoiding an unrequested dashboard. Use offset paging (bounded) with deterministic ID tie-breaker; rows can shift between different requests if ingestion changes inventory. Local-only enablement is a temporary unauthenticated prototype boundary, not production access control. No fields/schema changed. Current sandbox denied F: writes; scoped escalation succeeded, so work continued without changing approval policy.

## 8. Not done, limitations and technical debt

Original native Linux/osquery AC-1/3/4 remain unverified. No UI/dashboard, real host/production access, authentication/RBAC product flow, indexes/schema migrations, native PostgreSQL daemon/Docker or remote CI run. Actual integration engine is PostgreSQL17.5 WASM. Server uses native pg pool but daemon success path is not claimed as tested. No concurrency/performance benchmark at production scale; no import/export or write endpoint. No native credential lookup or Cloudflare request was performed.

## 9. Blockers and decisions required

No hard blocker for the v4 assignment; all its requested work is complete. Future native acceptance requires approved real Linux/osquery lab input under the retained runbook. That follow-up does not invalidate the accepted simulator PoC or completed inventory prototype.

## 10. Next step and self-check

Submit this actual file and evidence to the same ClickUp task with one v4 PARTIAL comment (new assignment complete; original native gaps retained). Lead reviews; no self-ACCEPT/status/dependency changes. Execute concrete next assignment/rework when issued.

- [x] Ten sections in order; exact TASK/version/status and spec/Lead basis.
- [x] Every original AC and each v4 requirement separately mapped to truthful evidence.
- [x] Every changed file, actual commands/output, limitations and assumptions disclosed.
- [x] Synthetic/WASM and native boundaries explicit; no secrets/production data included.
- [x] Existing v2/v3 acceptance and completed real-duration outage preserved.

Version history: v1 BLOCKED mapping; v2 PARTIAL simulator PoC, ACCEPT01:30; v3 PARTIAL overall/native-readiness complete, ACCEPT02:03; v4 PARTIAL overall/assigned host inventory complete, new assignment not rework. Earlier canonical versions remain in Git and previously attached ClickUp files.
