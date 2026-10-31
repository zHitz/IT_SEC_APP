# TASK-S2-001: Collect and persist host IP inventory

## 1. General information
Project: IT Asset & Security. Sprint2 / Phase1. Priority: approved server discovery/inventory roadmap. Lead: Team Lead. Final approver: PO. Issued2026-10-31. No invented calendar commitment. Authority: PO-S1-CLOSE-S2-OPEN-20261031.

Executor: backend-dev. Status: READY

## 2. Objective
Close the observed server-IP gap: existing osquery payload includes hostname/UUID/OS but not host IPs, while standard asset APIs already expose ip_addresses. Deliver collector-to-database-to-authenticated-API proof without native rollout assumptions.

## 3. References and dependencies
SRS FR-01.1, FR-01.5, sections7.2/8 Host and Network Interface,20,23,25; S0 collector and S1 standard assets APIs.
Dependencies: None; retain accepted Sprint1 baseline.

## 4. Scope
In scope: fixed SELECT network-address projection, bounded validated optional payload extension, existing Host.ip_addresses/NetworkInterface persistence and focused regression. Out: active scanning, DNS resolution, subnet topology, firewall, Docker/K8s, Cloudflare, UI, full dedup/manual merge.

## 5. Detailed requirements
1. Read current source/model/store/queue before edits. Add only approved network projection SELECT interface,address,mask FROM interface_addresses (verify exact supported table/schema using official osquery primary docs before implementation; report compatibility limits). No SELECT*, dynamic SQL or process-sensitive fields. Reuse read-only synthetic adapter; no native execution/install permission implied.
2. Extend payload explicitly and compatibly: optional bounded network_interfaces with only interface/address/mask; retain legacy batches/queued files. Strictly validate IP/family/mask and unknown keys. Derive canonical CIDR only from valid masks; preserve host_uuid identity and owner/site. Do not infer internet reachability from a bind/IP alone.
3. Write Host.ip_addresses and existing NetworkInterface fields using deterministic identities within current transaction. Newer complete network observations update current host addresses; legacy omitted observations and failed network query must not erase existing addresses. Prevent older snapshots reverting newer values; preserve first_seen_at. Missing interfaces are not silently deleted or labeled retired by this task. Explicit valid empty observation behavior must be documented/tested separately from omission/failure.
4. Preserve exact ACK/retry/restart/queue bounds and rollback semantics; bounded errors, no raw secret logging. Expose IPs through existing authenticated asset list/detail only, no new API required. No undocumented changes to previous clients.

## 6. Technical constraints
Node24/ESM/PostgreSQL17. Reuse pinned dependencies and existing schema; no migration/DDL or new framework without explicit Lead decision. Synthetic/local only. osquery fixed SELECT projections only; authenticated stable host identity. No cmdline, environment, files/history/credentials/cookies/private keys. No production, token search, workstation deep scan, remediation, firewall/network changes, Cloudflare mutation or Q01..05 answers. No native/disabled-browser bypass. Keep accepted collector queue/ACK safety, SSO/RBAC/privacy, unrelated PDFs/cache and historical evidence. Independent QA/featurePR/requiredCI gates remain; no main push/forcepush/automatic merge.
Branch dev/sprint2-server-discovery from verified local73f7c71abaf6bf656e76d683530d10cdc81fc349. Inspect ancestry/worktree; create/reuse only this branch, never reset unrelated files or merge main. This unmerged feature ancestry is deliberate; existing remote-delivery dependency remains separately tracked.

## 7. Inputs and outputs
Inputs: current source/contracts and sanitized synthetic fixtures; no new company inputs assumed. Outputs: scoped implementation/tests, explicit contracts, unchanged TASK copy and Docs/RESULT-TASK-S2-001.md with evidence.

## 8. Acceptance criteria
- [ ] AC-1: A synthetic authenticated collector batch reaches PostgreSQL and existing asset list/detail with correct IPv4/IPv6, hostname/OS and stable host identity; observation timestamp/source are traceable.
- [ ] AC-2: Legacy/omitted/failed network data preserve existing IPs; complete newer observations and older/replayed batches obey documented monotonic/idempotent rules without duplicating host/interface identities.
- [ ] AC-3: Malformed/over-limit/unknown-field payloads are rejected without partial inventory writes; tokens bound to another host cannot ingest; safe fields only leave source adapter.
- [ ] AC-4: Existing queued legacy batches and exact ACK/recovery behavior remain compatible; focused transaction/queue/privacy regression and actual HTTP/PostgreSQL evidence supplied.
- [ ] AC-5: Canonical ten-section RESULT documents the explicit payload contract, native compatibility/simulation limits and unchanged S0/S1 restrictions.

## 9. Definition of Done
Map every AC independently to actual sanitized evidence, reproducible commands, changed files, assumptions and gaps. Supply all ten canonical RESULT v1.0 sections, retaining Vietnamese headings with English technical content. DONE only for all assignedAC; otherwise PARTIAL/BLOCKED precisely. Simulation never proves native osquery/browser or actual150-server rollout. No arbitrary test-count target. Keep previous Sprint0/1 limitations and PO decisions.

## 10. Handoff
One TASK = one canonical Docs/RESULT-TASK-S2-001.md (substitute actual ID). Lead owns this TASK under lead/; Dev may copy it unchanged into Docs. Read full immutable assignment/TASK and applicable SRS; verify actual messageID. One exclusive shared-tree Dev slot, assigned executor only, renew lease before10min/writes. Publish submission with actual commit, parent assignment, AC decisions, RESULT and evidence files; wait for all tools. No manual forwarding/other-chat messages. Feature commit/push/PR workflow continues only via supported authorized capability; report remote limits honestly without blocking feasible local work.
