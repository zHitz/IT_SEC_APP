# Result — TASK-S0-003: PoC osquery collector thu thập inventory từ server thử nghiệm

| Trường | Giá trị |
|---|---|
| Task ID | TASK-S0-003 |
| Result version | v1 |
| Trạng thái | BLOCKED |
| Spec version đã làm theo | SRS v1.0 FR-01; TASK-S0-003; schema S0-002 v2 ACCEPT; Lead mở S0-003 ngày 2026-10-24 22:19 |
| Dev agent | Codex — Dev AI Agent |
| Ngày nộp | 2026-10-25 00:27 +07:00 |
| Thời gian thực hiện | Lượt kiểm tra đầu vào 2026-10-25, chưa code collector |

## 1. Tóm tắt kết quả

Đã nhận mở task và đọc TASK đầy đủ, đối chiếu schema đã ACCEPT. Phát hiện mâu thuẫn trực tiếp AC-5: TASK yêu cầu bốn entity Host/Package/Port/Process, nhưng schema không có Port/Process riêng, chỉ ListeningPort chứa process/pid; TASK §6 cấm tự đổi schema. Cần Lead chốt mapping và cách xử lý process không listen. Không dựng entity mới hoặc khai 3 host/mock là nghiệm thu. Đây là blocker contract mới, không phải chờ repo, SRS hoặc ACCEPT S0-002.

## 2. Đối chiếu acceptance criteria

| AC | Tiêu chí TASK §8 | Đạt? | Bằng chứng |
|---|---|---|---|
| AC-1 | ≥3 Linux host với hostname/OS/version/packages/version trong backend | Chưa đạt | Chưa collector, chưa lab chạy. |
| AC-2 | Offline10 phút, queue sống qua restart, gửi bổ sung và cập nhật last_seen | Chưa đạt | Chưa queue/endpoint, không có log nghiệm thu. |
| AC-3 | Chỉ cài osquery/collector, checklist trước/sau đầy đủ từng host | Chưa kiểm chứng | Chưa cài hoặc thay host nào; không lấy đó làm bằng chứng AC đạt. |
| AC-4 | Fresh install theo đúng5 bước đưa host vào inventory | Chưa đạt | Chưa có hướng dẫn5 bước được chạy thật. |
| AC-5 | Đúng4 entity Host/Package/Port/Process, provenance/idempotency/time | Chưa đạt | B-03-01: schema không có Process/Port, ListeningPort chỉ có process/pid. |
| AC-6 | SELECT đúng5 bảng, exclude secrets, payload thật sạch | Chưa đạt | Chưa collector/query/payload thực tế. |

## 3. Công việc đã làm

Đọc mở task và TASK-S0-003, đối chiếu metadata canonical S0-002, xác minh không tồn tại entity process/port. Kiểm tra môi trường chỉ thấy wsl.exe, không thấy docker/osqueryi trên PATH; chưa khẳng định WSL không có Linux vì chưa enumerate distribution. Không cài software hoặc chạy truy vấn trên host. Tách RESULT này khỏi S0-004.

## 4. Files đã thay đổi

| File | Loại | Nội dung |
|---|---|---|
| Docs/RESULT-TASK-S0-003.md | Thêm | RESULT v1, từng AC chưa đạt, xung đột entity và câu hỏi Lead cần chốt. |

Không có source collector/API/DB thay đổi của S0-003. Source Cloudflare của task riêng không được tính bằng chứng task này. Checkpoint monitor ngoài repo ghi trạng thái để không lặp hỏi.

## 5. Cách chạy và kiểm chứng

Đọc Docs/TASK-S0-003.md §4/§5.2/§5.6/§6/AC-5 đối chiếu backend/db/schema.json entities `listening_port`, `host`, `package`. `process`/`port` không phải key entity; ListeningPort có host_id/container_id/protocol/port/bind_address/process/pid/is_exposed. Common time tên physical first_seen_at/last_seen_at đã rõ; không cần đổi cột.

## 6. Test và kết quả test

Chưa test sản phẩm S0-003 vì chưa code. Kiểm tra đầu vào thật bằng Node đọc schema.json in tên cột, không dữ liệu/secret: processEntity=false; portEntity=false; listeningPortColumns=[host_id,container_id,protocol,port,bind_address,process,pid,is_exposed]. PowerShell Get-Command docker,osqueryi,wsl chỉ trả wsl.exe. Không suy ra3host đã chạy hoặc queue đã pass. CI11/11 của repo trong lượt S0-004 không phải nghiệm thu collector.

## 7. Vấn đề gặp phải và quyết định tự xử lý

V1 bản đầu; không REWORK trước đó. Ưu tiên giữ nguyên schema đã ACCEPT và yêu cầu không đổi schema. Chỉ đề xuất mapping, không coi Process là entity mới hoặc âm thầm bỏ process không listen. Không tự sửa TASK, tên entity hoặc AC. Timefield physical _at là mapping đã có, không coi đó là blocker riêng.

## 8. Chưa làm, giới hạn và nợ kỹ thuật

Chưa collector, endpoint ingest, auth/batching/retry/queue, query allowlist, checklist host và tài liệu5 bước. Chưa3–5serverLinux, không có bằng chứng offline10phút hay payload thực tế. Sau chốt contract sẽ kiểm tra khả năng dựng lab qua môi trường sẵn có; không tự thay đổi host/production hoặc cài WSL distribution để lách scope.

## 9. Điểm nghẽn và việc cần quyết định

**B-03-01 — mâu thuẫn entity ảnh hưởng AC-5.** Đã đối chiếu TASK với schema đã ACCEPT: Host/Package có; Port/Process riêng không có; ListeningPort mang process/pid. Cần Lead chốt AC/mapping: Port→ListeningPort, processes chỉ enrich tên/pid của port, còn process không listen giữ raw evidence hay loại khỏi inventory? Hoặc Lead giao schema change riêng. Dev không tự tạo bảng Process trái contract. Cũng cần Lead xác nhận `packages` là dataset logic cho phép query bảng package Linux tương ứng theo OS khi triển khai; không tự thêm bảng osquery ngoài allowlist literal trong TASK. Gom câu hỏi liên quan trong một lần, không hỏi vụn.

Sau quyết định, dev tiếp tục cùng task ngay, không chờ ACCEPT bản BLOCKED. Môi trường nghiệm thu cần Linux lab3host; Docker/osqueryi chưa có trên PATH, WSL chưa kiểm tra distribution. Không khai đây là quyền truy cập đã bị từ chối hoặc bắt PO cấp host nếu có thể dựng lab phù hợp sau chốt.

## 10. Đề xuất bước tiếp theo và tự kiểm tra

Lead giải quyết B-03-01/mapping dataset; dev implement/query/queue/endpoint theo contract đó và kiểm tra lab. Chỉ nộp v2 với bằng chứng thực thi thật. Không tự ACCEPT/đóng task.

- [x] Đủ10mục và6AC riêng, chưa test ghi rõ.
- [x] Chỉ một RESULT canonical, không sửa task/schema/status.
- [x] Không secret, không claim cài agent/host hoặc mất mạng10phút.
- [x] Nộp file trên đúng task cùng comment BLOCKED, không chỉ lưu local.
