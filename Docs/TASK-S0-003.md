# TASK-S0-003: PoC osquery collector thu thập inventory từ server thử nghiệm

> File giao task do Team Lead viết. Khách hàng gửi nguyên file này cho Dev AI Agent, không sửa nội dung ở giữa. Dev làm xong trả lại đúng một file result theo Phụ lục ở cuối file này. Quy tắc bất biến: 1 TASK = 1 RESULT — Dev không tự gộp task, không tự chia task, không tự thay đổi phạm vi. Chỗ nào spec chưa rõ, Dev ghi vào Mục 7 của file result thay vì tự đoán và tự quyết.

---

## Phần A — TASK (Team Lead điền, Dev chỉ đọc)

## 1. Thông tin chung

- Mã task: TASK-S0-003
- Dự án: IT Asset & Security Posture
- Sprint / Phase: Sprint 0 — nền móng và PoC
- Độ ưu tiên: P0
- Người giao (Team Lead): Muse
- Người duyệt cuối (Khách hàng): Product Owner
- Ngày giao: 2026-10-23
- Hạn hoàn thành: Team Lead chốt khi giao thực tế, căn cứ thời điểm TASK-S0-001 và TASK-S0-002 đạt PASS
- Trạng thái: TODO
- Spec version áp dụng: SRS v1.0 — "Đặc tả IT Asset & Security"

## 2. Mục tiêu

Chứng minh chuỗi thu thập cơ bản của hệ thống chạy được từ đầu đến cuối: osquery trên server thử nghiệm lấy được thông tin host, gói phần mềm, cổng đang mở và tiến trình, rồi đẩy về backend và lưu thành inventory tra cứu được. PoC này là căn cứ để quyết định có mở rộng cơ chế thu thập này ra toàn bộ hạ tầng ở các phase sau hay không. Nếu PoC chưa chứng minh được việc thu thập an toàn (chỉ đọc, không làm thay đổi host) và bền khi mất kết nối (không mất dữ liệu), hệ thống chưa có nền để xây tiếp các tính năng phân tích bảo mật.

## 3. Tài liệu liên quan

- SRS v1.0 "Đặc tả IT Asset & Security" — FR-01 (discovery qua osquery) là requirement chính của task này; các quy định kiến trúc chung của SRS áp dụng cho endpoint ingest do Dev định nghĩa trong task này
- Sổ tay Team Lead v1.0 — quy trình giao task, review và vòng rework
- Mẫu file giao task — khung Phần A / Phần B mà file này tuân theo
- Quy chuẩn file result v1.0 — chuẩn trả bài, tóm tắt ở Phụ lục cuối file này
- Task phụ thuộc: TASK-S0-001 (setup repo, kiến trúc, CI skeleton) và TASK-S0-002 (data model và migration) — cả hai phải đạt PASS trước khi bắt đầu task này. Nếu một trong hai chưa PASS, Dev khai trạng thái `BLOCKED` trong file result, ghi rõ đang chờ task nào, thay vì tự dựng kiến trúc hoặc data model riêng

## 4. Phạm vi

### Làm (In scope)

- Triển khai osquery agent — hoặc dùng `osqueryi` / extension nếu Dev chứng minh được cách đó đáp ứng đủ các yêu cầu ở Mục 5 — trên tối thiểu 3, tối đa 5 server Linux thử nghiệm. Ở PoC này Dev được dùng server lab hoặc Docker giả lập server, với điều kiện ghi rõ trong file result server nào là lab / giả lập và giả lập bằng cách nào
- Thu thập đúng 5 bảng osquery: `system_info`, `os_version`, `packages`, `listening_ports`, `processes`
- Xây dựng một API ingest endpoint ở backend để nhận dữ liệu từ collector, có batching và retry cơ bản
- Lưu dữ liệu vào đúng 4 entity Host, Package, Port, Process của data model đã bàn giao ở TASK-S0-002
- Cơ chế hàng đợi cục bộ (local queue) tại collector để không mất dữ liệu khi mất kết nối tới backend
- Tài liệu ngắn hướng dẫn cài agent lên một server mới trong đúng 5 bước
- Checklist kiểm chứng host không bị thay đổi ngoài việc cài agent, dùng cho AC-3

### Không làm (Out of scope)

- Tự động triển khai (auto-deploy) agent hàng loạt lên 150 server thật — thuộc phase sau, không thuộc PoC này
- Discovery cho Docker và Kubernetes — thuộc task khác
- Thu thập từ workstation và gom theo site — thuộc task khác
- Hệ điều hành khác ngoài Linux (Windows, macOS) — ngoài phạm vi PoC
- Giao diện inventory, tìm kiếm, dashboard — thuộc task khác; task này chỉ cần dữ liệu vào được database và kiểm chứng được bằng truy vấn hoặc API
- Phân tích CVE, fingerprint nâng cao, chấm điểm phơi nhiễm — thuộc task khác; task này chỉ thu thập đủ dữ liệu thô (đặc biệt là tên và version của package) để các task sau dùng
- Thay đổi cấu hình host, firewall, network hoặc package đang cài trên server thử nghiệm ngoài việc cài chính osquery agent

## 5. Yêu cầu chi tiết

1. **Môi trường thử nghiệm.** Triển khai collector lên tối thiểu 3 server Linux thử nghiệm phân biệt được với nhau (hostname khác nhau). Nếu dùng Docker giả lập, mỗi container / môi trường giả lập phải đại diện cho một host riêng với `system_info` riêng, không dùng chung một nguồn dữ liệu cho cả 3 "server". File result phải liệt kê đủ các server đã dùng: hostname, loại (server thật / lab / Docker giả lập), hệ điều hành và version.

2. **Thu thập đủ 5 bảng, đúng ý nghĩa dữ liệu.** Ánh xạ tối thiểu như sau, chi tiết trường theo data model ở TASK-S0-002:

   - `system_info` → định danh host cho entity Host (hostname và các trường định danh mà entity Host yêu cầu)
   - `os_version` → hệ điều hành và version của Host
   - `packages` → entity Package, bắt buộc có tên package và version — đây là dữ liệu nền cho fingerprint tech stack và phân tích CVE ở các task sau, thiếu version là thiếu dữ liệu cốt lõi
   - `listening_ports` → entity Port của host tương ứng
   - `processes` → entity Process của host tương ứng, chỉ lấy các trường mà entity Process quy định

3. **Lịch thu thập cấu hình được.** Chu kỳ thu thập và chu kỳ đẩy dữ liệu phải đặt trong file cấu hình của collector, không hardcode trong code. File result ghi rõ giá trị chu kỳ đã dùng khi kiểm thử.

4. **API ingest endpoint.** Dev tự định nghĩa endpoint trong task này nhưng phải tuân thủ kiến trúc đã chốt ở TASK-S0-001 và SRS v1.0. Tài liệu endpoint bàn giao kèm task phải ghi rõ: method và đường dẫn, cấu trúc request (theo batch), cấu trúc response thành công, các mã lỗi chính và ý nghĩa, và cách endpoint nhận biết dữ liệu thuộc về host nào. Endpoint phải từ chối payload thiếu định danh host hoặc thiếu trường bắt buộc thay vì lưu dữ liệu lỗi vào database.

5. **Batching và retry.** Collector gom dữ liệu thành batch khi gửi, không gửi từng bản ghi đơn lẻ. Khi gửi thất bại (backend không phản hồi, trả lỗi tạm thời, mất mạng), collector tự thử lại (retry) theo cơ chế có ghi rõ trong tài liệu bàn giao: số lần thử lại tối đa hoặc cơ chế chờ giữa các lần thử (backoff). Retry không được tạo bản ghi trùng trong database — lần gửi lại cùng một batch phải cập nhật bản ghi đã có (upsert theo khóa tự nhiên mà data model quy định) thay vì chèn thêm bản ghi mới.

6. **Lưu đúng data model, đủ trường quản trị.** Mọi bản ghi tạo ra phải thuộc đúng entity Host / Package / Port / Process của TASK-S0-002 và điền đủ 4 trường `source`, `first_seen`, `last_seen`, `confidence` theo đúng quy tắc của data model đó:

   - `source` cho biết dữ liệu đến từ osquery collector của task này, phân biệt được với các nguồn discovery khác về sau
   - `first_seen` giữ nguyên thời điểm hệ thống lần đầu thấy bản ghi, không bị ghi đè khi thu thập lại
   - `last_seen` cập nhật theo lần thu thập gần nhất có bản ghi đó
   - `confidence` điền theo quy tắc data model đã quy định cho dữ liệu quan sát trực tiếp từ host

   Nếu data model ở TASK-S0-002 chưa quy định rõ một trong các trường trên, Dev không tự thay đổi data model: ghi giả định đã dùng vào Mục 7 của file result và chờ Team Lead quyết định.

7. **Mất kết nối không mất dữ liệu.** Khi collector không liên lạc được với backend, dữ liệu thu thập trong thời gian đó phải được giữ trong hàng đợi cục bộ (local queue) trên chính server thử nghiệm và tự động gửi tiếp khi kết nối khôi phục, không cần thao tác tay. Hàng đợi phải sống sót qua việc khởi động lại tiến trình collector trong thời gian mất kết nối. Hành vi khi hàng đợi đầy (giới hạn kích thước nếu có) phải ghi rõ trong tài liệu bàn giao.

8. **Chỉ đọc, không thay đổi host.** Collector chỉ thực thi truy vấn đọc (SELECT) trên các bảng ở yêu cầu 2. Việc cài đặt không được thay đổi cấu hình hệ thống, cấu hình network / firewall, không cài thêm phần mềm nào ngoài osquery (và thành phần collector của chính task này), không khởi động lại dịch vụ nào khác trên host. Dev lập checklist kiểm chứng việc này — chụp lại trạng thái trước và sau khi cài (danh sách dịch vụ / package hệ thống ngoài osquery, cấu hình network) — và đưa checklist đã điền vào bằng chứng của AC-3.

9. **Loại trừ dữ liệu nhạy cảm.** Chỉ thu thập đúng 5 bảng ở yêu cầu 2 và chỉ các trường entity cần. Cụ thể loại trừ: biến môi trường của tiến trình; nội dung dòng lệnh (command line) nếu có chứa hoặc có thể chứa mật khẩu / token — nếu entity Process cần trường này thì phải có cơ chế lọc bỏ giá trị nhạy cảm trước khi gửi và mô tả cơ chế đó trong tài liệu bàn giao; nội dung file trên host; lịch sử lệnh của người dùng; mọi mật khẩu, token, API key, khóa riêng, cookie. Danh sách loại trừ cuối cùng Dev đã áp dụng phải ghi rõ trong file result.

10. **Tài liệu cài agent trong 5 bước.** Viết tài liệu ngắn, đúng 5 bước đánh số, để một người chưa từng cài có thể cài collector lên một server Linux mới và thấy host đó xuất hiện trong inventory. Mỗi bước ghi lệnh hoặc thao tác cụ thể và kết quả mong đợi của bước đó, gồm bước kiểm tra cuối (xác nhận host đã xuất hiện trong dữ liệu backend). Tài liệu không chứa secret thật — chỗ cần giá trị nhạy cảm thì ghi tên biến cấu hình.

## 6. Ràng buộc kỹ thuật

- Collector chỉ đọc (read-only) theo yêu cầu 8 ở Mục 5 — đây là ràng buộc cứng, vi phạm là không đạt AC-3 và AC-6 bất kể các phần khác có chạy
- Không thay đổi kiến trúc đã chốt ở TASK-S0-001 và không thay đổi data model đã bàn giao ở TASK-S0-002; cần thay đổi thì ghi vào Mục 7 / Mục 9 của file result và chờ quyết định
- Endpoint ingest và collector giao tiếp theo cơ chế bảo mật mà kiến trúc TASK-S0-001 quy định; không hardcode secret trong code, file cấu hình mẫu hay tài liệu — chỉ ghi tên biến cấu hình, giá trị thật do môi trường cung cấp
- Không thu thập dữ liệu ngoài phạm vi loại trừ ở yêu cầu 9, Mục 5
- Môi trường kiểm thử: server Linux thật, server lab hoặc Docker giả lập đều được chấp nhận cho PoC này, với điều kiện khai báo trung thực loại môi trường trong file result. Kết quả trên môi trường giả lập không được mô tả như kết quả trên server thật
- Collector phải ghi log đủ để kiểm chứng khi nghiệm thu: thời điểm thu thập, batch đã gửi thành công / thất bại, lần retry, dữ liệu đang chờ trong hàng đợi. Log không được chứa secret hoặc dữ liệu đã loại trừ ở yêu cầu 9
- Tần suất thu thập không quét liên tục gây tải lên host thử nghiệm; chu kỳ cụ thể đặt trong cấu hình theo yêu cầu 3, Mục 5

## 7. Dữ liệu vào — ra

### Đầu vào

- Kết quả truy vấn osquery trên từng server thử nghiệm từ 5 bảng: `system_info`, `os_version`, `packages`, `listening_ports`, `processes`
- Cấu hình collector: địa chỉ endpoint ingest, chu kỳ thu thập / gửi batch, tham số retry và hàng đợi cục bộ — truyền qua file cấu hình hoặc biến môi trường, không hardcode
- Data model 4 entity Host, Package, Port, Process và quy tắc các trường `source`, `first_seen`, `last_seen`, `confidence` từ TASK-S0-002

### Đầu ra

- Collector chạy được trên từng server thử nghiệm, gửi batch về backend theo chu kỳ đã cấu hình
- API ingest endpoint hoạt động trên backend, kèm tài liệu endpoint theo yêu cầu 4, Mục 5
- Bản ghi inventory trong database thuộc đúng 4 entity Host, Package, Port, Process, truy vấn lại được để đối chiếu số lượng và nội dung theo từng host
- Tài liệu cài agent 5 bước theo yêu cầu 10, Mục 5
- File result `RESULT-TASK-S0-003.md` theo Phụ lục

Cấu trúc một batch gửi về endpoint có dạng khái quát dưới đây — đây là khung minh họa để hai phía (collector và endpoint) thống nhất cách hiểu, tên trường chi tiết cuối cùng phải khớp data model TASK-S0-002 và được ghi trong tài liệu endpoint bàn giao:

```json
{
  "host": { "hostname": "<hostname>", "os_name": "<ten he dieu hanh>", "os_version": "<version>" },
  "collected_at": "<thoi diem thu thap, ISO 8601>",
  "packages": [{ "name": "<ten package>", "version": "<version>" }],
  "listening_ports": [{ "port": 0, "protocol": "<tcp/udp>", "address": "<dia chi lang nghe>" }],
  "processes": [{ "pid": 0, "name": "<ten tien trinh>" }]
}
```

## 8. Acceptance Criteria (AC)

Mỗi AC dưới đây được nghiệm thu Đạt / Chưa đạt dựa trên bằng chứng trong file result. Không có bằng chứng thì AC đó tính là chưa đạt.

- [ ] AC-1: Tối thiểu 3 server thử nghiệm xuất hiện trong inventory ở backend, mỗi server có đủ: hostname, hệ điều hành kèm version, và danh sách package kèm version của từng package. Bằng chứng: kết quả truy vấn dữ liệu backend (hoặc output API) liệt kê từng host kèm số lượng package của host đó.
- [ ] AC-2: Tắt agent (hoặc ngắt kết nối của collector tới backend) trong 10 phút rồi bật lại: dữ liệu thu thập trong thời gian mất kết nối không bị mất, được gửi bổ sung về backend sau khi khôi phục, và `last_seen` của các host liên quan cập nhật đúng theo lần thu thập sau khi bật lại. Bằng chứng: log collector trong khoảng mất kết nối và sau khi khôi phục, kèm kết quả truy vấn đối chiếu trước / sau.
- [ ] AC-3: Không có thay đổi nào trên các server thử nghiệm ngoài việc cài osquery agent và thành phần collector của task này — không đổi cấu hình hệ thống, network / firewall, không cài thêm phần mềm khác, không khởi động lại dịch vụ khác. Bằng chứng: checklist kiểm chứng trước / sau khi cài đã điền đầy đủ cho từng server thử nghiệm.
- [ ] AC-4: Tài liệu cài agent gồm đúng 5 bước, và một lượt cài mới làm theo tài liệu từ đầu đến cuối (trên server hoặc môi trường giả lập chưa từng cài) đưa được host đó vào inventory mà không cần hỏi thêm Dev. Bằng chứng: ghi lại lượt chạy thử tài liệu — môi trường đã dùng, kết quả từng bước, host mới xuất hiện trong dữ liệu backend.
- [ ] AC-5: Dữ liệu lưu đúng 4 entity Host, Package, Port, Process của data model TASK-S0-002, đủ 4 trường `source`, `first_seen`, `last_seen`, `confidence` trên các bản ghi; gửi lại cùng một batch hoặc thu thập lại cùng một host không tạo bản ghi trùng, và `first_seen` không đổi trong khi `last_seen` được cập nhật. Bằng chứng: kết quả truy vấn mẫu một host qua hai lần thu thập liên tiếp, đối chiếu số bản ghi và hai trường thời gian.
- [ ] AC-6: Collector chứng minh được tính chỉ đọc và đúng phạm vi thu thập: chỉ truy vấn 5 bảng được phép ở Mục 5, có danh sách loại trừ dữ liệu nhạy cảm đã áp dụng, và payload gửi về backend không chứa mật khẩu, token, biến môi trường hay nội dung file. Bằng chứng: cấu hình / danh sách truy vấn của collector kèm một payload mẫu thực tế đã gửi (đã che giá trị nhạy cảm nếu có) để Team Lead đối chiếu.

## 9. Definition of Done

Task chỉ được coi là xong khi tất cả các mục sau đều đạt:

- [ ] Đủ 100% AC ở Mục 8 đạt, mỗi AC có bằng chứng cụ thể trong file result
- [ ] Có bằng chứng kiểm thử đính kèm trong file result: log, output truy vấn / API thật của lần làm task này, không dùng output tự chế
- [ ] Không phá vỡ sản phẩm đã PASS của TASK-S0-001 và TASK-S0-002 (kiến trúc, repo, data model giữ nguyên trừ thay đổi đã được Team Lead duyệt)
- [ ] Đã nộp file result `RESULT-TASK-S0-003.md` đúng quy chuẩn ở Phụ lục, khai trạng thái trung thực
- [ ] Mọi môi trường giả lập đã dùng đều được khai báo rõ là giả lập trong file result

## 10. File / thành phần cần bàn giao

- Code collector (osquery agent config / extension và thành phần thu thập, hàng đợi cục bộ, gửi batch) nằm trong repo của TASK-S0-001, ghi rõ đường dẫn trong file result
- API ingest endpoint trên backend, kèm tài liệu endpoint: method, đường dẫn, cấu trúc request / response, mã lỗi, cơ chế batching và retry
- File cấu hình mẫu của collector (không chứa secret thật, chỉ tên biến) và mô tả các tham số cấu hình
- Tài liệu cài agent lên server mới trong 5 bước, kèm checklist kiểm chứng không thay đổi host dùng cho AC-3
- File result `RESULT-TASK-S0-003.md` theo Phụ lục dưới đây

---

## Phụ lục — Quy chuẩn file result (bản rút gọn cho Dev)

> Nộp một file `RESULT-TASK-S0-003.md` theo Quy chuẩn file result v1.0. Đủ 10 mục theo template, giữ nguyên thứ tự. Trạng thái chỉ dùng `DONE`, `PARTIAL`, `BLOCKED`, `FAILED` đúng định nghĩa trong quy chuẩn. Từng acceptance criterion phải đối chiếu với bằng chứng cụ thể; không có bằng chứng thì không tính là đạt. Khai đầy đủ file đã thay đổi, cách chạy lại, test kèm output thật, phần chưa làm, giả định và điểm nghẽn. Không để secret trong file. Rework thì nộp lại cùng file, tăng result version và ghi rõ đã sửa gì.

Các quy định cốt lõi Dev phải nắm trước khi bắt đầu:

- Tên file và định danh: file result đặt tên `RESULT-<Task ID>.md` — với task này là `RESULT-TASK-S0-003.md`. Task ID copy nguyên văn `TASK-S0-003`, không viết tắt, không đổi. Ngày nộp ghi dạng `YYYY-MM-DD HH:mm` kèm múi giờ, ví dụ `2026-10-24 09:30 +07:00`.
- Một task file chỉ sinh một file result. Việc phát sinh ngoài phạm vi ghi vào Mục 8 của file result và chờ Team Lead ra task mới, không tự làm.
- Chỉ dùng đúng 4 trạng thái, viết hoa: `DONE` (mọi AC đều đạt và có bằng chứng), `PARTIAL` (một phần đạt, phần còn lại chưa làm hoặc chưa đạt), `BLOCKED` (không tiếp tục được vì thiếu thông tin, quyền truy cập hoặc quyết định — phải ghi rõ nghẽn ở đâu, đã thử gì, cần ai quyết định điều gì), `FAILED` (đã làm nhưng kết quả sai, hỏng hoặc phải làm lại từ đầu). Cấm khai `DONE` khi còn bất kỳ AC nào chưa đạt, chưa kiểm chứng được, hoặc còn việc chưa làm ảnh hưởng tới AC đó — trường hợp này khai `PARTIAL`.
- Đầu file result là bảng thông tin gồm: Task ID, Result version (v1, nộp lại sau rework thì tăng lên v2, v3... trong cùng một file), Trạng thái, Spec version đã làm theo (SRS v1.0), Dev agent, Ngày nộp, Thời gian thực hiện.
- Template 10 mục bắt buộc, giữ nguyên tên và thứ tự. Mục nào không áp dụng thì ghi rõ `Không áp dụng — <lý do>`, không xóa mục, không để trống:

  1. Tóm tắt kết quả
  2. Đối chiếu acceptance criteria
  3. Công việc đã làm
  4. Files đã thay đổi
  5. Cách chạy và kiểm chứng
  6. Test và kết quả test
  7. Vấn đề gặp phải và quyết định tự xử lý
  8. Chưa làm, giới hạn và nợ kỹ thuật
  9. Điểm nghẽn và việc cần quyết định
  10. Đề xuất bước tiếp theo và tự kiểm tra

- Mục 2 là mục quan trọng nhất: liệt kê đủ từng AC của task này (AC-1 đến AC-6), đúng thứ tự, không gộp, không bỏ AC chưa đạt. Cột "Đạt?" chỉ dùng `Đạt` / `Chưa đạt` / `Chưa kiểm chứng`; cột "Bằng chứng" phải trỏ tới thứ kiểm tra được (test case ở Mục 6, output thật, file ở Mục 4, ảnh chụp). Viết "đã kiểm tra OK" tính như không có bằng chứng.
- Mục 6 ghi test đã chạy thật: lệnh hoặc cách test, kết quả Pass / Fail và trích output chính. Test fail thì vẫn ghi fail và giải thích ở Mục 7, không bỏ khỏi bảng. Không test gì cả thì ghi thẳng "Chưa test" và trạng thái không được là `DONE`.
- Những điều cấm: tự mở rộng phạm vi; khẳng định không có bằng chứng ("đã test kỹ", "chạy ổn"); che giấu lỗi, test fail hoặc phần chưa làm; để lộ mật khẩu, token, API key, khóa riêng hay dữ liệu nhạy cảm thật (chỉ ghi tên biến); sửa việc của task khác; thay đổi ngược nội dung bản result trước mà không ghi vào Mục 7.
- Nghiệm thu: Team Lead đọc file result theo 5 bước (định danh → trạng thái và tóm tắt → đối chiếu AC → bằng chứng ở Mục 4, 5, 6 → giả định, phần chưa làm và điểm nghẽn ở Mục 7, 8, 9) và ra một trong ba quyết định: ACCEPT, REWORK (tối đa 3 vòng; Dev nộp lại cùng file result, tăng result version, chỉ sửa đúng điểm Team Lead ghi), hoặc đưa lên khách hàng quyết định đối với điểm nghẽn thuộc về phạm vi, ưu tiên, quyền truy cập hoặc bảo mật.
- Spec thay đổi giữa chừng: trường "Spec version đã làm theo" ghi đúng phiên bản Dev đã nhận — đó là căn cứ nghiệm thu duy nhất cho lần nộp đó. Dev không tự đổi hướng theo spec mới; ghi điểm khác biệt vào Mục 7, hoàn thành theo task file đã nhận hoặc khai `BLOCKED` nếu hai bản mâu thuẫn, và chờ Team Lead ra task file cập nhật.
