# TASK-S1-001: Validate OIDC access tokens and enforce API roles

## 1. General information
Task ID: TASK-S1-001
Task version: v1
Project: IT Asset & Security
Sprint: 1 / Phase 1
Priority: Phase 1 critical path (SRS P0, not Phase 2 P1)
Lead: Team Lead
Final approver: Product Owner
Issued: 2026-10-30 Asia/Saigon
Deadline: no invented calendar commitment; execute in dependency order
Status: READY

## 2. Objective
Validate OIDC access tokens and enforce API roles so server inventory has an authenticated, least-privilege path. Build only the missing delta over Sprint 0.

## 3. References and dependencies
SRS v1.0 sections 5.2, 20, 21, 25; D-01
Authorization: PO-S0-CLOSE-S1-OPEN-20261030. SRS roadmap section 25 takes precedence over illustrative handbook sprint labels.
Dependencies: PO-closed Sprint 0 baseline bdc2c66
Sources: Docs/it-asset-security-srs.pdf; Docs/Quy chuan file result.md (v1.0).

## 4. Scope
In scope: requirements below, synthetic/local evidence, focused regression.
Out of scope: production access, real credentials, Q-01..Q-05 decisions, remediation, Cloudflare mutations, optional UI expansion, automatic merge.

## 5. Detailed requirements
1. Implement a reusable server-side OIDC/JWKS access-token verifier with explicitly configured issuer, audience and allowed asymmetric signing algorithm; no home-grown cryptography, no unsigned token acceptance, no production credentials.
2. Implement deny-by-default role policy for inventory read routes using an explicit mapping for Admin, Security Analyst, Infra Engineer, Viewer and Auditor. Service Owner access requires ownership scoping and is denied in this first slice; do not grant global read. Collector credentials remain separate.
3. Wire authentication into existing /api/v1/inventory/* routes when inventory reads are enabled. Remove anonymous inventory access; /health remains nonsensitive liveness. Preserve independently authenticated osquery ingest and loopback restriction.
4. Use local synthetic signed tokens and an actual local HTTP JWKS fixture. Bound key fetching/cache and fail closed for unknown keys or unavailable verification; document rotation and cache policy. Redact tokens, cookies and key material from logs/evidence.

## 6. Technical constraints
Retain Node 24/ESM/PostgreSQL architecture. Use maintained standards libraries where required, pinned with lockfile. No silent schema changes. Keep native desktop stop; disabled tools cannot be bypassed. No production IdP connection or secrets. Preserve Cloudflare GET-only and osquery authenticated SELECT-only boundaries.
Branch: create dev/sprint1-auth-inventory from current verified bdc2c66 feature tip; do not switch to main, merge Sprint 0 or reset unrelated files. If branch exists inspect its ancestry/worktree before reuse. Keep existing feature push/PR/independent QA workflow; no auto merge.

## 7. Inputs and outputs
Inputs: current source/schema, synthetic lab records and nonsecret configuration names.
Outputs: scoped implementation/tests/documentation, Docs/RESULT-TASK-S1-001.md and sanitized evidence. This Lead-owned TASK remains here; Dev may copy it unchanged into Docs in its own commit for repository traceability.

## 8. Acceptance criteria
- [ ] AC-1: Valid locally signed access tokens with matching issuer/audience/algorithm and permitted role can read a fixture-backed inventory route; capture actual HTTP request/response with credentials redacted.
- [ ] AC-2: Missing, malformed, expired, wrong-issuer, wrong-audience, tampered, unsigned and algorithm-confusion tokens are rejected with 401 and the standard request_id error envelope; no inventory payload is returned.
- [ ] AC-3: Valid tokens with unmapped/absent roles or Service Owner without supported scope receive 403; collector tokens cannot read inventory and user tokens cannot replace collector ingest credentials.
- [ ] AC-4: JWKS key rotation and unknown-key/provider-failure cases have actual reproducible fixture evidence; untrusted token URLs cannot select the issuer/JWKS network destination.
- [ ] AC-5: Health and existing ingest behavior remain covered by focused regression checks; no secret enters responses/logs/artifacts; configuration errors fail closed.
- [ ] AC-6: Provide pinned dependency/lockfile changes, route/policy documentation and RESULT with all ten canonical sections, every AC, commands and actual output.

## 9. Definition of Done
All AC supported independently; actual test output and reproducible commands supplied; no regression of accepted scope. Use RESULT v1.0 canonical ten section names/order (preserve Vietnamese headings while writing technical content in English). DONE only if all AC are verified; otherwise PARTIAL/BLOCKED with precise reasons. No arbitrary test-count target or result-version churn.

## 10. Handoff
One TASK = one RESULT. Submit immutable snapshots through atlas_local.py using this task ID as assignment_id; include commit, changed files, TASK copy, RESULT and actual sanitized evidence. Stop after submission; Lead reviews and selects the next item. Dependencies become READY only after verified acceptance, not merely a Dev DONE label.
