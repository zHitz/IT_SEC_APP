# Result — TASK-S0-003: v37 exact ACK and restart recovery evidence; overall PARTIAL

| Field | Value |
|---|---|
| Task ID | TASK-S0-003 |
| Result version | v37 |
| Status | PARTIAL |
| Spec version followed | SRS v1.0; TASK-S0-003; live Lead decision 1100390000172265 |
| Dev agent | Codex — Dev AI Agent |
| Submission package prepared at | 2026-10-30T11:51:02.197946+00:00 |
| Source/evidence commit | f3cb824adc44332041a7189b2a7a084dce2c3bf8 |

## 1. Summary

CURRENT v37: LOCAL-QUEUE-ACK-RECOVERY-001 adds missing real loopback HTTP exact-ACK/permanent-rejection/re-instantiation proof. Tests/evidence only; runtime unchanged. Overall PARTIAL. v36 and older claims below are historical.

CURRENT v36: LOCAL-QUEUE-CONCURRENCY-001 reproduced/fixed acknowledged flush deletion racing enqueue capacity stat. Only ENOENT is tolerated; other errors propagate. Overall PARTIAL. All v35 statements below are historical, not current run claims.

PARTIAL per the latest Lead decision 1100390000172265. Recovered the interrupted bounded native retry and the full test process. All four native journeys remain NOT PROVEN, including Flagged-record opener and original saved-bookmark cross-view return after child closure. All gaps remain OPEN. Current full suite:104/104 pass,0fail; lint96; unchanged schema22+2/114FK; buildPASS. Original native Host AC-1/AC-3/AC-4 remain unverified; previously accepted simulator/outage evidence is retained as historical evidence and was not rerun or reclassified as native.

## 2. Acceptance criteria

V37 AC-2: five response cases retain two byte-identical queue files and block FIFO advance. Wrong ID/accepted:false/malformed JSON use three finite attempts; 401/403 use one request and zero waits. A new queue instance receives two matching ACKs in FIFO order, pending0; an empty flush sends no further requests. AC-1/3/4 native gaps, AC-5 accepted mapping and AC-6 privacy boundaries unchanged; no new proof for those ACs.

V36 AC-2 follow-up supported: deterministic regression1fail before fix,1pass after; new batch retained then delivered, overflow rejected. Original AC rows below retain accepted lab scope and unverified native limits. AC-5 follows S0-002 mapping; no Process table/waiver.

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

| V24-1 | Site picker sorting | PASS: actual HTTP/PostgreSQL regressions and verification-v24.json. |
| V24-2 | Combined direct/reload/native history context | PASS: freshDOM and actual built-in browser proof, complete scoped fragments. |
| V24-3 | Return/isolation without partial rows | PASS: both parent returns; four invalid picker sorts retain selected Site and six host rows. |
| V24-4 | Full checks and evidence | PASS:77/77tests;lint93;schema22+2/114FK unchanged;build;three screenshots. |

| V25-1 | Combined state/chain preservation | PASS: Simultaneous picker name-desc/searchSite/page2 and selectedSite Host hostname-desc/searchhost-/page2 survive direct/reload/history and both parent returns. Changing one sort retains the other list context. Four invalid picker and four invalid host cases clear only their own list. NativeAC1/3/4 remain unverified;accepted600010msoutage retained/notrerun. |
| V25-2 | Direct/reload/native Back/Forward and returns | PASS:actual HTTP/PostgreSQL/DOM regression and built-in browser complete-state verification. |
| V25-3 | Independent invalid states | PASS: 4 picker +4 host sort cases; no partial rows or cross-clearing. |
| V25-4 | Complete checks and evidence | PASS:79tests/0fail;lint93;schema22+2/114FK unchanged;build;three screenshots. |

| V26-1 | Combined list/detail state | PASS: Host list search/sort/page plus independent package and port search/sort/page coexist in one fragment. Host11 has31 packages/31 ports; filtered page2 has6 rows each. Detail return/reopen, direct/reload/nativehistory retain both levels. Six invalid list/package/port cases clear only affected rows. NativeAC1/3/4remainunverified;accepted600010msoutage retained/notrerun. |
| V26-2 | Direct/reload/history and return context | PASS:actual HTTP/PostgreSQL/DOM and built-in browser;record return/detail return or Host reopen retain scoped state. |
| V26-3 | Invalid state independence | PASS:six invalid cases per task;affected list/detail cleared,healthy context retained. |
| V26-4 | Full checks/evidence | PASS:81tests/0fail;lint93;schema22+2/114FK unchanged;build;three screenshots. |


| ID | v27 criterion | Result / actual evidence |
|---|---|---|
| V27-1 | Combined fragment with all assigned levels | PASS: Site picker name-desc/search Site/page2, Site-filtered Hosts hostname-desc/search host-/page2, Host11 package version-desc/search package/page2 and ports pid-desc/search synthetic/page2 coexist in one fragment. Detail returns to Site Hosts; picker return and same-Site reopen retain Host page2. Package and port page2 each contain6 rows. Native AC-1/3/4 remain unverified; accepted actual600010ms outage retained, not rerun. |
| V27-2 | Direct/reload/native history and origin return/reopen | PASS: actual HTTP/PostgreSQL fresh DOM/history tests and built-in browser reload, Back/Forward and origin-specific return. Site picker search/sort/page and Site Host page2 survive reopen. |
| V27-3 | At least six independently invalid levels | PASS: picker sort/direction, Site Host sort/direction, package sort and port sort; only affected rows clear, healthy lists retain state. |
| V27-4 | Full suite, lint/build/schema, verification/logs and three screenshots | PASS:83/83 tests,0fail;lint94modules;schema22entities+2junctions/114nativeFK unchanged;buildPASS. verification-v27.json, test/lint/build-v27.txt and three actual v27 screenshots. |


| ID | v28 criterion | Result / actual evidence |
|---|---|---|
| V28-1 | Complete v27 journey survives switch to other inventory view and back | PASS: exact fragment preserved through separate fixed-path session bookmarks; no reset or cross-clear. Site picker name-desc/searchSite/page2, Site Host hostname-desc/searchhost-/page2, Host11 package version-desc/searchpackage/page2 and port pid-desc/searchsynthetic/page2 |
| V28-2 | Direct/reload/native history and correct origin after switching | PASS: actual HTTP/PostgreSQL fresh-document regressions and built-in browser. Host detail Back restores Site Host page2; reopening Host11 retains six package and six port rows. |
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
| V31-1 | Independent filtered tab journeys without overwrite | PASS: Independent tabs retain Site-filtered Host11 with scoped package/port lists and Unassigned Host20 with its own list origin. Fixed Unassigned Host selection and detail Back so it restores Unassigned search/sort/page rather than the Site picker. |
| V31-2 | Fresh zero-entry saved URLs and two exact list/detail round trips | PASS: all four filtered journeys assert initial0 modeled storage entries and exact canonical saved fragment; two list/detail trips each. Actual independent browser tabs separately verify same behavior. |
| V31-3 | Invalid fresh filtered URL, zero affected rows, healthy sibling, repair and clean new tab | PASS: Site/Unassigned/Flagged Domain/Flagged record invalid sort paths clear affected rows0, retain healthy main inventory rows, and repair with explicit valid URL. New independent tab after close remains default. |
| V31-4 | Exactly three new tests,95/95,lint96,schema/build and actual screenshots | PASS:95tests,0fail;lint96;schema22entities+2junctions/114nativeFK unchanged;buildPASS. verification-v31.json,test/lint/build-v31.txt and three real screenshots. |


| ID | v32 criterion | Result / actual evidence |
|---|---|---|
| V32-1 | Filtered journeys survive opposite-view switch with exact fragment | PASS: Site Host11 and Unassigned Host20 retain filtered origins,search/sort/page and scoped package/port page2 across Host/Domain switches. Each scoped page2 has6rows afterreturn/reopen. Two cross-view round trips per journey; other view remains exact. |
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

V37 inspected osquery-safety.test.mjs and osquery.test.mjs: existing restart/overflow/unsafe-destination/lab tests do not assert invalid successful ACKs or permanent-rejection FIFO recovery. Added only these missing cases.

Read the live task/Lead decision and live Git/PR state. Reused the existing START; no duplicate START. Ran lint/schema, all tests and build on the recorded source commit. The one bounded retry entered the approved lab URL, then the turn was interrupted before navigation. On resume a fresh address-bar observation differed from the last verified entry, so no navigation/corrective input or second attempt was issued. Recorded that bounded outcome and prior gate-stop separately; created the per-journey evidence matrix. No inventory implementation changed.

## 4. Files changed

V37 changed backend/test/osquery-queue-ack-recovery.test.mjs (five table-driven real HTTP/filesystem cases), Docs/evidence/S0-003/ack-focused-v37.txt and ack-lint-v37.txt (actual output), and this canonical RESULT. No runtime or other TASK RESULT changed.

V36 files: collectors/osquery/queue.mjs (ENOENT-only handling); backend/test/osquery-queue-concurrency.test.mjs (ordered real filesystem/HTTP regression); this RESULT; verification-v36.json and baseline/targeted/test/lint/schema/build-v36.txt under Docs/evidence/S0-003. No other TASK RESULT change.

| File | Specific change |
|---|---|
| Docs/RESULT-TASK-S0-003.md | Canonical report incremented to v35; preserves original/historical AC mapping and adds explicit per-journey OPEN native gaps. |
| Docs/evidence/S0-003/verification-v35.json | Actual source/check totals, model/native separation, zero new screenshots and evidence SHA-256 references. |
| Docs/evidence/S0-003/native-retry-v35.json | One bounded retry chronology, prior mandatory gate record, interrupted turn and later address mismatch; no inference of who changed it. |
| Docs/evidence/S0-003/test-v35.txt | Actual complete current-source suite output:104pass/0fail; existing model markers retained. |
| Docs/evidence/S0-003/lint-v35.txt | Actual lint96 and schema22+2/114FK output. |
| Docs/evidence/S0-003/build-v35.txt | Actual backend/frontend and migration-asset build output. |

## 5. Run and verify

V37 reproduce from repo: `node --test backend/test/osquery-queue-ack-recovery.test.mjs backend/test/osquery-queue-concurrency.test.mjs backend/test/osquery-safety.test.mjs`; `npm run lint`; `git diff --check`.

From the IT_SEC_APP root on Node24:

```powershell
npm run lint
npm test
npm run build
```

Match outputs to the source commit in the header and the hashes in verification-v35.json. Read native-retry-v35.json and the four-journey matrix separately from automated model outputs. Reproduction commands above are local verification, not instructions to bypass a Computer Use safety stop. Do not repeat the bounded retry just to obtain a more favorable result. Complete the remaining native traces through the normal approved setup only after capture is restored.

## 6. Tests and actual results

V37 actual output: focused 9 tests / 9 pass / 0 fail, duration514.2669ms; lint PASS98 modules; schema PASS22 entities/2 junctions/114 native FKs; diff whitespace PASS. Full suite/build/ten-minute outage not rerun for tests-only changes; v36 full105 pass is historical, not a current v37 full run.

V36 actual commands: node --test backend/test/osquery-queue-concurrency.test.mjs (baseline1fail ENOENT; fixed1pass); node --test backend/test/*.test.mjs frontend/test/*.test.mjs (105pass,0fail); node scripts/check.mjs; node scripts/generate-schema.mjs --check; node scripts/build.mjs (all pass). Logs attached locally. No ten-minute outage rerun.

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

V37 no demonstrated product defect, so no runtime change. Retry wait is injected as a counter, not a sleep; real HTTP and queue files are used. Restart means a fresh DurableQueue object reading existing disk files, not OS/process power-loss recovery. Accepted records are counted by the HTTP fixture; this is not new database idempotency proof. No equivalent assertions found in inspected existing tests.

V36 new defect established by ordering acknowledged flush after real enumeration before stat via test subclass. No timing loop/production hook. The earlier audit established no defect; this new regression supplies the missing reproduction. UTF-8 console error interrupted packaging after source commit; resumed packaging without duplicate commit/test execution.

Correction to the prior BLOCKED-and-wait posture: Lead comment 1100390000172265 explicitly directs PARTIAL submission regardless of retry outcome. The capture interruption is handled within the assignment; no AC, scope, security or SRS change is requested. The existing START remains valid.

The bounded retry began in the interrupted previous turn. Its exact URL entry was observed; the turn ended before Return/navigation. On resume the fresh native address bar contained a trailing character absent from the last verified entry. That observation does not establish its cause. The attempt was stopped rather than navigating an unexpected URL or starting a second retry. The earlier URL-confidence gate-stop is retained with its actual prior timestamp; it is not falsely claimed as a fresh stop during this retry.

The background test process finished successfully; its complete output was recovered, so tests were not duplicated after interruption. No implementation defect was inferred from desktop input behavior. No model result substitutes for native proof. No policy weakening, alternate input path or production access occurred.

## 8. Not done, limitations and technical debt

V37 local/synthetic only. No native browser/Linux/provider evidence, process crash/fsync fault injection, multi-producer capacity guarantee or new ten-minute experiment. Original unverified AC portions remain open.

V36 synthetic/local only; deterministic concurrency is not native browser/Linux evidence. Original native/integration limits and four UI native gaps remain OPEN/NOT PROVEN. Existing accepted lab scope preserved.

Every native Duplicate/opener/invalid trace and original saved-bookmark cross-view return after child closure remains OPEN for Site Host, Unassigned Host, Flagged Domain and Flagged record. Corrected Flagged-record opener is specifically NOT PROVEN. No native evidence gap is closed or waived. Original native Host AC-1/AC-3/AC-4 remain unverified; previously accepted simulator/outage evidence is retained as historical evidence and was not rerun or reclassified as native. Synthetic/local scope only; no production/RBAC/scale/CVE/live Cloudflare/native Linux proof. Existing storage denial/clearing and size limits remain.

## 9. Blockers and decisions required

V37 no new implementation blocker. Independent current-revision QA and required CI remain merge gates; Dev must not merge.

V36 requires independent current-head QA approval before merge. Local coordinator replaces historical ClickUp delivery directions. No new PO scope or security decision requested.

No new PO-level decision is required for this PARTIAL submission. The environment capture limitation remains an execution gap to resolve through the normal approved setup; it does not gate submission under the latest Lead decision. QA approval is still required before any merge. No task status, description or dependency was changed; no self-ACCEPT, no merge, Q-01..Q-05 untouched.

## 10. Next step and self-check

V37 next: Lead reviews exact assertions/output and submitted commit. Checklist: ten sections retained; six original AC rows retained separately; all changed files/output/reproduction/limits disclosed; no secrets or new scope; no duplicate outage/full-suite run. History: v37 adds ACK/recovery evidence after bounded v36 concurrency acceptance.

V36 next: Lead reviews local submission with actual new queue proof and current PR/CI status. Do not merge. Historical v35 text/checklist below applies only to v35, including its old no-code-change statement.

Commit these report/evidence changes on the assigned feature branch, push to update the existing PR, verify current-head CI/reviews, attach the actual report plus five evidence files to this exact task, and post one [DEV][SUBMISSION] PARTIAL summary after the live duplicate check. Record actual attachment IDs and submission comment in STATE; do not claim upload success from this prepared report alone.

After native capture is restored, complete the OPEN journeys under the Lead's stated follow-up assignment; do not wait for another ACCEPT merely to resume. Do not create an incremented report without new evidence or a new explicit reporting instruction.

- [x] Exact ten sections; original/historical/current AC mappings kept separate.
- [x] Real source commit, preparation time, actual check output and evidence hashes.
- [x] All four journeys explicitly NOT PROVEN, especially Flagged-record opener and saved bookmark after child close.
- [x] Prior gate-stop distinguished from this interrupted bounded retry;0 new screenshots; no native claim from model tests.
- [x] No code/schema/API/collector change, policy bypass, task mutation, self-acceptance or merge.
- [ ] Complete all OPEN native journeys through the normal approved capture path.

History: v34 is retained in section2 as previously reported/accepted PARTIAL history. v35 follows the live Lead decision 1100390000172265; capture capability restoration is not a submission prerequisite.

History: v36 adds queue concurrency fix/evidence. v35 PARTIAL history and all native gaps retained; zero new screenshots.
