# Result — TASK-S0-003: v21 Unassigned Hosts sorting

| Field | Value |
|---|---|
| Task ID | TASK-S0-003 |
| Result version | v21 |
| Status | PARTIAL |
| Spec version followed | SRS v1.0; TASK-S0-003; live Lead assignment 1100390000161152 accepting v20 and assigning v21 |
| Dev agent | Codex — Dev AI Agent |
| Prepared at | 2026-10-25T14:22:19.509615+07:00 |
| Source/evidence commit | ee21fa011beb7de289f14d287e49b10917bbd3c7 |

## 1. Summary

PARTIAL in declared scope. v21 adds Unassigned Hosts sort controls, combined search/sort/page fragments, direct and reload restoration, native Back/Forward, and parent full-list/detail return with saved state. Invalid sort clears only this view. 71/71 tests pass; lint 93 modules; schema 22 entities + 2 junctions / 114 native FKs unchanged; build PASS. Synthetic local evidence only. Original native AC1/3/4 remain unverified; accepted actual 600010 ms outage evidence is retained, not rerun.

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


| V13-1 | Direct fragment and reload restore | PASS: actual HTTP/PostgreSQL freshDOM and real browser preserve selected Site/picker2/hostname/Host2. |
| V13-2 | Native Back/Forward and origin return | PASS: real browser/history fixture replay; previous both-return regressions pass. |
| V13-3 | Invalid state explicit/no partial | PASS: 7Site invalid cases;0rows/cards; real browser error screenshot. |
| V13-4 | Fields/style/boundaries and complete checks | PASS:55tests,lint82/schema22+2/114FK unchanged,build; existing OS/version or ownerDNS fields retained. |


| V14-1 | Direct link and reload | PASS: shared-runtime/deb,2.0search,12records/page2/2rows through actual HTTP/PostgreSQL freshDOM and real browser. |
| V14-2 | Back/Forward and returns | PASS: history fixture and real browser replay pages/search; existing return regressions pass. |
| V14-3 | Invalid state/no partial | PASS: 6package invalid cases; zero cells; real browser error screenshot. |
| V14-4 | Fields/style/docs/full checks/boundaries | PASS:57tests,84modules,22+2/114FK unchanged,build; exact source header. |


| V15-1 | Direct/reload/history | PASS: actual READ ONLY HTTP/PostgreSQL and browser evidence: 24processmatches/page2of3;port8011/host11/PID111;real browser reload/Back/Forward. |
| V15-2 | Invalid state | PASS: actual READ ONLY HTTP/PostgreSQL and browser evidence: 6malformed/duplicate/control/out-of-range routes clear rows. |
| V15-3 | Fields/returns | PASS: actual READ ONLY HTTP/PostgreSQL and browser evidence: Host/port/process/PID, detail and full-list search/page returns retained. |
| V15-4 | Docs/full checks/exact source/boundaries | PASS:59tests,86modules,22+2/114FK unchanged,build; exact source above. |


| V16-1 | Direct/reload | PASS: actual HTTP/PostgreSQL/browser evidence: SampleSite+host-/page2/16matches. |
| V16-2 | History/returns | PASS: actual HTTP/PostgreSQL/browser evidence: Host11search1 and original Site/page context;detailreturn. |
| V16-3 | Invalid/no partial | PASS: actual HTTP/PostgreSQL/browser evidence: 5malformed/duplicate/control states0rows. |
| V16-4 | Checks/boundaries | PASS: actual HTTP/PostgreSQL/browser evidence: 61tests,88modules,22+2/114FK unchanged,build;exact source. |


| V17-1 | Direct/reload | PASS: PARTIAL overall; nativeAC1/3/4 unverified. v17 Host detail package/port pages persist together via fragments/reload/history;31each/page2/6rowseach,OS12.3/process/PID and list return retained. |
| V17-2 | History/returns | PASS: Actual history fixture and browser Back/Forward; parent context retained |
| V17-3 | Invalid/no partial | PASS: 4Hostchildinvalid cases,0cells |
| V17-4 | Fullchecks/boundaries | PASS: 63tests,90modules,22+2/114FK unchanged,build;exact source above |


| V18-1 | Assigned Host sorting behavior | PASS in actual local HTTP/PostgreSQL and DOM: Three stored text fields × two directions; varied OS/version fixture, stable id ties, disjoint pages, search/page direct route, fresh DOM reload, Back/Forward fixture, detail return and six invalid routes. |
| V18-2 | Full regression and boundaries | PASS:65tests,93modules,22+2/114FK unchanged,build;source above. |
| V18-3 | Actual browser validation and delivery path | PASS browser: direct/reload, native Back/Forward, origin return, invalid zero partial; three screenshots. Attachment retry timed out; Lead-authorized fixed-commit fallback used in submission comment. |


| V19-1 | Assigned sorting and route behavior | PASS: Package name/version and port/PID asc/desc,stable id ties/NULLS LAST;31packages/31ports;direct bothpage2 yields6rows each;native reload/history;return retains scoped sorts;4invalid sort cases clear only affected list and preserve HostOS/healthy list. |
| V19-2 | Full validation and unchanged boundaries | PASS:67tests/0fail,lint93,schema22+2/114FK,build. Actual proof/logs/screenshots in evidence folder. |
| V19-3 | Browser evidence | PASS:3actual screenshots reload/history/invalid;scope and errors above verified in native built-in browser. |


| V20-1 | Assigned sort/combined routes/returns | PASS: Package hostname/version asc/desc,stable id ties/NULLS LAST;24hosts,search2.0 gives12,page2desc host03+host01;package/search/sort/page direct/reload/nativehistory;both parentdetail/list return retainstate;3invalidsort routes clearonlyview. |
| V20-2 | Tests and boundaries | PASS:69tests/0fail,lint93,schema22+2/114FK unchanged,build;actualproof in verification-v20.json. |
| V20-3 | Actual browser screenshots | PASS:3screens reload/history/invalid;nativeBack/Forward and bothparentreturnsverified. |

| V21-1 | Unassigned Hosts sort and combined direct/reload/history routes | PASS: verification-v21.json, scoped navigation regression and three actual browser screenshots. Existing SQL whitelist, id ties and NULLS LAST retained. |
| V21-2 | Parent detail/full-list return and isolated invalid sort | PASS: both parent return/reopen paths preserve search/sort/page in actual HTTP/DOM tests; four invalid sort routes clear only the scoped view and retain parent rows. |
| V21-3 | Complete checks and evidence within scope | PASS: 71/71 tests; lint93; schema22+2/114FK unchanged; build PASS; synthetic fixtures only. |

## 3. Work completed

Implemented and verified Lead assignment 1100390000161152. Sort controls preserve search and reset page on change. Inactive saved bookmarks let parent views render normally and restore the scoped view on explicit reopen. No API/schema/entity/tag/collector changes.

## 4. Files changed

| File | Specific change |
|---|---|
| Docs/DOMAIN-INVENTORY-UI.md | Document the v21 controls, route and reproduction steps. |
| Docs/HOST-INVENTORY-UI.md | Document the v21 controls, route and reproduction steps. |
| Docs/evidence/S0-003/build-v21.txt | Actual native ESM build output. |
| Docs/evidence/S0-003/lint-v21.txt | Actual lint/schema output (93 modules; 22+2/114FK). |
| Docs/evidence/S0-003/test-v21.txt | Actual complete test output (71 pass, 0 fail). |
| Docs/evidence/S0-003/unassigned-sort-history-v21.png | Actual viewport screenshot for unassigned-sort-history-v21. |
| Docs/evidence/S0-003/unassigned-sort-invalid-v21.png | Actual viewport screenshot for unassigned-sort-invalid-v21. |
| Docs/evidence/S0-003/unassigned-sort-reload-v21.png | Actual viewport screenshot for unassigned-sort-reload-v21. |
| Docs/evidence/S0-003/verification-v21.json | Actual structured v21 observations and limits. |
| Docs/evidence/S0-004/build-v21.txt | Actual native ESM build output. |
| Docs/evidence/S0-004/flagged-domains-sort-history-v21.png | Actual viewport screenshot for flagged-domains-sort-history-v21. |
| Docs/evidence/S0-004/flagged-domains-sort-invalid-v21.png | Actual viewport screenshot for flagged-domains-sort-invalid-v21. |
| Docs/evidence/S0-004/flagged-domains-sort-reload-v21.png | Actual viewport screenshot for flagged-domains-sort-reload-v21. |
| Docs/evidence/S0-004/lint-v21.txt | Actual lint/schema output (93 modules; 22+2/114FK). |
| Docs/evidence/S0-004/test-v21.txt | Actual complete test output (71 pass, 0 fail). |
| Docs/evidence/S0-004/verification-v21.json | Actual structured v21 observations and limits. |
| frontend/src/domain-navigation.mjs | Validate scoped sort keys and preserve Flagged Domains bookmarks and owner child-page state. |
| frontend/src/flagged-domains.mjs | Add hostname/direction controls; retain search and owner child-page behavior. |
| frontend/src/host-navigation.mjs | Validate scoped sort keys and serialize active/saved Unassigned routes through parent navigation. |
| frontend/src/site-hosts.mjs | Add Unassigned-only hostname/OS/version and direction controls; bind API sort and restore controls. |
| frontend/test/flagged-navigation.test.mjs | Add flagged-owner HTTP sort combinations and saved state regression including list/detail returns. |
| frontend/test/unassigned-navigation.test.mjs | Add real HTTP/PostgreSQL sort combinations, fresh DOM reload, list/detail returns, native-history fixture and invalid-view isolation. |
| Docs/RESULT-TASK-S0-003.md | Canonical v21 report; original and historical AC evidence retained; current criteria separate. |

## 5. Run and verify

From repository root: `npm ci`, `npm test`, `npm run lint`, `npm run build`. Focused: `node --test frontend/test/unassigned-navigation.test.mjs frontend/test/flagged-navigation.test.mjs`. Start browser labs with `node scripts/inventory-ui-lab.mjs --hosts` and `node scripts/inventory-ui-lab.mjs --flagged`; append the v21 fragment in the corresponding UI guide to the printed URL.

## 6. Tests and actual results

71 tests passed, zero failures. Lint passed for 93 modules; schema parity passed for 22 entities + 2 junctions / 114 native FKs; build passed. Real local HTTP/PostgreSQL tests cover six Host or two Domain sort combinations and parent list/detail return. Fresh DOM reload and history regressions plus actual built-in browser reload/native Back/Forward checks passed. Evidence: `Docs/evidence/S0-003/verification-v21.json`, `test-v21.txt`, `lint-v21.txt`, `build-v21.txt`, and three sort screenshots (reload/history/invalid). Browser screenshots are viewport captures.

## 7. Issues and implementation decisions

No v21 test failures. Existing API already enforces allowed sort identifiers, NULLS LAST and stable id-ascending ties; reuse it without schema changes. The new scoped sort parameters are independent of full-list sorting. Saved bookmarks use `unassigned_saved=1` to prevent immediate child reopening on parent return. Search remains bound through the existing API. OS/version sorting is lexical; stored flags are not recalculated. Nullable sorting is inherited from the tested reader; this round does not add a nullable fixture. ClickUp connector recovered; actual attachment upload will be attempted before submission. Earlier filechooser failures remain historical, not a current upload claim.

## 8. Not done, limitations and technical debt

Synthetic local inventory only. No production auth/RBAC/scale/CVE/native Linux/live Cloudflare/credential evidence. No schema/entity/collector/tag-algorithm changes. Inventory updates can change pagination between requests. Original AC1/3/4 remain unverified. The accepted actual 600010 ms outage proof is retained, not rerun.

## 9. Blockers and decisions required

No new missing input, security or specification decision. Q-01..Q-05 remain unanswered. QA approval is required before merge; Dev will not merge.

## 10. Next step and self-check

Push to the existing feature branch and PR, verify live CI, attach this canonical RESULT and evidence to the exact task and publish one submission. Await Lead/QA review.

- [x] Exact ten sections; historical and current AC rows separate.
- [x] Exact source commit, preparation time, files, commands, outputs and three screenshots.
- [x] Limits, decisions and read-only boundaries explicit.
- [x] No schema/entity/production changes.

History: v20 submitted and accepted in live Lead comment 1100390000161152; v21 assigned in that same comment, implemented and verified in this cycle.
