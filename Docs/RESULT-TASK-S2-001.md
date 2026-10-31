# Result — TASK-S2-001: Collect and persist host IP inventory

| Field | Value |
|---|---|
| Task | TASK-S2-001; assignment #39 |
| Version | v1 |
| Status | PARTIAL — local ACs supported; external PR/QA/CI gates remain |
| Branch | dev/sprint2-server-discovery |
| Implementation/evidence commit | b878669 |
| Baseline | 73f7c71abaf6bf656e76d683530d10cdc81fc349 |
| Scope | SRS FR-01.1, FR-01.5, sections7.2/8/20/23/25; PO Sprint2 authorization |

## 1. Tóm tắt kết quả

Added optional bounded network observations to the existing read-only collector and ingest contract, with canonical IPv4/IPv6 addresses and network CIDRs persisted transactionally in existing Host/NetworkInterface tables. Actual synthetic source/queue/authenticated HTTP/PGlite/signed Viewer API proof passes. No schema migration or UI changes. Sprint0/1 remain closed with historical limits preserved. Local deliverable is ready for Lead review; external delivery is PARTIAL.

## 2. Đối chiếu acceptance criteria

| AC | Status | Actual evidence |
|---|---|---|
| AC-1 | Verified synthetic local | final-network.txt S2_IP_HTTP_PROOF: read-only SQLite source ->4 split queued batches -> host-bound token HTTP -> PostgreSQL17.5 WASM/PGlite -> signed RS256 Viewer/JWKS list/detail. Correct dual-stack addresses, hostname, OS, source and observed instant; same host ID. |
| AC-2 | Verified bounded temporal cases | S2_IP_DB_PROOF: replay does not duplicate three historical interface identities; older complete snapshot cannot revert latest IPs; first_seen preserved; omitted legacy observation preserves IPs; explicit empty clears current Host addresses without deleting interfaces. HTTP proof drops optional network table to induce real read failure and verifies preservation. |
| AC-3 | Verified local | Model rejects bad literals/family/masks/unknown keys/257rows. HTTP422 for unknown sensitive field and over-limit network, wrong-host403; host count unchanged. Source projection excludes synthetic forbidden extra column. Shared ingest safety tests preserve unknown-token/media/size protections. |
| AC-4 | Verified local | focused.txt12pass includes five exact-ACK failure/restart cases and queue concurrency, legacy validation; actual queue drains4new batches through HTTP; injected network INSERT error rolls back Host address change. Full run131pass1 obsolete-count assertion failure; corrected native-readiness affected2pass, final network3pass. No claim of all-green rerun. |
| AC-5 | Verified documentation | This canonical ten-section v1, unchanged TASK copy, NETWORK-INVENTORY.md explicit contract, official schema link, reproduction commands and real logs. External native/PR/QA/CI limits explicit. |

## 3. Công việc đã làm

Verified assignment39 snapshots10files and claimed only backend-owned turn. Read full TASK and SRS scope extraction. Created the assigned branch from exact accepted baseline. Verified official osquery5.12.1 specs/interface_addresses.table supports interface/address/mask TEXT. Added fixed SELECT only; optional query failure omits observation while all other query errors retain prior failure behavior. Every split batch repeats the entire bounded successful network snapshot. No queue implementation or ACK format changed.

Strict optional network_interfaces array max256, each row only interface/address/mask. Interface nonempty<=128/no control characters; address and mask must be literal same-family IPs, masks contiguous. Canonical CIDR uses masked network bits. Prefix strings and scoped zones rejected. Deterministic interface UUID uses an unambiguous JSON tuple of hostID/interface/canonical IP. Host_uuid remains identity. Source/observation/raw reference traceability retained; raw refs excluded from existing public inventory API. Owner/site unchanged.

## 4. Files đã thay đổi

- backend/src/ingest/osquery-model.mjs — optional contract, IP/mask normalization.
- backend/src/ingest/osquery-store.mjs — guarded current IP update and deterministic interface upserts in existing transaction.
- collectors/osquery/queries.mjs — approved fixed sixth SELECT.
- collectors/osquery/source.mjs — safe field projection, optional network read omission and complete snapshot per split batch.
- backend/test/osquery-network.test.mjs — literal validation, temporal DB, authenticated source/queue/HTTP/API and rollback fixtures.
- backend/test/osquery-safety.test.mjs — expected approved sixth query and exact network SELECT assertion.
- backend/test/osquery-native-readiness.test.mjs — expected logical count6; no native execution behavior changed.
- collectors/osquery/NETWORK-INVENTORY.md — payload/temporal/simulation contract.
- Docs/TASK-S2-001.md — unchanged immutable assignment TASK.
- Docs/RESULT-TASK-S2-001.md — this canonical v1.
- Docs/evidence/S2-001/{focused,final-network,full,native-readiness,lint,build,initial-failures}.txt — actual outputs and initial failure explanations.

Unrelated pre-existing PDFs and scripts/__pycache__ were not staged or edited. No dependency/schema/SSO/UI files changed.

## 5. Cách chạy và kiểm chứng

From repository root with Node24 and pinned installed dependencies:

```powershell
node --test backend/test/osquery-network.test.mjs backend/test/osquery-safety.test.mjs backend/test/osquery-queue-ack-recovery.test.mjs backend/test/osquery-queue-concurrency.test.mjs
node --test backend/test/osquery-native-readiness.test.mjs
npm test
npm run lint
npm run build
```

Tests create synthetic temporary SQLite/raw evidence directories and isolated PGlite databases. No company credentials, external host scans, native binaries or browser input. Source schema: https://raw.githubusercontent.com/osquery/osquery/5.12.1/specs/interface_addresses.table . Initial guessed networking/posix paths404 were corrected through official repository tree; schema compatibility is not native proof.

## 6. Test và kết quả test

focused.txt:12pass/0fail4593ms. final-network.txt after unambiguous identity serialization:3pass/0fail4651ms. Full run full.txt:132tests,131pass/1fail189586ms. Sole failure expected logicalTableCount5 after approved sixth query. Corrected assertion; native-readiness.txt2pass/0fail306ms, report nativeExecuted=false, binaryExecuted=false, networkRequests0. No repeated full suite on unchanged product code; full-green final revision not claimed. lint111modules/schema22entities2junctions114FK PASS; build PASS. Final identity serialization is covered by final-network rerun; no schema effects. SQLite experimental warning retained. Initial HTTP test used textual Z vs +00:00 timestamp equality; corrected to equal parsed instants. Initial privacy query allowlist expected five tables; corrected to include exact approved network projection. Failure notes retained.

## 7. Vấn đề gặp phải và quyết định tự xử lý

Used existing Host observed_at as conservative monotonic guard, under existing upsert row lock and same transaction. Newer complete snapshots replace current IP list; older than latest Host observation are ignored even when latest observation omitted network. Equal timestamps retain existing last-arrival-wins policy; identical replay idempotent. Missing interfaces are historical observations, never silently retired/deleted. Empty successful array differs explicitly from omission/failure. is_public stays existing false default; no public reachability inferred. No schema watermark or native policy change introduced. Raw evidence file may remain on inventory rollback, matching existing store behavior; no partial inventory writes.

## 8. Chưa làm, giới hạn và nợ kỹ thuật

No native osquery/Linux/Windows adapter execution, installation, browser/UI proof, company150-server rollout or production access. Optional query omission reports unknown rather than success. Existing Host metadata timestamp can be newer than preserved last-known IP data; independent per-field freshness requires separately approved design/schema work. No address retirement, manual dedup, active scans, DNS/subnets, exposure inference or CollectionRun implementation in this TASK. Native compatibility across installed versions is unverified. Temporary synthetic artifacts are retained under OS temp by the new fixtures. Historical Sprint0/1 PARTIAL limits and Q01..05 remain unchanged.

## 9. Điểm nghẽn và việc cần quyết định

No missing company/native input blocks local assigned implementation. Feature branch push succeeded. Live GitHub query found no existing open PR for this Sprint2 branch; gh executable unavailable and no authenticated PR writer capability was used. Current-head independent GitHub QA/review and successful required CI remain unverified until live inspection/Lead workflow. Do not merge or self-accept. No new permission request or native retry is needed for local review.

## 10. Đề xuất bước tiếp theo và tự kiểm tra

Lead verify immutable submission and current commit; review each AC and conservative temporal contract. Continue Sprint2-002 CollectionRun only after a new explicit backend assignment. Sprint2-003 depends on002;004 reserved for dev-ui after dependencies. Publish coordinator evidence; preserve GitHub PR/QA/CI gates and closed Sprint1 native limits. All tools settle before handoff; no ClickUp or external chat handoff.
