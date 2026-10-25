# Result — TASK-S0-004: Exact-owner Domain API

| Field | Value |
|---|---|
| Task ID | TASK-S0-004 |
| Result version | v8 |
| Status | DONE |
| Spec version followed | SRSv1.0; TASK-S0-004; latest Lead04:13 v8 assignment; v7 ACCEPT retained |
| Dev agent | Codex — Dev AI Agent |
| Submitted at | 2026-10-25T08:17:28.303784+07:00 |
| Source/evidence commit | e6ae95f4b59dafed6d9a3a182bfd517d35bd0bb3 (v8 corrected source/tests) |

## 1. Summary

DONE in approved synthetic v8 scope: Domain UUID deep links and real browser reload restore fresh exact-owner detail. Native Back/Forward restores selected Domain; Back retains search/filter/page/page size. Missing/invalid identities clear metadata/DNS and show errors. Existing v7 exact-owner API is reused unchanged.44/44 tests, lint65, unchanged22+2/114FK and build passed. No production/live Cloudflare or native/scale claim.

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

## 3. Work completed
Added Domain route controller, identity-only history and validated search/filter/page context. Bootstrap uses exact-owner v7 API for direct/reloaded links. Parent and DNS data are cleared on failed lookup. Existing v7 backend/Cloudflare ingestion are unchanged.

## 4. Files changed

| File | Purpose |
|---|---|
| frontend/src/domain-navigation.mjs | UUID fragment parser, list context, reload/history and safe Back. |
| frontend/src/inventory-page.mjs | Boot Domain route controller with existing theme. |
| frontend/server.mjs | Serve only the new fixed navigation module. |
| frontend/test/domain-navigation.test.mjs | Actual HTTP/PostgreSQL direct/reload/history/missing/invalid/filter assertions. |
| Docs/DOMAIN-INVENTORY-UI.md | v8 route contract and reproduction. |
| Docs/evidence/S0-004/navigation-v8.json | Actual proof, resolved test issues and limitations. |
| Docs/evidence/S0-004/test-v8.txt | Complete44-test output. |
| Docs/evidence/S0-004/lint-v8.txt | Actual65-module and schema checks. |
| Docs/evidence/S0-004/build-v8.txt | Actual successful build output. |
| Docs/evidence/S0-004/reload-v8.png | Real local reload restores Domain and DNS. |
| Docs/evidence/S0-004/history-v8.png | Native Forward restores another selected Domain. |
| Docs/evidence/S0-004/missing-v8.png | Clear missing identity error without stale rows. |
| Docs/RESULT-TASK-S0-004.md | Canonical v8 report, prior AC evidence retained above. |

## 5. Run and verify

From repo root: `npm ci`, `npm run lint`, `npm test`, `npm run build`. Run `node scripts/inventory-ui-lab.mjs` for synthetic local UI; use emitted origin with `/inventory/domains#domain=10000000-0000-4000-8000-000000000012&search=sample-&outside_known_range=true&page=1&page_size=10`. Reload; Back to list retains context; select another Domain then browser Back/Forward. Missing UUID `ffffffff-ffff-ffff-ffff-ffffffffffff` shows no prior data. Lab is opt-in loopback synthetic only.

## 6. Tests and actual results

44/44 tests pass; lint65 modules; schema22entities+2junctions/114FK unchanged; buildPASS. Full output attached. Domain test uses real synthetic HTTP/PostgreSQL and fresh DOM remount with injected history, supplemented by actual browser reload/Back/Forward/filter/error screenshots. Existing read-only Cloudflare and Host regressions pass; no new real Cloudflare calls.

## 7. Issues and implementation decisions

Record correction v8 per Lead08:14: header timestamp/source and Summary corrected; no code/test change or rerun. Actual original submission08:07; this corrected file has the real correction timestamp above. v8 implementation source is e6ae95f (including test correction), not the historical v7 hash.

UUID fragment satisfies UUID-or-fqdn alternative; no hostname/fqdn resolution alias added. Legacy detail fragment works. URL contains only validated context, no stale row snapshot. Test generation initially referenced an incorrect filename; corrected before passing. Linkedom select.value/selected emulation assertions failed; changed them to actual state/request assertions and independently verified selected Flagged in the real browser. Filter test also changed state without loading it; added explicit reload and the full44-test suite passed. Initial pushed commit contained that failing test output and premature summary; corrected in a follow-up commit before ClickUp submission. These failed runs are not counted as passes. No spec/schema change.

## 8. Not done, limitations and technical debt

No live Cloudflare/production/token/native PostgreSQL/Docker/auth/RBAC/scale benchmark. Existing historical AC proofs remain scoped synthetic PoC. Exact viewport and reduced-motion emulation not claimed. Cross-request data is not a frozen DB snapshot. Domain v7 reload limitation is superseded by v8.

## 9. Blockers and decisions required

No hard blocker for assigned v8 scope. No new policy/security/priority decision or Q01–05 answer.

## 10. Next step and self-check

Submit this actual file and evidence to assigned task and update existing QA PR; do not merge or self-ACCEPT. Act on concrete review/new assignments.

- [x] Ten numbered sections, all original and new criteria mapped separately.
- [x] Every changed file, commands, real outputs, failures, assumptions and limits listed.
- [x] No production data or credentials; local opt-in and read-only boundaries retained.
- [x] Canonical RESULT version incremented; evidence prepared for actual attachment.

History: v2–v6 accepted in their recorded synthetic scopes; v7 exact-owner accepted by Lead04:13; v8 Domain deep-link/reload/history complete. Prior reports retained in Git/ClickUp.

Record history: v8 documentation correction per Lead08:14; same v8 code/evidence, corrected header and Summary only plus this required correction note.
