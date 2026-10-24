# TASK-S0-004: PoC ingest DNS từ Cloudflare về inventory (read-only)

Tài liệu này là file giao task chính thức cho Dev AI Agent. Khách hàng gửi nguyên file này cho Dev, Dev làm xong trả lại đúng một file `RESULT-TASK-S0-004.md` theo phụ lục ở cuối file.

Quy tắc bất biến: 1 TASK = 1 RESULT. Dev không tự gộp task, không tự chia task, không tự thay đổi phạm vi. Chỗ nào spec chưa rõ, Dev ghi vào Mục 7 và Mục 9 của file result thay vì tự đoán.

> **Ràng buộc cứng — đọc trước khi làm:** Quyền truy cập Cloudflare của khách hàng chỉ ở mức **read-only** (ràng buộc C-01 trong SRS v1.0). Task này chỉ được gọi API đọc. Tuyệt đối không tạo code path nào ghi, sửa hoặc xóa DNS — kể cả code để đó không dùng, code trong test, hay script phụ trợ.

## 1. Thông tin chung

- Mã task: TASK-S0-004
- Dự án: IT Asset & Security Posture
- Sprint / Phase: Sprint 0 — Nền móng / PoC
- Độ ưu tiên: P0
- Người giao (Team Lead): Muse
- Người duyệt cuối (Khách hàng): Product Owner
- Ngày giao: 2026-10-23
- Hạn hoàn thành: Theo lịch Sprint 0 do Team Lead xác nhận khi giao
- Trạng thái: TODO
- Spec version đã làm theo: SRS v1.0 — "Đặc tả IT Asset & Security"

## 2. Mục tiêu

Hệ thống tự lấy được toàn bộ bản ghi DNS từ Cloudflare về kho inventory, để lần đầu tiên trả lời được câu hỏi domain nào đang trỏ tới IP nào — nền tảng cho bản đồ domain → host → service ở các task sau. PoC này chứng minh việc ingest chạy đúng, chạy lại không tạo trùng, và an toàn tuyệt đối với DNS production vì chỉ đọc, không ghi. Các bản ghi trỏ về IP lạ ngoài dải hạ tầng đã biết được gắn cờ để con người xem xét, hệ thống không tự sửa bất cứ thứ gì.

## 3. Tài liệu liên quan

- SRS v1.0 "Đặc tả IT Asset & Security": FR-04 (domain / DNS), ràng buộc C-01 (Cloudflare read-only), mô hình dữ liệu entity Domain và DNSRecord
- Sổ tay Team Lead v1.0: quy trình giao task, review result và vòng rework
- Mẫu file giao task: Phần A là khung của file này, Phần B là khung file result
- Quy chuẩn file result v1.0: chuẩn đầy đủ cho file `RESULT-TASK-S0-004.md` (phụ lục rút gọn ở cuối file này)
- Task phụ thuộc: TASK-S0-001 (setup repo, kiến trúc, CI skeleton) phải PASS trước; TASK-S0-002 (data model và migration, gồm entity Domain / DNSRecord) phải PASS trước

## 4. Phạm vi

### Làm (In scope)

- Kết nối Cloudflare API bằng API token read-only: liệt kê zones, lấy toàn bộ DNS records của các zone trong phạm vi thử nghiệm
- Map domain → record → IP và lưu vào entity Domain / DNSRecord của data model đã có từ TASK-S0-002
- Đánh dấu (gắn cờ) các record trỏ về IP không thuộc dải hạ tầng đã biết, phục vụ rà soát dangling / sai lệch
- Cấu hình lịch chạy sync định kỳ kèm log cho mỗi lần chạy
- Test chứng minh tính read-only: không tồn tại code path ghi DNS nào trong toàn bộ phần việc của task này
- Tài liệu cấu hình token và file result theo quy chuẩn

### Không làm (Out of scope)

- Tự động sửa, xóa hoặc tạo DNS record dưới bất kỳ hình thức nào — kể cả khi phát hiện record sai hoặc dangling
- Quản lý, gia hạn hoặc kiểm kê TLS certificate — thuộc task sau
- Map domain → service / host cụ thể — cần thêm dữ liệu từ Traefik và inventory host, thuộc task sau; task này chỉ dừng ở domain → record → IP
- Ingest từ nguồn DNS khác ngoài Cloudflare
- Giao diện người dùng cho dữ liệu DNS — task này chỉ làm ingest và lưu trữ, hiển thị thuộc task sau
- Xử lý, phân quyền hoặc vô hiệu hoá record bị gắn cờ — con người quyết định ngoài hệ thống

## 5. Yêu cầu chi tiết

1. **Kết nối và liệt kê zones.** Dùng Cloudflare API token có quyền read-only (quyền xem zone và xem DNS). Liệt kê được toàn bộ zones mà token có quyền xem. Nếu token thiếu quyền hoặc hết hạn, job phải dừng, ghi log lỗi rõ nguyên nhân và không ghi dữ liệu nửa vời vào inventory.

2. **Lấy toàn bộ DNS records.** Với mỗi zone, lấy toàn bộ DNS records, tối thiểu đủ ba loại A, AAAA và CNAME. Việc lấy dữ liệu phải xử lý phân trang (pagination) của API để không bỏ sót record khi zone có nhiều bản ghi. Record thuộc loại khác (ví dụ MX, TXT) nếu API trả về thì ghi nhận theo data model nếu model hỗ trợ; nếu model không hỗ trợ, ghi rõ cách xử lý vào file result, không tự sửa data model.

3. **Map và lưu vào inventory.** Mỗi record lấy về được map theo chuỗi domain → record → IP và lưu vào entity Domain / DNSRecord đúng cấu trúc của TASK-S0-002. Mỗi bản ghi lưu trữ phải điền đủ bốn trường truy vết: `source` (giá trị xác định nguồn là Cloudflare), `first_seen` (lần đầu hệ thống nhìn thấy record), `last_seen` (lần sync gần nhất vẫn còn thấy record) và `confidence` (mức tin cậy của dữ liệu theo quy ước trong SRS / data model; nếu chưa có quy ước, Dev nêu giả định ở Mục 7 của file result).

4. **Idempotent khi chạy lại.** Chạy sync nhiều lần trên cùng một dữ liệu Cloudflare không được tạo trùng record trong inventory. Định danh duy nhất của một DNS record phải xác định rõ (ví dụ theo Cloudflare record ID hoặc tổ hợp zone + tên + loại + giá trị — Dev nêu rõ lựa chọn và lý do trong file result). Khi chạy lại: record đã có thì chỉ cập nhật `last_seen` và các trường thay đổi, giữ nguyên `first_seen`; record mới thì tạo mới với `first_seen` bằng `last_seen` tại lần sync đó.

5. **Gắn cờ record trỏ về IP lạ.** Sau mỗi lần sync, đối chiếu IP đích của các record loại A / AAAA (và IP phân giải được từ CNAME nếu làm được trong phạm vi PoC — nếu không làm, ghi rõ ở Mục 8 của file result) với danh sách dải hạ tầng đã biết được cung cấp qua cấu hình. Record nào trỏ về IP nằm ngoài mọi dải đã biết thì bị gắn cờ nghi ngờ dangling / sai lệch theo trường cờ của data model. Chỉ gắn cờ và ghi lý do, tuyệt đối không tự sửa, không tự xóa, không gọi API ghi.

6. **Chứng minh read-only bằng test.** Viết test tự động chứng minh mọi lời gọi tới Cloudflare API đều là thao tác đọc (GET) và trong codebase của task không tồn tại code path nào ghi DNS. Chấp nhận một hoặc kết hợp các cách sau, miễn là test chạy được trong CI: (a) test quét codebase, fail nếu phát hiện lời gọi PUT / POST / PATCH / DELETE tới Cloudflare API hoặc hàm client ghi DNS; (b) mock server mô phỏng Cloudflare API, từ chối và ghi nhận mọi request không phải GET, test fail nếu có request ghi nào bị gửi đi trong suốt quá trình sync. Test này phải pass 100% mới được khai trạng thái DONE.

7. **Lịch chạy định kỳ và log.** Job sync chạy được theo lịch định kỳ cấu hình được (cron expression hoặc khoảng interval — theo chuẩn scheduler đã chốt ở TASK-S0-001). Mỗi lần chạy phải ghi log đủ: thời điểm bắt đầu / kết thúc, zone đã sync, số record lấy về, số record tạo mới, số record cập nhật, số record bị gắn cờ, và lỗi nếu có. Một lần sync lỗi ở một zone không được làm mất log của các zone còn lại.

8. **Bảo mật thông tin truy cập.** Token chỉ đọc từ biến môi trường hoặc cơ chế quản lý secret của dự án. Không ghi token vào code, file cấu hình nộp kèm, log, output mẫu hay file result. Tài liệu cấu hình chỉ ghi tên biến và quyền cần cấp, không ghi giá trị token thật.

## 6. Ràng buộc kỹ thuật

- **Ràng buộc cứng C-01 (SRS v1.0):** Cloudflare ở chế độ read-only. Chỉ dùng API token có quyền xem (read). Mọi lời gọi API là thao tác đọc. Không code path ghi / sửa / xóa DNS ở bất kỳ đâu, kể cả code dự phòng, code test hay script thủ công đi kèm.
- Dùng đúng entity Domain / DNSRecord và migration đã bàn giao ở TASK-S0-002; không tự đổi cấu trúc bảng. Thiếu trường thì ghi vào Mục 9 của file result và chờ Team Lead quyết định, không tự thêm migration ngoài task.
- Dùng đúng khung repo, ngôn ngữ, thư viện HTTP client và cơ chế scheduler đã chốt ở TASK-S0-001; không đưa thêm thư viện lớn ngoài khung khi chưa ghi rõ lý do trong file result.
- Mọi tham chiếu requirement, entity, trường dữ liệu copy nguyên văn từ SRS và task file (FR-04, C-01, Domain, DNSRecord) — gõ sai mã được tính như mục chưa làm rõ.
- Xử lý lỗi API (timeout, lỗi xác thực, bị giới hạn tốc độ gọi) theo hướng an toàn: dừng hoặc bỏ qua zone lỗi, log rõ, không ghi dữ liệu dở dang, không thử lại vô hạn.
- Môi trường kiểm thử: chạy với zone thử nghiệm do khách hàng chỉ định và mock server cho test read-only; không dùng DNS production làm nơi thử thao tác ghi dưới bất kỳ hình thức nào.

## 7. Dữ liệu vào — ra

### Đầu vào

- Cloudflare API token read-only, cung cấp qua biến môi trường / secret của môi trường chạy (chỉ ghi tên biến trong tài liệu, không ghi giá trị)
- Danh sách zone thử nghiệm do khách hàng chỉ định để nghiệm thu
- Danh sách dải IP hạ tầng đã biết, cung cấp qua file cấu hình (Dev ghi rõ định dạng cấu hình đã dùng trong file result)
- Entity Domain / DNSRecord và migration từ TASK-S0-002

### Đầu ra

- Bản ghi Domain / DNSRecord trong inventory, điền đủ `source`, `first_seen`, `last_seen`, `confidence` cho từng record
- Cờ đánh dấu trên các record trỏ về IP ngoài dải hạ tầng đã biết, kèm lý do gắn cờ truy vết được
- Log của từng lần sync định kỳ với đủ số liệu nêu ở yêu cầu chi tiết số 7
- Bộ test read-only chạy được trong CI, kèm output thật khi nghiệm thu

## 8. Acceptance Criteria (AC)

Muse sẽ PASS / FAIL theo đúng danh sách này. Mỗi AC phải được đối chiếu riêng trong Mục 2 của file result, kèm bằng chứng cụ thể.

- [ ] AC-1: Toàn bộ DNS records của zone thử nghiệm xuất hiện trong inventory, đủ các loại record A, AAAA, CNAME có trong zone đó, và mỗi record điền đủ `source`, `first_seen`, `last_seen`, `confidence`.
- [ ] AC-2: Chạy sync lần thứ hai trên cùng dữ liệu, số lượng record trong inventory không tăng do trùng lặp — record cũ giữ nguyên `first_seen`, `last_seen` được cập nhật (idempotent).
- [ ] AC-3: Test chứng minh không có code path ghi DNS pass 100% — mọi lời gọi tới Cloudflare API đều là thao tác đọc, không tồn tại lời gọi PUT / POST / PATCH / DELETE tới Cloudflare API trong codebase của task.
- [ ] AC-4: Record trỏ về IP không thuộc dải hạ tầng đã biết được gắn cờ đúng, truy vết được lý do gắn cờ; record trỏ về IP trong dải đã biết không bị gắn cờ.
- [ ] AC-5: Job sync chạy được theo lịch định kỳ đã cấu hình, và log của mỗi lần chạy ghi đủ thời điểm, zone, số record lấy về / tạo mới / cập nhật / gắn cờ và lỗi nếu có.

## 9. Definition of Done

Task chỉ được coi là xong khi tất cả các mục sau đều đạt:

- [ ] Đủ 100% AC ở Mục 8 đạt, mỗi AC có bằng chứng kiểm chứng được trong file result
- [ ] Test read-only ở AC-3 pass 100% và chạy được trong CI của repo
- [ ] Không có bất kỳ code path ghi / sửa / xóa DNS nào tồn tại trong phần bàn giao
- [ ] Không phá vỡ chức năng đã PASS ở TASK-S0-001 và TASK-S0-002
- [ ] Không có token, secret hay dữ liệu nhạy cảm thật trong code, log mẫu và file result
- [ ] Đã nộp file `RESULT-TASK-S0-004.md` đúng quy chuẩn ở phụ lục, đủ 10 mục

## 10. File / thành phần cần bàn giao

- Code ingest Cloudflare: module kết nối API read-only, liệt kê zones, lấy DNS records (có xử lý phân trang), map domain → record → IP và lưu vào Domain / DNSRecord
- Module gắn cờ record trỏ về IP ngoài dải hạ tầng đã biết, kèm cấu hình danh sách dải IP
- Cấu hình lịch chạy sync định kỳ (cron / interval) và cơ chế ghi log mỗi lần sync
- Bộ test: test ingest, test idempotent khi chạy lại, test chứng minh read-only / không có code path ghi DNS
- Tài liệu cấu hình token: quyền read-only cần cấp, tên biến môi trường / secret, cách cấu hình zone và dải IP — không chứa giá trị token thật
- File `RESULT-TASK-S0-004.md` theo quy chuẩn ở phụ lục dưới đây

---

## Phụ lục — Quy chuẩn file result (bản rút gọn)

> **Yêu cầu file result:** Nộp một file `RESULT-TASK-S0-004.md` theo Quy chuẩn file result v1.0. Đủ 10 mục theo template dưới đây, giữ nguyên thứ tự và tên mục. Trạng thái chỉ dùng `DONE`, `PARTIAL`, `BLOCKED`, `FAILED` đúng định nghĩa trong quy chuẩn. Từng acceptance criterion phải đối chiếu với bằng chứng cụ thể; không có bằng chứng thì không tính là đạt. Khai đầy đủ file đã thay đổi, cách chạy lại, test kèm output thật, phần chưa làm, giả định và điểm nghẽn. Không để secret trong file. Rework thì nộp lại cùng file, tăng result version và ghi rõ đã sửa gì.

### Template bắt buộc

```markdown
# Result — TASK-S0-004: PoC ingest DNS từ Cloudflare về inventory (read-only)

| Trường | Giá trị |
|---|---|
| Task ID | TASK-S0-004 |
| Result version | v1 |
| Trạng thái | <DONE / PARTIAL / BLOCKED / FAILED> |
| Spec version đã làm theo | SRS v1.0 |
| Dev agent | <tên / công cụ thực hiện> |
| Ngày nộp | <YYYY-MM-DD HH:mm +07:00> |
| Thời gian thực hiện | <giờ bắt đầu – giờ kết thúc, hoặc tổng thời lượng> |

## 1. Tóm tắt kết quả
## 2. Đối chiếu acceptance criteria
## 3. Công việc đã làm
## 4. Files đã thay đổi
## 5. Cách chạy và kiểm chứng
## 6. Test và kết quả test
## 7. Vấn đề gặp phải và quyết định tự xử lý
## 8. Chưa làm, giới hạn và nợ kỹ thuật
## 9. Điểm nghẽn và việc cần quyết định
## 10. Đề xuất bước tiếp theo và tự kiểm tra
```

### Bốn trạng thái duy nhất

| Trạng thái | Được dùng khi |
|---|---|
| `DONE` | Mọi acceptance criteria đều đạt và có bằng chứng |
| `PARTIAL` | Một phần đạt, phần còn lại chưa làm hoặc chưa đạt |
| `BLOCKED` | Không thể tiếp tục vì thiếu thông tin, quyền truy cập hoặc quyết định — phải ghi rõ nghẽn ở đâu, đã thử gì, cần ai quyết định điều gì ở Mục 9 |
| `FAILED` | Đã làm nhưng kết quả sai, hỏng hoặc phải làm lại từ đầu |

Khai `DONE` bị cấm nếu còn bất kỳ AC nào chưa đạt, chưa kiểm chứng được, hoặc test read-only chưa pass 100%.

### Ba lỗi bị trả lại ngay

- Thiếu Mục 2 đối chiếu từng AC, hoặc đối chiếu mà không có bằng chứng cụ thể
- Mục 6 ghi đã test nhưng không có lệnh test và output thật — với task này, output của test read-only là bằng chứng bắt buộc
- Giấu điểm lệch spec, phần chưa làm hoặc test fail thay vì khai ở Mục 7 và Mục 8

Lưu ý riêng của task này: vì ràng buộc C-01 là read-only tuyệt đối, bất kỳ dấu hiệu nào cho thấy code bàn giao có khả năng ghi DNS đều khiến file result bị trả lại và task không được nghiệm thu, bất kể các AC còn lại đạt đến đâu.
