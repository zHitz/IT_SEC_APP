# Result — TASK-S0-003: Package-to-hosts inventory view

| Field | Value |
|---|---|
| Task ID | TASK-S0-003 |
| Result version | v8 |
| Status | PARTIAL |
| Spec version followed | SRSv1.0; TASK-S0-003; latest Lead07:54 v8assignment; v7ACCEPT retained |
| Dev agent | Codex — Dev AI Agent |
| Submitted at | 2026-10-25T08:11:37.082584+07:00 |
| Source/evidence commit | See v8 commit on existing QA feature branch; logs/screenshots included |

## 1. Summary

PARTIAL overall because original native Linux/osquery AC1/3/4 remain unverified. All newly assigned v8 package-to-hosts requirements are complete in approved synthetic scope. Host packages open exact name/ecosystem host/version inventory, searchable and paginated, with safe return to original Host/list. No schema, Cloudflare or production change.

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

## 3. Work completed

Added one read-only package UUID-to-hosts endpoint and selected-package panel. Uses accepted package source_host_or_image mapping, only host source_kind, exact package name+ecosystem across all stored versions. Search remains scoped to selected identity. No arbitrary SQL identifiers or upstream target. The panel uses text nodes, bounded fetch timeout, explicit empty/error states and clears stale rows. Host v7 and Domain v8 regressions pass.

## 4. Files changed

| File | Purpose |
|---|---|
| backend/src/app.mjs | Dispatch whitelisted package UUID/hosts GET relation through existing gates/errors. |
| backend/src/inventory/exact-reader.mjs | Single bound read statement for package identity, host/version page/count and existence. |
| frontend/server.mjs | Fixed package-host route proxy and static module whitelist. |
| frontend/src/package-hosts.mjs | Package panel, name/version search,10-row paging/count, safe rendering/error/return controls. |
| frontend/src/host-navigation.mjs | Connect package selection to panel, preserve Host/list context and teardown. |
| frontend/src/inventory-detail.mjs | Optional package-name selection hook; Domain behavior unchanged. |
| frontend/test/package-hosts.test.mjs | Actual synthetic HTTP/PostgreSQL READ ONLY flow, search/pages/count/return and query errors. |
| scripts/inventory-ui-lab.mjs | Optional --packages synthetic24host/two-version fixture; default fixtures unchanged. |
| Docs/HOST-INVENTORY-API.md | Package endpoint response, identity, query and count semantics. |
| Docs/HOST-INVENTORY-UI.md | Package navigation and honest reload limits/reproduction. |
| Docs/evidence/S0-003/package-v8.json | Actual observed proof and limitations. |
| Docs/evidence/S0-003/test-v8.txt | Complete45test output. |
| Docs/evidence/S0-003/lint-v8.txt | Actual67module/schema check. |
| Docs/evidence/S0-003/build-v8.txt | Actual successful build. |
| Docs/evidence/S0-003/package-page-v8.png | Real browser page2of3,24host/version records. |
| Docs/evidence/S0-003/package-search-v8.png | Real version2.0 search12records/2pages. |
| Docs/evidence/S0-003/package-back-v8.png | Returned Host list retaining host-/page2/size10. |
| Docs/RESULT-TASK-S0-003.md | Canonical v8 report retaining original/historical AC rows above. |

## 5. Run and verify

From repo root: `npm ci`, `npm run lint`, `npm test`, `npm run build`. For browser proof run `node scripts/inventory-ui-lab.mjs --packages`, use emitted origin and `/inventory/hosts#host=20000000-0000-4000-8000-000000000011&search=host-&page=2&page_size=10`. Select shared-runtime, inspect24rows/3pages, Next, search2.0, return Host11, reopen and Back to host list. Synthetic local loopback lab only; no production token.

## 6. Tests and actual results

45/45tests pass, lint67modules, schema22entities+2junctions/114nativeFK unchanged, buildPASS. Package flow executes actual HTTP and PostgreSQL17.5WASM in BEGIN READ ONLY: exact selected identity,24host rows,2versions, pagination/count/search, empty state, Host return, missing404/invalid400/nonGET405. Real browser independently verifies select/page/search/both return paths. All earlier Host, Domain and collector regressions pass. Actual accepted600010ms outage remains retained and was not rerun. No native Linux/osquery claim.

## 7. Issues and implementation decisions

Package identity is exact name plus ecosystem, not selected version; otherwise cross-host version comparison would be lost. Counts are host/version observation rows; multiple stored versions can produce multiple rows for a Host. Search is within that package identity and matches name OR version literally; no SQL wildcard interpretation. Existing UUID provides a stable selected package reference; missing/non-host package404. Package subview is temporary within originating Host route; reload returns Host details, no new package deep-link scope assumed. No task-specific failed tests in v8; targeted3checks and final45checks passed. Prior Domain test-fix history is separate and disclosed in its RESULT.

## 8. Not done, limitations and technical debt

Original native AC1/3/4 remain unverified (Windows SQLite Linux-inventory simulators, actual HTTP/PostgreSQLWASM, not native Linux/osquery). No real credentials/production/Cloudflare changes/CVE conclusions. No new RBAC or schema/entity. No package deep-link reload persistence or scale benchmark;24synthetic hosts prove functional pagination only. Exact viewport/reduced-motion emulation not claimed. Accepted600010ms experiment preserved, not reconstructed.

## 9. Blockers and decisions required

No hard blocker for assigned package scope; all v8 requirements pass. Native follow-ups remain separately required before production; no new PO decision/Q01–05 answer.

## 10. Next step and self-check

Attach this actual RESULT and proof to assigned task, update existing QA PR, await specific review/new assignment. Do not merge, self-ACCEPT or change task status/dependencies.

- [x] Ten sections in order; original and new criteria individually mapped.
- [x] Actual commands/outputs, all changed files, limits and assumptions listed.
- [x] PARTIAL preserves native gaps; no production/native/scale claim.
- [x] Canonical version incremented; actual attachments prepared.

History: v2–v6 accepted in recorded PoC scopes; v7 Host navigation accepted Lead07:54; v8 package-to-hosts complete. Previous versions retained in Git/ClickUp.
