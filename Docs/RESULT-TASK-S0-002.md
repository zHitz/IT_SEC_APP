# Result — TASK-S0-002: Data model và migration

| Trường | Giá trị |
|---|---|
| Task ID | TASK-S0-002 |
| Result version | v1 |
| Trạng thái | BLOCKED |
| Spec version đã làm theo | SRS v1.0 §8/8.1; TASK-S0-002; Quy chuẩn file result v1.0; chỉ thị Team Lead ngày 2026-10-24 21:17 trên S0-002 và 21:19 trên S0-001 |
| Dev agent | Codex — Dev AI Agent |
| Ngày nộp | 2026-10-24 21:29 +07:00 |
| Thời gian thực hiện | 2026-10-24 21:22–21:29 +07:00 — đọc giao việc, đối chiếu schema constraints và chuẩn bị báo cáo |

## 1. Tóm tắt kết quả

Đã nhận chỉ thị chính thức UNBLOCK và bắt đầu S0-002, đọc đầy đủ TASK trong repo IT_SEC_APP. Không chờ ACCEPT cho S0-001: Lead đã chuyển AC-1/AC-6 và ADR sang follow-up, cho dùng tạm stack đề xuất. Đối chiếu mô hình cho thấy yêu cầu FK thật cho các phần tử quan hệ nhiều giá trị, đặc biệt allowed_groups[], cần giải pháp khác với FK thông thường của PostgreSQL khi đồng thời cấm mọi bảng phụ và bắt buộc đúng 22 bảng. Đã chuẩn bị câu hỏi kèm phương án cụ thể để Lead chốt phạm vi ràng buộc trước khi tạo migration; chưa tạo/chạy schema, seed hoặc ER và không khai AC đạt. Đây là blocker ảnh hưởng trực tiếp AC-2/AC-4, không phải chờ duyệt việc nhỏ hoặc nhắc lại blocker repo/SRS đã gỡ.

## 2. Đối chiếu acceptance criteria

| # | Acceptance criterion (copy từ TASK mục 8) | Đạt? | Bằng chứng |
|---|---|---|---|
| AC-1 | Migration up và migration down chạy sạch trên một database trống bằng công cụ migration của stack đã chốt: up tạo đủ schema không lỗi, down gỡ sạch schema do migration tạo, không phải sửa tay ở bất kỳ bước nào. Bằng chứng: lệnh chạy và output thật của cả hai chiều. | Chưa kiểm chứng | Chưa tạo/chạy schema vì B-01 cần quyết định ảnh hưởng AC-2/AC-4; không có output database giả. |
| AC-2 | Schema có đủ 22 bảng tương ứng 22 entity ở Mục 5.2, và mọi bảng đều có đủ các trường chung ở Mục 5.1 — gồm `source`, `first_seen_at`, `last_seen_at`, `confidence`, `raw_ref` — kiểm chứng bằng schema inspect (lệnh / công cụ liệt kê bảng và cột), output đính kèm trong file result. | Chưa kiểm chứng | Chưa tạo/chạy schema vì B-01 cần quyết định ảnh hưởng AC-2/AC-4; không có output database giả. |
| AC-3 | Seed chạy thành công trên schema vừa tạo và truy vấn lại được dữ liệu mẫu: ít nhất 2 host, 1 container, 1 domain và 1 Finding mẫu thuộc loại CVE, kèm các bản ghi nối cần thiết cho khóa ngoại. Bằng chứng: lệnh chạy seed, lệnh truy vấn và output thật. | Chưa kiểm chứng | Chưa tạo/chạy schema vì B-01 cần quyết định ảnh hưởng AC-2/AC-4; không có output database giả. |
| AC-4 | Mọi quan hệ ở Mục 5.3 đều có khóa ngoại đúng trong schema — đúng hai đầu quan hệ, đúng chiều — kiểm chứng bằng schema inspect hoặc truy vấn thông tin khóa ngoại, output đính kèm trong file result. | Chưa kiểm chứng | Chưa tạo/chạy schema vì B-01 cần quyết định ảnh hưởng AC-2/AC-4; không có output database giả. |
| AC-5 | ER diagram nằm trong thư mục `docs/` của repo, thể hiện đủ 22 entity và các quan hệ ở Mục 5.3, khớp với SRS và khớp với schema thật đã dựng. Bằng chứng: đường dẫn file diagram khai ở Mục 4 của file result. | Chưa đạt | Chưa tạo/chạy schema vì B-01 cần quyết định ảnh hưởng AC-2/AC-4; không có output database giả. |

## 3. Công việc đã làm

1. Đọc cập nhật ClickUp qua browser fallback (API đang hết quota); S0-001 lúc 21:19 mở S0-002; đọc comment giao việc chính S0-002 lúc 21:17. Không sửa status/mô tả/dependency.
2. Đọc đầy đủ Docs/TASK-S0-002.md; đối chiếu §5.1–5.5, §6, AC-1..AC-5; repo hiện chưa có công cụ migration/schema của task trước.
3. Đăng comment bắt đầu S0-002 trên đúng task lúc 21:25; chỉ dùng tạm Node/native ESM/PostgreSQL trong ADR-001 PROPOSED như Lead cho phép.
4. Kiểm tra local PATH: chưa có psql/postgres/pg_ctl/docker. Đây là giới hạn kiểm chứng runtime đã biết, không lấy thay cho phân tích schema và không tự đổi database.
5. Đối chiếu tài liệu PostgreSQL 17 chính thức: Foreign Keys §5.5.5 mô tả FK giữa các cột và yêu cầu kiểu/số lượng cột khớp; ví dụ nhiều-nhiều dùng bảng nối. Arrays §8.15.5 khuyến nghị bảng riêng mỗi phần tử cho quan hệ dạng tập. Nguồn tại mục 5/7. Không khẳng định đã thử DDL trên database thật.

## 4. Files đã thay đổi

| Đường dẫn | Loại | Nội dung thay đổi |
|---|---|---|
| Docs/RESULT-TASK-S0-002.md | Thêm mới | Báo cáo BLOCKED v1, đầy đủ AC, câu hỏi/đề xuất và bằng chứng đọc/đối chiếu. |
| reports/clickup-monitor/STATE.json (ngoài repo, từ workspace root) | Sửa | Ghi chỉ thị mở S0-002, task hiện tại, blocker schema, đường dẫn RESULT và kết quả nộp. |

Chưa sửa schema, migrations, seed, app UI/backend hoặc RESULT v4 của S0-001. Chưa sửa tài liệu nguồn TASK/SRS. Không tạo bảng thứ 23, Process/Pod/Remediation Recommendation entity.

## 5. Cách chạy và kiểm chứng

Từ F:/PROJECT/REVERSE_PROJECT/Project_app/IT_SEC_APP, đọc Docs/TASK-S0-002.md §5.2 (allowed_groups[]), §5.3 (mọi quan hệ có FK thật và Identity Group/Role là nguồn tham chiếu), §6 (cấm cả bảng phụ) và AC-2/AC-4. Không có lệnh migration/seed để cung cấp vì chưa tạo hoặc chạy; output trước/sau số bảng chưa có, không thay bằng output mô phỏng.

Nguồn kỹ thuật chính thức:
- https://www.postgresql.org/docs/17/ddl-constraints.html#DDL-CONSTRAINTS-FK — FK các cột, matching types và ví dụ many-to-many dùng order_items.
- https://www.postgresql.org/docs/17/arrays.html#ARRAYS-SEARCHING — array không phải set; cân nhắc bảng riêng một dòng cho mỗi phần tử.

Ví dụ minh họa vấn đề (KHÔNG là migration đã chạy): `allowed_groups uuid[] REFERENCES identity_group_role(id)` không phải FK từng phần tử tới khóa UUID scalar. Đổi sang FK giữa hai cột array chỉ kiểm tra toàn bộ array khớp một row khác, không đảm bảo mỗi group ID tồn tại độc lập và làm đổi ý nghĩa quan hệ. Trigger kiểm tra phần tử có thể giữ số bảng nhưng không tạo FK native được schema inspect liệt kê như AC-4 yêu cầu. Giới hạn một policy chỉ có một group hoặc nhân bản group theo policy cũng không được tự giả định.

## 6. Test và kết quả test

| Test / kiểm tra | Lệnh hoặc cách kiểm tra | Kết quả | Output / bằng chứng thật |
|---|---|---|---|
| PRE-01 — Task được mở | ClickUp web, comment S0-002 21:17 và S0-001 21:19 | Pass cho đầu vào | Task chính thức UNBLOCK; dùng tạm stack ADR PROPOSED; AC-1/AC-6/ADR S0-001 follow-up. |
| PRE-02 — Đọc TASK | Get-Content Docs/TASK-S0-002.md | Pass cho đầu vào | Đọc đủ §5.1–5.5/§6/AC và template; 22 bảng, không có bảng phụ, mọi quan hệ có FK thật. |
| PRE-03 — Runtime PostgreSQL/Docker | Get-Command psql,postgres,pg_ctl,docker -ErrorAction SilentlyContinue | Chưa có runtime | Không trả command nào; chưa có DDL/seed/schema inspect thực tế. |
| PRE-04 — Đối chiếu PostgreSQL docs | Đọc hai trang chính thức mục 5 | Pass cho đối chiếu tài liệu | Foreign Key column types must match; many-to-many example uses join table. Đây không phải test SQL đã chạy. |
| Migration up/down | Chưa chạy | Chưa test | B-01 chưa chốt, không có DB/schema output. |
| Seed/FK inspect/ER parity | Chưa chạy | Chưa test | Chưa có schema để inspect hoặc đối chiếu. |

Không chạy lại CI skeleton không thay đổi chỉ để tạo cảm giác có bằng chứng cho schema. Test 4/4 của S0-001 không chứng minh bất kỳ AC nào của S0-002.

## 7. Vấn đề gặp phải và quyết định tự xử lý

- Theo comment Lead 21:17, dùng tạm stack ADR-001 PROPOSED là chỉ định đã có; không yêu cầu ACCEPT lần nữa và không tự coi ADR đã ACCEPTED. S0-001 vẫn PARTIAL/follow-up.
- B-01 là xung đột áp dụng trên PostgreSQL giữa TASK §5.3/AC-4 (FK thật cho các quan hệ, gồm nhóm trong allowed_groups[]) và §6/AC-2 (đúng 22 bảng, cấm cả bảng phụ). Chưa tự quyết cho phép bảng nối, thay FK bằng trigger, giảm cardinality hoặc lưu quan hệ bằng text/JSON không có FK.
- Đề xuất ưu tiên để Lead đánh giá: giữ 22 entity nghiệp vụ, cho phép bảng nối kỹ thuật tối thiểu cho quan hệ nhiều-nhiều và cập nhật cách đếm bảng của AC-2/§6. Ví dụ access_policy_identity_group(policy_id FK, identity_group_id FK) với PK ghép. Đây là đề xuất chưa triển khai; không tuyên bố nó được cho phép bởi TASK hiện tại.
- Phương án nếu Lead giữ cứng 22 bảng vật lý: cần Lead chốt biểu diễn nhiều giá trị và điều chỉnh AC-4 để chấp nhận constraint trigger bảo toàn tham chiếu thay cho native FK ở mảng (cần test insert/update/delete và concurrency). Không tự áp dụng phương án này.
- Các quan hệ nhiều-nhiều khác như Package ↔ Vulnerability và các tham chiếu đa hình Finding.entity_ref cũng cần được làm rõ cùng lần để tránh tự thiết kế lại sau. Chưa tự thêm asset supertable hay junction table.
- Repo chưa có công cụ migration từ S0-001; sau khi contract được chốt, sẽ chọn đúng một cơ chế SQL migration PostgreSQL phù hợp Node theo phạm vi được duyệt, không tự thêm bảng metadata vi phạm §6. Không coi đây là blocker riêng trước khi chốt B-01.

## 8. Chưa làm, giới hạn và nợ kỹ thuật

Chưa tạo/chạy migration up/down, 22 bảng/constraints, seed, schema inspect, ER diagram. Chưa có output trước/sau số bảng hoặc số bản ghi, do đó không AC nào đã đạt. Chưa làm S0-003/S0-004. Không có thay đổi source ngoài scope. Giới hạn runtime PostgreSQL/Docker còn tồn tại, sẽ cần môi trường local/test phù hợp khi thực thi migration; không truy cập production.

## 9. Điểm nghẽn và việc cần quyết định

| ID | Nghẽn ở đâu | Đã thử gì | Cần ai quyết định điều gì |
|---|---|---|---|
| B-01 | TASK §5.3/AC-4 yêu cầu FK thật tới từng group trong allowed_groups[], nhưng §6/AC-2 cấm mọi bảng ngoài 22 bảng; PostgreSQL FK array không là FK từng phần tử tới scalar id | Đọc toàn TASK và đối chiếu PostgreSQL 17 FK/arrays docs; đánh giá array-to-array, trigger, giảm cardinality, bảng nối; chưa giả vờ chạy DDL | Team Lead chốt: (A) cho phép bảng nối kỹ thuật ngoài 22 entity và cập nhật AC-2/§6 (đề xuất), hay (B) giữ 22 bảng và điều chỉnh yêu cầu native FK cho trường array/đa hình kèm cơ chế integrity được chấp nhận; chốt luôn pattern nhiều-nhiều/đa hình. |

Đây là yêu cầu quyết định contract ảnh hưởng trực tiếp AC, không xin phép bắt đầu task đã giao. Không nhắc lại thiếu repo/SRS hoặc chờ ACCEPT v3. Sau quyết định sẽ làm tiếp ngay, không chuyển task khác.

## 10. Đề xuất bước tiếp theo và tự kiểm tra

Lead chốt B-01 bằng comment/file TASK cập nhật; Dev triển khai cùng repo/stack, chạy migration và seed thật trên DB test trống, inspect bảng/cột/FK và xuất diagram khớp. RESULT v1 BLOCKED không cần ACCEPT để làm tiếp khi blocker được gỡ; bản sau tăng v2, giữ một file canonical.

- [x] Đã đối chiếu đủ từng AC ở mục 2, không khai đạt khi chưa có SQL output.
- [x] Mọi câu đã đọc/đã kiểm tra có nguồn/lệnh/bằng chứng và phạm vi; chưa test runtime được khai rõ.
- [x] Không có secret, mật khẩu, token hay dữ liệu thật nhạy cảm trong file này.
