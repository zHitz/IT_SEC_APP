# Result — TASK-S0-003: v32 Filtered journeys across inventory views

| Field | Value |
|---|---|
| Task ID | TASK-S0-003 |
| Result version | v32 |
| Status | PARTIAL |
| Spec version followed | SRS v1.0; TASK-S0-003; live Lead21:41 ACCEPTv31 and V32-1..4 assignment |
| Dev agent | Codex — Dev AI Agent |
| Prepared at | 2026-10-25T21:51:13.078147+07:00 |
| Source/evidence commit | 0278789d142a8c17a5ddeb426a241825f023b8b4 |

## 1. Summary

Site Host11 and Unassigned Host20 retain filtered origins,search/sort/page and scoped package/port page2 across Host/Domain switches. Each scoped page2 has6rows afterreturn/reopen. Exact fragments and healthy state survive both directions. Invalid filtered destination repair preserves source. Full98/98tests pass,lint96,schema unchanged,buildPASS. NativeAC1/3/4remainunverified;acceptedactual600010msoutage retained/notrerun;overallPARTIAL.

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

## 3. Work completed

Site Host11 and Unassigned Host20 retain filtered origins,search/sort/page and scoped package/port page2 across Host/Domain switches. Each scoped page2 has6rows afterreturn/reopen. Added exactly3tests in the existing module and extended only the opt-in synthetic Host20 fixture for requested page2 evidence. Existing runtime navigation already satisfies v32; no runtime,API,schema,entity,collector orstylechange. One START21:44 published on each exact task beforeimplementation;no status/description/dependency mutation.

## 4. Files changed

| File | Specific change |
|---|---|
| frontend/test/view-bookmarks.test.mjs | Exactly3newtests:all4filteredcross-viewjourneys;post-switchdirect/reload/history/originreturns;invaliddestination/sourcepreservation/repair/newdefault. Uses actualHTTP/PostgreSQL READONLY. |
| scripts/inventory-ui-lab.mjs | Only filteredTabsFixtures+hostDetailFixtures adds30syntheticpackages/ports forHost20;31total yields6rows onpage2. No defaultfixture/runtime/APIchange. |
| Docs/HOST-INVENTORY-UI.md | Document filteredHostcross-viewstate,Host20fixture and reproduction. |
| Docs/DOMAIN-INVENTORY-UI.md | Document cross-viewFlaggedDomain/record origins and childDNSreturn. |
| Docs/evidence/S0-003/verification-v32.json | Actual per-criterion98pass/lint96/schema/build/browserchecks and limits. |
| Docs/evidence/S0-003/{test,lint,build}-v32.txt | Actual full98pass/0fail,lint96/schema22+2/114FK and build output. |
| Docs/evidence/S0-003/host-filter-switch-{reload,history,invalid}-v32.png | Three real settled screenshots after filtered cross-view switching. |
| Docs/RESULT-TASK-S0-003.md | Canonical ten-section v32 report;preserveoriginal/historyAC andaddseparateV32rows. |

## 5. Run and verify

Repository root:`npm ci`;`npm test`;`npm run lint`;`npm run build`.
Focused:`node --test --test-concurrency=1 frontend/test/view-bookmarks.test.mjs` (15tests,3newv32).
Lab:`node scripts/inventory-ui-lab.mjs --host-detail --sites --site-journey --filtered-tabs --detail-dns --flagged`.
Use filtered32 routes in the test. In tabA open Site Host11 then Flagged Domains/Sample04detail;tabB open UnassignedHost20 then FlaggedDNSrecord. Save canonical URLs,perform2sidebarcross-viewtrips each andcompareexactfragments. Reload,use nativeBack/Forward,detailBack/reopen;Hostscopedpage2each6rows,childDNSpage2five. Forall4filteredlistURLs set site_sort/unassigned_sort/flagged_sort/record_sort=bad,establishoppositeviewsource,returntodestinationandverify0affectedrows/healthymain;repairbyexplicitURLandreturnsourceexact. Independentnewtabafterclose default. Syntheticsetup precedes BEGIN READ ONLY.

## 6. Tests and actual results

Full98/98passed,0failed;15targetedpassed;exactly3newtestsinexistingfile. Lint96modules;schema22entities+2junctions/114nativeFKunchanged;buildPASS. V32_FILTERED_SWITCH provesall4journeys,2exactcross-viewtrips,nocrossclear;V32_ORIGIN_HISTORY provesdirect/reload/history/correctorigin/reopen;V32_INVALID_DESTINATION proves0affectedrows/healthysibling/sourceexact/repair. ActualHTTP/PostgreSQL17.5WASM READONLY aftersetup. Actualbuilt-inbrowser separately verifies2tabpairs,all4invaliddestinations,6rows perHostscopedlist,recordBack5childDNSrows,bothDomainorigins,explicitrepair/newtabdefault. Threeactualscreenshots per task. Cloudflare0requests.

## 7. Issues and implementation decisions

Lead requests6rows onHost20package/portpage2;its priorfixture had1record each. Added30syntheticrecords only when both existingfilteredTabsFixtures andhostDetailFixtures are enabled. No productiondata,defaultfixture orruntimecontractchange. Exactly3newtests stayinexistingfile so lint remains96. Independenttab/historyfixtures are modeled integration evidence;realbrowser checks separatelyverifyUI. No targeted/fulltest failures. Reused accepted v31 origin implementation without unnecessary source changes.

## 8. Not done, limitations and technical debt

Synthetic/local only;no production/RBAC/scale/CVE/nativeLinux/liveCloudflareproof. Existing sessionstorage denial/clearing/fragment16384limits remain. Independentfresh tabs withoutopener verified;duplicate/openerstoragecloning notclaimed. Healthy main sibling rows are retained but hidden whilefilteredpanelactive;no simultaneousvisibilityclaim. NativeAC1/3/4unverified;acceptedactual600010msoutage retained/notrerun;overallPARTIAL. Uploadactualoutcome/exactattachmentIDs recordedinsubmission/checkpoint;quota boundary honored.

## 9. Blockers and decisions required

No new missinginput/spec/security/productiondecision orhardblocker. Q-01..Q-05untouched. QAapprovalrequired beforemerge;Devdoesnotmerge. Routinecomments/RESULT/evidenceuploads authorized onexactassignedtasks only.

## 10. Next step and self-check

Push existingfeaturebranch/updatePR1;verifylivecurrent-headCI. UploadRESULT/evidenceusing browsemenu->Uploadfile->chooser;verifylinks,thenpublish exactlyone [DEV][SUBMISSION] pertask. Savecheckpoint andcontinuevalidLead/QAworkwithoutduplicates.

- [x] Exacttensections;original/historical/currentACseparate.
- [x] Exactsource/time,eachfile,commands,realoutput.
- [x] Three newtests,98fullsuite,lint96,unchangedschema/build,3actualscreenshots.
- [x] Fixture/model/browser/native/securitylimits explicit;no selfaccept/statuschange/merge.

History:v31accepted byliveLead21:41basedonactualClickUpattachments;v32START21:44verifiedbeforeimplementation. Exacttestedsource/evidencecommit above.
