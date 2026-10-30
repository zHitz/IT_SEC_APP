# TASK-S1-002: Implement local Keycloak SSO session lifecycle

## 1. General information
Task ID: TASK-S1-002
Task version: v1
Project: IT Asset & Security
Sprint: 1 / Phase 1
Priority: Phase 1 critical path (SRS P0, not Phase 2 P1)
Lead: Team Lead
Final approver: Product Owner
Issued: 2026-10-30 Asia/Saigon
Deadline: no invented calendar commitment; execute in dependency order
Status: PLANNED; dependency-gated

## 2. Objective
Implement local Keycloak SSO session lifecycle so server inventory has an authenticated, least-privilege path. Build only the missing delta over Sprint 0.

## 3. References and dependencies
SRS v1.0 sections 5.2, 21, 25; D-01
Authorization: PO-S0-CLOSE-S1-OPEN-20261030. SRS roadmap section 25 takes precedence over illustrative handbook sprint labels.
Dependencies: TASK-S1-001
Sources: Docs/it-asset-security-srs.pdf; Docs/Quy chuan file result.md (v1.0).

## 4. Scope
In scope: requirements below, synthetic/local evidence, focused regression.
Out of scope: production access, real credentials, Q-01..Q-05 decisions, remediation, Cloudflare mutations, optional UI expansion, automatic merge.

## 5. Detailed requirements
1. Implement Authorization Code + PKCE browser login through a local test IdP/Keycloak-compatible OIDC interface, server-side token handling, state/nonce verification, bounded session lifetime and logout.
2. Use HttpOnly SameSite cookies with Secure in HTTPS deployments; no access/refresh tokens in browser localStorage, URLs or logs. Protect state-changing session endpoints against CSRF and session fixation.
3. Prepare reproducible isolated local Keycloak realm configuration or CI lab with synthetic users/roles; company Keycloak integration remains explicitly unverified until authorized details exist. Require an appropriate MFA claim for Admin/Security Analyst sessions; document the lab claim contract without claiming company policy.

## 6. Technical constraints
Retain Node 24/ESM/PostgreSQL architecture. Use maintained standards libraries where required, pinned with lockfile. No silent schema changes. Keep native desktop stop; disabled tools cannot be bypassed. No production IdP connection or secrets. Preserve Cloudflare GET-only and osquery authenticated SELECT-only boundaries.
Branch: create dev/sprint1-auth-inventory from current verified bdc2c66 feature tip; do not switch to main, merge Sprint 0 or reset unrelated files. If branch exists inspect its ancestry/worktree before reuse. Keep existing feature push/PR/independent QA workflow; no auto merge.

## 7. Inputs and outputs
Inputs: current source/schema, synthetic lab records and nonsecret configuration names.
Outputs: scoped implementation/tests/documentation, Docs/RESULT-TASK-S1-002.md and sanitized evidence. This Lead-owned TASK remains here; Dev may copy it unchanged into Docs in its own commit for repository traceability.

## 8. Acceptance criteria
- [ ] AC-1: Actual local OIDC login round trip creates a session and permits an authorized inventory request; logout/expiry revokes session use.
- [ ] AC-2: Invalid state/nonce, PKCE mismatch, reused code, invalid redirect and missing required MFA claims fail closed with reproducible evidence.
- [ ] AC-3: Session cookies and CSRF behavior are verified from actual HTTP headers; no tokens appear in client storage or logs.
- [ ] AC-4: Provide setup/rollback instructions and separate local IdP evidence from unavailable company integration/native-browser evidence; UI AC requires genuine approved-browser evidence or PARTIAL.
- [ ] AC-5: Canonical RESULT includes changed files, reproduction commands, actual tests and each AC independently.

## 9. Definition of Done
All AC supported independently; actual test output and reproducible commands supplied; no regression of accepted scope. Use RESULT v1.0 canonical ten section names/order (preserve Vietnamese headings while writing technical content in English). DONE only if all AC are verified; otherwise PARTIAL/BLOCKED with precise reasons. No arbitrary test-count target or result-version churn.

## 10. Handoff
One TASK = one RESULT. Submit immutable snapshots through atlas_local.py using this task ID as assignment_id; include commit, changed files, TASK copy, RESULT and actual sanitized evidence. Stop after submission; Lead reviews and selects the next item. Dependencies become READY only after verified acceptance, not merely a Dev DONE label.
