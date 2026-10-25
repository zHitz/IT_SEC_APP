# Result — TASK-S0-004: v21 Flagged Domains sorting

| Field | Value |
|---|---|
| Task ID | TASK-S0-004 |
| Result version | v21 |
| Status | DONE |
| Spec version followed | SRS v1.0; TASK-S0-004; live Lead assignment 1100390000161153 accepting v20 and assigning v21 |
| Dev agent | Codex — Dev AI Agent |
| Prepared at | 2026-10-25T14:22:19.509615+07:00 |
| Source/evidence commit | ee21fa011beb7de289f14d287e49b10917bbd3c7 |

## 1. Summary

DONE in declared scope. v21 adds Flagged Domains sort controls, combined search/sort/page fragments, direct and reload restoration, native Back/Forward, and parent full-list/detail return with saved state. Invalid sort clears only this view. 71/71 tests pass; lint 93 modules; schema 22 entities + 2 junctions / 114 native FKs unchanged; build PASS. Synthetic local evidence only. No live Cloudflare, production or credential access.

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

## 3. Work completed

Implemented and verified Lead assignment 1100390000161153. Sort controls preserve search and reset page on change. Inactive saved bookmarks let parent views render normally and restore the scoped view on explicit reopen. No API/schema/entity/tag/collector changes.

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
| Docs/RESULT-TASK-S0-004.md | Canonical v21 report; original and historical AC evidence retained; current criteria separate. |

## 5. Run and verify

From repository root: `npm ci`, `npm test`, `npm run lint`, `npm run build`. Focused: `node --test frontend/test/unassigned-navigation.test.mjs frontend/test/flagged-navigation.test.mjs`. Start browser labs with `node scripts/inventory-ui-lab.mjs --hosts` and `node scripts/inventory-ui-lab.mjs --flagged`; append the v21 fragment in the corresponding UI guide to the printed URL.

## 6. Tests and actual results

71 tests passed, zero failures. Lint passed for 93 modules; schema parity passed for 22 entities + 2 junctions / 114 native FKs; build passed. Real local HTTP/PostgreSQL tests cover six Host or two Domain sort combinations and parent list/detail return. Fresh DOM reload and history regressions plus actual built-in browser reload/native Back/Forward checks passed. Evidence: `Docs/evidence/S0-004/verification-v21.json`, `test-v21.txt`, `lint-v21.txt`, `build-v21.txt`, and three sort screenshots (reload/history/invalid). Browser screenshots are viewport captures.

## 7. Issues and implementation decisions

No v21 test failures. Existing API already enforces allowed sort identifiers, NULLS LAST and stable id-ascending ties; reuse it without schema changes. The new scoped sort parameters are independent of full-list sorting. Saved bookmarks use `flagged_saved=1` to prevent immediate child reopening on parent return. Search remains bound through the existing API. OS/version sorting is lexical; stored flags are not recalculated. Nullable sorting is inherited from the tested reader; this round does not add a nullable fixture. ClickUp connector recovered; actual attachment upload will be attempted before submission. Earlier filechooser failures remain historical, not a current upload claim.

## 8. Not done, limitations and technical debt

Synthetic local inventory only. No production auth/RBAC/scale/CVE/native Linux/live Cloudflare/credential evidence. No schema/entity/collector/tag-algorithm changes. Inventory updates can change pagination between requests. DONE applies only to the assigned synthetic display/navigation scope.

## 9. Blockers and decisions required

No new missing input, security or specification decision. Q-01..Q-05 remain unanswered. QA approval is required before merge; Dev will not merge.

## 10. Next step and self-check

Push to the existing feature branch and PR, verify live CI, attach this canonical RESULT and evidence to the exact task and publish one submission. Await Lead/QA review.

- [x] Exact ten sections; historical and current AC rows separate.
- [x] Exact source commit, preparation time, files, commands, outputs and three screenshots.
- [x] Limits, decisions and read-only boundaries explicit.
- [x] No schema/entity/production changes.

History: v20 submitted and accepted in live Lead comment 1100390000161153; v21 assigned in that same comment, implemented and verified in this cycle.
