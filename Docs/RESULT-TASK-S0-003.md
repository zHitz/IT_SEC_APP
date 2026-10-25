# Result — TASK-S0-003: Unassigned Host route persistence

| Field | Value |
|---|---|
| Task ID | TASK-S0-003 |
| Result version | v12 |
| Status | PARTIAL |
| Spec version followed | SRSv1.0; TASK-S0-003; Lead09:25 ACCEPT v11 and v12 assignment |
| Dev agent | Codex — Dev AI Agent |
| Submitted at | 2026-10-25T09:34:32.810967+07:00 |
| Source/evidence commit | 4deb45d8df11175c20fbfe1991d05a4c7d443344 |

## 1. Summary

PARTIAL overall: original nativeLinux/osquery AC1/3/4 remain unverified. Assigned v12 unassigned view/search/page deep links, reload and Back/Forward complete. Explicit malformed-state errors clear all rows. OS/version and origin list/detail retained.53/53tests,lint80/schema22+2/114FK unchanged,buildPASS. No Site/schema/Cloudflare/CVE/production changes.

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

| V10-1 | Filter Hosts by existing Site with OS/version | PASS: exact accepted FK site_id; Sample16hosts/Secondary10; Host15 excluded from Sample; OS12.3 shown. |
| V10-2 | Hostname search/count/pages | PASS:16hosts/2pages, hostname11 ->1; Site picker13Sites/2pages in integration; valid unknown UUID0rows, invalid400. |
| V10-3 | Return full list/detail, existing style/context | PASS: browser Host11detail and full list host-/page2/3/size10 retained; Atlas tokens/frame. |
| V10-4 | Docs/full tests/local read-only/schema unchanged/current hash | PASS:50tests,lint76/schema22+2/114FK,buildPASS; exact source above; no forbidden expansion. |

| V11-1 | Only Hosts with site_id null, OS/version | PASS: exact IS NULL predicate;24nullSite Hosts,2assigned excluded; OS12.3 rendered. |
| V11-2 | Hostname search/count/pagination | PASS:24hosts/3pages, host11 ->1; assigned sample-host searchempty; invalid/conflicting query400. |
| V11-3 | Return full list/detail and existing style/context | PASS: browser Host11detail and full list host-/page2/3/size10 retained; dedicated unassigned controls. |
| V11-4 | Docs/full checks/read-only/schema unchanged/current hash | PASS:51tests,lint77/schema22+2/114FK,buildPASS; no Site writes, exact current source above. |


| V12-1 | Direct unassigned/search/page link and reload | PASS: actual HTTP/PostgreSQL freshDOM and real browser restore24hosts/page2of3 and host- search. |
| V12-2 | Native Back/Forward | PASS: host11search ->1/page1; Back24/page2; Forward1/page1 in actual browser and history fixture. |
| V12-3 | Invalid state explicit error/no partial | PASS:6invalid marker/page/duplicate/control cases zero cells; actual browser page0 error screenshot. |
| V12-4 | OS/version and origin list/detail/style | PASS: Synthetic Linux12.3 shown; both original return regressions pass retaining Host11detail or host-/page2/size10. |
| V12-5 | Full checks/docs/exact source/boundaries | PASS:53tests,80modules,22+2/114FK,build; exact source header; no Site writes or Cloudflare changes. |

## 3. Work completed

Added unassigned=1/unassigned_search/unassigned_page fragment parsing and fail-closed validation. Panel restore reuses accepted site_assigned=false GET, with history callbacks for search/page/return. Duplicate route events leave unchanged panel visible. Existing Site picker stays separate and retains behavior; no backend/schema changes.

## 4. Files changed

| File | Purpose |
|---|---|
| frontend/src/host-navigation.mjs | Strict unassigned route parse/restore/history and duplicate-event guard. |
| frontend/src/site-hosts.mjs | Routed unassigned open/search/page/return and invalid error clearing; preserve Site view. |
| frontend/test/unassigned-hosts.test.mjs | Existing READ ONLY nullSite/search/pages/503/bothreturns regression uses actual history semantics. |
| frontend/test/unassigned-navigation.test.mjs | Actual HTTP/PostgreSQL freshDOM reload, history and6invalid routes. |
| Docs/HOST-INVENTORY-UI.md | Route contract, reproduction and limits. |
| Docs/evidence/S0-003/unassigned-v12.json | Measured proof summary. |
| Docs/evidence/S0-003/test-v12.txt | Complete53test output. |
| Docs/evidence/S0-003/lint-v12.txt | Actual80module/schema parity. |
| Docs/evidence/S0-003/build-v12.txt | Successful build. |
| Docs/evidence/S0-003/unassigned-reload-v12.png | Browser24hosts/page2/OS12.3 after reload. |
| Docs/evidence/S0-003/unassigned-history-v12.png | Browser Forward restores host11search/page1. |
| Docs/evidence/S0-003/unassigned-invalid-v12.png | Browser page0 error without rows. |
| Docs/RESULT-TASK-S0-003.md | Canonical v12 exact10section report. |

## 5. Run and verify

Repo root: `npm ci`, `npm test`, `npm run lint`, `npm run build`. Focused `node --test frontend/test/unassigned-navigation.test.mjs frontend/test/unassigned-hosts.test.mjs`.
`node scripts/inventory-ui-lab.mjs --hosts`; use emitted origin + `/inventory/hosts#list=1&search=host-&page=2&page_size=10&unassigned=1&unassigned_search=host-&unassigned_page=2`. Reload, search host-11, Back/Forward; page0 shows error. No production inputs.

## 6. Tests and actual results

53/53tests pass,0failures; lint80modules; schema22entities+2junctions/114FK unchanged; buildPASS. Actual loopback HTTP/PostgreSQL17.5WASM, freshDOM reload/history fixture and real browser evidence prove route behavior. Existing BEGIN READ ONLY tests retain24nullSite/2assigned excluded/3pages, hostname search, OS/version, empty/503clearing and both return paths. Six invalid routes yield explicit error/zero cells. Full Domain/Site/package/collector regressions pass. No failed task tests. Accepted actual600010ms outage evidence retained and not rerun.

## 7. Issues and implementation decisions

Separate origin list search/page from unassigned_search/page. Require unique unassigned=1, search<=200/no controls, page1..100000; invalid marker/page/duplicates fail closed without panel data request. Route restores origin context before panel; return removes unassigned parameters. Existing temporary Site picker retains its behavior. Duplicate popstate/hashchange guard precedes hide. Synthetic Linux label is fixture data, never native proof.

## 8. Not done, limitations and technical debt

Native Linux/osquery AC1/3/4 remain unverified. No installation, production/RBAC/token/scale/CVE claim; no Site writes/schema/entity or Cloudflare changes. Existing bounded GET snapshots can change under concurrent inventory updates. Site picker itself is not reload-persisted. No exact viewport/reduced-motion measurement. Original600010ms accepted evidence remains historical, not simulated anew.

## 9. Blockers and decisions required

No hard blocker for v12 synthetic UI scope. Native follow-ups require legitimately authorized environment inputs; no new credential/production access inferred. Q01–05 untouched.

## 10. Next step and self-check

Push source/report to existing QA PR and attach canonical RESULT/guide/proof/logs/screenshots once. Await concrete Lead/QA review; execute next valid assignment. No self-accept or merge.

- [x] Ten numbered sections in order; original/historical/new AC separately mapped.
- [x] Exact current source/time/Summary; every changed file and reproduction commands.
- [x] Actual outputs, browser evidence, assumptions and remaining limits.
- [x] Native gaps and600010ms evidence preserved; no production/security overclaim.
- [x] One canonical report increment; prior accepted history retained in Git/ClickUp.

History: v10accepted09:06; v11accepted09:25; v12assigned09:25 and implemented. Historical rows retain original evidence dates/scope.
