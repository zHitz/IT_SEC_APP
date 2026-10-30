# Result — TASK-S0-002: Data model và migration

| Trường | Giá trị |
|---|---|
| Task ID | TASK-S0-002 |
| Result version | v2 |
| Trạng thái | DONE |
| Spec version đã làm theo | SRS v1.0 §8/8.1; TASK-S0-002; Quy chuẩn file result v1.0; quyết định Lead mở task 21:17 và phương án A 21:44 ngày 2026-10-24 |
| Dev agent | Codex — Dev AI Agent |
| Ngày nộp | 2026-10-24 22:06 +07:00 |
| Thời gian thực hiện | v1: kiểm tra/khai blocker 21:22–21:31; v2: triển khai/kiểm thử sau gỡ blocker khoảng 21:47–22:06 +07:00 |

## 1. Tóm tắt kết quả

Đã triển khai model 22 entity nghiệp vụ cùng hai bảng nối kỹ thuật theo quyết định A của Lead, migration up/down, seed synthetic và ER dạng DBML. Đã thực thi SQL thật trên PostgreSQL 17.5 nhúng WASM: 0 → 24 → 0 bảng, seed truy vấn đủ 2 Host/1 Container/1 Domain/1 CVE Finding và một đường quan hệ từ Domain tới Finding. Inspect cho thấy 114 native FK; test âm từ chối tham chiếu mồ côi và dữ liệu sai. Lint, 5 test và build đều xanh, commit source b6bc8714c188cf2b4c2ab243051495cc209fd83d. Tự đánh giá DONE cho AC của S0-002 với bằng chứng PostgreSQL nhúng, không tự ACCEPT/đóng task và không tuyên bố đã xác minh Docker/native daemon hoặc hoàn tất follow-up S0-001.

## 2. Đối chiếu acceptance criteria

| # | Acceptance criterion (copy từ TASK mục 8) | Đạt? | Bằng chứng |
|---|---|---|---|
| AC-1 | Migration up và migration down chạy sạch trên một database trống bằng công cụ migration của stack đã chốt: up tạo đủ schema không lỗi, down gỡ sạch schema do migration tạo, không phải sửa tay ở bất kỳ bước nào. Bằng chứng: lệnh chạy và output thật của cả hai chiều. | Đạt | backend/db/migrate.mjs thực thi chính 001.up.sql/001.down.sql trên PostgreSQL 17.5 WASM trống: 0 → 24 → 0 bảng, reapply up/down pass; ci-local.txt và schema-inspect.json. |
| AC-2 | Schema có đủ 22 bảng tương ứng 22 entity ở Mục 5.2, và mọi bảng đều có đủ các trường chung ở Mục 5.1 — gồm `source`, `first_seen_at`, `last_seen_at`, `confidence`, `raw_ref` — kiểm chứng bằng schema inspect (lệnh / công cụ liệt kê bảng và cột), output đính kèm trong file result. | Đạt | Inspect information_schema.columns cho 22 entity + 2 bảng nối kỹ thuật; đủ common và entity fields. AC-2/§6 được Lead cập nhật theo quyết định A lúc 21:44: 22 bảng nghiệp vụ, không phải 22 bảng vật lý tổng. |
| AC-3 | Seed chạy thành công trên schema vừa tạo và truy vấn lại được dữ liệu mẫu: ít nhất 2 host, 1 container, 1 domain và 1 Finding mẫu thuộc loại CVE, kèm các bản ghi nối cần thiết cho khóa ngoại. Bằng chứng: lệnh chạy seed, lệnh truy vấn và output thật. | Đạt | Chạy seed.sql qua cùng executor; SELECT thật: hosts=2, containers=1, domains=1, cve_findings=1; syntheticAccessPath trả 1 chuỗi Domain → Finding. |
| AC-4 | Mọi quan hệ ở Mục 5.3 đều có khóa ngoại đúng trong schema — đúng hai đầu quan hệ, đúng chiều — kiểm chứng bằng schema inspect hoặc truy vấn thông tin khóa ngoại, output đính kèm trong file result. | Đạt | pg_constraint inspect có 114 native FK; kiểm tra âm từ chối owner/group/CVE/Finding target không tồn tại; junction dùng FK thật, generated typed FK cho Finding.entity_ref. Xem mapping/giới hạn external cluster_id ở §7. |
| AC-5 | ER diagram nằm trong thư mục `docs/` của repo, thể hiện đủ 22 entity và các quan hệ ở Mục 5.3, khớp với SRS và khớp với schema thật đã dựng. Bằng chứng: đường dẫn file diagram khai ở Mục 4 của file result. | Đạt | Docs/data-model.dbml: 22 entity nghiệp vụ + 2 bảng nối, đủ 114 Ref; sinh cùng metadata với SQL và lint --check chống drift; full schema inspect đính kèm. |

AC-2 đọc cùng quyết định Lead 21:44 cập nhật §6: đúng 22 **bảng nghiệp vụ**, cho phép bảng nối kỹ thuật. Tổng thực tế là 24, không che giấu số bảng. Bằng chứng database được thực thi bằng PostgreSQL 17.5 WASM/PGlite 0.3.16, không phải JavaScript mock hoặc output tự chế.

## 3. Công việc đã làm

1. Nhận quyết định A trên ClickUp, comment tiếp tục lúc 21:47; không chờ ACCEPT cho RESULT v1 BLOCKED. Giữ nguyên scope S0-002 và dùng tạm stack ADR-001 như Lead đã chỉ định.
2. Tạo schema.json làm metadata canonical; generator sinh SQL up/down và ER DBML, lint kiểm tra drift. Một SQL migration executor cho cả server pg và database kiểm thử PostgreSQL nhúng; S0-001 trước đó chưa có công cụ migration, không tạo hệ thống migration thứ hai hoặc bảng metadata ngoài scope.
3. Dựng common fields trên mọi entity, native FK, unique digest Image, CHECK enum/port/chronology, soft-state record_status. Package giữ version gốc và normalized_version; Finding dùng generated typed FK từ entity_type/entity_ref mà không thêm business entity.
4. Thêm access_policy_identity_group và package_vulnerability như bảng nối kỹ thuật; allowed_groups[] là projection có trigger đồng bộ và constraint chống sửa lệch. Không thay FK bằng trigger: FK thật nằm trên junction.
5. Viết seed synthetic cho đủ 22 loại entity (23 dòng nghiệp vụ, gồm 2 Host) và 2 dòng junction; source manual cho Site/Owner, tags/raw_ref ghi rõ seed, không có dữ liệu thật.
6. Thêm verifier PostgreSQL 17.5, inspect cột/FK/tables, truy vấn chuỗi quan hệ, test dương/âm và up/down/reapply. Cập nhật lockfile, CI npm ci, build đóng gói migration/pg dependency và README vận hành.

## 4. Files đã thay đổi

Đường dẫn tương đối với F:/PROJECT/REVERSE_PROJECT/Project_app/IT_SEC_APP. Danh sách dưới là source commit b6bc8714c188cf2b4c2ab243051495cc209fd83d; RESULT canonical cập nhật thêm ở dòng cuối.

| Đường dẫn | Loại | Nội dung thay đổi |
|---|---|---|
| `.env.example` | Sửa | Migration/model/seed/test/diagram, bằng chứng hoặc tooling đóng gói theo S0-002; vai trò chi tiết trong README tương ứng. |
| `.gitattributes` | Thêm mới | Migration/model/seed/test/diagram, bằng chứng hoặc tooling đóng gói theo S0-002; vai trò chi tiết trong README tương ứng. |
| `.github/workflows/ci.yml` | Sửa | Migration/model/seed/test/diagram, bằng chứng hoặc tooling đóng gói theo S0-002; vai trò chi tiết trong README tương ứng. |
| `Docs/DATA_MODEL.md` | Thêm mới | Migration/model/seed/test/diagram, bằng chứng hoặc tooling đóng gói theo S0-002; vai trò chi tiết trong README tương ứng. |
| `Docs/data-model.dbml` | Thêm mới | Migration/model/seed/test/diagram, bằng chứng hoặc tooling đóng gói theo S0-002; vai trò chi tiết trong README tương ứng. |
| `Docs/evidence/S0-002/README.md` | Thêm mới | Migration/model/seed/test/diagram, bằng chứng hoặc tooling đóng gói theo S0-002; vai trò chi tiết trong README tương ứng. |
| `Docs/evidence/S0-002/changed-files.txt` | Thêm mới | Migration/model/seed/test/diagram, bằng chứng hoặc tooling đóng gói theo S0-002; vai trò chi tiết trong README tương ứng. |
| `Docs/evidence/S0-002/ci-local.txt` | Thêm mới | Migration/model/seed/test/diagram, bằng chứng hoặc tooling đóng gói theo S0-002; vai trò chi tiết trong README tương ứng. |
| `Docs/evidence/S0-002/schema-inspect.json` | Thêm mới | Migration/model/seed/test/diagram, bằng chứng hoặc tooling đóng gói theo S0-002; vai trò chi tiết trong README tương ứng. |
| `Docs/evidence/S0-002/secret-scan.json` | Thêm mới | Migration/model/seed/test/diagram, bằng chứng hoặc tooling đóng gói theo S0-002; vai trò chi tiết trong README tương ứng. |
| `README.md` | Sửa | Migration/model/seed/test/diagram, bằng chứng hoặc tooling đóng gói theo S0-002; vai trò chi tiết trong README tương ứng. |
| `backend/db/README.md` | Thêm mới | Migration/model/seed/test/diagram, bằng chứng hoặc tooling đóng gói theo S0-002; vai trò chi tiết trong README tương ứng. |
| `backend/db/inspect.sql` | Thêm mới | Migration/model/seed/test/diagram, bằng chứng hoặc tooling đóng gói theo S0-002; vai trò chi tiết trong README tương ứng. |
| `backend/db/migrate.mjs` | Thêm mới | Migration/model/seed/test/diagram, bằng chứng hoặc tooling đóng gói theo S0-002; vai trò chi tiết trong README tương ứng. |
| `backend/db/migrations/001.down.sql` | Thêm mới | Migration/model/seed/test/diagram, bằng chứng hoặc tooling đóng gói theo S0-002; vai trò chi tiết trong README tương ứng. |
| `backend/db/migrations/001.up.sql` | Thêm mới | Migration/model/seed/test/diagram, bằng chứng hoặc tooling đóng gói theo S0-002; vai trò chi tiết trong README tương ứng. |
| `backend/db/migrations/README.md` | Thêm mới | Migration/model/seed/test/diagram, bằng chứng hoặc tooling đóng gói theo S0-002; vai trò chi tiết trong README tương ứng. |
| `backend/db/schema.json` | Thêm mới | Migration/model/seed/test/diagram, bằng chứng hoặc tooling đóng gói theo S0-002; vai trò chi tiết trong README tương ứng. |
| `backend/db/seed.sql` | Thêm mới | Migration/model/seed/test/diagram, bằng chứng hoặc tooling đóng gói theo S0-002; vai trò chi tiết trong README tương ứng. |
| `backend/test/model.test.mjs` | Thêm mới | Migration/model/seed/test/diagram, bằng chứng hoặc tooling đóng gói theo S0-002; vai trò chi tiết trong README tương ứng. |
| `deploy/docker/backend.Dockerfile` | Sửa | Migration/model/seed/test/diagram, bằng chứng hoặc tooling đóng gói theo S0-002; vai trò chi tiết trong README tương ứng. |
| `deploy/docker/compose.yaml` | Sửa | Migration/model/seed/test/diagram, bằng chứng hoặc tooling đóng gói theo S0-002; vai trò chi tiết trong README tương ứng. |
| `deploy/docker/frontend.Dockerfile` | Sửa | Migration/model/seed/test/diagram, bằng chứng hoặc tooling đóng gói theo S0-002; vai trò chi tiết trong README tương ứng. |
| `package-lock.json` | Thêm mới | Migration/model/seed/test/diagram, bằng chứng hoặc tooling đóng gói theo S0-002; vai trò chi tiết trong README tương ứng. |
| `package.json` | Sửa | Migration/model/seed/test/diagram, bằng chứng hoặc tooling đóng gói theo S0-002; vai trò chi tiết trong README tương ứng. |
| `scripts/README.md` | Sửa | Migration/model/seed/test/diagram, bằng chứng hoặc tooling đóng gói theo S0-002; vai trò chi tiết trong README tương ứng. |
| `scripts/build.mjs` | Sửa | Migration/model/seed/test/diagram, bằng chứng hoặc tooling đóng gói theo S0-002; vai trò chi tiết trong README tương ứng. |
| `scripts/generate-schema.mjs` | Thêm mới | Migration/model/seed/test/diagram, bằng chứng hoặc tooling đóng gói theo S0-002; vai trò chi tiết trong README tương ứng. |
| `scripts/verify-db.mjs` | Thêm mới | Migration/model/seed/test/diagram, bằng chứng hoặc tooling đóng gói theo S0-002; vai trò chi tiết trong README tương ứng. |
| `Docs/RESULT-TASK-S0-002.md` | Sửa | Cùng file v1 → v2; giữ lịch sử blocker, ghi quyết định A và toàn bộ bằng chứng. |

Ngoài repo: reports/clickup-monitor/STATE.json cập nhật checkpoint và ảnh bằng chứng nộp trong reports/clickup-monitor/evidence/. Không sửa SRS/TASK hoặc RESULT S0-001; không triển khai S0-003/004. Generated dist và npm cache/node_modules bị ignore. Source/model/diagram có vai trò riêng, xem backend/db/README.md và Docs/DATA_MODEL.md.

## 5. Cách chạy và kiểm chứng

Node thực tế v24.11.1. Từ root repo:

```powershell
npm ci
npm run lint
npm test
npm run build
npm run db:verify
```

`db:verify` luôn tạo PostgreSQL 17.5 WASM mới trong memory, không đọc DATABASE_URL; dùng cùng file migration/seed/inspect và executor như server. Log và schema inspect được ghi ở Docs/evidence/S0-002. Để đối chiếu thủ công: schema-inspect.json có version, before, danh sách cột, native FK definitions, 24 bảng, seedCounts, syntheticAccessPath, after. Kết quả mong đợi thực tế: 0 trước up, 24 sau up, 0 sau down; hosts=2/containers=1/domains=1/cve_findings=1.

PostgreSQL 17 server dành riêng cho local/test: copy .env.example → .env, điền DATABASE_URL của database disposable; không đưa giá trị vào RESULT. Chạy `npm run db:up`, `npm run db:seed`, `npm run db:inspect`, `npm run db:down`. Các lệnh CLI server đã chuẩn bị nhưng chưa được chạy qua native daemon trên máy này; không lấy chúng làm bằng chứng đã chạy. Down xóa schema asset_inventory và dữ liệu của chính migration, chỉ khi marker sở hữu đúng. Không đụng public schema; không chạy production. Rollback/reapply đã được thực thi thật qua cùng executor trong test nhúng.

Sửa model: `npm run db:generate` để sinh SQL và DBML; `npm run lint` kiểm tra drift. Không sửa tay SQL/diagram gây lệch. Docs/data-model.dbml là artifact dbdiagram được TASK chấp nhận, không cần API/UI mới.

## 6. Test và kết quả test

| Test / kiểm tra | Lệnh hoặc cách kiểm tra | Kết quả | Output thật |
|---|---|---|---|
| Lint + generated parity | npm run lint | Pass | lint PASS: 14 modules; schema check PASS: 22 entities, 2 junctions, 114 native FKs |
| Migration up/inspect | npm run db:verify + node:test | Pass | PostgreSQL 17.5; before tables=0; after up=24 (22+2); common và entity fields kiểm tra bằng information_schema |
| Seed + query | db:verify đọc/chạy seed.sql rồi SELECT | Pass | hosts:2, containers:1, domains:1, cve_findings:1; syntheticAccessPath có 1 hàng Domain → Finding |
| Foreign key inspect | inspect.sql trên database vừa tạo | Pass | pg_constraint: 114 native foreign keys, definitions đầy đủ trong schema-inspect.json |
| Validation âm | backend/test/model.test.mjs | Pass | Chặn owner/group/CVE/Finding entity mồ côi (23503); confidence/port/discriminator/projection sai (23514); digest trùng (23505) |
| Projection/soft-state | model.test.mjs | Pass | groups array khớp junction, xóa group đang được tham chiếu bị chặn; bỏ junction làm array rỗng; Host missing → retired vẫn giữ 2 row, count Site cập nhật |
| Migration down/reapply | cùng executor SQL | Pass | DOWN 24 → 0; reapply up → down PASS |
| Regression + DB | npm test | Pass | tests 5, pass 5, fail 0; gồm 4 test skeleton và 1 test migration tích hợp PostgreSQL đầy đủ |
| Build | npm run build | Pass | backend/dist, frontend/dist, database migration assets packaged |
| Seed lần đầu trước sửa | node --test backend/test/model.test.mjs | Fail, đã sửa | 42804: ip_addresses inet[] nhưng biểu thức text[]; thêm cast ::inet[] trong seed, rerun PostgreSQL 17 pass |
| Kiểm thử engine ban đầu | PGlite 0.5.11 | Không dùng làm bằng chứng mục tiêu | Runtime báo PostgreSQL 18.6; thay dev dependency bằng PGlite 0.3.16, runtime xác nhận 17.5, chạy lại toàn suite |
| npm network lần đầu | npm view trong sandbox | Fail môi trường, đã xử lý | ENOTFOUND registry.npmjs.org; đọc/cài với quyền network phù hợp, không giảm policy |
| Dependency audit | npm install exact pg/PGlite | Pass tại thời điểm cài | audited 16 packages, found 0 vulnerabilities; không thay full security audit |
| Secret scan | scripts/scan-secrets.mjs + rà source/seed/config | Pass trong phạm vi heuristic | findings: []; scanner loại binary/PDF/ảnh, không chứng minh tuyệt đối mọi secret |

Log cuối có START/END tại Docs/evidence/S0-002/ci-local.txt; schema-inspect.json lưu full SQL inspect thay vì dán hàng trăm cột vào RESULT. Không chạy hay claim test collector/network production/CVE matching. Không có ảnh UI mới vì task không đổi UI.

## 7. Vấn đề gặp phải và quyết định tự xử lý

- **v1 → v2:** v1 chỉ đọc TASK và nộp B-01 BLOCKED; Lead chốt A lúc 21:44, v2 triển khai migrations/model/seed/diagram và SQL tests. Không tự sửa TASK, không tự coi v1 cần ACCEPT trước khi tiếp tục. Chưa có verdict REWORK chính thức, không ghi là rework vòng 1/3.
- **Quyết định A:** giữ 22 entity nghiệp vụ, bảng nối kỹ thuật không là entity thứ 23; FK thật trên junction. Đã thêm đúng hai bảng kỹ thuật: access_policy_identity_group và package_vulnerability. Áp dụng cùng pattern nhiều-nhiều cho Package–CVE, khai rõ để Lead review, không tạo business entity mới.
- **Stack:** dùng tạm ADR-001 PROPOSED theo comment giao việc 21:17. PostgreSQL 17 vẫn là database đích. PGlite 17.5 là execution adapter test cùng SQL, không đổi database đích hoặc tự nâng server lên 18. Docker/native daemon chưa có; SQL verification không phụ thuộc nguồn thật.
- **Migration tool:** S0-001 chưa có migration framework. Chọn duy nhất Node executor chạy versioned SQL file với transaction; native server dùng pg, test dùng PGlite adapter. Không có bảng schema_version thứ 25, marker version nằm trên schema PostgreSQL. Đây là lựa chọn triển khai trong stack tạm đã được cho phép, không đưa ORM hoặc DB thứ hai vào product.
- **Polymorphic refs:** Finding.entity_type + generated typed FK columns bảo vệ entity_ref; Package.source_kind + generated source_host_id/source_image_id bảo vệ source_host_or_image. Đây là thêm cột nội bộ, không thêm entity/bảng phụ. allowed_groups[] giữ như projection đọc từ junction, không là nguồn truth thứ hai.
- **Source/seed:** Site và Owner giữ source=manual đúng §5.1; tags/raw_ref xác định seed. Các entity discovery mẫu dùng source=seed:sample. Dữ liệu dùng sample.test, documentation IP, CVE placeholder rõ synthetic. Không đưa dữ liệu Rediver/company vào fixtures.
- **External cluster_id:** SRS không có Cluster entity trong 22 loại, nên cluster_id là định danh ngoài Kubernetes; host_id có native FK, CHECK chọn đúng một kiểu chỗ chạy. Không tự thêm bảng Cluster để có FK giả. Đây là diễn giải mapping đã công khai ở Docs/DATA_MODEL.md; không tuyên bố external identifier có native FK tới entity không tồn tại. Tất cả quan hệ giữa entity đã định nghĩa có FK thật.
- **Read models:** Site counts theo record_status=active, không phải online status; trigger cập nhật delta khi Host/Workstation chuyển site/state. Không làm job xóa/retire, risk engine hoặc workflow Finding trong task dữ liệu.

Mapping SRS → tên vật lý (snake_case, không đổi ý nghĩa):

| SRS entity | Table in asset_inventory |
|---|---|
| Host / Server | host |
| Workstation | workstation |
| Site | site |
| Service / Application | service |
| Deployment | deployment |
| Container | container |
| Image | image |
| Package / Library | package |
| Runtime / Stack | runtime_stack |
| Network Interface / IP | network_interface |
| Listening Port | listening_port |
| Firewall Rule | firewall_rule |
| Domain | domain |
| DNS Record | dns_record |
| Certificate | certificate |
| Route (Traefik) | route |
| Access Policy | access_policy |
| Identity Group / Role | identity_group_role |
| Vulnerability (CVE) | vulnerability |
| Finding | finding |
| Owner / Team | owner_team |
| Scan / Collection Run | collection_run |

Mọi trường SRS giữ tên; [] là ký hiệu kiểu mảng, không nằm trong identifier. normalized_version và các cột quan hệ bổ sung/typed projection đã liệt kê trong Docs/DATA_MODEL.md. Chi tiết JSON/SQL/DBML theo cùng metadata canonical.

## 8. Chưa làm, giới hạn và nợ kỹ thuật

- Chưa chạy server CLI qua native PostgreSQL daemon/Docker; kiểm thử thực tế là PostgreSQL 17.5 WASM trống. Docker AC-1/AC-6 của S0-001 vẫn follow-up như Lead chốt; không đánh đồng hoàn tất S0-001.
- Chưa stress/concurrency test multi-connection, query performance/search scale hoặc hardening go-live. Seed không idempotent, chỉ dùng schema trống; discovery dedupe thuộc task ingest sau.
- DBML là text artifact, chưa xuất ảnh hoặc mở dbdiagram online; không gửi source lên dịch vụ ngoài. Generated FK refs và cột khớp metadata/SQL inspect; diagram không liệt kê mọi chi tiết CHECK/trigger như thay SQL.
- Metadata/cột giải thích cluster_id là external identifier; nếu Lead muốn thêm thực thể Cluster hoặc thay contract cần task/spec thay đổi riêng, không âm thầm thêm ở đây.
- Không API CRUD/inventory UI, collector/ingest thật, CVE matching/risk scoring, SSO hoặc S0-003/004. Chưa remote CI GitHub, chỉ local CI theo quyết định Sprint 0.

## 9. Điểm nghẽn và việc cần quyết định

Không có blocker còn lại của S0-002 theo quyết định A và phạm vi kiểm chứng SQL của task. B-01 v1 đã được Lead gỡ. Chờ Lead review RESULT v2 và verdict, không tự ACCEPT/đóng task. Giới hạn native Docker/ADR S0-001 và diễn giải external cluster_id được khai ở mục 7–8, không giấu trong AC.

## 10. Đề xuất bước tiếp theo và tự kiểm tra

Lead review source commit, inspect/DBML và RESULT v2; nếu có REWORK sẽ sửa đúng điểm nêu và nộp v3, giữ một RESULT. Chỉ bắt đầu S0-003/004 khi Lead mở. Follow-up Docker/native runner và ADR S0-001 vẫn là việc riêng đã được chuyển, không tự mở rộng task này.

- [x] Đã đối chiếu đủ AC-1..AC-5 với output thật, ghi rõ thay đổi AC-2/§6 theo Lead A.
- [x] Mọi câu đã làm/đã test có file, lệnh hoặc output; đã khai lỗi seed ban đầu và môi trường thực tế.
- [x] Đủ danh sách file, mapping và lịch sử v1 → v2; không có secret/mật khẩu/token/hạ tầng thật trong RESULT.
- [x] Không sửa status/mô tả/dependency, không tự ACCEPT/đóng hoặc chuyển task khác.
