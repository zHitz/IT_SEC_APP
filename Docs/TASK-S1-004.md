# TASK-S1-004: Connect server inventory UI to authenticated APIs

## 1. General information
Task ID: TASK-S1-004
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
Connect server inventory UI to authenticated APIs so server inventory has an authenticated, least-privilege path. Build only the missing delta over Sprint 0.

## 3. References and dependencies
SRS v1.0 FR-01.1, sections 5.2, 20, 25
Authorization: PO-S0-CLOSE-S1-OPEN-20261030. SRS roadmap section 25 takes precedence over illustrative handbook sprint labels.
Dependencies: TASK-S1-002, TASK-S1-003
Sources: Docs/it-asset-security-srs.pdf; Docs/Quy chuan file result.md (v1.0).

## 4. Scope
In scope: requirements below, synthetic/local evidence, focused regression.
Out of scope: production access, real credentials, Q-01..Q-05 decisions, remediation, Cloudflare mutations, optional UI expansion, automatic merge.

## 5. Detailed requirements
1. Reuse existing host inventory UI for authenticated list/detail/ports and scoped filters; handle loading, empty, error, expired-session and forbidden states.
2. Render only permitted actions/data; call the authenticated APIs rather than embedding synthetic data as production data. Preserve inaccessible sensitive fields and existing safe DOM rendering.
3. Use a deterministic synthetic server dataset for reproducible review. Native/browser limitations remain; automated model/DOM tests are not browser screenshots.

## 6. Technical constraints
Retain Node 24/ESM/PostgreSQL architecture. Use maintained standards libraries where required, pinned with lockfile. No silent schema changes. Keep native desktop stop; disabled tools cannot be bypassed. No production IdP connection or secrets. Preserve Cloudflare GET-only and osquery authenticated SELECT-only boundaries.
Branch: create dev/sprint1-auth-inventory from current verified bdc2c66 feature tip; do not switch to main, merge Sprint 0 or reset unrelated files. If branch exists inspect its ancestry/worktree before reuse. Keep existing feature push/PR/independent QA workflow; no auto merge.

## 7. Inputs and outputs
Inputs: current source/schema, synthetic lab records and nonsecret configuration names.
Outputs: scoped implementation/tests/documentation, Docs/RESULT-TASK-S1-004.md and sanitized evidence. This Lead-owned TASK remains here; Dev may copy it unchanged into Docs in its own commit for repository traceability.

## 8. Acceptance criteria
- [ ] AC-1: An authorized local session can list/filter/page hosts and open host detail/ports through the scoped APIs.
- [ ] AC-2: Anonymous/expired/forbidden sessions show correct safe states and cannot reveal data; hidden actions are also denied server-side.
- [ ] AC-3: Loading/empty/API-error and untrusted text rendering are verified by focused tests.
- [ ] AC-4: Provide genuine approved-browser screenshots with browser/viewport and measured load on the declared fixture dataset; if tool permission is unavailable, preserve PARTIAL and name the precise blocked AC.
- [ ] AC-5: Canonical RESULT includes all ten sections, actual API/UI evidence and unchanged P0 limitations; no optional navigation/queue expansion.

## 9. Definition of Done
All AC supported independently; actual test output and reproducible commands supplied; no regression of accepted scope. Use RESULT v1.0 canonical ten section names/order (preserve Vietnamese headings while writing technical content in English). DONE only if all AC are verified; otherwise PARTIAL/BLOCKED with precise reasons. No arbitrary test-count target or result-version churn.

## 10. Handoff
One TASK = one RESULT. Submit immutable snapshots through atlas_local.py using this task ID as assignment_id; include commit, changed files, TASK copy, RESULT and actual sanitized evidence. Stop after submission; Lead reviews and selects the next item. Dependencies become READY only after verified acceptance, not merely a Dev DONE label.
