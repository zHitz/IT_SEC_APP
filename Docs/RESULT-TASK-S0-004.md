# Result — TASK-S0-004: v34 Duplicate/opener isolation (partial native evidence)

| Field | Value |
|---|---|
| Task ID | TASK-S0-004 |
| Result version | v34 |
| Status | PARTIAL |
| Spec version followed | SRS v1.0; TASK-S0-004; live Lead22:32 ACCEPTv33 and V34-1..4 assignment |
| Dev agent | Codex — Dev AI Agent |
| Prepared at | 2026-10-25T23:08:12.493811+07:00 |
| Source/evidence commit | 396f985ab8cd013ba45d3da498ac7edb91bc69a5 |

## 1. Summary

Added exactly three integration tests modeling duplicate/opener copied-store isolation for all four filtered journeys. Full104/104, lint96, unchanged schema and build pass. Added opt-in lab-only real opener controls and corrected a stale-fragment link. Actual Chrome screenshots are retained, but the final native acceptance trace is incomplete after browser safety/user-input interruptions. Overall PARTIAL; modeled evidence is not native proof. Prior v33 DONE applied only to its synthetic/local assignment; v34 is PARTIAL because new native-browser acceptance evidence is incomplete.

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


| ID | v28 criterion | Result / actual evidence |
|---|---|---|
| V28-1 | Complete v27 journey survives switch to other inventory view and back | PASS: exact fragment preserved through separate fixed-path session bookmarks; no reset or cross-clear. Domain list searchsample-/flagtrue/hostname-desc/page2, Flagged list searchsample-/hostname-desc/page2, Sample04 detail DNS value-desc/search192.0.2/page2 and record UUID |
| V28-2 | Direct/reload/native history and correct origin after switching | PASS: actual HTTP/PostgreSQL fresh-document regressions and built-in browser. Record Back restores five-row DNS detail page2; detail Back restores actual Domain or Flagged list origin. |
| V28-3 | Six invalid levels remain independent across views | PASS: six Host and six Domain invalid-level round trips; affected rows clear, other view fragment remains exact, no partial rows. |
| V28-4 | Full checks and actual logs/screenshots | PASS:86/86 tests,0fail;lint96modules;schema22+2/114FK unchanged;buildPASS;verification-v28.json,test/lint/build-v28.txt and three actual screenshots. |


| ID | v29 criterion | Result / actual evidence |
|---|---|---|
| V29-1 | Three consecutive round trips from both starting views, exact fragments every time | PASS: actual HTTP/PostgreSQL regression and built-in browser compare complete fragments;3roundtrips startingHost and3startingDomain, no drift/cross-clear. |
| V29-2 | Saved invalid destination, no affected partial rows, source exact, explicit repair | PASS: destinationHost invalidpackage sort clears package rows0 and keeps6portrows; destinationDomain invalidrecord clearsrecordfields0 and keeps5DNSrows. Source fragment exact; explicit valid destination restores journey in both directions. |
| V29-3 | Clean default tabs without fabricated bookmarks; newly created source journey persists | PASS: both no-fragment views remain default, no synthetic #list=1 and no copied other fragment. New journey survives subsequent switch; explicit default removes only own prior bookmark. |
| V29-4 | 89/89 tests;96modules;unchanged schema/build;logs and3screenshots | PASS:89tests,0fail;lint96;schema22+2/114FK unchanged;buildPASS;verification-v29.json,test/lint/build-v29.txt,three real screenshots. |


| ID | v30 criterion | Result / actual evidence |
|---|---|---|
| V30-1 | Two independent tabs with distinct Host/Domain journeys, no cross-tab copy | PASS: separate integration stores and two actual browser tabs;tabA package/portpage2 and DNSpage2/record30,tabB package/portpage1 and DNSpage1/record29;both unchanged after othertab navigation. |
| V30-2 | Saved complete URLs in fresh empty sessions then two exact round trips | PASS: both starting views assert initial0storageentries,restore full explicit fragment; actual fresh-tab other-view links default;2roundtrips each compare exact href fragments. |
| V30-3 | Fresh invalid URLs,0affectedpartialrows,healthy sibling,repair;newtab afterclose default | PASS: Host invalidpackage0rows/6healthyports;Domain invalidrecord0fields/5healthyDNSrows;validexplicitURL repairs;new independently created tab default afterclose. |
| V30-4 | Exactly3newtests,92/92,lint96,schema/build/evidence | PASS:3newtests in existing view-bookmarks.test.mjs;92pass/0fail;lint96;schema22+2/114FK unchanged;buildPASS;verification-v30.json,test/lint/build-v30.txt and3actualscreenshots. |


| ID | v31 criterion | Result / actual evidence |
|---|---|---|
| V31-1 | Independent filtered tab journeys without overwrite | PASS: Independent tabs retain Flagged Domains/Sample04 DNS detail and Flagged DNS records/exact record detail. Both filtered list states preserve search/sort/flag/page through fresh saved URLs and list/detail returns. |
| V31-2 | Fresh zero-entry saved URLs and two exact list/detail round trips | PASS: all four filtered journeys assert initial0 modeled storage entries and exact canonical saved fragment; two list/detail trips each. Actual independent browser tabs separately verify same behavior. |
| V31-3 | Invalid fresh filtered URL, zero affected rows, healthy sibling, repair and clean new tab | PASS: Site/Unassigned/Flagged Domain/Flagged record invalid sort paths clear affected rows0, retain healthy main inventory rows, and repair with explicit valid URL. New independent tab after close remains default. |
| V31-4 | Exactly three new tests,95/95,lint96,schema/build and actual screenshots | PASS:95tests,0fail;lint96;schema22entities+2junctions/114nativeFK unchanged;buildPASS. verification-v31.json,test/lint/build-v31.txt and three real screenshots. |


| ID | v32 criterion | Result / actual evidence |
|---|---|---|
| V32-1 | Filtered journeys survive opposite-view switch with exact fragment | PASS: Flagged Domains/Sample04 DNS detail and Flagged DNS records/exact record retain search/sort/flag/page across Domain/Host switches. Record Back restores child DNS page2 with5rows; detail Back restores actual Domain or Flagged origin. Two cross-view round trips per journey; other view remains exact. |
| V32-2 | Direct/reload/native history and correct origin return/reopen | PASS: fresh-document integration and actual browser reload/Back/Forward;Site/Unassigned origins distinct;bothHostscopedlists6rows;recordBackchildDNS5rows;mainDomainandFlaggedorigins separate. |
| V32-3 | Invalid filtered destination only clears affected rows;repair and newtabdefault | PASS: all4filteredinvalidsortpaths afterswitch clear affectedrows0,retainhealthy main rows and exactsource;explicitvalidURLrepairs;freshindependenttabafterclose default. |
| V32-4 | Exactly3newtests,98/98,lint96,schema/build,evidence | PASS:98tests0fail;3newtests in existingfile;lint96;schema22+2/114FKunchanged;buildPASS;verification-v32.json,test/lint/build-v32.txt and3actualscreenshots. |


| V33-1 | Independent filtered tab pairs with opposite origins | PASS: V33_TAB_ISOLATION in test-v33.txt; two independent stores, Site Host11 versus Unassigned Host20 and Flagged Domain versus record; two exact trips each. Actual browser tabs separately retain distinct complete URLs; both Host page2 lists have six rows and child DNS has five. |
| V33-2 | Complete saved URLs in fresh empty sessions | PASS: V33_FRESH_URL asserts initial Map size 0 for each of four journeys; two exact cross-view trips each. Actual fresh independent browser tabs restore all four URLs and repeat two exact trips; browser storage is not enumerated. |
| V33-3 | Fresh invalid destination after switch, repair and closed-session defaults | PASS: V33_INVALID_FRESH, four invalid sorts, zero affected cells, retained healthy main/source exact and explicit repair; V33_CLOSED_DEFAULT. Browser independently verifies four paths, 125 healthy Host cells / 150 Domain cells, and new no-fragment tab defaults in both views. |
| V33-4 | Exactly three new tests, complete checks and fresh artifacts | PASS: full 101/101, zero failures; lint96, schema22+2/114 FK unchanged, build PASS. verification-v33.json, test/lint/build-v33.txt and three new actual screenshots attached with this RESULT. |


| V34-1 | Native Duplicate restores complete filtered journey and isolates original bookmark | PARTIAL: V34_DUPLICATE_MODEL passes for all4journeys with copied initial stores in separate Maps and exact parent state. Actual native Duplicate screenshots retained, but final all-journey parent-bookmark cross-view trace is incomplete. No full native-clone claim. |
| V34-2 | Real opener child restores its own URL and closing preserves opener | PARTIAL: V34_OPENER_MODEL passes explicit child URL precedence for all4journeys. Actual screenshots show opener=true. Lab stale-hash link corrected to refresh on click. Final corrected Flagged-record opener and all-parent saved-bookmark checks remain unverified. |
| V34-3 | Invalid duplicate clears affected rows only, repairs explicitly, parent unaffected | PARTIAL: V34_INVALID_CLONE passes all4journeys with0affected rows, retained healthy main, explicit repair and exact unchanged parent store. Actual error screenshots retained; complete final native traces remain pending. |
| V34-4 | Exactly3newtests, checks and artifacts | PASS for requested deliverables: full104/104pass,0fail; lint96; unchanged22+2/114FK; buildPASS; verification-v34.json,3actuallogs and3actualscreenshots per task. These outputs do not remove V34-1..3 native gaps. |

## 3. Work completed

Implemented three tests in the existing view-bookmarks module, using actual HTTP/PostgreSQL READ ONLY after synthetic setup. Separate Maps copy an initial snapshot to model session cloning. Child explicit URLs win over inherited bookmarks; original store/hash stay unchanged after child navigation/teardown. The lab flag --opener-tabs injects a synthetic control and external script only in that opt-in lab. Production frontend/API/schema/style/collectors are unchanged. One START per task was verified22:44; no duplicate START during resume.

## 4. Files changed

| File | Specific change |
|---|---|
| frontend/test/view-bookmarks.test.mjs | Exactly3newtests: copied-store duplicate restoration/isolation; opener-model explicit URL precedence/close; invalid cloned destination0rows/repair/unchanged parent. Added clone34 helper with distinct-Map assertion. |
| scripts/inventory-ui-lab.mjs | Opt-in openerFixtures/--opener-tabs wraps only lab responses with a visible opener-status panel and target=_blank rel=opener link. href updates at click time; panel is scoped to main. No production server change. |
| Docs/HOST-INVENTORY-UI.md | v34 native reproduction and model/native distinction; remaining checks. |
| Docs/DOMAIN-INVENTORY-UI.md | Same for Flagged Domain/record journeys, with incomplete opener case explicit. |
| Docs/evidence/S0-003/verification-v34.json | Actual104pass/lint/schema/build outputs, partial native scope, remaining checks and screenshot hashes. |
| Docs/evidence/S0-003/test-v34.txt | Final actual104pass/0fail log with V34 proof markers. |
| Docs/evidence/S0-003/lint-v34.txt | Actual96module syntax/safety and unchanged22+2/114FK output. |
| Docs/evidence/S0-003/build-v34.txt | Actual backend/frontend/migration build output. |
| Docs/evidence/S0-003/host-duplicate-v34.png | Actual Chrome duplicate with restored synthetic detail; partial evidence only. |
| Docs/evidence/S0-003/host-opener-v34.png | Actual Chrome child showing opener=true; partial evidence only. |
| Docs/evidence/S0-003/host-invalid-duplicate-v34.png | Actual invalid synthetic child route/error; partial evidence only. |
| Docs/evidence/S0-004/verification-v34.json | Actual104pass/lint/schema/build outputs, partial native scope, remaining checks and screenshot hashes. |
| Docs/evidence/S0-004/test-v34.txt | Final actual104pass/0fail log with V34 proof markers. |
| Docs/evidence/S0-004/lint-v34.txt | Actual96module syntax/safety and unchanged22+2/114FK output. |
| Docs/evidence/S0-004/build-v34.txt | Actual backend/frontend/migration build output. |
| Docs/evidence/S0-004/domain-duplicate-v34.png | Actual Chrome duplicate with restored synthetic detail; partial evidence only. |
| Docs/evidence/S0-004/domain-opener-v34.png | Actual Chrome child showing opener=true; partial evidence only. |
| Docs/evidence/S0-004/domain-invalid-duplicate-v34.png | Actual invalid synthetic child route/error; partial evidence only. |
| Docs/RESULT-TASK-S0-004.md | Canonical ten-section v34 PARTIAL report; preserve prior AC/history and append distinct V34 rows. |

## 5. Run and verify

Repository root: `npm ci`; `npm test`; `npm run lint`; `npm run build`. Focused: `node --test frontend/test/view-bookmarks.test.mjs` (21tests total, exactly3newv34; all included in full suite). Lab: `node scripts/inventory-ui-lab.mjs --host-detail --sites --site-journey --filtered-tabs --detail-dns --flagged --opener-tabs`.

For Site Host11, Unassigned Host20, Flagged Domain/Sample04 and exact Flagged record, save complete filtered URLs. Use actual Chrome tab context menu > Duplicate. Compare complete URL and detail; navigate only child, return to original and verify original bookmark via a cross-view round trip. In duplicate, open invalid site_sort/unassigned_sort/flagged_sort/record_sort, require0affected rows and healthy sibling, repair by explicit valid URL, then check original again. Use the lab target=_blank rel=opener link; require visible opener=true and child own URL, close child, recheck original bookmark. Repeat final checks after any lab correction. Remaining native steps are explicitly pending, not claimed executed.

## 6. Tests and actual results

Final retained npm test:104tests,104pass,0fail. Exactly3newtests. Lint PASS96modules. Schema PASS22entities+2junctions/114nativeFK unchanged. Build PASS backend/frontend/migration assets. V34_DUPLICATE_MODEL, V34_OPENER_MODEL and V34_INVALID_CLONE each cover all4filtered journeys against actual HTTP/PostgreSQL; copied initial store semantics are modeled with separate Maps. Three real Chrome screenshots per task have SHA256 entries in verification-v34.json. Native screenshot observations are partial; they are not a complete all-journey trace. Cloudflare0requests. Full suite/lint/build rerun after the lab-link lifecycle fix passed.

## 7. Issues and implementation decisions

In-app browser exposes no native Duplicate capability; clicking the opener link created no child tab there. Used a dedicated native Chrome window and observed actual Duplicate and real opener=true. Found the initial lab-only opener link retained the initial URL after hash-only navigation; fixed href refresh on click and moved the panel into main. This was a fixture issue, not an inventory runtime defect. Repeated full checks after correction.

Prior turn Computer Use stopped because it could not determine the Windows browser URL confidently enough to enforce policy. On this resume, native address-field input reported user input in that window. No further native actions were taken; no policy weakening or bypass. Preserve partial actual screenshots and label unverified acceptance evidence honestly. Windows AX timing/position issues were not treated as app regressions. A checkpoint print encountered cp1258 encoding failure after the checkpoint write; this was console-only and not a test failure.

## 8. Not done, limitations and technical debt

Final native duplicate/opener/invalid traces for all4journeys remain incomplete, including corrected Flagged-record opener and original saved bookmark verified through cross-view return after child closure. Integration Map snapshots do not prove browser storage cloning. Browser sessionStorage is not enumerated. Domain screenshots include earlier partial lab observations; Site captures include the corrected lab. Synthetic/local only; no production/RBAC/scale/CVE/live Cloudflare/native Linux proof. Prior v33 DONE applied only to its synthetic/local assignment; v34 is PARTIAL because new native-browser acceptance evidence is incomplete. Existing storage denial/clearing and fragment-length limits remain. Healthy sibling rows may be retained hidden in DOM; no simultaneous-visibility claim.

## 9. Blockers and decisions required

Native UI verification currently limited by browser-control safety/user-input interruption. No spec/AC change requested or assumed; no new production/security/credential access needed. Continue remaining browser evidence when that surface is available. Do not treat routine fixture issues as Lead blockers. Q-01..Q-05 untouched. QA approval remains required before merge; Dev does not merge.

## 10. Next step and self-check

Push assigned feature branch/update existing PR1; verify live head/CI. Submit this honest PARTIAL RESULT with7evidence files per task and exactly1submission comment after duplicate check. Record actual uploaded IDs and published fingerprints in STATE. Next executable work: resume final corrected-lab native traces for all4journeys and original saved-bookmark checks; resubmit an incremented report only with new evidence. Do not claim DONE or stop permanently at modeled evidence.

- [x] Exact ten sections; original/history/current AC separate.
- [x] Exact source/time, specific files, reproduction and actual outputs.
- [x] Exactly3newtests;104pass;lint96;schema unchanged;buildPASS;3actualscreenshots per task.
- [x] Model/native distinction, fixture correction, interruption and remaining evidence explicit.
- [ ] Complete all native V34-1..3 traces and parent-bookmark verification.
- [x] No selfaccept/status change/production access/merge.

History: v33 accepted by live Lead22:32; same comment assigned v34. One v34 START per task22:44. v34 implementation resumed after interruption; no v34 submission existed at the start of this run. Source/evidence commit is above; this report follows in a separate commit.
