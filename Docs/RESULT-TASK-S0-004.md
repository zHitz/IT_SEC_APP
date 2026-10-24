# Result — TASK-S0-004: Exact-owner Domain API

| Field | Value |
|---|---|
| Task ID | TASK-S0-004 |
| Result version | v7 |
| Status | DONE |
| Spec version followed | SRSv1.0; TASK-S0-004; latest Lead03:53 v7assignment; v6ACCEPT retained |
| Dev agent | Codex — Dev AI Agent |
| Submitted at | 2026-10-25T04:03:28.889810+07:00 |
| Source/evidence commit | 9e2974742cd46a2feb55e26d0a34235c5b91eb4b |

## 1. Summary

Completed the assigned exact-owner Domain API and integrated it into detail rendering. Parent lookup uses Domain UUID; related DNS rows join through the accepted Domain.fqdn FK with exact equality and server pagination. The former candidate scan and its100-page cap are removed. Actual SQL/HTTP/DOM/browser proof;39/39tests,lint60modules/schema parity and build pass. DONE applies to approved local synthetic scope. No schema, osquery, Cloudflare collector, credential or production change.

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

## 3. Work completed

Read STATE, live task assignments, git branch/status/log and current GitHub PR/CI/reviews before execution. Lead accepted v6 and explicitly assigned the exact-owner API. Added lookup/owned-DNS reader and gated REST/proxy wiring, replaced frontend candidate collection, retained fields and Back state, and added tests/docs. Posted [DEV][START] with real code and targeted6/6passing tests. Ran full checks and actual browser walkthrough, saved evidence, scanned source and committed.

## 4. Files changed

Source commit9e29747 contains these18files. The canonical RESULT is a separate report update.

| File | Specific change |
|---|---|
| Docs/DOMAIN-INVENTORY-API.md | Methods, paths, fields, pagination, errors, missing-vs-empty and read-only boundary. |
| Docs/DOMAIN-INVENTORY-UI.md | Marks v6candidate method historical; explains current exact API, errors and reproducible checks. |
| Docs/evidence/S0-004/back-v7.png | Actual returned list with search/page retained. |
| Docs/evidence/S0-004/build-v7.txt | Actual ESM/database packaging output. |
| Docs/evidence/S0-004/exact-v7.json | Observed SQL/UI/browser proof, limits and source/log hashes. |
| Docs/evidence/S0-004/exact-v7.png | Actual Domain detail browser screenshot. |
| Docs/evidence/S0-004/lint-v7.txt | Actual60module/schema parity output. |
| Docs/evidence/S0-004/secret-scan-v7.json | Actual tracked-text known-pattern scan; binary artifacts excluded. |
| Docs/evidence/S0-004/test-v7.txt | Complete actual39test output. |
| backend/src/app.mjs | Optional exact REST route dispatch, GET-only methods and sanitized400/404/503 envelopes. |
| backend/src/inventory/exact-reader.mjs | New fixed Domain UUID lookup and exact-owner DNS reader; parameter validation, missing-parent distinction, single-statement existence/count/page. |
| backend/src/server.mjs | Wires exact reader into the existing opt-in read-only inventory pool. |
| backend/test/domain-exact.test.mjs | Actual SQL/HTTP owner isolation, trap/pagination/not-found/input/method/gate and sanitized failure tests. |
| frontend/server.mjs | Adds only Domain UUID and owned-DNS paths to fixed loopback GET proxy. |
| frontend/src/inventory-detail.mjs | Uses authoritative parent GET and one exact child page; removes candidate scanning; validates scope and clears metadata on failure. |
| frontend/test/domain-detail.test.mjs | Retains exact-owner/Back assertions with new API; replaces obsolete candidate-cap test with server-count/no-scan and not-found clearing test. |
| frontend/test/domain-proxy.test.mjs | Tests exact route proxy and default-disabled gates. |
| scripts/inventory-ui-lab.mjs | Wires exact reader into the disposable synthetic lab backend. |
| Docs/RESULT-TASK-S0-004.md | This canonical v7 report, preserving prior scope/acceptance history. |

## 5. Run and verify

Node24 in IT_SEC_APP: `npm ci`; `node scripts/inventory-ui-lab.mjs --hosts`; open the printed origin at /inventory/domains. Search sample-, choose10rows, Next, open sample-12.test; verify provenance and DNSA/value/proxiedfalse/TTL300/Flagged. Back retains search and page2. Run `node --test backend/test/domain-exact.test.mjs frontend/test/domain-detail.test.mjs frontend/test/domain-proxy.test.mjs`; then `npm run lint`, `npm test`, `npm run build`. API examples: GET /api/v1/inventory/domains/:uuid and /:uuid/dns-records?page=2&page_size=25. Use only approved local synthetic DB with existing explicit opt-in flags.

## 6. Tests and actual results

Targeted6/6 passed, including Host detail regression. Full sequence all exit0:39tests/pass39/fail0/duration8853.2287ms; lint60modules; schema22business+2junctions/114nativeFK unchanged; build backend/frontend ESM/database packaging PASS. Backend tests execute inside BEGIN READ ONLY and prove32owned records, overlapping trap exclusion, deterministic pages/counts, unknown404, invalid400 and GET-only/disabled/sanitized failures. Frontend actual HTTP test retains31record/2childpage proof and Back search/filter/page. A separate mocked metadata test declares10001total with one requested child page to prove no full scan; it does not claim10001inserted rows. Browser sample-12.test shows current parent provenance and A/198.51.100.25/proxiedfalse/TTL300/Flagged; Back retains sample- and page2. No final test failure. Native/live evidence is not claimed.

## 7. Issues and implementation decisions

Chose UUID canonical paths; no fqdn lookup alias is needed because the assignment permits id lookup. DNS schema still stores domain fqdn, so the server joins through the existing native FK instead of adding domain_id. Count/page/parent existence share one SQL snapshot. Missing owner differs from existing empty owner. Frontend parent re-read prevents relying on stale list metadata, and returned child owners are validated. All visible v6fields and local/session Back behavior remain; only the exact read API is new as explicitly assigned. No schema change or security-policy decision.

## 8. Not done, limitations and technical debt

No live Cloudflare/production/token, native PostgreSQL/Docker, auth/RBAC or schema/entity change. Domain standalone deep-link/reload persistence is not assigned in v7 and remains separate. Pagination is server-bounded and cross-request mutation is not an immutable snapshot guarantee. No huge-record performance benchmark; mocked high-count metadata is clearly separated from actual32record SQL proof. Exact viewport/reduced-motion runtime emulation remains unavailable, not claimed. Prior accepted PoC/native follow-ups remain preserved.

## 9. Blockers and decisions required

No hard blocker for this assignment; all v7criteria pass within approved synthetic scope. No new scope/security/priority question or Q01–05 answer was introduced.

## 10. Next step and self-check

Commit and push to the recorded feature branch, update the existing open QA PR without merge, upload this actual RESULT plus guide/proof/logs/screenshots, publish one [DEV][SUBMISSION]DONEcomment and verify links. Continue the separately assigned Host deep-link work afterward.

- [x] Ten ordered sections, exact task/version/status/spec.
- [x] Original/historical accepted criteria and each V7requirement mapped separately.
- [x] Every changed file, actual command/output and limit recorded.
- [x] No secrets, real infrastructure or unsupported native/live claims.
- [x] One canonical RESULT; prior accepted versions preserved.

History: v2synthetic PoC accepted; v3readiness accepted; v4API accepted; v5frontend accepted; v6detail accepted by latest Lead03:53; v7exact-owner API and integrated detail complete. Earlier canonical reports remain in Git/ClickUp.

