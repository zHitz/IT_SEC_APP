# TASK-S0-002: Data model và migration

File này là file giao task chính thức. Khách hàng gửi nguyên file này cho Dev AI Agent, không sửa nội dung ở giữa. Dev làm xong thì trả lại đúng một file result theo Phụ lục ở cuối file này: `RESULT-TASK-S0-002.md`.

Quy tắc bất biến: 1 TASK = 1 RESULT. Dev không tự gộp task, không tự chia task, không tự thay đổi phạm vi. Chỗ nào spec chưa rõ, Dev ghi vào Mục 7 và Mục 9 của file result thay vì tự đoán.

---

## Phần A — TASK (Team Lead điền, Dev chỉ đọc)

## 1. Thông tin chung

- Mã task: TASK-S0-002
- Dự án: IT Asset & Security Posture
- Sprint / Phase: Sprint 0 — nền móng, Phase 1 (MVP)
- Độ ưu tiên: P0
- Người giao (Team Lead): Muse
- Người duyệt cuối (Khách hàng): Product Owner
- Ngày giao: 2026-10-23
- Hạn hoàn thành: theo kế hoạch Sprint 0 Team Lead thông báo khi giao
- Trạng thái: TODO
- Spec version áp dụng: SRS v1.0 "Đặc tả IT Asset & Security", Sổ tay Team Lead v1.0
- Task phụ thuộc: TASK-S0-001 — chỉ bắt đầu khi TASK-S0-001 đã được nghiệm thu (PASS / ACCEPT). Task này dùng đúng repo, cấu trúc thư mục và tech stack đã chốt ở TASK-S0-001, không dựng repo riêng.

## 2. Mục tiêu

Dự án chưa có một cấu trúc dữ liệu chung để chứa tài sản hạ tầng và dữ liệu bảo mật, nên mọi tính năng sau này — discovery, domain mapping, phân tích CVE — sẽ phải tự chế cách lưu riêng và không nối được với nhau. Task này dựng xong mô hình dữ liệu gồm 22 entity theo SRS v1.0, kèm migration chạy được và dữ liệu mẫu tối thiểu. Khi task hoàn thành, các task tiếp theo có ngay một database đúng spec để ghi dữ liệu thu thập vào và để kiểm thử, thay vì phải tự đoán schema.

## 3. Tài liệu liên quan

- SRS v1.0 "Đặc tả IT Asset & Security":
  - Mục 8 — Mô hình dữ liệu (Data Model): định nghĩa 22 entity, các trường chung và tiêu chí nghiệm thu của mô hình dữ liệu. Đây là căn cứ duy nhất cho schema của task này.
  - Mục 8.1 — Quan hệ cốt lõi phải truy vấn được.
  - Các mục FR-01 đến FR-07 và Mục 20 (API Specification): chỉ để đối chiếu tên trường và quan hệ, không triển khai logic của các mục này trong task này.
- Sổ tay Team Lead v1.0: quy trình giao task, nghiệm thu và vòng rework.
- Mẫu file giao task: Phần A là khung của file này; Phụ lục ở cuối file này rút gọn từ Quy chuẩn file result v1.0.
- Task phụ thuộc: TASK-S0-001 (repo và tech stack đã chốt) — gồm tên công cụ migration, quy ước cấu trúc thư mục và quy ước đặt tên đã áp dụng trong repo.

## 4. Phạm vi

### Làm (In scope)

- Dựng schema cho đủ 22 entity ở Mục 5.2 theo Mục 8 của SRS.
- Viết migration tạo toàn bộ schema, chạy được cả chiều lên (up) và chiều xuống (down) bằng công cụ migration của stack đã chốt ở TASK-S0-001.
- Seed dữ liệu mẫu tối thiểu theo Mục 5.4 để các task sau có dữ liệu kiểm thử.
- Xuất ER diagram (sơ đồ quan hệ thực thể) khớp với schema đã dựng, đặt trong thư mục `docs/` của repo.

### Không làm (Out of scope)

- API CRUD đầy đủ cho các entity — thuộc task sau. Task này không yêu cầu endpoint nào ngoài những gì cần để kiểm chứng migration và seed.
- Logic đối chiếu CVE (CVE matching), tính risk score và vòng đời xử lý Finding — thuộc task sau. Task này chỉ tạo bảng và trường, không tạo logic.
- Collector, discovery osquery / Docker / Kubernetes và ingest dữ liệu thật — thuộc các task khác.
- Giao diện web (UI) hiển thị inventory.
- Sửa, thêm hoặc bớt entity so với SRS. Mọi đề xuất thay đổi mô hình dữ liệu phải khai trong file result và chờ Team Lead ra quyết định riêng.

## 5. Yêu cầu chi tiết

### 5.1 Trường chung bắt buộc trên mọi entity

Mọi entity trong Mục 5.2 đều phải có đủ các trường chung theo Mục 8 của SRS:

| Trường | Ý nghĩa |
|---|---|
| `id` | UUID nội bộ, khóa chính |
| `source` | Collector / nguồn phát hiện ra bản ghi |
| `first_seen_at` | Thời điểm thấy lần đầu |
| `last_seen_at` | Thời điểm thấy lần gần nhất |
| `observed_at` | Thời điểm dữ liệu được đo ở nguồn |
| `confidence` | Chỉ dùng 3 giá trị: `confirmed` / `inferred` / `stale` |
| `raw_ref` | Con trỏ tới dữ liệu thô đã lưu |
| `tags` | Nhãn gắn thêm |
| `owner_id` | Chủ sở hữu, nếu có |
| `environment` | `dev` / `prod` / `staging` / khác |
| `site_id` | Site liên quan, nếu có |

Hai làm rõ từ SRS, Dev phải áp dụng đúng:

- Không entity nào được thiếu 5 trường `source`, `first_seen_at`, `last_seen_at`, `confidence`, `raw_ref`. Riêng Site và Owner / Team do con người khai báo thì `source` mang giá trị `manual` — vẫn phải có trường, không được bỏ.
- Xóa mềm (soft delete) là mặc định cho tài sản: tài sản không còn thấy được chuyển trạng thái `missing`, sau ngưỡng cấu hình mới chuyển `retired`, không xóa khỏi lịch sử. Schema phải có trường trạng thái đủ để biểu diễn vòng này; giá trị ngưỡng cấu hình không thuộc task này.

### 5.2 Đủ 22 entity theo Mục 8 của SRS

Tên entity và các trường chính dưới đây copy từ SRS — Dev giữ nguyên tên entity, tên trường và ý nghĩa trường. Cột "Trường chính" là phần riêng của từng entity, nằm ngoài các trường chung ở Mục 5.1.

| # | Entity | Trường chính theo SRS |
|---|---|---|
| 1 | Host / Server | `hostname`, `host_uuid`, `ip_addresses[]`, `mac`, `os`, `os_version`, `kernel`, `cpu`, `ram`, `disk`, `virtualization`, `cloud_provider`, `site_id`, `agent_status`, `last_boot` |
| 2 | Workstation | `hostname`, `os`, `os_major_version`, `site_id`, `assigned_user`, `last_checkin_at`, `status` |
| 3 | Site | `name`, `address_summary`, `contact`, `workstation_count`, `server_count` |
| 4 | Service / Application | `name`, `display_name`, `owner_id`, `criticality`, `repo_url`, `lifecycle`, `description` |
| 5 | Deployment | `service_id`, `environment`, `host_id` / `cluster_id`, `namespace`, `replicas`, `image_ref`, `image_digest`, `started_at`, `version_label` |
| 6 | Container | `container_id`, `image`, `image_digest`, `runtime`, `host_id`, `ports[]`, `mounts`, `privileged`, `run_as_user`, `restart_count` |
| 7 | Image | `repository`, `tag`, `digest`, `os_base`, `size`, `created_at`, `known_vuln_summary`, `last_scanned_at` |
| 8 | Package / Library | `name`, `version`, `ecosystem`, `source_host_or_image`, `license`, `is_eol` |
| 9 | Runtime / Stack | `type`, `name`, `version`, `eol_date`, `support_status` |
| 10 | Network Interface / IP | `host_id`, `interface`, `ip`, `cidr`, `is_public`, `mac` |
| 11 | Listening Port | `host_id` / `container_id`, `protocol`, `port`, `bind_address`, `process`, `pid`, `is_exposed` |

| # | Entity | Trường chính theo SRS |
|---|---|---|
| 12 | Firewall Rule | `source_system`, `action`, `src_cidr`, `dst`, `ports`, `direction` |
| 13 | Domain | `fqdn`, `registrar_note`, `is_internal`, `primary_service_id` |
| 14 | DNS Record | `domain`, `type`, `value`, `proxied`, `ttl`, `observed_at` |
| 15 | Certificate | `domain`, `issuer`, `subject`, `san[]`, `not_before`, `not_after`, `source`, `fingerprint` |
| 16 | Route (Traefik) | `router_name`, `rule_host`, `rule_path`, `service_target`, `middlewares[]`, `tls`, `entrypoint`, `source_config` |
| 17 | Access Policy | `system`, `route_ref`, `allowed_groups[]`, `allowed_domains`, `mfa_required`, `public_allowed` |
| 18 | Identity Group / Role | `idp`, `realm`, `client_id`, `groups[]`, `roles[]`, `user_count` |
| 19 | Vulnerability (CVE) | `cve_id`, `aliases`, `cvss`, `severity`, `kev_listed`, `epss`, `published_at`, `fixed_versions[]`, `references[]` |
| 20 | Finding | `type`, `entity_ref`, `severity`, `risk_score`, `status`, `first_found`, `last_found`, `evidence_ref` |
| 21 | Owner / Team | `team_name`, `members`, `contact_channel`, `escalation` |
| 22 | Scan / Collection Run | `collector`, `started_at`, `finished_at`, `status`, `records_seen`, `errors[]`, `scope` |

Giá trị cho phép phải bám SRS, ví dụ: `criticality` của Service chỉ dùng `critical` / `high` / `medium` / `low`; `type` của Finding chỉ dùng `cve` / `exposure` / `drift` / `eol` / `misconfig`; `system` của Access Policy là Pomerium / Traefik / Keycloak; `type` của DNS Record là A / AAAA / CNAME / TXT / các loại record chuẩn khác. Package phải lưu cả chuỗi version gốc và version đã chuẩn hóa, vì version là căn cứ đối chiếu CVE ở các task sau.

### 5.3 Quan hệ giữa các entity phải đúng Mục 8.1 của SRS

Mọi quan hệ dưới đây phải có khóa ngoại (foreign key) thật trong schema — đúng hai đầu quan hệ, đúng chiều — chứ không chỉ ghi bằng một trường text tự do:

- Chuỗi truy cập chính: Domain → DNS Record → Network Interface / IP → Host → Route (Traefik) → Access Policy → Service → Deployment → Container → Image → Package / Library.
- Host → Listening Port; Listening Port gắn với process đang nghe (process là thuộc tính trên Listening Port theo SRS, gồm tên process và `pid`); Host → Firewall Rule.
- Service → Owner / Team; Service → Runtime / Stack → Package / Library → Vulnerability (CVE) → Finding.
- Site → Workstation (một Site có nhiều Workstation); Site → Host (nếu server đặt tại site).
- Các quan hệ nối còn lại theo trường đã nêu ở Mục 5.2: Deployment thuộc Service và chạy trên Host / cluster; Container thuộc Host và tham chiếu Image; Domain có `primary_service_id` trỏ tới Service; Certificate và DNS Record gắn với Domain; Identity Group / Role là nguồn tham chiếu cho `allowed_groups[]` của Access Policy; Scan / Collection Run là bản ghi kiểm toán của mỗi đợt thu thập.

Hai điểm Dev hay tự suy diễn sai, Team Lead chốt trước:

- SRS v1.0 Mục 8 không có entity Pod riêng và không có entity Process riêng. Dữ liệu pod được biểu diễn qua Deployment và Container; process là thuộc tính của Listening Port. Không tự tạo bảng Pod hoặc bảng Process — nếu Dev cho rằng không thể biểu diễn đủ bằng mô hình trên, phải khai `BLOCKED` hoặc ghi đề xuất ở Mục 7 / Mục 10 của file result và chờ quyết định, không tự thêm entity thứ 23.
- Tương tự, "Remediation Recommendation" trong chuỗi quan hệ của SRS là đầu ra nghiệp vụ của Finding ở các task sau, không phải entity thứ 23 trong task này.

### 5.4 Migration và seed

1. Migration phải chạy lên (up) tạo toàn bộ schema và chạy xuống (down) gỡ sạch schema do chính nó tạo, trên một database trống, bằng đúng công cụ migration của stack đã chốt ở TASK-S0-001. Không sửa tay database thay cho migration, không để migration phụ thuộc vào dữ liệu thật.
2. Seed dữ liệu mẫu tối thiểu gồm: 2 host, 1 container, 1 domain, 1 Finding mẫu thuộc loại CVE. Để giữ toàn vẹn khóa ngoại, seed được (và phải) tạo thêm các bản ghi nối tối thiểu mà 5 mẫu trên phụ thuộc — ví dụ Service, Deployment, Image, Package / Library, Vulnerability (CVE) cho Finding mẫu; DNS Record cho Domain.
3. Seed phải ghi rõ là dữ liệu mẫu: dùng tên và giá trị ví dụ, không dùng hostname, domain, địa chỉ IP, token hay dữ liệu thật của công ty. Tên miền và IP trong ví dụ của SRS là giá trị giả định để minh họa, không được hard-code vào hệ thống như dữ liệu thật.
4. Mọi bản ghi seed vẫn phải có đủ trường chung ở Mục 5.1, với `source` ghi rõ nguồn seed / mẫu để phân biệt với dữ liệu discovery thật.
5. Lệnh chạy seed phải được ghi trong file result kèm output thật, và dữ liệu seed phải truy vấn lại được sau khi chạy (kèm lệnh truy vấn kiểm chứng).

### 5.5 ER diagram

Xuất ER diagram thể hiện đủ 22 entity và mọi quan hệ ở Mục 5.3, dưới dạng file ảnh hoặc file dbdiagram (hoặc cả hai), đặt trong thư mục `docs/` của repo. Tên entity và tên quan hệ trên diagram phải khớp SRS và khớp schema thật đã dựng — diagram vẽ khác schema được tính là chưa đạt.

## 6. Ràng buộc kỹ thuật

- Dùng đúng tech stack, database và công cụ migration đã chốt ở TASK-S0-001. Không tự đổi database, không đưa thêm công cụ migration thứ hai, không viết script tạo bảng ngoài hệ thống migration.
- Tên bảng và tên cột theo quy ước của SRS: giữ nguyên tên entity và tên trường của SRS khi ánh xạ xuống bảng / cột; nếu quy ước đặt tên vật lý của repo ở TASK-S0-001 (ví dụ snake_case) buộc phải biến đổi hình thức tên, phải lập bảng ánh xạ tên SRS → tên vật lý trong file result, không được đổi ý nghĩa hoặc viết tắt tự chế.
- Không tự ý thêm hoặc bớt entity so với danh sách 22 entity ở Mục 5.2. Mọi điểm làm khác — kể cả thêm bảng phụ trợ mà SRS không có — đều phải khai ở Mục 7 của file result; điểm lệch ảnh hưởng mô hình dữ liệu thì phải khai `BLOCKED` và chờ quyết định, không tự làm tiếp.
- Digest là định danh chính của Image, `tag` chỉ là nhãn phụ vì tag có thể bị ghi đè — khóa và ràng buộc duy nhất phải bám nguyên tắc này của SRS.
- Identity Group / Role chỉ lưu nhóm, vai trò và số lượng người dùng (`user_count`); không thiết kế trường lưu dữ liệu cá nhân thừa của người dùng IdP. Workstation chỉ lưu `assigned_user` ở mức tên đăng nhập.
- Không chứa secret, mật khẩu, token hay dữ liệu thật trong migration, seed, ER diagram và file result. Biến môi trường chỉ ghi tên biến, không ghi giá trị.
- Môi trường kiểm thử: database trống, tạo mới hoàn toàn cho mỗi lần kiểm chứng migration up / down.

## 7. Dữ liệu vào — ra

- Đầu vào:
  - SRS v1.0, Mục 8 và Mục 8.1 — định nghĩa entity, trường và quan hệ.
  - Repo và stack từ TASK-S0-001 đã nghiệm thu — gồm công cụ migration và quy ước đặt tên đang dùng trong repo.
- Đầu ra:
  - Migration scripts chạy được up và down trong repo.
  - Seed script / seed data tạo được dữ liệu mẫu ở Mục 5.4.
  - ER diagram (file ảnh hoặc dbdiagram) trong thư mục `docs/` của repo.
  - File `RESULT-TASK-S0-002.md` theo Phụ lục ở cuối file này.

## 8. Acceptance Criteria (AC)

Mỗi AC là một câu kiểm chứng được đúng / sai. Team Lead sẽ PASS / FAIL task theo đúng danh sách này, đối chiếu với Mục 2 của file result.

- [ ] AC-1: Migration up và migration down chạy sạch trên một database trống bằng công cụ migration của stack đã chốt: up tạo đủ schema không lỗi, down gỡ sạch schema do migration tạo, không phải sửa tay ở bất kỳ bước nào. Bằng chứng: lệnh chạy và output thật của cả hai chiều.
- [ ] AC-2: Schema có đủ 22 bảng tương ứng 22 entity ở Mục 5.2, và mọi bảng đều có đủ các trường chung ở Mục 5.1 — gồm `source`, `first_seen_at`, `last_seen_at`, `confidence`, `raw_ref` — kiểm chứng bằng schema inspect (lệnh / công cụ liệt kê bảng và cột), output đính kèm trong file result.
- [ ] AC-3: Seed chạy thành công trên schema vừa tạo và truy vấn lại được dữ liệu mẫu: ít nhất 2 host, 1 container, 1 domain và 1 Finding mẫu thuộc loại CVE, kèm các bản ghi nối cần thiết cho khóa ngoại. Bằng chứng: lệnh chạy seed, lệnh truy vấn và output thật.
- [ ] AC-4: Mọi quan hệ ở Mục 5.3 đều có khóa ngoại đúng trong schema — đúng hai đầu quan hệ, đúng chiều — kiểm chứng bằng schema inspect hoặc truy vấn thông tin khóa ngoại, output đính kèm trong file result.
- [ ] AC-5: ER diagram nằm trong thư mục `docs/` của repo, thể hiện đủ 22 entity và các quan hệ ở Mục 5.3, khớp với SRS và khớp với schema thật đã dựng. Bằng chứng: đường dẫn file diagram khai ở Mục 4 của file result.

## 9. Definition of Done

Task chỉ được coi là xong khi tất cả mục sau đều đạt:

- [ ] Đủ 100% AC ở Mục 8 đạt và có bằng chứng trong file result.
- [ ] Migration up / down và seed đã chạy thật trên database trống, có lệnh và output thật kèm theo — không dùng output mẫu tự chế.
- [ ] Không phá vỡ repo, cấu trúc thư mục và quy ước đã chốt ở TASK-S0-001.
- [ ] Mọi điểm lệch spec, giả định tự đặt ra và phần chưa làm đã khai đầy đủ ở Mục 7, 8 và 9 của file result.
- [ ] Không còn secret, mật khẩu, token hay dữ liệu thật trong các file bàn giao và trong file result.
- [ ] Đã nộp file `RESULT-TASK-S0-002.md` đúng Phụ lục ở cuối file này.

## 10. File / thành phần cần bàn giao

- Migration scripts trong repo, tại vị trí quy ước của công cụ migration đã chốt ở TASK-S0-001.
- Seed script / seed data trong repo, kèm lệnh chạy seed.
- ER diagram (file ảnh hoặc dbdiagram) trong thư mục `docs/` của repo.
- File `RESULT-TASK-S0-002.md` theo quy chuẩn ở Phụ lục dưới đây.

---

## Phụ lục — Quy chuẩn file result (bản rút gọn, dán kèm để Dev trả bài)

> **Yêu cầu file result:** Nộp một file `RESULT-TASK-S0-002.md` theo Quy chuẩn file result v1.0. Đủ 10 mục theo template dưới đây, giữ nguyên tên và thứ tự các mục. Trạng thái chỉ dùng `DONE`, `PARTIAL`, `BLOCKED`, `FAILED` đúng định nghĩa trong quy chuẩn. Từng acceptance criterion phải đối chiếu với bằng chứng cụ thể; không có bằng chứng thì không tính là đạt. Khai đầy đủ file đã thay đổi, cách chạy lại, test kèm output thật, phần chưa làm, giả định và điểm nghẽn. Không để secret trong file. Rework thì nộp lại cùng một file, tăng `Result version` và ghi rõ đã sửa gì ở Mục 7.

### Bốn trạng thái duy nhất

| Trạng thái | Được dùng khi |
|---|---|
| `DONE` | Mọi acceptance criteria đều đạt và có bằng chứng |
| `PARTIAL` | Một phần đạt, phần còn lại chưa làm hoặc chưa đạt |
| `BLOCKED` | Không thể tiếp tục vì thiếu thông tin, quyền truy cập hoặc quyết định |
| `FAILED` | Đã làm nhưng kết quả sai, hỏng hoặc phải làm lại từ đầu |

Cấm khai `DONE` nếu còn bất kỳ AC nào chưa đạt, chưa kiểm chứng được, hoặc còn mục "chưa làm" ảnh hưởng đến AC đó — trường hợp này phải khai `PARTIAL`. Khai `BLOCKED` phải chỉ rõ nghẽn ở đâu, đã thử cách gì và cần ai quyết định điều gì (Mục 9).

### Template bắt buộc của file result

Dev copy nguyên văn khung dưới đây, thay phần trong dấu `<...>` bằng nội dung thật. Mục nào không áp dụng thì ghi rõ `Không áp dụng — <lý do>`, không xóa mục.

```markdown
# Result — TASK-S0-002: Data model và migration

| Trường | Giá trị |
|---|---|
| Task ID | TASK-S0-002 |
| Result version | v1 |
| Trạng thái | <DONE / PARTIAL / BLOCKED / FAILED> |
| Spec version đã làm theo | SRS v1.0 |
| Dev agent | <tên / công cụ thực hiện> |
| Ngày nộp | <YYYY-MM-DD HH:mm +07:00> |
| Thời gian thực hiện | <giờ bắt đầu – giờ kết thúc, hoặc tổng thời lượng> |

## 1. Tóm tắt kết quả
<3–5 câu: đã làm được gì, kết quả chính, có đạt mục tiêu của task không.>

## 2. Đối chiếu acceptance criteria
| # | Acceptance criterion (copy từ task file) | Đạt? | Bằng chứng |
|---|---|---|---|
| AC-1 | <...> | Đạt / Chưa đạt / Chưa kiểm chứng | <test, output, file — ghi rõ ở mục nào> |

## 3. Công việc đã làm
<Từng việc đã làm theo thứ tự thực hiện, kèm cách làm ngắn gọn.>

## 4. Files đã thay đổi
| Đường dẫn | Loại | Nội dung thay đổi |
|---|---|---|
| <path/to/file> | Thêm mới / Sửa / Xóa | <thay đổi gì, vì sao> |

## 5. Cách chạy và kiểm chứng
<Điều kiện môi trường, lệnh chạy migration up / down, lệnh chạy seed,
các bước để Team Lead tự chạy lại và thấy đúng kết quả đã báo cáo.>

## 6. Test và kết quả test
| Test case | Lệnh / cách test | Kết quả | Output chính |
|---|---|---|---|
| <TC-1> | <...> | Pass / Fail | <trích output thật> |

## 7. Vấn đề gặp phải và quyết định tự xử lý
<Khó khăn, giả định đã tự đặt ra, điểm làm khác task file / spec và lý do.
Nộp lại sau rework: ghi rõ lần này sửa gì so với bản trước. Không có thì ghi "Không có".>

## 8. Chưa làm, giới hạn và nợ kỹ thuật
<Phần chưa làm, giới hạn đã biết, việc phát sinh ngoài scope. Không có thì ghi "Không có".>

## 9. Điểm nghẽn và việc cần quyết định
<Bắt buộc khi PARTIAL / BLOCKED / FAILED: nghẽn ở đâu, đã thử gì,
cần Team Lead hoặc khách hàng quyết định điều gì. Nếu DONE thì ghi "Không có".>

## 10. Đề xuất bước tiếp theo và tự kiểm tra
<Đề xuất task tiếp theo nếu có.>
- [ ] Đã đối chiếu đủ từng acceptance criterion ở Mục 2
- [ ] Mọi câu "đã làm / đã test" đều có bằng chứng kèm theo
- [ ] Không còn secret, mật khẩu, token hay dữ liệu thật nhạy cảm trong file này
```

### Bằng chứng tối thiểu riêng cho task này

Ngoài Mục 2 và Mục 6, file result của task dữ liệu / migration này phải có: số lượng bảng trước và sau khi chạy migration, lệnh chạy migration up và down kèm output thật, lệnh chạy seed kèm số bản ghi mẫu truy vấn lại được, và cách hoàn tác (chính là migration down). Thiếu các bằng chứng này, Team Lead trả lại trước khi xét nội dung.
