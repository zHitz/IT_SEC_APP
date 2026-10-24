# Result — TASK-S0-004: PoC ingest DNS từ Cloudflare về inventory (read-only)

| Trường | Giá trị |
|---|---|
| Task ID | TASK-S0-004 |
| Result version | v1 |
| Trạng thái | PARTIAL |
| Spec version đã làm theo | SRS v1.0 FR-04/C-01; TASK-S0-004; S0-002 v2 ACCEPT; Lead mở task 2026-10-24 22:21 |
| Dev agent | Codex — Dev AI Agent |
| Ngày nộp | 2026-10-25 00:27 +07:00 |
| Thời gian thực hiện | Bắt đầu 00:18 ngày 2026-10-25; lượt thực thi đầu sau mở task |

## 1. Tóm tắt kết quả

Đã code client GET-only, phân trang zones/records, giới hạn zone thử nghiệm, retry hữu hạn, timeout và lỗi không lộ token. Sáu test mới pass; local suite 11/11 pass, lint/build pass. Chưa triển khai lưu inventory/cờ/scheduler vì contract trường cờ thiếu so với TASK §5.5/§6; đề xuất mapping ở mục 9, không tự thêm migration hoặc coi đề xuất là quyết định. Chưa có đầu vào nghiệm thu zone/token/CIDR thật; không khai DONE hoặc gọi dữ liệu mock là inventory thật.

## 2. Đối chiếu acceptance criteria

| AC | Tiêu chí TASK §8 | Đạt? | Bằng chứng |
|---|---|---|---|
| AC-1 | Toàn bộ DNS records zone thử nghiệm xuất hiện inventory, đủ A/AAAA/CNAME và source/first_seen/last_seen/confidence | Chưa đạt | Test mới chỉ đọc fake-fetch qua 2 trang zone/3 trang record; chưa lưu DB và chưa có zone chỉ định. |
| AC-2 | Sync lần hai không tăng trùng, giữ first_seen, cập nhật last_seen | Chưa đạt | Chưa upsert; không có truy vấn idempotency. |
| AC-3 | Test không có code path ghi DNS pass 100%; mọi request Cloudflare là đọc | Đạt | 6/6 test; fake-fetch từ chối method khác GET; audit module chỉ có một transport hardcode GET, fixed origin/path, không mutation interface. ci-local.txt. Chỉ chứng minh phần source hiện bàn giao, phải mở rộng audit khi thêm ingest. |
| AC-4 | Flag IP ngoài dải đúng, lý do truy vết, IP trong dải không bị flag | Chưa đạt | Schema chưa có trường flag/reason; chưa tự thay bằng tags, chưa nhận CIDR. Mục 9. |
| AC-5 | Job chạy lịch cấu hình, log đủ thời điểm/zone/fetched/created/updated/flagged/error | Chưa đạt | Chưa scheduler/job ingest. Reader không được mô tả là job hoàn chỉnh. |

## 3. Công việc đã làm

Đọc giao việc mới, xác nhận bắt đầu trên task lúc 00:18. Giữ nguyên schema ACCEPT. Dựng reader độc lập với DB; stage toàn scope để lỗi xác thực ở zone sau không trả dữ liệu nửa vời cho caller. Thêm test bảo mật, pagination, retry/rate-limit, dữ liệu lỗi và chống thu ngoài zone chỉ định; đưa collectors vào lint. Kiểm tra hồi quy model và shell, không thay UI.

## 4. Files đã thay đổi

Tất cả đường dẫn tương đối root IT_SEC_APP; ngoài các file này chỉ checkpoint monitor ngoài repo được cập nhật.

| File | Loại | Thay đổi cụ thể |
|---|---|---|
| collectors/cloudflare/client.mjs | Thêm | Client fixed-origin GET, token private, pagination strict, retry/timeout, stage test scope; chưa DB. |
| collectors/cloudflare/README.md | Thêm | API module, quyền token/tên biến, guard, lệnh test, giới hạn và đề xuất mapping chờ duyệt. |
| backend/test/cloudflare.test.mjs | Thêm | 6 test fake-fetch + source audit C-01; không request Cloudflare thật hoặc thao tác ghi DNS. |
| scripts/check.mjs | Sửa | Thêm collectors vào cây kiểm tra syntax/unsafe patterns. |
| Docs/evidence/S0-004/ci-local.txt | Thêm | Trích output thật lint/test/build, gồm lỗi sandbox và lần chạy lại pass. |
| Docs/RESULT-TASK-S0-004.md | Thêm | RESULT canonical v1, từng AC và blocker/đề xuất. |

## 5. Cách chạy và kiểm chứng

Tại root IT_SEC_APP với Node24/dependencies từ lockfile: `node --test backend/test/cloudflare.test.mjs`, `npm run lint`, `npm test`, `npm run build`. Nếu mới checkout chạy `npm ci` trước; không khai đã chạy clean install trong lượt này. Test đọc API giả lập không cần token hay network. README module mô tả cách consumer truyền token từ CLOUDFLARE_API_TOKEN; chưa có lệnh chạy job vì chưa bàn giao ingest. Không chạy reader với production để thử.

## 6. Test và kết quả test

Output thật lưu Docs/evidence/S0-004/ci-local.txt: lint16 modules + schema22/2/114 PASS; test riêng6/6 PASS; suite lần sandbox9/11 (2 test HTTP cũ bị EACCES loopback), chạy lại ngoài sandbox theo escalation11/11 PASS; build PASS. PostgreSQL17.5 WASM kiểm tra hồi quy migration, không kiểm tra Cloudflare ingest. Không giấu lần fail; chưa remote CI/Docker/zone thật. Không test idempotency/flag/scheduler vì chưa có phần đó.

## 7. Vấn đề gặp phải và quyết định tự xử lý

Lịch sử v1: bản đầu, chưa có REWORK. Chọn native fetch để giữ Node24 và không thêm dependency. API fixed origin, GET hardcode, không URL/method cấu hình; max pages10.000 và retries2 để tránh vòng lặp. Không log raw body/token, redirect error. Bất nhất pagination làm hủy lượt đọc. Các quyết định này không đổi AC. Khái niệm first_seen/last_seen sẽ map physical first_seen_at/last_seen_at theo schema đã ACCEPT; không đổi tên cột. Gặp thiếu trường cờ thì tuân thủ TASK §6 chờ Lead, chưa tự áp dụng tags/raw_ref.

## 8. Chưa làm, giới hạn và nợ kỹ thuật

Chưa map/upsert Domain/DNSRecord, raw snapshot, CIDR check, periodic job và log ingest; chưa CNAME resolution (PoC cho phép bỏ, phải khai). Chưa zone thật, token read-only thật hoặc file CIDR khách hàng. Không kiểm chứng tính snapshot của API khi dữ liệu đổi giữa các trang; fail khi thấy drift metadata/ID. Chưa load/memory/performance test. Build app shell không đóng gói collector standalone; source module chạy bằng Node, chưa container worker. Không claim mọi AC đạt từ 6 test reader.

## 9. Điểm nghẽn và việc cần quyết định

**B-04-01 — thiếu contract cờ ảnh hưởng AC-4.** TASK §5.5 yêu cầu trường cờ/reason và §6 bắt buộc thiếu trường thì chờ Lead, không đổi schema. Đã đối chiếu schema.json/DBML S0-002 ACCEPT: DNSRecord chỉ có domain/type/value/proxied/ttl/network_interface_id + common tags/raw_ref, không flag/reason. Đề xuất Lead xác nhận tag namespace `cloudflare:outside-known-range` và reason trong snapshot raw_ref, giữ schema; hoặc giao thay đổi schema riêng. Chưa áp dụng phương án nào. Có thể tiếp tục client GET độc lập nên đã làm/test phần đó; dừng phần semantics lưu cờ tại đây.

**B-04-02 — đầu vào nghiệm thu.** Không có .env tại root và CLOUDFLARE_API_TOKEN không hiện diện trong process lúc kiểm tra; không tìm/đọc secret ở vị trí khác. Cần PO/Lead chỉ định zone thử nghiệm, file CIDR và cung cấp token read-only qua secret môi trường (không comment/upload token). Không tự chọn production zone. Đây không phải blocker repo/SRS cũ và không chờ ACCEPT bản PARTIAL để tiếp tục sau quyết định.

## 10. Đề xuất bước tiếp theo và tự kiểm tra

Lead chốt B-04-01, PO cung cấp B-04-02; dev tiếp tục cùng source và RESULT v2: transaction upsert/idempotency, cờ/log/schedule và test đủ rồi nghiệm thu zone chỉ định. Không tự ACCEPT/đóng task.

- [x] Đủ 10 mục, AC-1..5 tách riêng; không có bằng chứng thì chưa đạt.
- [x] File thay đổi ghi vai trò cụ thể, output thật và lỗi test được khai.
- [x] Không secret/hạ tầng thật, không DNS write path hoặc sửa schema.
- [x] V1 duy nhất; nộp đính kèm trên đúng task, không chỉ đường dẫn local.
