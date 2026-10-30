# Result — TASK-S1-003: Expose authenticated server inventory API

| Field | Value |
|---|---|
| Task ID | TASK-S1-003 |
| Result version | v1 |
| Status | PARTIAL |
| Spec | SRS v1.0 FR-01.1/FR-01.5/§20/§25; TASK-S1-003 v1; RESULT v1.0 |
| Dev | Codex — Dev AI Agent |
| Implementation/evidence commit | 053e45f (full hash in coordinator submission) |
| Branch | dev/sprint1-auth-inventory |

## 1. Tóm tắt kết quả

Implemented authenticated GET /api/v1/assets, /api/v1/assets/{id}, /api/v1/hosts/{id}/ports against the accepted Host/Package/ListeningPort schema. Added strict bound filters, stable default50/max200 paging and one-statement as_of/count/page metadata. Actual signed-token HTTP/PostgreSQL fixtures verify source metadata and exact relations. Focused6pass/0fail; full119pass/0fail; lint109modules/schema/build PASS. Local scoped ACs are supported; overall PARTIAL preserves the existing external PR/current-revision QA delivery gap. No 150-company-host, discovery, production or native-browser claim.

## 2. Đối chiếu acceptance criteria

| ID | Criterion | Status | Actual evidence |
|---|---|---|---|
| AC-1 | Authenticated scoped APIs expose source evidence for synthetic hosts/packages/ports | Verified local scope | focused-v1.txt ASSET_HTTP_PROOF:207synthetic hosts; list/detail200, exact host package excludes image package, exact host port8080, source/observed_at metadata asserted. Signed local JWKS token, no auth stub. |
| AC-2 | Filters/stable default50 max200/as_of/invalid queries/unknown IDs have HTTP proof | Verified | HTTP fixture combines env/site/owner/tag/q to102matches;205tie-order records page50/200 boundaries, repeat stable UUID tie-break, page2 no overlap and200+5 split, out-of-range empty. as_of parseable; malformed/duplicate/unknown filters400 and nonexistent UUID404. |
| AC-3 | Policy denies unauthorized; raw sensitive data excluded; ServiceOwner denied | Verified bounded checks | All three routes missing401/ServiceOwner403, POST405; response asserts no raw_ref/canary/token. Explicit safe columns exclude raw payload/env/commandline/history. Existing shared five-role policy retained; no new relation privilege. |
| AC-4 | Ingest identity/dedup and existing schema survive; migration explicit if any | Verified; no migration | focused-v1.txt existing osquery actual lab and all-entity first_seen/last_seen/upsert/stale replay tests pass. API SQL runs READ ONLY; host/package/port counts unchanged. Full119pass; schema22entities/2junctions/114FK unchanged; no schema file diff. |
| AC-5 | RESULT maps each AC, fixture sizes, commands/output and limits | Verified local deliverable; external delivery PARTIAL | This canonical ten-section v1, ASSETS-API.md, source/tests and actual logs. Fixture207hosts/2packages/1port explicit. No company150hosts claim. |

## 3. Công việc đã làm

Verified assignment29 and read full TASK; reused current accepted feature tip3147dac, auth/SSO boundary and read-only pool. Inspected SRS FR-01.1 and accepted schema; included existing ip_addresses with hostname/OS/version. Added standards adapters while leaving legacy readers/UI compatibility unchanged. All configured standard routes pass shared auth before query/method dispatch. No migration, source collection, credential or business ownership changes.

## 4. Files đã thay đổi

| File | Specific change |
|---|---|
| backend/src/inventory/assets.mjs | Bound host filter/page query and exact package/port relation readers with provenance/as_of |
| backend/src/inventory/ASSETS-API.md | Endpoint/filter/field/ID/page/as_of semantics, safe evidence contract and reproduction |
| backend/src/app.mjs | Shared authorization for standard routes and standard200/400/404/405/503 request_id dispatch |
| backend/src/server.mjs | Bind adapters to existing opt-in read-only inventory database pool |
| backend/test/assets.test.mjs | Actual two-seed-host query/filter/default/max/SQL-literal/read-only proof |
| backend/test/assets-http.test.mjs | Actual signed-token HTTP/JWKS/PostgreSQL207host paging, exact relations, policy and unchanged counts |
| Docs/TASK-S1-003.md | Original Lead-owned TASK copied unchanged for traceability |
| Docs/evidence/S1-003/initial-import-failure-v1.txt | Actual initial test import failure, retained |
| Docs/evidence/S1-003/fixture-failure-v1.txt | Actual required normalized_version fixture omission failure, retained |
| Docs/evidence/S1-003/focused-v1.txt | Final6pass focused API/ingest/auth output |
| Docs/evidence/S1-003/full-v1.txt | Final full119pass/0fail output |
| Docs/evidence/S1-003/lint-v1.txt | Lint109modules and unchanged schema PASS |
| Docs/evidence/S1-003/build-v1.txt | Actual build PASS |
| Docs/RESULT-TASK-S1-003.md | This canonical v1 RESULT |

Other TASK RESULTs, schema/migrations and unrelated PDFs/generated cache untouched.

## 5. Cách chạy và kiểm chứng

From root with Node24: `npm ci`; `node --test backend/test/assets-http.test.mjs backend/test/assets.test.mjs backend/test/osquery.test.mjs backend/test/oidc-http.test.mjs`; `npm test`; `npm run lint`; `npm run build`; `git diff --check`.

Runtime uses accepted INVENTORY_READ_ENABLED loopback/DATABASE_URL/OIDC configuration and optional accepted SSO sessions. Standard APIs have no new credential. All methods/parameters and response fields are in ASSETS-API.md. GET asset detail's page/page_size paginate host packages; ports endpoint pages separately. Raw evidence locations/contents are intentionally excluded; provenance metadata supplies source evidence.

## 6. Test và kết quả test

- Initial query test failed at nonexistent seed.mjs import; corrected to existing migrate.mjs seed export. Actual failure retained.
- Initial HTTP fixture failed NOT NULL normalized_version; populated required existing field, no schema relaxation. Actual failure retained (all marker data is synthetic).
- Corrected HTTP/query2pass; final focused6pass/0fail,7662.8743ms includes ingest identity/upsert/timestamp/stale replay and signed auth.
- One initial full invocation interrupted before completion to add SRS-required existing host IP projection; not claimed passing. Final full119pass/0fail,165739.5869ms against final runtime.
- Lint109modules/schema22entities+2junctions/114FK PASS; build PASS; whitespace PASS. No repeat ten-minute outage or native test.
- Fixture:207hosts=2accepted seeds+205synthetic same-hostname tie/page rows;2packages=1image seed+1host-only fixture;1listener. API executed within READ ONLY transaction, counts unchanged. Isolated JWKS fixture generates ephemeral signing keys in memory, no token/key output.

## 7. Vấn đề gặp phải và quyết định tự xử lý

Mapped env/site/owner/tag/q to stored environment/site_id/owner_id/tags/hostname with no inferred values. UUID filters mean identity, not names; absent filters include null/unassigned records. type defaults host; all other types rejected. Strict query keys/duplicates and bound values prevent caller SQL. Pages use static stable orders with UUID tie-break. Detail packages exclude image-kind packages and use explicit page metadata, avoiding silent truncation; unknown owner host404 differs from existing host with zero children200.

as_of is statement snapshot time, not a historical replay parameter or proof all source observations are fresh. Source evidence is source/observed_at/first_seen/last_seen/confidence; raw_ref paths/raw payloads are omitted to avoid disclosing file locations or sensitive evidence. Listener process/pid are existing accepted attributes, not expanded process collection. No schema extension was needed.

Ordinary fixture import/required-field mistakes self-resolved with recorded failures. SRS review exposed missing IP projection before final verification; added existing safe IP field and restarted regression. No user/Lead scope decision required.

## 8. Chưa làm, giới hạn và nợ kỹ thuật

Host-only server slice, no Docker/K8s discovery, real150hosts, production queries, raw evidence download, historical as_of lookup, UI change or native browser proof. q searches hostname only; no implicit ownership/name/environment inference. Session/company IdP/native gaps from S1-002 remain separate. External PR creation/current-revision independent QA gap is still unresolved; no token search or disabled-tool retry. API behavior is real HTTP/database execution using explicitly synthetic data.

## 9. Điểm nghẽn và việc cần quyết định

No local API implementation blocker. Existing supported PR-write capability is absent in this session; use an authorized supported reviewer/connector to create/reuse exactly one Sprint1 PR and obtain current-head QA. Do not merge or invent approval. Missing company/native data is not required to review this synthetic API package and is not a reason to reopen Sprint0.

## 10. Đề xuất bước tiếp theo và tự kiểm tra

Lead reviews immutable package and supported local ACs, preserves external delivery and native/company limits, then assigns S1-004 only through the coordinator. Do not self-accept or open dependent work automatically.

- [x] One canonical RESULT, all5ACs separately mapped and ten canonical sections.
- [x] Actual outputs/failures, all changed files, fixture size and commands disclosed.
- [x] No schema/production/collector expansion; no secrets or real infrastructure data.
- [x] Feature branch only; no merge/QA bypass.
- [ ] External PR/current-head QA and required remote CI delivery gates complete.
