# Inventory API OIDC boundary — TASK-S1-001

Inventory reads require verified bearer access tokens. `/health` remains nonsensitive public liveness; `/api/v1/ingest/osquery` retains its separate host-bound collector credential. Inventory remains loopback-only. Database schema and collector query boundaries are unchanged.

Set `INVENTORY_READ_ENABLED=true`, the existing disposable `DATABASE_URL`, and all of `OIDC_ISSUER`, `OIDC_AUDIENCE`, `OIDC_JWKS_URI`, `OIDC_ALGORITHM`. Missing/invalid settings fail startup closed before inventory opens. Algorithms are explicitly RS256 or ES256; no symmetric/unsigned fallback. Issuer/JWKS must share an origin; HTTPS required except literal loopback HTTP for local fixtures. There is no token-driven discovery. Redirects and credential-bearing/query/fragment URLs are refused.

Local access-token profile: protected `typ=at+jwt`, configured issuer/audience/algorithm, nonempty subject, required exp/iat, maximum token age15minutes and no clock tolerance. This prevents accepting an ID token merely because it was signed by the same issuer. Company Keycloak profile/configuration is unverified and no company IdP was contacted. Session/login/MFA is TASK-S1-002, not evidence from this verifier slice.

Role claim is exactly `realm_access.roles`, with exact case-sensitive names. Explicit policy:

| Role | Inventory GET |
|---|---|
| Admin | Allow |
| Security Analyst | Allow |
| Infra Engineer | Allow |
| Viewer | Allow existing safe field projections |
| Auditor | Allow existing safe field projections |
| Service Owner alone | Deny403: ownership scoping not implemented in this slice |
| Missing/unmapped role | Deny403 |

A token with multiple roles is allowed only if at least one is explicitly permitted; Service Owner does not itself grant global access. Collector opaque tokens receive401 on inventory; a user JWT does not satisfy the ingest registration token. No role comes from a request header/query parameter or unverified token payload. No write role is granted here.

Every enabled `/api/v1/inventory/*` path passes the shared guard before collection/exact readers or method dispatch. Missing/malformed/unverifiable token returns401 with `WWW-Authenticate: Bearer`; verified but unauthorized role returns403. The standard JSON error includes code, generic `Access denied`, and request_id matching X-Request-Id. No token, claim dump, cookie, JWK or upstream error is logged/returned. Missing verifier injection fails closed. Legacy query/DB tests inject explicit synthetic authorization only to isolate reader behavior; the signed-token HTTP tests exercise the real guard.

JWKS policy: fixed configured URL;2second timeout; redirects rejected; response bounded64KiB/20keys;60second cache age;30second refresh cooldown, including failed fetches. Concurrent refreshes are coalesced by JOSE. During a fresh cache lifetime, a still-trusted cached key can verify tokens even if provider later goes offline; after expiry, unavailable refresh fails401. Unknown keys fail closed and only trigger refresh after cooldown. Rotate by publishing overlap of old/new public keys before issuing new kid; retain old keys only for intended token overlap. Removal may take up to cache lifetime to propagate; no instant revocation claim. Retry after cooldown after recovery. No raw response bodies are persisted.

Dependency: `jose`6.2.14 pinned in package.json/package-lock.json. Standard JOSE/WebCrypto verification is used, not custom cryptography. References: [JOSE remote JWKS](https://github.com/panva/jose/blob/main/docs/jwks/remote/functions/createRemoteJWKSet.md), [customFetch](https://github.com/panva/jose/blob/main/docs/jwks/remote/variables/customFetch.md).

Reproduce synthetic evidence: `node --test backend/test/oidc.test.mjs backend/test/oidc-http.test.mjs backend/test/oidc-rotation.test.mjs backend/test/health.test.mjs backend/test/osquery-safety.test.mjs`. Fixtures generate signing keys only in process memory and serve actual loopback HTTP JWKS; token values/key material are never printed. Rotation advances an isolated test Date clock, not the OS clock or real elapsed time. Evidence records method/path, redacted authorization, response fixture/status/error categories and actual request counts.

Limitations: no company SSO/MFA, production IdP, native browser, UI session integration, ownership-scoped Service Owner, audit export or real infrastructure proof. No new permissions follow from local fixture success.
