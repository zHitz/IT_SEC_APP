# Result — TASK-S0-003: Listening port/process Host search

| Field | Value |
|---|---|
| Task ID | TASK-S0-003 |
| Result version | v9 |
| Status | PARTIAL |
| Spec version followed | SRSv1.0; TASK-S0-003; Lead08:24 ACCEPT v8 and v9 assignment |
| Dev agent | Codex — Dev AI Agent |
| Submitted at | 2026-10-25T08:39:16.525255+07:00 |
| Source/evidence commit | 2bcc0bfb7ced1b8bb98ad4aa149a13ff973c1be3 |

## 1. Summary

PARTIAL overall retains original nativeLinux/osquery AC1/3/4 gaps. All assigned v9 listening port/process search requirements complete: exact port and literal case-insensitive process filters, matching Host/port/process/PID records, count/paging and return list/detail context. Existing local read-only GET extended without schema/Cloudflare/CVE/production change.48/48tests,lint72/schema22+2/114FK and buildPASS.

## 2. Acceptance criteria

Original and V4–V6/QA rows retain their previously accepted evidence boundaries. V7 below supersedes the old full-reload limitation.

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

| V6-1 | Click Host -> detail with OS/version, scoped Packages/version and ListeningPorts/process/PID through accepted APIs | Pass: host-detail.test.mjs actual HTTP/PostgreSQL and browser host-11.test/OS12.3/package1.2.3/port8011/PID111; detail-v6.json/png. |
| V6-2 | Back returns to list preserving search/page and frame style | Pass: DOM and actual browser retain host- search, page2of3/10rows. back-v6.png. Shared Atlas tokens/shell remain. |
| V6-3 | Opt-in/local/no schema/Cloudflare/native expansion | Pass: same gated frontend/proxy/API; no backend contract/schema change. Existing disabled404 tests retained. |
| V6-4 | Frontend detail/render/back tests/docs and full checks | Pass:35/35tests,lint57modules/schema22+2/114FK,buildPASS; Host guide updated. |
| QA-1 | PR comment4368355476: stale replay must preserve Package latest raw_ref | Pass: conditional incoming>=observed_at update; regression opens actual referenced Host/Package/Port rawJSON after latest/repeat/stale replay and confirms latest collected_at. |
| V7-1 | Direct Host identity link and reload reconstruct correct detail | Pass: UUID fragment and legacy detail fragment; fresh Host lookup, no list scan/history-data trust. DOM fresh-document and actual browser reload proofs. |
| V7-2 | Native browser Back/Forward and list search/page retention | Pass: URL carries validated list context; actual browser and history tests return to searchhost-/page2 and forward to Host12/PID112. |
| V7-3 | Unknown/invalid Host has clear error and no other Host partial data | Pass: exact lookup404/400; metadata/related rows cleared; actual browser and HTTP/DOM tests. |
| V7-4 | Same local opt-in/style/schema boundaries, tests/docs/full checks | Pass:42/42tests,lint63/schema22+2/114FK,buildPASS; API/UI guides updated; no Cloudflare/schema/production change. |

| V8-1 | Host package opens all matching hosts and versions | PASS: exact-name/null-safe ecosystem GET; actual24host/two-version READ ONLY SQL and browser proof. |
| V8-2 | Package-name/version search, pagination and total | PASS: literal bound search, page/count one statement,24records/3pages;2.0 search12records/2pages; empty state and invalid queries tested. |
| V8-3 | Return to originating Host and Host list with context | PASS: test restores Host11; actual browser restores Host11/PID111 and list host-/page2/3/size10. |
| V8-4 | Atlas style/local opt-in/no schema or CVE inference; docs/full checks | PASS: existing tokens/frame and fixed loopback GET proxy;45/45tests,lint67/schema22+2/114FK,buildPASS. |

| V9-1 | Search listening port or process and show matching Host/port/process/PID | PASS: exact8011 ->Host11/PID111; case-insensitive process24matches; real read-only SQL and browser proof. |
| V9-2 | Pagination and total | PASS:24listening records/3pages,10/page; actual second page Host11–20; both filters AND and empty matches tested. |
| V9-3 | Return list/detail and existing style/context | PASS: actual browser Host11 and list host-/page2/3/size10 retained; existing frame/tokens. |
| V9-4 | Docs/tests/local opt-in/schema unchanged/no CVE/Cloudflare | PASS:48tests,lint72/schema22+2/114FK,buildPASS; no schema/collector/Cloudflare changes. |
| R8-1 | Record exact v8 commit and exact v9 header | PASS: v8 hash914f875363559acb1dc870bfb60f78a3592f83ce recorded in section7; exact v9 implementation hash above. |

## 3. Work completed

Extended accepted listening-ports GET with bounded exact port/process_search parameters and a read-only Host join supplying hostname. One bound read statement returns count/page. Host list/detail launch a temporary search panel; safe text rendering, timeout, invalid/empty/error clearing,10-row pages and return to entry context. Existing endpoint fields and host_id scope retained.

## 4. Files changed

| File | Purpose |
|---|---|
| backend/src/inventory/reader.mjs | Exact port/literal process query validation/predicates and Host name join. |
| frontend/server.mjs | Whitelist port-search module under existing opt-in gate. |
| frontend/src/host-navigation.mjs | Mount/teardown port panel and hide during route changes. |
| frontend/src/port-search.mjs | Port/process inputs, results/count/paging/errors and origin return. |
| frontend/test/port-search.test.mjs | Actual read-only HTTP/PostgreSQL filters/identity/pages/return/invalid tests. |
| Docs/HOST-INVENTORY-API.md | Filters, validation, AND/count/response semantics. |
| Docs/HOST-INVENTORY-UI.md | Search flow, local reproduction and limits. |
| Docs/evidence/S0-003/port-search-v9.json | Observed proof and honest limits. |
| Docs/evidence/S0-003/test-v9.txt | Actual48test output. |
| Docs/evidence/S0-003/lint-v9.txt | Actual72module/schema check. |
| Docs/evidence/S0-003/build-v9.txt | Actual buildPASS. |
| Docs/evidence/S0-003/port-v9.png | Actual exact8011/Host11/PID111. |
| Docs/evidence/S0-003/process-page-v9.png | Actual24process matches/page2of3. |
| Docs/evidence/S0-003/port-back-v9.png | Actual returned list host-/page2/size10. |
| Docs/RESULT-TASK-S0-003.md | Canonical v9 with exact current hash and v8 provenance note. |

## 5. Run and verify

Repo root: `npm ci`, `npm run lint`, `npm test`, `npm run build`. Run `node scripts/inventory-ui-lab.mjs --hosts`; use emitted origin `/inventory/hosts#host=20000000-0000-4000-8000-000000000011&search=host-&page=2&page_size=10`. Search port or process ->8011 ->Host11/PID111. Clear port, process synthetic-listener ->24records/3pages; Next. Return detail, then list retains search/page. API `/api/v1/inventory/listening-ports?port=8011&process_search=synthetic&page=1&page_size=10`. Local synthetic only.

## 6. Tests and actual results

48/48tests pass; lint72modules; schema22businessentities+2junctions/114nativeFK unchanged; buildPASS. New integration uses actual HTTP/PostgreSQL17.5WASM inside BEGIN READ ONLY. Proves exactport, case-insensitive process, AND filters,24records/pages, invalid0/65536/decimal/duplicate/control400, literal injection no matches, no stale data and return context. Actual browser verifies8011/Host11/PID111, process page2/3 and both returns. Previous Domain/Host/package/collector regressions pass. Accepted600010ms outage not rerun.

## 7. Issues and implementation decisions

Lead requested explicit v8 provenance: actual accepted package-view v8 commit from Git is914f875363559acb1dc870bfb60f78a3592f83ce. Its old generic header is historical; current v9 header has exact current implementation/evidence hash.

Port is exact integer1–65535; process_search is a1–200character literal case-insensitive substring. Both combine with AND, including existing host_id scope. Counts are listening records, not unique hosts. Search is global stored listening inventory independent of origin list search, retained on return. Hostname comes from existing FK join, no schema migration. Temporary panel reload returns origin; no new deep-link search scope assumed. No task-specific failed tests; targeted1 and final48passed.

## 8. Not done, limitations and technical debt

Original nativeLinux/osquery AC1/3/4 remain unverified; accepted source lab is Windows SQLite Linux-inventory simulators plus real HTTP/PostgreSQLWASM. No native deployment/production/token/Cloudflare/CVE claim. No new auth/RBAC/schema/entity/scan. No search-panel reload persistence or scale benchmark;24synthetic matches prove function only. Exact viewport/reduced-motion runtime claim absent. Existing mandatory native follow-ups and accepted600010ms evidence preserved.

## 9. Blockers and decisions required

No hard blocker for v9; original native follow-ups remain separate before production. No new PO/security/spec decision or Q01–05 answer.

## 10. Next step and self-check

Submit actual v9 RESULT/guides/proof/logs/screenshots and update existing QA PR without merge. Await specific Lead/QA feedback/new assignment; no self-ACCEPT/task edits.

- [x] Ten ordered sections and individual original/historical/new criteria.
- [x] Exact current source/time/Summary and historical v8 hash checked.
- [x] Every changed file, commands/outputs/limits/assumptions listed.
- [x] PARTIAL retains native gaps; no native/scale/production overclaim.
- [x] Local/read-only/no-secret boundaries retained; actual attachments prepared.

History: v2–v7 accepted in recorded scopes; v8 package view accepted Lead08:24; v9 port/process search complete. Previous reports retained in Git/ClickUp.
