# Result — TASK-S0-003: v18 Host sorting

| Field | Value |
|---|---|
| Task ID | TASK-S0-003 |
| Result version | v18 |
| Status | PARTIAL |
| Spec version followed | SRSv1.0; TASK-S0-003; live Lead12:02 ACCEPTv17 and assignv18 |
| Dev agent | Codex — Dev AI Agent |
| Prepared at | 2026-10-25T13:06:43.856817+07:00 |
| Source/evidence commit | 85e74a7a9276a145c0363c29921471af8dd57833 (implementation 3ced829e35445734dba2e3476a3e1cb0534394f1) |

## 1. Summary

PARTIAL overall: original native Linux/osquery AC1/3/4 remain unverified; accepted600010ms outage retained. v18 Host sorting and browser route behavior pass: direct hostname desc/search host-/page2 reload returns host16; native Back/Forward restores desc/page2 and asc/page1; detail return retains context; invalid sort clears all rows. Full65/65tests,lint93modules/schema22+2/114FK unchanged,buildPASS. Actual built-in browser evidence added after access was restored by app restart. ClickUp attachment retry timed out; use fixed-commit fallback explicitly authorized by Lead12:02.

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

## 3. Work completed

Three stored text fields × two directions; varied OS/version fixture, stable id ties, disjoint pages, search/page direct route, fresh DOM reload, Back/Forward fixture, detail return and six invalid routes. Same Atlas shell/style retained. Code and evidence committed; no schema, collector, real infrastructure or credential access.

## 4. Files changed

Shared work package files are listed explicitly; each task retains its own evidence and canonical RESULT.

| File | Change |
|---|---|
| frontend/src/inventory-table.mjs | Host sort controls, safe selection and record value selection callbacks |
| frontend/src/inventory-detail.mjs | DNS child record selection callback |
| backend/src/app.mjs | Allow exact DNS record GET routing |
| backend/src/inventory/exact-reader.mjs | UUID-bound DNS record SELECT, strict query/errors and safe provenance projection |
| backend/src/inventory/reader.mjs | Whitelisted Host sort/direction, NULLS LAST with stable id tie order |
| frontend/server.mjs | Opt-in loopback GET proxy for exact DNS UUID and new module |
| frontend/src/dns-value-search.mjs | Record selection from value and flagged-record results |
| frontend/src/domain-navigation.mjs | Record identity routes/history and origin fragment restoration |
| frontend/src/host-navigation.mjs | Host sort/search/page fragment restoration and strict invalid state handling |
| frontend/src/dns-record-detail.mjs | Exact record view, safe text, timeout/stale suppression and zero-field failures |
| frontend/test/dns-record-detail.test.mjs | Actual READ ONLY HTTP/PostgreSQL and fresh DOM/history/detail/error verification |
| frontend/test/host-sort-navigation.test.mjs | Actual varied-text ordering across 3 fields/2 directions, stable ties/pages, reload/history/invalid verification |
| Docs/HOST-INVENTORY-API.md | v18 contract, reproduction commands and observed limits for respective feature |
| Docs/HOST-INVENTORY-UI.md | v18 contract, reproduction commands and observed limits for respective feature |
| Docs/DOMAIN-INVENTORY-API.md | v18 contract, reproduction commands and observed limits for respective feature |
| Docs/DOMAIN-INVENTORY-UI.md | v18 contract, reproduction commands and observed limits for respective feature |
| Docs/evidence/S0-003/verification-v18.json | Actual feature proof summary and explicit browser/delivery limits |
| Docs/evidence/S0-003/test-v18.txt | Final65test output, including READ ONLY integration proofs |
| Docs/evidence/S0-003/lint-v18.txt | 93module and accepted schema parity output |
| Docs/evidence/S0-003/build-v18.txt | Actual native ESM build output |
| Docs/evidence/S0-004/verification-v18.json | Actual feature proof summary and explicit browser/delivery limits |
| Docs/evidence/S0-004/test-v18.txt | Final65test output, including READ ONLY integration proofs |
| Docs/evidence/S0-004/lint-v18.txt | 93module and accepted schema parity output |
| Docs/evidence/S0-004/build-v18.txt | Actual native ESM build output |
| Docs/RESULT-TASK-S0-003.md | Canonical v18 prepared RESULT, original and historical AC evidence retained |

| Docs/evidence/S0-003/host-sort-reload-v18.png | Actual built-in browser reload viewport proof after access recovery |
| Docs/evidence/S0-003/host-sort-history-v18.png | Actual built-in browser history viewport proof after access recovery |
| Docs/evidence/S0-003/host-sort-invalid-v18.png | Actual built-in browser invalid viewport proof after access recovery |

## 5. Run and verify

At repo root: `npm ci`; `node --test frontend/test/host-sort-navigation.test.mjs`; `npm test`; `npm run lint`; `npm run build`. Lab and exact fragments in the respective UI guide v18 section. All data synthetic.

## 6. Tests and actual results

Final65/65tests,0failed;lint93modules;schema22entities+2junctions/114FK unchanged;buildPASS. Saved outputs and verification-v18.json in Docs/evidence/S0-003. Actual loopback HTTP/PostgreSQL17.5WASM tests execute within BEGIN READ ONLY after fixture setup. Reload uses fresh Linkedom document and history uses the navigation fixture; these are distinct from the additional actual built-in browser verification now completed. Three v18 screenshot files document reload/history/invalid states.

## 7. Issues and implementation decisions

Initial Host test found Linkedom select value assignment and invalid sort selection errors; explicit safe option selection fixes both. Stronger final tests use varied OS/version text and verify ordering/ties and invalid page size. Version ordering follows stored text, not semantic versions. DNS detail normalizes UUID case and removes only record identity on return to preserve origin fragment. Browser creation and existing ClickUp tab access both returned `Local browser use is disabled in Work settings`; no settings changed or premature API quota retry attempted. App restart restored built-in access. Actual browser route checks then passed. ClickUp Domain upload control was retried with filechooser listener armed first;10000ms timeout observed, so fixed-commit fallback is required. No attachment success claimed.

## 8. Not done, limitations and technical debt

Native browser validation/screenshots completed. Actual ClickUp file attachment unavailable after timeout; no uploaded file claimed. Submission uses exact fixed-commit RESULT and evidence links per live Lead12:02 authorization. No production authentication/RBAC/scale/live Cloudflare/native Linux claim. Separate snapshots may change during inventory updates. Stored flags unchanged; no silent schema, osquery or tag algorithm changes. Original nativeAC1/3/4 remain unverified. Accepted600010ms experiment not rerun. Historical rows retain their accepted evidence scope.

## 9. Blockers and decisions required

No content blocker for assigned synthetic v18. Browser access restored; filechooser timeout has Lead-authorized immutable GitHub fallback. Original native gaps are retained separately. No new technical/spec/security decision or production access requested. Q01–05 untouched.

## 10. Next step and self-check

Push browser-evidence/report update to existing PR1; verify liveCI. Live task comments show no v18 submission. Post one submission per task with exact commit RESULT/guide/evidence fallback; verify published UI and checkpoint. QA approval required; Dev does not merge.

- [x] Exact10sections;original/historical/v18AC mapped separately.
- [x] Exactsource/time,files,commands and actual test outputs.
- [x] Limits and failures explicit;no false browser/upload/native claims.
- [x] Native browser verification with actual screenshots.
- [x] Attachment failure recorded; authorized fixed-commit fallback prepared for verified task submission.

History:v16 ACCEPT11:39;v17 submitted via verified immutable links and accepted by latest Lead12:02 comment;v18 assigned same comment, START published, implemented/tested; after restart actual browser proof completed, upload retry timed out and authorized fixed-commit fallback selected.
