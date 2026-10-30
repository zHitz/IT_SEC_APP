# TASK-S1-003: Expose authenticated server inventory API

## 1. General information
Task ID: TASK-S1-003
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
Expose authenticated server inventory API so server inventory has an authenticated, least-privilege path. Build only the missing delta over Sprint 0.

## 3. References and dependencies
SRS v1.0 FR-01.1, FR-01.5, sections 20, 25
Authorization: PO-S0-CLOSE-S1-OPEN-20261030. SRS roadmap section 25 takes precedence over illustrative handbook sprint labels.
Dependencies: TASK-S1-001
Sources: Docs/it-asset-security-srs.pdf; Docs/Quy chuan file result.md (v1.0).

## 4. Scope
In scope: requirements below, synthetic/local evidence, focused regression.
Out of scope: production access, real credentials, Q-01..Q-05 decisions, remediation, Cloudflare mutations, optional UI expansion, automatic merge.

## 5. Detailed requirements
1. Adapt existing Host/Package/ListeningPort readers to GET /api/v1/assets, GET /api/v1/assets/{id}, GET /api/v1/hosts/{id}/ports for the server inventory slice. Reuse existing ingest/schema and source evidence; exclude Docker/K8s discovery.
2. Support type=host and existing env/site/owner/tag/q fields with documented semantics. Default page size 50, maximum 200, stable ordering and as_of. Do not invent ownership/site values or silently alter schema; propose explicit migration only when necessary.
3. Use the role policy from TASK-S1-001, prevent unauthorized fields/relations, and return standardized request_id errors. Preserve legacy internal readers as compatibility adapters where useful.

## 6. Technical constraints
Retain Node 24/ESM/PostgreSQL architecture. Use maintained standards libraries where required, pinned with lockfile. No silent schema changes. Keep native desktop stop; disabled tools cannot be bypassed. No production IdP connection or secrets. Preserve Cloudflare GET-only and osquery authenticated SELECT-only boundaries.
Branch: create dev/sprint1-auth-inventory from current verified bdc2c66 feature tip; do not switch to main, merge Sprint 0 or reset unrelated files. If branch exists inspect its ancestry/worktree before reuse. Keep existing feature push/PR/independent QA workflow; no auto merge.

## 7. Inputs and outputs
Inputs: current source/schema, synthetic lab records and nonsecret configuration names.
Outputs: scoped implementation/tests/documentation, Docs/RESULT-TASK-S1-003.md and sanitized evidence. This Lead-owned TASK remains here; Dev may copy it unchanged into Docs in its own commit for repository traceability.

## 8. Acceptance criteria
- [ ] AC-1: Authenticated API responses match the scoped endpoints and expose source evidence for synthetic seeded hosts and their packages/ports.
- [ ] AC-2: Filters, deterministic pagination (50 default/200 maximum), as_of, invalid queries and unknown IDs have reproducible HTTP evidence.
- [ ] AC-3: Unauthorized requests fail per policy; no raw secret/sensitive osquery data leaks; Service Owner remains denied until ownership scoping is implemented.
- [ ] AC-4: Ingest identity/deduplication and existing schema data survive regression checks; any migration is explicit with before/after and rollback evidence.
- [ ] AC-5: Canonical RESULT covers every AC and includes fixture size, commands, real output and all remaining limits; no claim of 150 company hosts.

## 9. Definition of Done
All AC supported independently; actual test output and reproducible commands supplied; no regression of accepted scope. Use RESULT v1.0 canonical ten section names/order (preserve Vietnamese headings while writing technical content in English). DONE only if all AC are verified; otherwise PARTIAL/BLOCKED with precise reasons. No arbitrary test-count target or result-version churn.

## 10. Handoff
One TASK = one RESULT. Submit immutable snapshots through atlas_local.py using this task ID as assignment_id; include commit, changed files, TASK copy, RESULT and actual sanitized evidence. Stop after submission; Lead reviews and selects the next item. Dependencies become READY only after verified acceptance, not merely a Dev DONE label.
