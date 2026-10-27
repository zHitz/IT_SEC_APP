# Result — TASK-S0-004: v35 native evidence gaps and bounded-retry PARTIAL

| Field | Value |
|---|---|
| Task ID | TASK-S0-004 |
| Result version | v35 |
| Status | PARTIAL |
| Spec version followed | SRS v1.0; TASK-S0-004; live Lead decision 1100390000172266 |
| Dev agent | Codex — Dev AI Agent |
| Submission package prepared at | 2026-10-27T20:47:01.422166+07:00 |
| Source/evidence commit | be26e51d2bafc9ece65d78dbeb412f4243fd1438 |

## 1. Summary

PARTIAL per the latest Lead decision 1100390000172266. Recovered the interrupted bounded native retry and the full test process. All four native journeys remain NOT PROVEN, including Flagged-record opener and original saved-bookmark cross-view return after child closure. All gaps remain OPEN. Current full suite:104/104 pass,0fail; lint96; unchanged schema22+2/114FK; buildPASS. Previously accepted synthetic/local Domain evidence remains historical evidence; it does not prove the new native-browser acceptance requirements.

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



### v35 native journey evidence (latest Lead decision)

| Journey | Native Duplicate | Native opener | Native invalid duplicate | Original saved bookmark after child closure + cross-view return | Gap |
|---|---|---|---|---|---|
| Site Host | NOT PROVEN | NOT PROVEN | NOT PROVEN | NOT PROVEN | OPEN; bounded retry interrupted before verified native load; native-retry-v35.json |
| Unassigned Host | NOT PROVEN | NOT PROVEN | NOT PROVEN | NOT PROVEN | OPEN; bounded retry interrupted before verified native load; native-retry-v35.json |
| Flagged Domain | NOT PROVEN | NOT PROVEN | NOT PROVEN | NOT PROVEN | OPEN; bounded retry interrupted before verified native load; native-retry-v35.json |
| Flagged record | NOT PROVEN | NOT PROVEN | NOT PROVEN | NOT PROVEN | OPEN; bounded retry interrupted before verified native load; native-retry-v35.json |

| ID | Current acceptance requirement | Result and evidence |
|---|---|---|
| V35-1 | Native Duplicate complete for all four filtered journeys, original preserved | NOT PROVEN for each journey above. No complete new native trace; existing V34_DUPLICATE_MODEL rerun is modeled evidence only. |
| V35-2 | Native opener complete, especially Flagged record; saved bookmark verified after child closure via cross-view return | NOT PROVEN for every journey. Flagged-record opener and original saved-bookmark return remain explicit OPEN gaps. Existing V34_OPENER_MODEL rerun is not native proof. |
| V35-3 | Invalid native duplicate isolates affected rows, explicit repair, original unaffected | NOT PROVEN for every journey. V34_INVALID_CLONE rerun supplies model assertions only; native trace remains OPEN. |
| V35-4 | Honest PARTIAL report, bounded native retry record and actual full checks/evidence | PASS for local artifacts: 104/104 tests, 0 fail, lint96, schema22+2/114FK unchanged, buildPASS; five evidence files. New screenshots: 0. Upload/publication is recorded separately in STATE after actual completion. |

## 3. Work completed

Read the live task/Lead decision and live Git/PR state. Reused the existing START; no duplicate START. Ran lint/schema, all tests and build on the recorded source commit. The one bounded retry entered the approved lab URL, then the turn was interrupted before navigation. On resume a fresh address-bar observation differed from the last verified entry, so no navigation/corrective input or second attempt was issued. Recorded that bounded outcome and prior gate-stop separately; created the per-journey evidence matrix. No inventory implementation changed.

## 4. Files changed

| File | Specific change |
|---|---|
| Docs/RESULT-TASK-S0-004.md | Canonical report incremented to v35; preserves original/historical AC mapping and adds explicit per-journey OPEN native gaps. |
| Docs/evidence/S0-004/verification-v35.json | Actual source/check totals, model/native separation, zero new screenshots and evidence SHA-256 references. |
| Docs/evidence/S0-004/native-retry-v35.json | One bounded retry chronology, prior mandatory gate record, interrupted turn and later address mismatch; no inference of who changed it. |
| Docs/evidence/S0-004/test-v35.txt | Actual complete current-source suite output:104pass/0fail; existing model markers retained. |
| Docs/evidence/S0-004/lint-v35.txt | Actual lint96 and schema22+2/114FK output. |
| Docs/evidence/S0-004/build-v35.txt | Actual backend/frontend and migration-asset build output. |

## 5. Run and verify

From the IT_SEC_APP root on Node24:

```powershell
npm run lint
npm test
npm run build
```

Match outputs to the source commit in the header and the hashes in verification-v35.json. Read native-retry-v35.json and the four-journey matrix separately from automated model outputs. Reproduction commands above are local verification, not instructions to bypass a Computer Use safety stop. Do not repeat the bounded retry just to obtain a more favorable result. Complete the remaining native traces through the normal approved setup only after capture is restored.

## 6. Tests and actual results

| Check | Actual result | Evidence |
|---|---|---|
| Full existing suite | 104 tests,104 pass,0 fail;0 new tests | test-v35.txt |
| Lint | PASS,96 modules | lint-v35.txt |
| Schema | PASS,22 entities+2 junctions,114 native FKs; no schema source edit | lint-v35.txt |
| Build | PASS backend/frontend/migration assets | build-v35.txt |
| Existing clone/opener/invalid models | All four journeys asserted in V34 model markers rerun | test-v35.txt; modeled, not native |
| Bounded native retry | Interrupted before verified native page load | native-retry-v35.json |
| Native four-journey acceptance | 0 newly PROVEN; all remain NOT PROVEN/OPEN | Per-journey matrix |

Live Cloudflare requests:0. Synthetic test log includes loopback mock traffic; that is not a real provider request. No new native screenshot was captured or relabeled from an older version.

## 7. Issues and implementation decisions

Correction to the prior BLOCKED-and-wait posture: Lead comment 1100390000172266 explicitly directs PARTIAL submission regardless of retry outcome. The capture interruption is handled within the assignment; no AC, scope, security or SRS change is requested. The existing START remains valid.

The bounded retry began in the interrupted previous turn. Its exact URL entry was observed; the turn ended before Return/navigation. On resume the fresh native address bar contained a trailing character absent from the last verified entry. That observation does not establish its cause. The attempt was stopped rather than navigating an unexpected URL or starting a second retry. The earlier URL-confidence gate-stop is retained with its actual prior timestamp; it is not falsely claimed as a fresh stop during this retry.

The background test process finished successfully; its complete output was recovered, so tests were not duplicated after interruption. No implementation defect was inferred from desktop input behavior. No model result substitutes for native proof. No policy weakening, alternate input path or production access occurred.

## 8. Not done, limitations and technical debt

Every native Duplicate/opener/invalid trace and original saved-bookmark cross-view return after child closure remains OPEN for Site Host, Unassigned Host, Flagged Domain and Flagged record. Corrected Flagged-record opener is specifically NOT PROVEN. No native evidence gap is closed or waived. Previously accepted synthetic/local Domain evidence remains historical evidence; it does not prove the new native-browser acceptance requirements. Synthetic/local scope only; no production/RBAC/scale/CVE/live Cloudflare/native Linux proof. Existing storage denial/clearing and size limits remain.

## 9. Blockers and decisions required

No new PO-level decision is required for this PARTIAL submission. The environment capture limitation remains an execution gap to resolve through the normal approved setup; it does not gate submission under the latest Lead decision. QA approval is still required before any merge. No task status, description or dependency was changed; no self-ACCEPT, no merge, Q-01..Q-05 untouched.

## 10. Next step and self-check

Commit these report/evidence changes on the assigned feature branch, push to update the existing PR, verify current-head CI/reviews, attach the actual report plus five evidence files to this exact task, and post one [DEV][SUBMISSION] PARTIAL summary after the live duplicate check. Record actual attachment IDs and submission comment in STATE; do not claim upload success from this prepared report alone.

After native capture is restored, complete the OPEN journeys under the Lead's stated follow-up assignment; do not wait for another ACCEPT merely to resume. Do not create an incremented report without new evidence or a new explicit reporting instruction.

- [x] Exact ten sections; original/historical/current AC mappings kept separate.
- [x] Real source commit, preparation time, actual check output and evidence hashes.
- [x] All four journeys explicitly NOT PROVEN, especially Flagged-record opener and saved bookmark after child close.
- [x] Prior gate-stop distinguished from this interrupted bounded retry;0 new screenshots; no native claim from model tests.
- [x] No code/schema/API/collector change, policy bypass, task mutation, self-acceptance or merge.
- [ ] Complete all OPEN native journeys through the normal approved capture path.

History: v34 is retained in section2 as previously reported/accepted PARTIAL history. v35 follows the live Lead decision 1100390000172266; capture capability restoration is not a submission prerequisite.
