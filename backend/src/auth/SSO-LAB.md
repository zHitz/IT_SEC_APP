# Local OIDC session lab — TASK-S1-002

This is a Keycloak-compatible **OIDC protocol interface lab**, not a running Keycloak distribution or proof of company Keycloak compatibility. The existing CI `verify` job executes its real loopback HTTP authorization/token/JWKS fixture as part of `npm test`. Synthetic users are generated in memory: Viewer, Admin and Security Analyst. No company IdP/credentials, browser/native control, persistent realm or host setting is used.

## Reproduce and roll back

1. Use the authorized source checkout with Node24; run `npm ci` (openid-client6.8.8 and jose6.2.14 are locked).
2. Run `node --test backend/test/sso.test.mjs backend/test/sessions.test.mjs`. The fixture starts ephemeral loopback ports, generates signing keys in memory, uses a public client with Code+S256 PKCE, and executes actual HTTP login/callback/inventory/logout. Test navigation is HTTP, not browser rendering.
3. Run the broader auth regressions or full `npm test`, then `npm run lint`/`npm run build`.
4. Tests close only their own servers in finally blocks; state and keys vanish with process exit. No DB schema, Docker/WSL, realm installation or global configuration is changed.
5. Runtime rollback: clear `SSO_ENABLED` and restart the local backend. All in-memory sessions/transactions are revoked on restart. Inventory remains bearer-authenticated when enabled; rollback never restores anonymous access. Do not reset unrelated files/services.

For an independently authorized existing local IdP, configure `SSO_ENABLED=true`, `INVENTORY_READ_ENABLED=true`, loopback BACKEND_HOST, disposable DATABASE_URL and OIDC_ISSUER/AUDIENCE/JWKS_URI/ALGORITHM from S1-001; add SSO_ORIGIN (exact application origin), OIDC_CLIENT_ID, OIDC_AUTHORIZATION_ENDPOINT and OIDC_TOKEN_ENDPOINT. No discovery from token URLs. Provider endpoints must share trusted issuer origin; HTTPS required except literal loopback lab HTTP. Redirect URI registered at the provider must be exactly `SSO_ORIGIN/auth/callback`. No caller-controlled redirect is accepted. Do not use company endpoints without authorization.

## Routes and session contract

- POST `/auth/login`: exact Origin required; no query parameters. Creates a new five-minute one-use server transaction with random state/nonce/PKCE verifier and a separate HttpOnly transaction cookie. Responds303 to configured authorization endpoint with code challenge, nonce/state and fixed callback. No access/refresh token in URL.
- GET `/auth/callback`: verifies transaction cookie, state, nonce, signed ID token (openid-client non-repudiation check), code grant/PKCE, access token via accepted verifier and matching subject. Consumes transaction before exchange; replay fails. Successful callback rotates any old session, sets an opaque cookie and redirects only to `/inventory/hosts`.
- GET `/auth/session`: exposes authenticated flag, expiry and synchronizer CSRF value only; never an access/refresh/ID token. Same-origin browser policy applies; no CORS allowlist is introduced.
- POST `/auth/logout`: exact Origin plus X-CSRF-Token from session info required. Revokes local session and clears cookie. This is local application logout, not company IdP/global SSO logout.
- Inventory: explicit bearer credential still takes precedence; otherwise the server-side session token is reverified through S1-001 policy. Collector ingest is unchanged and never accepts cookie sessions.

Sessions are process-local, max1000, absolute max15minutes and capped by both ID/access-token expiration; no sliding refresh. Lost process means revoked sessions, not durable/distributed sessions. Tokens remain server-side; refresh tokens are discarded. `atlas_session` and `atlas_login` cookies use Path=/, HttpOnly, SameSite=Lax (top-level GET callback needs Lax). HTTPS configuration uses `__Host-` names and Secure. LoopbackHTTP lab omits Secure deliberately; actual HTTPS transport/browser cookie behavior remains unverified. No localStorage/sessionStorage token handling exists.

## Synthetic claims and boundaries

Access-token contract is S1-001 `typ=at+jwt`, configured audience, realm_access.roles. ID token uses RS256/JWT, client audience, nonce, matching sub and exp/iat. For Admin or Security Analyst in the **verified access token**, signed ID token `amr` must contain exact string `mfa`. Viewer is allowed with `amr:['pwd']`. This is a declared lab contract, not certification of company MFA policy or evidence that a human second factor was performed. Real Keycloak may need authorized mapper/token-profile configuration; it has not been contacted.

openid-client handles standard protocol checks; JOSE/WebCrypto verifies signatures. Token/JWKS responses bounded128KiB, configured timeout2s, redirect-following disabled and network destination fixed to token/JWKS endpoints. Transactions capped1000 and expire5minutes. Session fixation rotates opaque IDs; server errors contain only generic request_id envelopes. No callback query, cookie, token or key material is logged.

Evidence distinguishes actual loopbackHTTP assertions from injected clock expiry and HTTPS cookie **header construction**. UI AC remains PARTIAL until genuine approved-browser evidence exists; native stop is preserved. No new production access, schema, Cloudflare mutation, osquery field or business UI feature follows from this lab.
