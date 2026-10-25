# Result — TASK-S0-003: Hosts by existing Site

| Field | Value |
|---|---|
| Task ID | TASK-S0-003 |
| Result version | v10 |
| Status | PARTIAL |
| Spec version followed | SRSv1.0; TASK-S0-003; Lead08:45 ACCEPT v9 and assignment v10 |
| Dev agent | Codex — Dev AI Agent |
| Submitted at | 2026-10-25T08:55:34.034437+07:00 |
| Source/evidence commit | 1f8d292e6222db90cceacfcc9dfc98dd354d4b30 |

## 1. Summary

PARTIAL overall retains original nativeLinux/osquery AC1/3/4 gaps. All v10 Site filter requirements complete: paged existing-Site picker, exact Host.site_id filter, hostname search, OS/version/count/pages and return full list/detail context.50/50tests,lint76/schema22+2/114FK,buildPASS. No schema/entity/Cloudflare/CVE/production change.

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

## 3. Work completed

Added read-only Site inventory GET and exact site_id filter to existing Host GET; includes site_id in Host rows. New local panel exposes paged Site buttons and independent Host pages, hostname search/OS/version/count and return. No silent truncation of Site choices. Synthetic optional --sites fixture assigns14testHosts to existing SampleSite plus2seedHosts,10to a second syntheticSite. No migration or entity change.

## 4. Files changed

| File | Purpose |
|---|---|
| backend/src/app.mjs | Whitelist sites resource under existing inventory GET dispatcher. |
| backend/src/inventory/reader.mjs | Fixed Site columns, existing Host.site_id output/filter, strict bound UUID validation. |
| frontend/server.mjs | Fixed sites proxy/module whitelist under existing loopback gate. |
| frontend/src/host-navigation.mjs | Mount/hide/teardown Site panel with route changes. |
| frontend/src/site-hosts.mjs | Paged Site choices, scoped Host search/count/pages/OS/version/errors/return. |
| frontend/test/site-hosts.test.mjs | Actual READ ONLY HTTP/PostgreSQL Site/Host pages/membership/search/failure/return. |
| scripts/inventory-ui-lab.mjs | Optional synthetic Site assignments; default fixtures unchanged. |
| Docs/HOST-INVENTORY-API.md | Site GET and site_id filter semantics/validation. |
| Docs/HOST-INVENTORY-UI.md | Site workflow, page controls, null membership and reproduction. |
| Docs/evidence/S0-003/site-v10.json | Actual proof and limits. |
| Docs/evidence/S0-003/test-v10.txt | Complete50test output. |
| Docs/evidence/S0-003/lint-v10.txt | Actual76module/schema check. |
| Docs/evidence/S0-003/build-v10.txt | Actual buildPASS. |
| Docs/evidence/S0-003/site-page-v10.png | SampleSite16Hosts/page2/OS versions. |
| Docs/evidence/S0-003/site-search-v10.png | Host11 single scoped result. |
| Docs/evidence/S0-003/site-back-v10.png | Full list return retaining host-/page2/size10. |
| Docs/RESULT-TASK-S0-003.md | Canonical v10 with exact current source/time/Summary. |

## 5. Run and verify

Repo root: `npm ci`, `npm run lint`, `npm test`, `npm run build`. `node scripts/inventory-ui-lab.mjs --sites` emits local origin; open `/inventory/hosts#host=20000000-0000-4000-8000-000000000011&search=host-&page=2&page_size=10`. Filter hosts by Site ->SampleSite ->16hosts/2pages with OS/version; search host-11 ->1. SecondarySite ->10hosts. Return detail/full list retains context. API `/api/v1/inventory/sites?page=1&page_size=10`; `/api/v1/inventory/hosts?site_id=00000000-0000-4000-8000-000000000002&page=1&page_size=10`. Synthetic local only.

## 6. Tests and actual results

50/50tests pass; lint76modules; unchanged22entities+2junctions/114nativeFK; buildPASS. Actual HTTP/PostgreSQL17.5WASM BEGIN READ ONLY checks13Sites/2pickerpages (11extra emptySites fixture),16SampleHosts/2pages and10SecondaryHosts, OS/version/search, strict membership, unknownempty/invalid400,503clears rows and both returns. Browser independently verifies16/page2, Host11search, Secondary10, originHost11 and full list context. Existing Domain/port/package/collector regressions pass;600010ms outage not rerun.

## 7. Issues and implementation decisions

Site means accepted Host.site_id FK; never inferred from IP/tags. Site selection is explicit/paged; Host search ANDs with chosen UUID. Valid nonexistent Site produces empty filter, not lookup404; nullSiteHosts remain on full list. Count is Hosts in chosen Site. Picker and Host pages are independent; selected Site persists across picker paging. Temporary view reload returns origin; no new deep-link scope assumed. Errors clear Host rows. No task-specific failed tests. Prior accepted v8 source914f875363559acb1dc870bfb60f78a3592f83ce retained; exact current source above.

## 8. Not done, limitations and technical debt

Original nativeLinux/osquery AC1/3/4 remain unverified; lab source is Windows SQLite Linux-inventory simulators with actual HTTP/PostgreSQLWASM, not native deployment. No production/token/Cloudflare/CVE/RBAC/schema/entity change. No Site CRUD, unassigned-Site special view, panel reload persistence or scale benchmark. Existing mandatory native follow-ups/600010ms proof preserved. No exact viewport/reduced-motion claim.

## 9. Blockers and decisions required

No hard blocker for v10; no new PO/security/spec decision or Q01–05 answer. Native follow-ups remain separate before production.

## 10. Next step and self-check

Attach actual RESULT/guides/proof/logs/screenshots; update existing QA PR without merge. Await specific Lead/QA feedback/new assignment. No self-ACCEPT/status/dependency edits.

- [x] Ten ordered sections and individual original/historical/new criteria.
- [x] Exact current source/time/Summary checked.
- [x] Every file, command/output, assumption/limit listed.
- [x] PARTIAL retains native gaps; local/read-only/no-secret boundaries.
- [x] Canonical version incremented; actual attachments prepared.

History: v8package andv9port/process accepted; v10existing-Site filter complete under Lead08:45. Prior versions remain in Git/ClickUp.
