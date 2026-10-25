# Result — TASK-S0-004: v27 Dual-origin Domain, DNS detail and record journey

| Field | Value |
|---|---|
| Task ID | TASK-S0-004 |
| Result version | v27 |
| Status | DONE (assigned synthetic scope) |
| Spec version followed | SRS v1.0; TASK-S0-004; live Lead16:31 ACCEPTv26 and assignv27 |
| Dev agent | Codex — Dev AI Agent |
| Prepared at | 2026-10-25T16:47:53.415052+07:00 |
| Source/evidence commit | 431b26205e26b3874a6869229a2ba1d3886d1fb6 |

## 1. Summary

One fragment retains Domain list search sample-/flag true/hostname-desc/page2, Flagged list search sample-/hostname-desc/page2, Sample04 detail DNS value-desc/search192.0.2/page2 and record UUID. Record Back restores DNS detail; detail Back restores its actual Domain or Flagged list origin. Detail page2 has5 rows; Flagged page2 has2 owners. Final83tests pass,0fail;lint94;schema unchanged;buildPASS. No production, collector, API contract or schema change. QA approval remains required before merge.

## 2. Acceptance criteria







Original AC and V4–V6 rows below retain their previously accepted scope. V7 replaces the historical candidate-search implementation with an explicitly assigned API.

| ID | Criterion | Result / evidence |
|---|---|---|
| AC-1 | Complete paginated records with provenance | Previously accepted v2 mockHTTP/PostgreSQL evidence:7 records across2 synthetic zones. V4 lists stored Domain/DNS fields and provenance; full regression passes; no live claim. |
| AC-2 | Idempotent sync preserves first_seen, advances last_seen | Previously accepted7->7/0created/7updated v2proof retained; existing full regression green. V4 read-only endpoints do not sync or alter rows. |
| AC-3 | Strict read-only Cloudflare paths/tests | Pass: accepted34GET-only mock calls retained; existing transport/source audit regression green. V4 reader imports no Cloudflare client and calls none; database integration reads inside BEGIN READ ONLY. |
| AC-4 | Correct known/outside IPv4/IPv6 flags | Existing accepted flag/clear/user-tag tests retained. V4 exact tag filtering passes, including rejecting lookalike tag; flagging algorithm unchanged. |
| AC-5 | Scheduled sync/logs | Accepted v2two sequential scheduler runs and structured logs retained; full regression passes; no new scheduler/live run claimed. |
| V4-1 | GET Domain/DNSRecord with provenance fields | Pass: actual loopback HTTP/PostgreSQL17.5WASM asserts source, first/last timestamps, confidence, tags and record identity/content. |
| V4-2 | Search domain, outside-known-range filter, pagination/counts | Pass: both resources tested for case-insensitive/literal search, combined predicates, exact true/false filtering, stable separate pages, totals, no matches and out-of-range pages. |
| V4-3 | Tests and endpoint contract | Pass:27/27suite; DOMAIN-INVENTORY-API.md covers method/path/query/response/errors/limits/examples and reproduction; HOST-INVENTORY-API.md describes shared local startup. |
| V4-4 | No schema/entity/osquery/UI change or real Cloudflare call | Pass: scoped commit changes shared inventory reader/router, domain tests/docs/evidence only; schema22+2/114FK unchanged. No collector modifications. |

| V5-1 | One local Domain/DNS frontend page using accepted v4 API and frame style | Pass: domains.html/controller reuse Atlas tokens/shell; actual browser shows both resources/provenance/tags and dark/light themes. ui-v5-dark/light.png. |
| V5-2 | Domain search, outside flag, pagination and total | Pass: DOM render/search/filter/page tests; actual HTTP proxy tests; browser25domains ->10rows/page ->page2, DNSflag6 ->searchsample-08 gives1. ui-v5.json. |
| V5-3 | Local opt-in boundary, no production auth/schema/osquery/liveAPI | Pass: disabled page/module/API404; loopback backend/socket/startup restrictions; fixed GET-only allowlist; no collector/schema change. |
| V5-4 | Frontend tests/docs and complete lint/test/build | Pass:31/31tests, lint52modules/schema22+2/114FK, build PASS; DOMAIN-INVENTORY-UI.md includes exact lab/local commands, behavior and limits. |

| V6-1 | Click Domain -> detail with provenance and exact-domain DNS type/value/proxied/TTL/tags/flag via accepted APIs | Pass: domain-detail.test.mjs actual HTTP/PostgreSQL exact owner/overlap trap/31records proof; browser sample-12.test and detail-v6.png. |
| V6-2 | Back preserves list search/flag/page and existing frame style | Pass: DOM tests and browser sample-search/page2 and separate flagtrue preserved; back-v6.png. Same Atlas shell/tokens. |
| V6-3 | Local opt-in, no newAPI/schema/osquery/liveCloudflare/production | Pass: unchanged gated routes/proxy; existing GET search only; schema22+2/114FK and boundary regressions pass;0Cloudflare requests. |
| V6-4 | Detail/render/back tests/docs and full checks | Pass:37/37tests,lint58modules,buildPASS; guide states exact-owner candidate bound and reload boundary. |
| V7-1 | Exact Domain lookup and exact-owner DNS GET endpoints on accepted schema | Pass: UUID Domain lookup; FK equality join for DNS; owner/count/page in one read statement. domain-exact.test.mjs, exact-v7.json. |
| V7-2 | Detail uses exact API instead of bounded candidate search; fields/Back retained | Pass: UI requests parent and requested child page only. Actual browser preserves provenance/DNS fields and Back search/page; existing filter retention regression passes. |
| V7-3 | Exact owner, overlapping-name trap, pagination and not-found tests | Pass: actual PostgreSQL/HTTP read-only test with 32 owned records and excluded trap, stable pages/counts, missing parent404, malformed/query400, GET-only/disabled gates. |
| V7-4 | Docs, local opt-in, no schema/osquery/live Cloudflare expansion; complete checks | Pass: API/UI guides updated; 39/39 tests, lint60/schema22+2/114FK and build pass. No osquery or Cloudflare collector files changed. |

| V8-1 | Direct Domain UUID link and reload | PASS: validated UUID fragment, fresh exact-parent/DNS lookup; fresh-DOM integration and real browser reload sample-12.test. |
| V8-2 | Native Back/Forward and retained list context | PASS: history stores identity/context; browser restores sample-16.test; Back retains sample- search, Flagged filter, page1/size10; test page2 context retained. |
| V8-3 | Missing/invalid ID without stale data | PASS: real HTTP 404/400 integration clears info/related; actual missing browser error screenshot. |
| V8-4 | Style, local opt-in, docs and complete checks | PASS: existing Atlas frame and gates;44/44 tests, lint65 modules, unchanged22+2/114FK, buildPASS. No schema/osquery/collector changes. |

| V9-1 | Search stored DNS values and list matching Domain/records | PASS: bound case-insensitive literal value_search filter; Domain/type/value/proxied/TTL/tags rendered; actual READ ONLY HTTP/PostgreSQL proof. |
| V9-2 | Pagination and total | PASS:192.0.2.25 ->18records/2pages;198.51.100.25 ->6records;10/page; actual second-page8rows. |
| V9-3 | Return to list/detail, existing style/context | PASS: real browser returns sample12 detail and flagged list retaining sample-/page1/size10; integration retains page2 context. |
| V9-4 | Docs/tests/local opt-in/no forbidden scope | PASS:46/46tests,lint69/schema22+2/114FK,buildPASS; no osquery/schema/Cloudflare client changes, zero external calls. |
| R8-1 | Correct v8 report only before v9 | PASS: source e6ae95f, correction timestamp and v8 Summary fixed; section7/history record correction; committed637e7aa and attached1430e2e8-5356-4370-b362-dadbc1b08d55 before v9 work. |

| V10-1 | Direct value_search link and reload persistence | PASS: direct192value/page2 and fresh DOM plus real browser reload restore18records/page2/8rows through accepted GET. |
| V10-2 | Native Back/Forward and return context | PASS: real browser and history-model integration restore192/page2 and198/page1/6rows; existing list/detail return tests pass. |
| V10-3 | Invalid values without partial data | PASS: control/duplicate/empty values error and zero rows; actual browser control-value error screenshot. |
| V10-4 | Docs/full checks/current header/no forbidden expansion | PASS:47tests,lint70/schema22+2/114FK,buildPASS; source hash above is exact v10 implementation/evidence commit. |

| V11-1 | Only flagged Domains, with DNS records | PASS: accepted outside_known_range=true Domain API plus exact-owner DNS;12flagged owners; nonflagged sample05 excluded; no algorithm change. |
| V11-2 | Domain search/count/pagination and DNS completeness | PASS:12owners/2pages; selected owner12DNS/2childpages; exact owner validation and search tested. |
| V11-3 | Return full list/detail with existing style/context | PASS: browser sample12 detail and full list sample-/page2/size10 retained; existing tokens/frame reused. |
| V11-4 | Docs/full tests/local-only/no forbidden expansion/current header | PASS:49tests,lint74/schema22+2/114FK,buildPASS; exact v11 source above; all external calls0. |


| V12-1 | Direct flagged/search/page link and reload | PASS: actual HTTP/PostgreSQL fresh-DOM and real browser reload retain sample-/page2/12owners. |
| V12-2 | Browser Back/Forward | PASS: search sample12 gives1owner/page1; Back restores12/page2, Forward restores1/page1. |
| V12-3 | Invalid route explicit error/no partial | PASS:7 invalid/duplicate/control/conflicting routes give explicit error and0DNS cells; real browser page0 screenshot. |
| V12-4 | Owner DNS fields/return/style/boundaries | PASS: existing parent/child owner paging and both return regressions pass; browser type/value/proxied/TTL/tags intact; no schema/algorithm changes. |
| V12-5 | Full checks/docs/current exact source | PASS:52tests,79lintmodules,22+2/114FK,build; exact source above and v12 guides/proof/logs/screenshots. |


| V13-1 | Direct fragment and reload restore | PASS: actual HTTP/PostgreSQL freshDOM and real browser preserve selected flagged sample04owner/DNS2of2/2rows. |
| V13-2 | Native Back/Forward and origin return | PASS: real browser/history fixture replay; previous both-return regressions pass. |
| V13-3 | Invalid state explicit/no partial | PASS: 6child invalid cases;0rows/cards; real browser error screenshot. |
| V13-4 | Fields/style/boundaries and complete checks | PASS:55tests,lint82/schema22+2/114FK unchanged,build; existing OS/version or ownerDNS fields retained. |


| V14-1 | Direct link and reload | PASS: sample04,31DNS/page2/6rows/provenance through actual HTTP/PostgreSQL freshDOM and real browser. |
| V14-2 | Back/Forward and returns | PASS: history fixture and real browser replay pages/search; existing return regressions pass. |
| V14-3 | Invalid state/no partial | PASS: 4detailDNS invalid cases; zero cells; real browser error screenshot. |
| V14-4 | Fields/style/docs/full checks/boundaries | PASS:57tests,84modules,22+2/114FK unchanged,build; exact source header. |


| V15-1 | Record-level exact flag | PASS: actual READ ONLY HTTP/PostgreSQL and browser evidence: 12records/2pages;unflagged records excluded, exact stored tag unchanged. |
| V15-2 | Value search/count/pages | PASS: actual READ ONLY HTTP/PostgreSQL and browser evidence: 198.51.100.25 ->12;unflagged192.0.2.25 ->0;page2sample44/48. |
| V15-3 | Owner/fields/returns/failures | PASS: actual READ ONLY HTTP/PostgreSQL and browser evidence: Owner/type/value/proxied/TTL/tags;503clear;bothreturns pass. |
| V15-4 | Docs/full checks/exact source/boundaries | PASS:59tests,86modules,22+2/114FK unchanged,build; exact source above. |


| V16-1 | Direct/reload | PASS: actual HTTP/PostgreSQL/browser evidence: 198value/page2/12flaggedrecords/sample44+48. |
| V16-2 | History/returns | PASS: actual HTTP/PostgreSQL/browser evidence: Back12/page2,Forwardnomatch/page1;bothreturns retained. |
| V16-3 | Invalid/no partial | PASS: actual HTTP/PostgreSQL/browser evidence: 6malformed/duplicate/control/out-of-range states0rows. |
| V16-4 | Checks/boundaries | PASS: actual HTTP/PostgreSQL/browser evidence: 61tests,88modules,22+2/114FK unchanged,build;exact source. |


| V17-1 | Direct/reload | PASS: DONE synthetic v17. Combined Domain search/flag/page direct/reload/history and detail return complete;12matches/page2/sample44+48,search12=1;invalid states clear rows. |
| V17-2 | History/returns | PASS: Actual history fixture and browser Back/Forward; parent context retained |
| V17-3 | Invalid/no partial | PASS: 5Domaincombinedinvalid cases,0cells |
| V17-4 | Fullchecks/boundaries | PASS: 63tests,90modules,22+2/114FK unchanged,build;exact source above |


| V18-1 | Assigned DNS record details behavior | PASS in actual local HTTP/PostgreSQL and DOM: Exact UUID detail with owner/type/value/proxied/TTL/tags/provenance/flag; fresh DOM reload, Back/Forward fixture, origin detail return, malformed/missing/duplicate records clear all fields, POST405 and unknown-query400. |
| V18-2 | Full regression and boundaries | PASS:65tests,93modules,22+2/114FK unchanged,build;source above. |
| V18-3 | Actual browser validation and delivery path | PASS browser: direct/reload, native Back/Forward, origin return, invalid zero partial; three screenshots. Attachment retry timed out; Lead-authorized fixed-commit fallback used in submission comment. |


| V19-1 | Assigned sorting and route behavior | PASS: Hostname asc/desc with stable id ties/NULLS LAST;sort/search/flag/page route;desc/searchsample-/flagtrue/page2 yields sample08+sample04 of12;native reload/history/detailreturn;4invalidsort casesclearallrows. |
| V19-2 | Full validation and unchanged boundaries | PASS:67tests/0fail,lint93,schema22+2/114FK,build. Actual proof/logs/screenshots in evidence folder. |
| V19-3 | Browser evidence | PASS:3actual screenshots reload/history/invalid;scope and errors above verified in native built-in browser. |


| V20-1 | Assigned sort/combined routes/returns | PASS: Flagged record owner/value/type asc/desc,stable id ties/NULLS LAST;12flaggedrecords,search198.51.100.25+ownerdesc+page2 sample08/sample04;combined record flag/search/sort/page direct/reload/nativehistory;both parentdetail/list returns retainstate;4invalidsort/flag routes zero rows. |
| V20-2 | Tests and boundaries | PASS:69tests/0fail,lint93,schema22+2/114FK unchanged,build;actualproof in verification-v20.json. |
| V20-3 | Actual browser screenshots | PASS:3screens reload/history/invalid;nativeBack/Forward and bothparentreturnsverified. |

| V21-1 | Flagged Domains sort and combined direct/reload/history routes | PASS: verification-v21.json, scoped navigation regression and three actual browser screenshots. Existing SQL whitelist, id ties and NULLS LAST retained. |
| V21-2 | Parent detail/full-list return and isolated invalid sort | PASS: both parent return/reopen paths preserve search/sort/page in actual HTTP/DOM tests; four invalid sort routes clear only the scoped view and retain parent rows. |
| V21-3 | Complete checks and evidence within scope | PASS: 71/71 tests; lint93; schema22+2/114FK unchanged; build PASS; synthetic fixtures only. |

| V22-1 | Domain detail DNS sorting, stable ties/NULLS LAST and combined direct/reload/history routes | PASS: verification-v22.json, actual HTTP/PostgreSQL regression and three browser screenshots. Four exact-owner DNS type/value sort combinations; bound literal type/value search. |
| V22-2 | Invalid sort clears only scoped list, preserving parent information | PASS: four invalid-sort routes, zero partial rows; Domain identity and source/provenance remain visible. |
| V22-3 | Full checks and evidence within scope | PASS: 73 tests, zero failures; lint93; schema22+2/114FK unchanged; build PASS; synthetic fixtures only. |

| V23-1 | Flagged owner child DNS sorts with stable ties/NULLS LAST and combined routes | PASS: Four type/value combinations; exact owner retained; 12 records, searched11, page2 one row. |
| V23-2 | Direct/reload/native history and invalid-sort isolation | PASS: actual HTTP/PostgreSQL/DOM tests and browser; four invalid sort cases clear only scoped list and retain owner provenance and healthy sibling records. |
| V23-3 | Full checks and required evidence | PASS:75tests/0fail;lint93;schema22+2/114FK unchanged;build;three browser screenshots. |

| V24-1 | Flagged child DNS record return | PASS: actual HTTP/PostgreSQL regressions and verification-v24.json. |
| V24-2 | Combined direct/reload/native history context | PASS: freshDOM and actual built-in browser proof, complete scoped fragments. |
| V24-3 | Return/isolation without partial rows | PASS: three invalid record cases retain child sort/search/page, owner and healthy siblings. |
| V24-4 | Full checks and evidence | PASS:77/77tests;lint93;schema22+2/114FK unchanged;build;three screenshots. |

| V25-1 | Combined state/chain preservation | PASS: Flagged hostname-desc/searchsample-/page2 -> sample04 child value-desc/search192.0.2/page2 -> exact record detail chain survives direct/reload/history. Record Back preserves child state; child Back preserves flagged list sort/search/flag/page. Invalid record3,childsort4,listsort4 cases clear only affected content. Synthetic scope only;Cloudflare0requests. |
| V25-2 | Direct/reload/native Back/Forward and returns | PASS:actual HTTP/PostgreSQL/DOM regression and built-in browser complete-state verification. |
| V25-3 | Independent invalid states | PASS: 3 record +4 child sort +4 list sort cases; unaffected owner/child/list context retained. |
| V25-4 | Complete checks and evidence | PASS:79tests/0fail;lint93;schema22+2/114FK unchanged;build;three screenshots. |

| V26-1 | Combined list/detail state | PASS: Domain list search/flag/sort/page plus detail DNS search/sort/page and record id coexist. RecordBack restores detail;detailBack retains list and saved detail state. Sample04 search192.0.2 gives30 DNS rows,page2 five. Directrecord/reload/history and six invalid list/detail/record cases preserve unaffected content. Synthetic scope only;Cloudflare0requests. |
| V26-2 | Direct/reload/history and return context | PASS:actual HTTP/PostgreSQL/DOM and built-in browser;record return/detail return or Host reopen retain scoped state. |
| V26-3 | Invalid state independence | PASS:six invalid cases per task;affected list/detail cleared,healthy context retained. |
| V26-4 | Full checks/evidence | PASS:81tests/0fail;lint93;schema22+2/114FK unchanged;build;three screenshots. |


| ID | v27 criterion | Result / actual evidence |
|---|---|---|
| V27-1 | Combined fragment with all assigned levels | PASS: One fragment retains Domain list search sample-/flag true/hostname-desc/page2, Flagged list search sample-/hostname-desc/page2, Sample04 detail DNS value-desc/search192.0.2/page2 and record UUID. Record Back restores DNS detail; detail Back restores its actual Domain or Flagged list origin. Detail page2 has5 rows; Flagged page2 has2 owners. |
| V27-2 | Direct/reload/native history and origin return/reopen | PASS: actual HTTP/PostgreSQL fresh DOM/history tests and built-in browser reload, Back/Forward and origin-specific return. Both main Domain and Flagged origins verified separately. |
| V27-3 | At least six independently invalid levels | PASS: Domain sort/direction, Flagged sort/direction, detail DNS sort and record UUID; affected rows clear, healthy main/detail state retained. |
| V27-4 | Full suite, lint/build/schema, verification/logs and three screenshots | PASS:83/83 tests,0fail;lint94modules;schema22entities+2junctions/114nativeFK unchanged;buildPASS. verification-v27.json, test/lint/build-v27.txt and three actual v27 screenshots. |

## 3. Work completed

One fragment retains Domain list search sample-/flag true/hostname-desc/page2, Flagged list search sample-/hostname-desc/page2, Sample04 detail DNS value-desc/search192.0.2/page2 and record UUID. Record Back restores DNS detail; detail Back restores its actual Domain or Flagged list origin. Detail page2 has5 rows; Flagged page2 has2 owners. Reused accepted GET inventory endpoints and existing Atlas UI controls/styles. Implemented explicit origin bookmarks so nested return does not fall into a different list. Verified actual built-in browser direct/reload/Back/Forward and invalid-state screenshots. Published [DEV][START] on the exact assigned task; no status change.

## 4. Files changed

| File | Specific change |
|---|---|
| frontend/src/host-navigation.mjs | Serialize explicit Site origin and inactive Site bookmark; restore selected Site Host list on detail Back; site_resume retains Host page through picker reopen. |
| frontend/src/site-hosts.mjs | Make Host names open exact Host detail; add Back to Site picker; preserve same-Site Host search/sort/page. |
| frontend/src/domain-navigation.mjs | Serialize Flagged origin and saved Flagged list alongside Domain/detail context; route detail Back to correct origin. |
| frontend/src/flagged-domains.mjs | Add explicit Open Domain detail buttons on existing stored-flag owner cards. |
| frontend/test/combined-origin-navigation.test.mjs | Two actual HTTP/PostgreSQL READ ONLY integration regressions cover combined journeys, fresh DOM, native-history fixture, all returns/reopens and six invalid cases per task. |
| scripts/inventory-ui-lab.mjs | Add isolated siteJourneyFixtures / --site-journey option assigning24 synthetic hosts to Sample Site so Host11 occurs on descending page2; old fixtures unchanged. |
| Docs/HOST-INVENTORY-UI.md | Document Site origin, return/reopen behavior, fixture option and reproduction command. |
| Docs/DOMAIN-INVENTORY-UI.md | Document dual-origin parameters and Domain/Flagged return semantics. |
| Docs/evidence/S0-004/verification-v27.json | Record actual check results, fixture rows, browser checks, failures and limits. |
| Docs/evidence/S0-004/{test,lint,build}-v27.txt | Actual final full-suite83pass,lint94/schema22+2/114FK and build output. |
| Docs/evidence/S0-004/domain-dual-{reload,history,invalid}-v27.png | Three actual built-in browser screenshots; synthetic data only. |
| Docs/RESULT-TASK-S0-004.md | Canonical v27 report; preserve original and previous version AC evidence, add separate V27-1..4 rows. |

## 5. Run and verify

From repository root: `npm ci`, `npm test`, `npm run lint`, `npm run build`.
Focused: `node --test --test-concurrency=1 frontend/test/combined-origin-navigation.test.mjs`.
Host lab: `node scripts/inventory-ui-lab.mjs --host-detail --sites --site-journey`; Domain lab: `node scripts/inventory-ui-lab.mjs --detail-dns --flagged`. For combined browser verification both sets of flags can be used in one lab. Open the returned loopback origin at /inventory/hosts or /inventory/domains and use the full fragment in combined-origin-navigation.test.mjs. Setup writes synthetic fixtures before the regression begins READ ONLY; runtime API calls are GET/SELECT only.

## 6. Tests and actual results

Final full suite83/83 passed,0failed;lint94modules;schema22entities+2junctions/114nativeFK unchanged;buildPASS. Both targeted tests use actual local HTTP and PostgreSQL17.5 WASM with BEGIN READ ONLY after setup. Output markers HOST_JOURNEY_V27_PROOF and DOMAIN_JOURNEY_V27_PROOF each record six invalid cases and successful reload/history/return/reopen. Actual built-in browser verified Host11 six package/six port rows, Site Host page2/3 and picker page2/2; Sample04 DNS page2/2 five rows, record192.0.2.99, Flagged page2/2 and main Domain page2/2. Screenshots were captured after settled visible state and inspected. Evidence in Docs/evidence/S0-004; Cloudflare requests0.

## 7. Issues and implementation decisions

Initial targeted Host assertion used an old Site fixture count, then showed Host11 was absent from that descending second page. Added a separate synthetic Site-journey fixture; did not alter existing fixtures or schema. Strengthened the test for picker return and same-Site reopen; fixed page reset using site_resume. Explicit origin survives nested detail changes while a main-list selection keeps its main origin. Browser hash-only navigation initially retained an older loaded module; reloaded the local page and verified final behavior. A broad exact-text selector matched hidden rows; scoped it to the actual DNS record panel. Python cp1258 console could not print the test checkmark after tests exited0; logs were intact, lint/build then completed. Final full checks rerun after the last source change. All these are resolved technical/lab details, not blockers.

## 8. Not done, limitations and technical debt

Synthetic/local only; no production authentication/RBAC/scale/native Linux/live Cloudflare/CVE evidence. Versions sort lexically. Existing bounded Site identity lookup and stored-flag owner guard limits remain; no scale claim. DONE applies only to the assigned synthetic local scope; no live infrastructure claim. ClickUp quota boundary honored; if browser file upload fails, use the Lead-authorized immutable GitHub report-commit fallback, report zero new attachments honestly.

## 9. Blockers and decisions required

No new missing-input/spec/security/production decision or hard blocker. Q-01..Q-05 untouched. Separate QA approval is required before merge; Dev does not merge. ClickUp upload outcome and submission fingerprints are recorded in the final task comment and checkpoint.

## 10. Next step and self-check

Push the existing feature branch and update existing PR1. Verify current-head CI live, attempt actual RESULT upload, and publish exactly one [DEV][SUBMISSION] per assigned task using exact immutable fallback if needed. Verify UI and checkpoint; continue valid Lead/QA work without duplicate submission.

- [x] Exact ten numbered sections and separate original/historical/current AC rows.
- [x] Exact source/time, specific files, reproduction commands and actual output.
- [x] Six invalid cases per task, three actual screenshots, failures/fixes and limits stated.
- [x] Schema/collector/API/production boundaries retained; no self-ACCEPT/status change/merge.

History: v26 accepted in live Lead16:31 comment at prior report head af12f0eeaafc7392918ac364e60cd6dda4c010a2. v27 started16:40 and executed in this cycle. Initial v27 source b1b5b81284d0084965cf6ff8f72cc1a1655cff07; final source above includes the same-Site reopen correction and final evidence.
