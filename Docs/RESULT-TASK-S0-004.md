# Result — TASK-S0-004: v19 Domain combined sorting

| Field | Value |
|---|---|
| Task ID | TASK-S0-004 |
| Result version | v19 |
| Status | DONE |
| Spec version followed | SRSv1.0; TASK-S0-004; live Lead13:11 ACCEPTv18 and assignv19 |
| Dev agent | Codex — Dev AI Agent |
| Prepared at | 2026-10-25T13:31:12.477501+07:00 |
| Source/evidence commit | 8f5f0c9b4f97ad43a10c7d9cac8d5647cc012031 |

## 1. Summary

DONE in declared scope. Hostname asc/desc with stable id ties/NULLS LAST;sort/search/flag/page route;desc/searchsample-/flagtrue/page2 yields sample08+sample04 of12;native reload/history/detailreturn;4invalidsort casesclearallrows. Full67/67tests,lint93modules,schema22+2/114FK unchanged,buildPASS. Actual loopback READ ONLY PostgreSQL17.5WASM/DOM tests and native built-in browser screenshots. No real Cloudflare/production/token/tagalgorithm/schema/osquery change.

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

## 3. Work completed

Hostname asc/desc with stable id ties/NULLS LAST;sort/search/flag/page route;desc/searchsample-/flagtrue/page2 yields sample08+sample04 of12;native reload/history/detailreturn;4invalidsort casesclearallrows. No schema or collector changes. Existing Atlas frame/tokens reused; local opt-in GET only.

## 4. Files changed

Shared work package source/evidence files:

| File | Specific change |
|---|---|
| Docs/DOMAIN-INVENTORY-API.md | v19 API/UI contract, exact route and reproduction/limits |
| Docs/DOMAIN-INVENTORY-UI.md | v19 API/UI contract, exact route and reproduction/limits |
| Docs/HOST-INVENTORY-API.md | v19 API/UI contract, exact route and reproduction/limits |
| Docs/HOST-INVENTORY-UI.md | v19 API/UI contract, exact route and reproduction/limits |
| Docs/evidence/S0-003/build-v19.txt | Actual ESM build output |
| Docs/evidence/S0-003/host-scoped-sort-history-v19.png | Actual built-in browser history viewport evidence |
| Docs/evidence/S0-003/host-scoped-sort-invalid-v19.png | Actual built-in browser invalid/error viewport evidence |
| Docs/evidence/S0-003/host-scoped-sort-reload-v19.png | Actual built-in browser reload viewport evidence |
| Docs/evidence/S0-003/lint-v19.txt | 93module/schema parity output |
| Docs/evidence/S0-003/test-v19.txt | Actual final full67test output |
| Docs/evidence/S0-003/verification-v19.json | Actual proof,errors,limits and test/browser scope |
| Docs/evidence/S0-004/build-v19.txt | Actual ESM build output |
| Docs/evidence/S0-004/domain-sort-history-v19.png | Actual built-in browser history viewport evidence |
| Docs/evidence/S0-004/domain-sort-invalid-v19.png | Actual built-in browser invalid/error viewport evidence |
| Docs/evidence/S0-004/domain-sort-reload-v19.png | Actual built-in browser reload viewport evidence |
| Docs/evidence/S0-004/lint-v19.txt | 93module/schema parity output |
| Docs/evidence/S0-004/test-v19.txt | Actual final full67test output |
| Docs/evidence/S0-004/verification-v19.json | Actual proof,errors,limits and test/browser scope |
| backend/src/inventory/reader.mjs | Resource-specific strict sort/direction whitelists; hostname to fqdn mapping;NULLS LAST/id ties;safe bound filters |
| frontend/src/domain-navigation.mjs | Strict combined Domain sort/search/flag/page route restoration and detail return |
| frontend/src/host-navigation.mjs | Independent package/port sort route fields, callbacks and round-trip context |
| frontend/src/inventory-detail.mjs | Scoped sort controls/queries and isolated invalid-sort list error with parent/healthy list retained |
| frontend/src/inventory-table.mjs | Domain sort controls and server query state shared with existing Host controls |
| frontend/test/combined-domain-navigation.test.mjs | Added READ ONLY v19 ordering/combined route/reload/history/detail/invalid assertions |
| frontend/test/host-scoped-navigation.test.mjs | Added READ ONLY four-field/two-direction ordering, ties, independent errors and return regression |
| Docs/RESULT-TASK-S0-004.md | Canonical v19report;original/historicalAC retained,current separate mapping |

## 5. Run and verify

Repo root:`npm ci`;`npm test`;`npm run lint`;`npm run build`. Focused:`node --test frontend/test/host-scoped-navigation.test.mjs frontend/test/combined-domain-navigation.test.mjs`. Browser labs:`node scripts/inventory-ui-lab.mjs --hosts --host-detail` and `node scripts/inventory-ui-lab.mjs --flagged`;exact route examples in respective UI guide v19section.

## 6. Tests and actual results

67/67tests,0failed;lint93modules;22entities+2junctions/114FK unchanged;buildPASS. Both actual integration tests hold BEGIN READ ONLY after synthetic fixture setup. Host four sortfields/twodirections with varying stored version values and id ties;Domain bothdirections/combined filters;freshDOM/history and actual browser checks distinct. Three browser screenshots per task plus verification-v19.json/test-v19.txt/lint-v19.txt/build-v19.txt. No nativeLinux/liveCloudflare/production test claim.

## 7. Issues and implementation decisions

Actual browser found scoped Host sort lost on detail/list/detail return. Added scoped sort properties to route context;new regression checks packageversion/desc and portPID return;full67tests/lint/build rerunPASS and browser reverified. Invalid child sort is isolated before its GET and renders a clear error with controls;healthy child and parent remain. Historical invalid-page behavior unchanged. SQL identifier whitelist only;sort values never interpolated unrestricted. Versions lexical,notsemver. Module count remains93 by extending existing test modules. Lead-authorized immutable GitHub fallback permitted if attachment retry fails;record actual delivery outcome in task comment/state.

## 8. Not done, limitations and technical debt

Synthetic loopback only;no productionauth/RBAC/scale/CVE/realcredential/liveCloudflare claim. No schema/entity/tagalgorithm/osquery change. Independent page snapshots may change across inventoryupdates. SQLNULLS LAST explicit;not a claim of real infrastructure behavior. Original accepted collector AC evidence retains its historicalscope.

## 9. Blockers and decisions required

No content blocker for assignedv19;no new PO/security/production/spec decision. Q01–05untouched. Filechooser limit has explicitly authorized fixed-commit fallback;do not falsely claim an attachment upload.

## 10. Next step and self-check

Push existing featurePR;verifycurrentheadCI;retry task upload and post exactlyone v19submission with canonicalreport/evidence or authorized exactcommitfallback. UIverify publication/checkpoint;await specificLead/QAreview. No selfaccept/merge.

- [x] Exact10sections;original/historical/v19criteria separately mapped.
- [x] Exactsource/time,allchangedfiles,commands,actualoutputs and3screenshots.
- [x] Errors,assumptions,limits and native boundaries honest.
- [x] No schema/entity/collector/production change;canonical versionincrement.

History:v17accepted12:02;v18submitted13:07Domain/13:08Host thenaccepted13:11;v19assignedsameLeadcomment,STARTpublished andexecutedthiscycle.
