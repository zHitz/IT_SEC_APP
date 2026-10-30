# Result — TASK-S1-001: Validate OIDC access tokens and enforce API roles

| Field | Value |
|---|---|
| Task ID | TASK-S1-001 |
| Result version | v1 |
| Status | PARTIAL |
| Spec version followed | SRS v1.0 §§5.2/20/21/25; TASK-S1-001 v1; RESULT v1.0 |
| Dev agent | Codex — Dev AI Agent |
| Submission preparation | 2026-10-31 00:15 +07:00 |
| Implementation/evidence commit | 72a93d6 (full hash in coordinator submission) |
| Branch | dev/sprint1-auth-inventory, from PO-closed bdc2c66 baseline |

## 1. Tóm tắt kết quả

Implemented explicit OIDC access-token verification and deny-by-default inventory authorization using pinned JOSE6.2.14. Actual local HTTP/JWKS tests cover permitted roles, invalid tokens, unauthorized roles, collector/user separation, rotation and provider failure. Corrected full regression:115pass/0fail; lint102 modules/schema22entities+2junctions/114FK/build PASS. Overall PARTIAL because the new branch has been pushed but no PR exists and this session has no available supported authenticated PR-creation tool/CLI. Independent QA and current required CI remain pending review gates. No company IdP, SSO session/MFA or native browser proof is claimed.

## 2. Đối chiếu acceptance criteria

| ID | Criterion | Status | Actual evidence |
|---|---|---|---|
| AC-1 | Valid locally signed access token with matching issuer/audience/algorithm and permitted role reads fixture-backed inventory via HTTP | Verified local scope | http-v1.txt: five exact roles return200; exact reader200; asserted real fixture hostname. Authorization redacted; keys generated only in memory. |
| AC-2 | Missing/malformed/expired/wrong issuer/audience/tampered/unsigned/algorithm-confusion tokens return401 standard request_id envelope without payload | Verified | oidc-http.test.mjs and http-v1.txt enumerate all eight cases plus ID-token-type and collector token. Actual request_id equals response header; denied payload has no data. |
| AC-3 | Absent/unmapped/Service Owner roles403; collector/user credentials remain separate | Verified | http-v1.txt: absent/empty/unmapped/ServiceOwner403; collector token inventory401 and user token ingest401; read callback only6 permitted invocations. |
| AC-4 | Actual JWKS rotation/unknown-key/provider-failure proof; token URLs cannot choose network destination | Verified synthetic scope | rotation-v1.txt: actual fixture4JWKS requests; unknown key401, rotation after mocked cooldown succeeds, expired cache/provider503 fails401, repeated failure makes no extra GET, recovery succeeds; jku/x5u get0requests. Isolated Date mock, not real-duration evidence. |
| AC-5 | Health/ingest regression; no credentials in responses/logs/artifacts; invalid config fails closed | Verified bounded checks | http-v1.txt health200/user-ingest401; osquery safety tests pass, config URL/audience/symmetric/none rejection in rotation-v1.txt. Response tests reject token/private-key leaks. No claim of exhaustive secret scanning. |
| AC-6 | Pinned dependency/lockfile, policy docs, ten-section RESULT, commands/output | Implemented; delivery PARTIAL | package.json/package-lock.json JOSE6.2.14; auth/README.md; this RESULT and actual logs. PR creation/independent QA remain outstanding. |

## 3. Công việc đã làm

Verified assignment snapshot23 and read full TASK, applicable SRS pages7/25–26/29, closure authorization and plan. Created explicitly authorized branch from exact bdc2c66 without resetting unrelated PDFs. Retained all schema and existing field projections. Added one shared guard before inventory routing; health and independent ingest retain separate boundaries. Inventory startup requires trusted configuration and loopback binding.

## 4. Files đã thay đổi

| File | Specific change |
|---|---|
| .env.example | Nonsecret OIDC/inventory configuration names; no real credentials |
| package.json | Exact production dependency jose6.2.14 |
| package-lock.json | Locked dependency/integrity resolution |
| backend/src/auth/oidc.mjs | Token/profile verification, explicit role map, bounded trusted JWKS fetch/cache, sanitized errors |
| backend/src/auth/README.md | Config, role table, access-token profile, rotation/cache policy, reproduction and limits |
| backend/src/app.mjs | Shared fail-closed inventory guard;401/403 request_id envelope |
| backend/src/server.mjs | Construct real authorizer before inventory database reader startup |
| backend/test/oidc.test.mjs | Initial actual local JWKS/cache/Viewer/ServiceOwner verification |
| backend/test/oidc-http.test.mjs | Real HTTP permitted/denied token cases, exact route, health and ingest separation |
| backend/test/oidc-rotation.test.mjs | Actual JWKS rotation/provider failure and config rejection, isolated clock |
| backend/test/domain-exact.test.mjs | Explicit synthetic authorization to isolate existing exact reader regression |
| backend/test/domain-inventory.test.mjs | Explicit synthetic authorization for existing DB reader test |
| backend/test/host-exact.test.mjs | Explicit synthetic authorization for existing host exact reader |
| backend/test/inventory.test.mjs | Explicit synthetic authorization for existing query/error tests |
| scripts/inventory-ui-lab.mjs | Explicit synthetic-only authorization for existing UI/query lab; no production fallback |
| Docs/TASK-S1-001.md | Byte-preserving copy of verified Lead assignment TASK |
| Docs/evidence/S1-001/http-v1.txt | Actual focused HTTP/health/ingest safety output8pass |
| Docs/evidence/S1-001/rotation-v1.txt | Actual rotation/config output2pass |
| Docs/evidence/S1-001/full-initial-failure-v1.txt | Initial full53pass/62fail, before synthetic UI lab injection |
| Docs/evidence/S1-001/full-final-v1.txt | Corrected full115pass/0fail,183126.855ms |
| Docs/evidence/S1-001/lint-v1.txt | Final lint102/schema PASS |
| Docs/evidence/S1-001/build-v1.txt | Actual build PASS |
| Docs/RESULT-TASK-S1-001.md | This canonical v1 RESULT |

Other TASK RESULTs, Lead/QA state, existing unrelated PDFs and generated __pycache__ remain untouched/uncommitted.

## 5. Cách chạy và kiểm chứng

From repo root with Node24: `npm ci`; `node --test backend/test/oidc.test.mjs backend/test/oidc-http.test.mjs backend/test/oidc-rotation.test.mjs backend/test/health.test.mjs backend/test/osquery-safety.test.mjs`; `npm test`; `npm run lint`; `npm run build`; `git diff --check`. No production endpoint/configuration is needed. Fixtures serve loopback HTTP JWKS and generate ephemeral asymmetric keys in memory. Full regression uses declared synthetic PostgreSQL/DOM lab data, never company hosts.

Runtime: set INVENTORY_READ_ENABLED=true, existing disposable DATABASE_URL, OIDC_ISSUER/AUDIENCE/JWKS_URI/ALGORITHM, loopback backend binding. See auth/README.md for exact profile. Do not put tokens in command logs. Missing configuration fails closed; no anonymous inventory fallback. UI session integration is a separate authorized task.

## 6. Test và kết quả test

- Initial focused HTTP/security8pass/0fail and rotation/config2pass/0fail, logs above.
- Existing backend reader regression8pass/0fail after explicit fixture authorization.
- Initial full115tests:53pass/62fail, UI lab still anonymous and correctly rejected by new guard. Failure log retained.
- An attempted corrected full invocation was interrupted after a Python UTF-8 read failure prevented the intended lab edit; no passing result is claimed for that interrupted run.
- Applied explicit synthetic lab authorization using UTF-8; final full115pass/0fail,183126.855ms. No native browser inference.
- Final lint102modules and schema22entities/2junctions/114FK PASS; build PASS; whitespace PASS. npm installation audit reported0findings at installation, not a production penetration test.

## 7. Vấn đề gặp phải và quyết định tự xử lý

No home-grown crypto: JOSE/WebCrypto verify signatures/claims. Local access-token profile requires typ=at+jwt, exp/iat/sub, max age15minutes, exact issuer/audience/algorithm and realm_access.roles. Company Keycloak profile remains unverified; no company access requested. Admin/Security Analyst MFA/session proof belongs to S1-002.

JWKS fixed config URL only; HTTPS except literal loopbackHTTP; same origin issuer/JWKS; redirects refused; timeout2s; response64KiB/20keys; cache60s; refresh cooldown30s including failures. Fresh cached keys remain usable within cache lifetime during outage; expired cache fails closed. Rotation test advances an isolated Date clock, does not change OS clock. Key removal is not instant revocation.

Legacy test/lab authorization injection is explicit and local to fixtures. Production server constructs real authorizer; app missing verifier returns401. Full initial failures exposed missing fixture setup, not a reason to reopen anonymous access. UTF-8 retry issue is disclosed above.

PR gap: public API inspection found no open PR for dev/sprint1-auth-inventory; Get-Command gh finds no CLI; no PR-writing connector is available. Git push works, but that is not proof of API/PR authorization capability. No token search or disabled browser fallback attempted. Prepared review text locally for supported creation by the coordinator/reviewer.

## 8. Chưa làm, giới hạn và nợ kỹ thuật

No company IdP integration, session/MFA, production TLS deployment, real inventory, native browser rendering, ownership-scoped Service Owner, full audit access/export, production pentest or schema change. No optional UI expansion. ServiceOwner alone stays denied. One permitted role in a multirole token grants its documented read scope. HTTP fixtures are actual execution but synthetic infrastructure. PR and current-revision independent QA remain unfulfilled delivery gates; no DONE label.

## 9. Điểm nghẽn và việc cần quyết định

Implementation is locally verified; supported authenticated PR creation capability is missing in this session. Exact attempts: public GET open PR filter returns empty, gh command discovery absent, available connected tools have diagnostics/attachment only. Next action: create one PR for the pushed branch through an existing authorized GitHub session/connector, using prepared review description; do not duplicate one if subsequently opened. No human file transfer needed; all code/evidence is in repo/local snapshots. QA approval/current required CI remain necessary; Dev never merges.

## 10. Đề xuất bước tiếp theo và tự kiểm tra

Lead reviews the local immutable package, resolves PR creation through supported tooling, and requests independent QA on exact current revision. Do not open dependent S1 tasks before verified acceptance. Preserve PO-closed S0 historical limits and native-control prohibition.

- [x] One TASK/one canonical RESULT, six ACs separately mapped, ten canonical numbered sections.
- [x] All changed files listed; real output and failures retained; synthetic/native limits explicit.
- [x] No secrets/key material printed or included; no schema/production/Cloudflare changes.
- [x] Feature branch only; no self-accept or merge.
- [ ] PR creation/current-head QA/required CI delivery gates complete.
