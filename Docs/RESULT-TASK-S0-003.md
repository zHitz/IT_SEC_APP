# Result — TASK-S0-003: v23 Port/process results sorting

| Field | Value |
|---|---|
| Task ID | TASK-S0-003 |
| Result version | v23 |
| Status | PARTIAL |
| Spec version followed | SRS v1.0; TASK-S0-003; live Lead comment 1100390000161262 accepting v22 and assigning v23 |
| Dev agent | Codex — Dev AI Agent |
| Prepared at | 2026-10-25T15:12:50.468389+07:00 |
| Source/evidence commit | 22843f16222f5162b20a7e37da352eaa854aea92 |

## 1. Summary

PARTIAL in declared scope. Port/process result sorting supports hostname/port/process/PID asc/desc. 24 synthetic matches; hostname-desc page 2 shows hosts14 through05. Invalid sort preserves search inputs and parent context. Original native AC1/3/4 remain unverified; accepted actual 600010ms outage retained, not rerun. Direct/reload/native history preserve combined context/search/sort/page. 75/75 tests pass; lint93; schema22+2/114FK unchanged; buildPASS.

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

| V22-1 | Site-filtered Hosts sorting, stable ties/NULLS LAST and combined direct/reload/history routes | PASS: verification-v22.json, actual HTTP/PostgreSQL regression and three browser screenshots. Six Host sort combinations using existing Site filter. |
| V22-2 | Invalid sort clears only scoped list, preserving parent information | PASS: four invalid-sort routes, zero partial rows; Host parent detail information retained; Site state saved across return/reopen. |
| V22-3 | Full checks and evidence within scope | PASS: 73 tests, zero failures; lint93; schema22+2/114FK unchanged; build PASS; synthetic fixtures only. |

| V23-1 | Port/process results sorts with stable ties/NULLS LAST and combined routes | PASS: Eight hostname/port/process/PID combinations; 24 matches. |
| V23-2 | Direct/reload/native history and invalid-sort isolation | PASS: actual HTTP/PostgreSQL/DOM tests and browser; four invalid sort cases clear only scoped list and retain inputs and parent information. |
| V23-3 | Full checks and required evidence | PASS:75tests/0fail;lint93;schema22+2/114FK unchanged;build;three browser screenshots. |

## 3. Work completed

Implemented Lead comment 1100390000161262. Reused existing sort parameter/API, extending only its whitelist for hostname/process. Search retains exact port/process AND semantics. Sort changes reset page, preserving query.

## 4. Files changed

| File | Specific change |
|---|---|
| Docs/DOMAIN-INVENTORY-UI.md | Document v23 controls, parameters, limits and exact reproduction route. |
| Docs/HOST-INVENTORY-API.md | Document v23 controls, parameters, limits and exact reproduction route. |
| Docs/HOST-INVENTORY-UI.md | Document v23 controls, parameters, limits and exact reproduction route. |
| Docs/evidence/S0-003/build-v23.txt | Actual ESM build output. |
| Docs/evidence/S0-003/lint-v23.txt | Actual lint/schema parity output. |
| Docs/evidence/S0-003/port-sort-history-v23.png | Actual viewport screenshot for port-sort-history-v23. |
| Docs/evidence/S0-003/port-sort-invalid-v23.png | Actual viewport screenshot for port-sort-invalid-v23. |
| Docs/evidence/S0-003/port-sort-reload-v23.png | Actual viewport screenshot for port-sort-reload-v23. |
| Docs/evidence/S0-003/test-v23.txt | Actual complete75test passing output. |
| Docs/evidence/S0-003/verification-v23.json | Actual structured v23 observations and limitations. |
| Docs/evidence/S0-004/build-v23.txt | Actual ESM build output. |
| Docs/evidence/S0-004/flagged-child-sort-history-v23.png | Actual viewport screenshot for flagged-child-sort-history-v23. |
| Docs/evidence/S0-004/flagged-child-sort-invalid-v23.png | Actual viewport screenshot for flagged-child-sort-invalid-v23. |
| Docs/evidence/S0-004/flagged-child-sort-reload-v23.png | Actual viewport screenshot for flagged-child-sort-reload-v23. |
| Docs/evidence/S0-004/lint-v23.txt | Actual lint/schema parity output. |
| Docs/evidence/S0-004/test-v23.txt | Actual complete75test passing output. |
| Docs/evidence/S0-004/verification-v23.json | Actual structured v23 observations and limitations. |
| backend/src/inventory/reader.mjs | Extend existing listening-port sort whitelist with hostname and process; preserve bound filters and NULLS LAST/id ordering. |
| frontend/src/domain-navigation.mjs | Validate child_sort/direction/search, serialize flagged-owner context and retain child bookmark fields. |
| frontend/src/flagged-domains.mjs | Add per-owner child DNS sort/search controls and exact-owner requests; retain owner provenance and healthy siblings on invalid scoped sort. |
| frontend/src/host-navigation.mjs | Validate and serialize independent result_sort/result_direction through port/process search and page history. |
| frontend/src/port-search.mjs | Add hostname/port/process/PID controls, bind sort query and restore controls/search inputs. |
| frontend/test/flagged-child-navigation.test.mjs | Add four exact-owner sort combinations, search/page reload/history and invalid child isolation preserving owner/siblings. |
| frontend/test/port-navigation.test.mjs | Add eight real API sort combinations, direct/reload/history and invalid-query inputs/parent isolation. |
| Docs/RESULT-TASK-S0-003.md | Canonical v23 report; original/historical AC retained, new criteria separate. |

## 5. Run and verify

Repository root: `npm ci`; `npm test`; `npm run lint`; `npm run build`. Focused: `node --test frontend/test/port-navigation.test.mjs frontend/test/flagged-child-navigation.test.mjs`. Browser labs: `node scripts/inventory-ui-lab.mjs --hosts` and `node scripts/inventory-ui-lab.mjs --flagged-child`; append the exact v23 fragment in the corresponding UI guide to its printed inventory URL.

## 6. Tests and actual results

75/75 tests passed; zero failures. Lint93 modules; schema22 entities+2junctions/114nativeFK unchanged; buildPASS. Actual loopback HTTP/PostgreSQL regressions execute inside READ ONLY after synthetic setup. Eight port/process sort combinations and four exact-owner DNS combinations verified, including id tie ordering. Fresh DOM reload, history and isolated invalid cases pass. Actual built-in browser reload and native Back/Forward verified after settled-state waits; three viewport screenshots per task. Outputs and counts: `Docs/evidence/S0-003/verification-v23.json`, `test-v23.txt`, `lint-v23.txt`, `build-v23.txt`, and sort reload/history/invalid screenshots.

## 7. Issues and implementation decisions

No failing v23 tests. Existing query sort parameters and exact-owner relation reused; whitelisted hostname/process identifiers added for listening results. Port and PID sort numerically; hostname/process/type/value sort lexically. NULLS LAST is explicit and id ascending ties are checked; no new nullable fixture this round. Child sort/search state applies to one routed owner; other owner cards retain their own default queries. Duplicate/unsupported route sort values are rejected locally with no partial scoped rows. Flags are stored data, not recalculated; no schema/entity/tag/collector changes. Python test-generation printed an escape-sequence warning; generated JavaScript syntax and all tests/lint passed.

## 8. Not done, limitations and technical debt

Synthetic local inventory only. No production auth/RBAC/scale/CVE/native Linux/live Cloudflare/credential evidence. Inventory updates may change pages between requests. Viewport screenshots only. Original native AC1/3/4 remain unverified; accepted actual600010ms outage retained, not rerun. OverallPARTIAL.

## 9. Blockers and decisions required

No new missing input, specification/security/production decision or hard blocker. Q-01..Q-05 untouched. QA approval required before merge; Dev does not merge.

## 10. Next step and self-check

Push existing feature branch/PR; verify current-head CI; attach canonical RESULT and v23 evidence to exact tasks, publish one submission and UI verify. Await Lead/QA review.

- [x] Exact ten sections; historical/current AC separate.
- [x] Exact source/time, changed files, commands, real outputs and three screenshots.
- [x] Limits and implementation decisions explicit.
- [x] No schema/entity/production changes.

History: v22 accepted via Lead comment 1100390000161262 and its required submission published; v23 assigned in same comment, started and implemented immediately in this cycle.
