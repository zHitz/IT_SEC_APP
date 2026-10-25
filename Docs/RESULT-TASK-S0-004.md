# Result — TASK-S0-004: Reloadable DNS value search

| Field | Value |
|---|---|
| Task ID | TASK-S0-004 |
| Result version | v10 |
| Status | DONE |
| Spec version followed | SRSv1.0; TASK-S0-004; Lead08:24 ACCEPT v8 correction/v9 and assignment v10 |
| Dev agent | Codex — Dev AI Agent |
| Submitted at | 2026-10-25T08:35:05.988724+07:00 |
| Source/evidence commit | d5f6efa0044edbb99f75bdd51f9c4b97ddf74fb9 |

## 1. Summary

DONE in approved synthetic v10 scope: direct value_search fragments restore fresh DNS matches and result page after reload. Native Back/Forward restores prior queries/pages; invalid values clear rows and show explicit errors. Existing Domain/record fields, local gates and return context retained.47/47tests,lint70/schema22+2/114FK and buildPASS. No backend/schema/osquery/collector/liveCloudflare change.

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

## 3. Work completed

Added DNS query/page parsing to Domain route controller. Search submit and paging push native history entries containing identity/context only. Reload resolves original Domain/list then fresh search results. Explicit return removes search route while preserving origin. Search page is dns_page, independent of list page. Old search test now uses a real URL/history model rather than a no-op stub.

## 4. Files changed

| File | Purpose |
|---|---|
| frontend/src/domain-navigation.mjs | Parse/serialize value_search/dns_page; sync reload/history/return. |
| frontend/src/dns-value-search.mjs | Routed submit/paging/return hooks and fresh restoration/invalid clearing. |
| frontend/test/dns-value-navigation.test.mjs | Actual HTTP/PostgreSQL direct/page2/reload/history/control/duplicate tests. |
| frontend/test/dns-value-search.test.mjs | Existing search/return regression adapted to real routed history. |
| Docs/DOMAIN-INVENTORY-UI.md | v10 URL contract and superseded v9 limitation. |
| Docs/evidence/S0-004/value-navigation-v10.json | Proof/failure resolution/limits. |
| Docs/evidence/S0-004/test-v10.txt | Actual47test output. |
| Docs/evidence/S0-004/lint-v10.txt | Actual70module/schema check. |
| Docs/evidence/S0-004/build-v10.txt | Actual buildPASS. |
| Docs/evidence/S0-004/value-reload-v10.png | Real reload preserves18records/page2. |
| Docs/evidence/S0-004/value-history-v10.png | Real Forward restores198value/6records. |
| Docs/evidence/S0-004/value-invalid-v10.png | Real control-value error with no rows. |
| Docs/RESULT-TASK-S0-004.md | Current-source canonical v10 report. |

## 5. Run and verify

Repo root: `npm ci`, `npm run lint`, `npm test`, `npm run build`. `node scripts/inventory-ui-lab.mjs` emits local origin. Open `/inventory/domains#domain=10000000-0000-4000-8000-000000000012&value_search=192.0.2.25&dns_page=2&search=sample-&outside_known_range=true&page=1&page_size=10`. Reload:18matches/page2. Search198.51.100.25; native Back/Forward restores18/6queries. Return restores original Domain. `#value_search=%00` displays explicit input error, no rows. Local synthetic only.

## 6. Tests and actual results

47/47tests pass, lint70modules, unchanged22businessentities+2junctions/114FK, buildPASS. New integration uses actual synthetic HTTP/PostgreSQL and fresh DOM for reload/history model. Actual browser independently verifies reload, native Back/Forward and invalid clearing. Existing return list/detail/search/Host/package/collector tests pass. No new externalCloudflare call or scale/native claim.

## 7. Issues and implementation decisions

value_search and dns_page live in fragment alongside optional DomainUUID and list context. Duplicate value_search is invalid; values1–200characters/no controls. dns_page defaults1 with100000bound. Literal matching unchanged. Submit/page creates history entry; explicit return creates origin-route entry, so native Back can revisit search. Initial existing search test failed because its history methods did nothing; upgraded fixture to real URL stack/events and awaited asynchronous return. Targeted2 and full47tests then passed; no hidden failing run counted.

Record discipline: exact source hash/time/Summary refreshed above. Lead08:24 accepted corrected v8 and v9; prior metadata issue resolved and preserved in history, not copied into current header.

## 8. Not done, limitations and technical debt

No production/realCloudflare/token/auth/RBAC/schema/osquery changes, native infrastructure or scale benchmark. Results are fresh declared inventory, not an immutable cross-request snapshot. Search history retains query/context, not returned data. Invalid page syntax defaults1; invalid values show error. No exact viewport/reduced-motion runtime claim.

## 9. Blockers and decisions required

No hard blocker for v10; no new scope/security/PO decision or Q01–05 answer.

## 10. Next step and self-check

Submit actual v10 RESULT/evidence and update existing QA PR without merge. Continue the separately assigned Host port/process work after this handoff. Act on specific review.

- [x] Ten ordered sections; original/historical/new criteria mapped.
- [x] Header exact source/time/Summary checked for current work.
- [x] Actual output/files/commands/failures/limits listed; no fake native/scale claims.
- [x] Local/read-only/no-secret boundaries retained; actual attachments prepared.

History: v2–v7 accepted; corrected v8 and v9 accepted Lead08:24; v10 reloadable DNS query complete. Prior versions remain in Git/ClickUp.
