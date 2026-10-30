# Result — TASK-S1-002: Implement local Keycloak SSO session lifecycle

| Field | Value |
|---|---|
| Task ID | TASK-S1-002 |
| Result version | v1 |
| Status | PARTIAL |
| Spec | SRS v1.0 §§5.2/21/25; TASK-S1-002 v1; RESULT v1.0 |
| Dev | Codex — Dev AI Agent |
| Prepared | 2026-10-31 01:10 +07:00 |
| Implementation/evidence commit | 02797ac (full hash in submission) |
| Branch | dev/sprint1-auth-inventory |

## 1. Tóm tắt kết quả

Implemented a local OIDC Code+PKCE server-side session lifecycle using pinned openid-client6.8.8 and accepted JOSE verification. Actual synthetic HTTP provider roundtrip creates an opaque session, permits inventory and revokes on logout/expiry; negative state/nonce/PKCE/replay/redirect/MFA cases fail closed. Focused12pass/0fail; full117pass/0fail; lint/schema/build PASS. PARTIAL because AC-4 genuine approved-browser/UI evidence and company Keycloak compatibility remain unverified. No native retry, company credentials, production access or schema change.

## 2. Đối chiếu acceptance criteria

| ID | Criterion | Status | Actual evidence |
|---|---|---|---|
| AC-1 | Actual local OIDC roundtrip creates session permitting inventory; logout/expiry revokes use | Verified local HTTP | focused-v1.txt SSO_ROUNDTRIP_PROOF/SSO_NEGATIVE_PROOF: real authorization/token/JWKS endpoints, inventory200 then logout401; injected session clock expiry401. Not native-browser evidence. |
| AC-2 | Invalid state/nonce/PKCE, reused code, invalid redirect and absent MFA fail closed | Verified synthetic scope | focused-v1.txt: invalid state/nonce/PKCE401; callback replay401 and provider consumed-code400; unauthorized redirect400/callback redirect401; Admin and SecurityAnalyst missing mfa401, matching signed lab claim accepted. |
| AC-3 | Actual cookie headers and CSRF; no browser-storage/log token handling | Verified bounded HTTP checks | sessions.test.mjs actual Set-Cookie assertions HttpOnly/SameSite=Lax/Max-Age; missing/foreignOrigin logout403, matchingCSRF logout200; fixation rotates ID; HTTPS Secure/__Host header construction tested separately. Session JSON lacks access_token; no frontend token-storage code added or tokens printed. Not exhaustive dynamic browser-storage inspection. |
| AC-4 | Setup/rollback; local versus company/native proof separated; UI needs genuine browser or PARTIAL | PARTIAL | auth/SSO-LAB.md gives five setup/rollback steps and existing CI synthetic IdP lab/users/roles. No Keycloak distribution/company IdP or approved native-browser execution; HTTP is not rendering. |
| AC-5 | Canonical RESULT, changed files, reproduction, actual tests, separate ACs | Verified local deliverable | This file has ten canonical sections, five rows and explicit evidence/limits; external PR/current-revision QA delivery remains outstanding. |

## 3. Công việc đã làm

Resumed verified assignment26 on accepted S1-001 tip7ba44f3. Added server-side one-use5minute login transactions with state/nonce/S256 verifier, fixed callback, signed ID-token verification and access-token/sub matching. Server holds tokens, browser receives random opaque session/transaction cookies. Session max15minutes capped by ID/access expiry; no refresh or sliding lifetime. Logout requires exact Origin and synchronizer CSRF. Inventory bearer flow and collector credentials remain separate; health public.

## 4. Files đã thay đổi

| File | Change |
|---|---|
| .env.example | Nonsecret opt-in SSO/session endpoint/client/origin configuration names |
| package.json | Pin openid-client6.8.8 production dependency |
| package-lock.json | Lock openid-client/oauth4webapi resolution/integrity |
| backend/src/auth/sessions.mjs | Bounded opaque in-memory session store, cookie policy, fixation rotation, expiry and CSRF logout |
| backend/src/auth/sso.mjs | Standard code/PKCE transaction, state/nonce/ID signature, MFA contract, safe routes and cookie authorization |
| backend/src/auth/SSO-LAB.md | Reproducible synthetic CI lab, setup/rollback, routes/claims and precise limits |
| backend/src/app.mjs | Optional SSO route dispatch using existing safe error headers |
| backend/src/server.mjs | Fail-closed opt-in startup config and session-aware inventory authorizer |
| backend/test/sessions.test.mjs | Real loopback HTTP cookie/fixation/CSRF/logout/expiry checks; HTTPS header construction |
| backend/test/sso.test.mjs | Actual local IdP roundtrip and state/nonce/PKCE/replay/redirect/MFA failure fixture |
| Docs/TASK-S1-002.md | Exact verified assignment copy, SHA256 DA14CA846675E9562E7AE97A23461794C04AA1E7254071907FCCA140922CA44E |
| Docs/evidence/S1-002/focused-v1.txt | Actual focused12pass output |
| Docs/evidence/S1-002/full-v1.txt | Actual full117pass output |
| Docs/evidence/S1-002/lint-v1.txt | Actual lint106modules/schema PASS |
| Docs/evidence/S1-002/build-v1.txt | Actual build PASS |
| Docs/RESULT-TASK-S1-002.md | This canonical RESULTv1 |

S0 and S1-001 RESULTs, schema and unrelated PDFs/generated __pycache__ unchanged.

## 5. Cách chạy và kiểm chứng

From root with Node24: `npm ci`; `node --test backend/test/sso.test.mjs backend/test/sessions.test.mjs backend/test/oidc.test.mjs backend/test/oidc-http.test.mjs backend/test/oidc-rotation.test.mjs backend/test/health.test.mjs backend/test/osquery-safety.test.mjs`; `npm test`; `npm run lint`; `npm run build`; `git diff --check`.

SSO-LAB.md documents exact env names, trusted endpoints and fixed SSO_ORIGIN/auth/callback redirect registration. Lab tests generate ephemeral keys/users/roles and real HTTP provider endpoints without persisted secrets; CI existing verify job runs them. Cleanup closes only owned servers; runtime rollback disables SSO and restarts backend, revoking process-local sessions while preserving bearer-only inventory authorization. No installation of Keycloak/Docker/WSL is required for the synthetic lab.

## 6. Test và kết quả test

- Initial session HTTP test1pass; initial successful local OIDC roundtrip1pass; retained raw local logs in dev checkpoint history, not presented as extra independent acceptance counts.
- Final focused12pass/0fail,760.6078ms: OIDC invalid-token/role/JWKS/health/ingest regression plus session and actual code-flow cases.
- Final full117pass/0fail,165105.9107ms. Executed once after final runtime/MFA changes; no repeated real10minute outage experiment.
- Lint106modules PASS; schema22entities/2junctions/114FK PASS; build PASS; whitespace PASS. npm installation audit0findings, not a penetration test.
- Expiry uses injected session clock; actual HTTPS transport/browser Secure-cookie enforcement was not run. Header construction is not relabeled as HTTPS/browser evidence.

## 7. Vấn đề gặp phải và quyết định tự xử lý

Used maintained openid-client protocol handling and JOSE/WebCrypto signature validation, not custom protocol cryptography. Pinned client is public/None authentication with S256 PKCE, compatible with a configured local OIDC interface; actual company Keycloak token format/mappers are unverified. S1-001 at+jwt access profile is retained. ID token RS256/JWT must carry matching subject/client audience and nonce. Admin/SecurityAnalyst require signed ID-token amr containing exact mfa; this is a lab claim contract, not proof a human second factor or company policy was exercised.

Fixed configured endpoints share issuer origin; HTTPS except literal loopback. Token/JWKS responses bounded128KiB with2second timeout and redirects refused. Transactions expire5minutes/max1000; sessions max1000/15minutes capped by tokens; keys/tokens stay process-local and logout is local app revocation, not IdP/global logout. SameSite=Lax supports top-level GET callback; HTTPS uses Secure/__Host names. Origin protection blocks loginCSRF; logout also uses synchronizer token. Errors expose generic request_id only.

No material failed test occurred in this task's executed tests. Native-browser limit is known and was not retried. Existing external PR creation capability gap remains separately tracked; no token search or disabled-tool bypass.

## 8. Chưa làm, giới hạn và nợ kỹ thuật

No genuine approved-browser/UI session proof (AC-4), no running Keycloak distribution/company IdP or real MFA ceremony. No UI login page/session integration work beyond session API dispatch; future S1-004 owns authenticated UI. No durable/distributed sessions, refresh flow or global IdP logout. Restart revokes in-memory state. No ownership-scoped ServiceOwner, audit export, production TLS deployment, real inventory or schema change. Full regression DOM models remain synthetic and do not prove native rendering.

## 9. Điểm nghẽn và việc cần quyết định

No local code/lab blocker remains. AC-4 native evidence is unavailable under existing approved-tool/permission limits; do not automatically retry or ask for production/company IdP credentials. Lead can review supported local scope and choose independent S1-003 API work per plan while preserving this gap. External PR creation/current-head QA remains an existing delivery dependency; this session has no gh/authenticated PR writer, no token search attempted. No merge is authorized.

## 10. Đề xuất bước tiếp theo và tự kiểm tra

Lead reviews the immutable local package and decides local-scope acceptance; independent QA uses exact revision. Keep UI/company gaps open and move to the next authorized independent task only after assignment. No S0 reopening or historical RESULT rewrite.

- [x] One canonical RESULT, five separate ACs, ten required sections.
- [x] Changed files, commands, actual outputs and synthetic/native limits disclosed.
- [x] No secrets/key material/browser tokens included; no production/schema/collector-boundary change.
- [x] Authorized feature branch only, no self-accept/merge.
- [ ] Native UI proof/company integration/external PR+QA delivery complete.
