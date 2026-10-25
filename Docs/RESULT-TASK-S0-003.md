# Result — TASK-S0-003: v20 Package-to-host sorting

| Field | Value |
|---|---|
| Task ID | TASK-S0-003 |
| Result version | v20 |
| Status | PARTIAL |
| Spec version followed | SRSv1.0; TASK-S0-003; live Lead13:41 ACCEPTv19 and assignv20 |
| Dev agent | Codex — Dev AI Agent |
| Prepared at | 2026-10-25T13:56:11.156722+07:00 |
| Source/evidence commit | 425417ea3790880c3a96b8ae413430de10bfd02c |

## 1. Summary

PARTIAL in declared scope. Package hostname/version asc/desc,stable id ties/NULLS LAST;24hosts,search2.0 gives12,page2desc host03+host01;package/search/sort/page direct/reload/nativehistory;both parentdetail/list return retainstate;3invalidsort routes clearonlyview. Full69/69tests,0fail;lint93modules,schema22+2/114FK unchanged,buildPASS. Actual loopback READ ONLY PostgreSQL17.5WASM/DOM plus built-in browser verification/screenshots. Original nativeAC1/3/4unverified;accepted600010msoutageretained,notrerun.

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

## 3. Work completed

Package hostname/version asc/desc,stable id ties/NULLS LAST;24hosts,search2.0 gives12,page2desc host03+host01;package/search/sort/page direct/reload/nativehistory;both parentdetail/list return retainstate;3invalidsort routes clearonlyview. Existing accepted schema and Atlas frame reused;bounded opt-in GET only.

## 4. Files changed

Shared package files listed explicitly:

| File | Specific change |
|---|---|
| Docs/DOMAIN-INVENTORY-API.md | API/UI v20contract,exactroutes,reproduction/limits |
| Docs/DOMAIN-INVENTORY-UI.md | API/UI v20contract,exactroutes,reproduction/limits |
| Docs/HOST-INVENTORY-API.md | API/UI v20contract,exactroutes,reproduction/limits |
| Docs/HOST-INVENTORY-UI.md | API/UI v20contract,exactroutes,reproduction/limits |
| Docs/evidence/S0-003/build-v20.txt | Actual ESM build output |
| Docs/evidence/S0-003/lint-v20.txt | Actual93module/schema parity output |
| Docs/evidence/S0-003/package-sort-history-v20.png | Actual built-in browser history viewport screenshot |
| Docs/evidence/S0-003/package-sort-invalid-v20.png | Actual built-in browser invalid viewport screenshot |
| Docs/evidence/S0-003/package-sort-reload-v20.png | Actual built-in browser reload viewport screenshot |
| Docs/evidence/S0-003/test-v20.txt | Actual69test finaloutput |
| Docs/evidence/S0-003/verification-v20.json | Actualverification scope/counts/decisions/limits |
| Docs/evidence/S0-004/build-v20.txt | Actual ESM build output |
| Docs/evidence/S0-004/flagged-sort-history-v20.png | Actual built-in browser history viewport screenshot |
| Docs/evidence/S0-004/flagged-sort-invalid-v20.png | Actual built-in browser invalid viewport screenshot |
| Docs/evidence/S0-004/flagged-sort-reload-v20.png | Actual built-in browser reload viewport screenshot |
| Docs/evidence/S0-004/lint-v20.txt | Actual93module/schema parity output |
| Docs/evidence/S0-004/test-v20.txt | Actual69test finaloutput |
| Docs/evidence/S0-004/verification-v20.json | Actualverification scope/counts/decisions/limits |
| backend/src/inventory/exact-reader.mjs | Exact package-hosts hostname/version sort validation and ordered count/page query |
| backend/src/inventory/reader.mjs | Strict DNS owner/value/type sort whitelist and stable NULLS LAST/id ordering |
| frontend/src/dns-value-search.mjs | Flagged record sort controls,GET state,restoration and record-level flag retention |
| frontend/src/domain-navigation.mjs | Flagged record sort/flag/search/page routes and saved parent-return bookmarks |
| frontend/src/host-navigation.mjs | Package active/saved route state through search/sort/page and host detail/list return |
| frontend/src/package-hosts.mjs | Accessible sort/direction controls,queries and strict invalid view clearing |
| frontend/test/flagged-record-navigation.test.mjs | READ ONLY three-field/two-direction sort,combined flag/search,history/return/4invalid regressions |
| frontend/test/package-navigation.test.mjs | READ ONLY two-field/two-direction sort,stableties,reload/history/parent return/3invalid regressions |
| Docs/RESULT-TASK-S0-003.md | Canonical v20report;historicalACretained,newACseparate |

## 5. Run and verify

Repo root:`npm ci`;`npm test`;`npm run lint`;`npm run build`. Focused:`node --test frontend/test/package-navigation.test.mjs frontend/test/flagged-record-navigation.test.mjs`. Browserlabs:`node scripts/inventory-ui-lab.mjs --packages` and `node scripts/inventory-ui-lab.mjs --flagged`;use respective UIguidev20 exactfragments.

## 6. Tests and actual results

69/69tests,0failed;lint93modules;schema22entities+2junctions/114FK unchanged;buildPASS. Tests use real loopback HTTP/PostgreSQL17.5WASM inside BEGIN READ ONLY after syntheticfixtures,whitelisted sort SQL and existing owner/flag predicates. FreshDOM reload/history checks plus actual built-in browser nativeBack/Forward/parentreturns;3screenshots each. Proof/counts and limits in verification-v20.json;full outputs test/lint/build-v20.txt.

## 7. Issues and implementation decisions

No failed v20 focused/full tests. Active related-view identity is separated from saved parent bookmark in fragment:package_saved/records_saved prevent parent return reopening child immediately;explicit user reopen restores search/sort/page. Saved package state applies only to samepackageUUID. Controls reset page1 on sortchange,retainingsearch andstoredflag. Prefix package_hosts_sort avoids collision with accepted scoped package_sort. Identifier whitelists only,NULLS LAST,id ascending ties;version/text sorting lexical,notsemver. Flags use exact storedtag;no recalculation. Filechooser failures in priorrounds have explicitLead13:41 immutablecommitfallback;attemptuploadthisround then recordactualoutcome incomment/state.

## 8. Not done, limitations and technical debt

Local syntheticinventory only;no productionauth/RBAC/scale/CVE/nativeLinux/liveCloudflare/credential evidence. No schema/entity/collector/tagalgorithmchanges. Snapshots can change under inventoryupdates;versions lexical. NativeAC1/3/4remainunverified;600010msacceptedexperimentnotrerun.

## 9. Blockers and decisions required

No new contentblocker or PO/security/spec/production decision. Q01–05untouched. Actualupload retry/fallback outcome must remainhonest;fallbackalreadyexplicitlyauthorized byLead.

## 10. Next step and self-check

Push existingfeaturePR;verifylivecurrentCI;retryClickUpupload then exactlyonev20submissionperassignedtaskwithreport/evidence or authorizedimmutablecommitfallback;UIverify/checkpoint. AwaitspecificLead/QAreview;no selfaccept/merge.

- [x] Exact10sections;original/historical/currentACmappedseparately.
- [x] Exactsource/time,files,commands,actualoutputs and3screenshots.
- [x] Limits/errors/decisions/read-only/nativeboundariesclear.
- [x] Canonicalversionincrement;no schema/entity/productionchange.

History:v18accepted13:11;v19submitted13:32Domain/13:33Host,accepted13:41;v20assignedsameLeadcomment,STARTpublished,implementedandverifiedthiscycle.
