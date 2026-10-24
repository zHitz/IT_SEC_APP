# Mẫu file giao task cho DEV AI Agent

Tài liệu chuẩn dùng cho dự án IT Asset & Security. Mỗi task có 2 file đi theo cặp: file **TASK** do Team Lead (Muse) viết, và file **RESULT** do DEV AI Agent trả lại. Khách hàng chỉ làm một việc: chuyển file TASK cho DEV, rồi chuyển file RESULT nhận được về cho Muse review.

## Cách dùng trong 4 bước

1. Muse viết file TASK theo Phần A, đặt trạng thái `TODO`.
2. Khách hàng gửi nguyên file đó cho DEV AI Agent, không sửa nội dung ở giữa.
3. DEV làm xong, trả lại 1 file RESULT theo Phần B, cùng mã task.
4. Muse đọc RESULT, đối chiếu từng Acceptance Criteria, kết luận `PASS` hoặc `REWORK` kèm lý do. Nếu `REWORK`, DEV sửa và gửi RESULT phiên bản mới, không viết lại từ đầu.

Quy tắc bất biến: 1 TASK = 1 RESULT. DEV không tự gộp task, không tự chia task, không tự thay đổi phạm vi. Chỗ nào spec chưa rõ, DEV ghi vào mục Câu hỏi / Lệch spec trong RESULT thay vì tự đoán.

## Quy ước mã task và tên file

| Loại file | Tên file | Ví dụ |
|---|---|---|
| File giao task | `TASK-xxx-[ten-ngan].md` | `TASK-001-discovery-osquery-host.md` |
| File kết quả | `RESULT-xxx-[ten-ngan].md` | `RESULT-001-discovery-osquery-host.md` |
| Bản sửa lại | Thêm hậu tố phiên bản | `RESULT-001-discovery-osquery-host-v2.md` |

Mã `xxx` tăng dần, không tái sử dụng. `[ten-ngan]` viết thường, không dấu, nối bằng dấu gạch ngang, tối đa 5 từ. Mã task phải xuất hiện ở dòng đầu tiên của cả hai file để Muse ghép cặp tự động.

---

## Phần A — Mẫu file TASK (Muse điền, DEV chỉ đọc)

DEV copy nguyên khối dưới đây làm khung khi nhận task. Các mục đánh dấu * là bắt buộc, thiếu mục nào thì task chưa sẵn sàng để giao.

```markdown
# TASK-xxx: [Tên task ngắn gọn, dạng động từ + đối tượng]

## 1. Thông tin chung *
- Mã task: TASK-xxx
- Dự án: IT Asset & Security
- Sprint / Phase:
- Độ ưu tiên: P0 / P1 / P2
- Người giao (Team Lead): Muse
- Người duyệt cuối (Khách hàng):
- Ngày giao:
- Hạn hoàn thành:
- Trạng thái: TODO

## 2. Mục tiêu *
Một đoạn tối đa 5 câu: task này giải quyết vấn đề gì, xong thì
người dùng / hệ thống làm được gì mà trước đó chưa làm được.
Viết bằng ngôn ngữ kết quả, không viết bằng ngôn ngữ kỹ thuật.

## 3. Tài liệu liên quan *
- SRS: [số mục, ví dụ FR-01, US-03]
- Tài liệu khác: [tên file / mục cụ thể]
- Task phụ thuộc: [TASK-xxx phải PASS trước, nếu có]

## 4. Phạm vi *
### Làm (In scope)
- [Việc 1]
- [Việc 2]

### Không làm (Out of scope)
- [Việc tưởng liên quan nhưng để task khác / phase sau]

## 5. Yêu cầu chi tiết *
1. [Yêu cầu 1 — viết kiểm chứng được, tránh từ mơ hồ như "nhanh", "tốt"]
2. [Yêu cầu 2]
3. [Yêu cầu 3]

## 6. Ràng buộc kỹ thuật
- Công nghệ / thư viện bắt buộc hoặc cấm:
- Chuẩn dữ liệu / API phải tuân theo:
- Giới hạn hiệu năng, bảo mật, tương thích:
- Môi trường chạy / kiểm thử:

## 7. Dữ liệu vào — ra
- Đầu vào: [nguồn dữ liệu, định dạng, ví dụ mẫu nếu có]
- Đầu ra: [màn hình / API / file / bảng dữ liệu DEV phải tạo ra]

## 8. Acceptance Criteria (AC) *
Đánh số AC-1, AC-2... Mỗi AC là một câu kiểm chứng được
đúng / sai. Muse sẽ PASS / FAIL theo đúng danh sách này.
- [ ] AC-1:
- [ ] AC-2:
- [ ] AC-3:

## 9. Definition of Done *
Task chỉ được coi là xong khi tất cả mục sau đều đạt:
- [ ] Đủ 100% AC ở mục 8 đạt
- [ ] Có bằng chứng kiểm thử đính kèm trong RESULT
- [ ] Không phá vỡ chức năng đã PASS ở task trước
- [ ] Đã nộp file RESULT đúng mẫu Phần B

## 10. File / thành phần cần bàn giao
- [Code / module / endpoint / màn hình cụ thể]
- [Tài liệu đi kèm nếu có]
```

---

## Phần B — Mẫu file RESULT (DEV điền và trả lại)

DEV không được sửa cấu trúc mẫu này, chỉ điền nội dung. Mục nào không áp dụng thì ghi rõ `Không áp dụng — [lý do]`, không được xóa mục hoặc để trống.

```markdown
# RESULT-xxx: [Tên task, giữ nguyên như file TASK]

## 1. Thông tin chung *
- Mã task: TASK-xxx
- Phiên bản RESULT: v1 / v2 / v3
- Ngày nộp:
- Trạng thái tự đánh giá: DONE / PARTIAL / BLOCKED

## 2. Tóm tắt đã làm *
Tối đa 10 dòng: đã làm được gì so với mục tiêu ở mục 2 của
file TASK. Chỉ viết việc đã hoàn thành và kiểm chứng được,
không viết kế hoạch hay ý định.

## 3. Cách làm
- Hướng tiếp cận đã chọn, và lý do chọn hướng đó:
- Quyết định kỹ thuật quan trọng (nếu tự quyết, phải nêu rõ):
- Thư viện / công cụ đã dùng thêm so với ràng buộc ở TASK:

## 4. File và thành phần đã thay đổi *
| File / thành phần | Loại thay đổi | Mô tả ngắn |
|---|---|---|
| [đường dẫn / tên] | Tạo mới / Sửa / Xóa | [1 dòng] |

## 5. Hướng dẫn chạy và kiểm thử *
1. [Lệnh / bước chạy]
2. [Lệnh / bước kiểm thử]
3. [Điều kiện môi trường cần có, nếu có]

## 6. Kết quả kiểm thử và bằng chứng *
| Trường hợp kiểm thử | Kết quả mong đợi | Kết quả thực tế | Đạt? |
|---|---|---|---|
| [TC-1] | | | Có / Không |

Đính kèm hoặc dán vào đây: log, ảnh chụp màn hình, output mẫu.
Không có bằng chứng thì mục này coi như chưa làm.

## 7. Đối chiếu Acceptance Criteria *
Copy nguyên danh sách AC từ file TASK, tick và ghi bằng chứng:
- [x] AC-1: Đạt — bằng chứng: [mục / log / ảnh nào chứng minh]
- [ ] AC-2: Chưa đạt — lý do: [ghi rõ]

## 8. Vấn đề gặp phải và lệch spec
- Vấn đề đã gặp và cách đã xử lý:
- Điểm nào làm khác spec, và vì sao: [không có thì ghi "Không có"]
- Giả định DEV đã tự đặt ra khi spec chưa rõ: [liệt kê hết]

## 9. Việc còn lại / chưa làm
- [Việc chưa xong, thuộc phạm vi task này]
- [Việc phát sinh ngoài phạm vi, đề xuất tách task mới]

## 10. Đề xuất cho Team Lead
- Đề xuất kỹ thuật, rủi ro, hoặc thứ tự task tiếp theo (nếu có):
```

Ba lỗi khiến RESULT bị trả lại ngay, không cần đọc tiếp: thiếu mục 7 đối chiếu AC, mục 6 không có bằng chứng, hoặc mục 8 không khai báo điểm lệch spec mà Muse phát hiện ra khi đối chiếu.

---

## Phần C — Trạng thái task và vòng review

| Trạng thái | Ý nghĩa | Ai chuyển trạng thái |
|---|---|---|
| `TODO` | Đã viết xong, chờ giao | Muse |
| `IN PROGRESS` | DEV đã nhận và đang làm | Khách hàng báo lại |
| `IN REVIEW` | Đã có RESULT, chờ Muse đối chiếu | Khách hàng gửi RESULT |
| `PASS` | Đủ AC và bằng chứng, đóng task | Muse |
| `REWORK` | Chưa đạt, kèm danh sách mục phải sửa | Muse |
| `BLOCKED` | Kẹt vì thiếu thông tin / phụ thuộc | DEV khai trong RESULT |

Quy tắc vòng lặp: một task được `REWORK` tối đa 3 vòng. Quá 3 vòng vẫn chưa `PASS`, Muse dừng vòng lặp và báo lại khách hàng kèm nguyên nhân gốc và phương án khác, để khách hàng quyết định — DEV không tự kéo dài thêm.

Khi `REWORK`, Muse chỉ liệt kê các AC chưa đạt và bằng chứng còn thiếu. DEV sửa đúng các mục đó và nộp RESULT phiên bản tiếp theo, giữ nguyên các mục đã đạt.

## Ví dụ điền mẫu ngắn

TASK rút gọn:

> **TASK-001: Thu thập thông tin host qua osquery**
>
> Mục tiêu: hệ thống tự lấy được danh sách phần mềm và phiên bản đang chạy trên 1 host mẫu, để làm nền cho phân tích CVE.
>
> Acceptance Criteria:
>
> - AC-1: Chạy trên host mẫu, trả về đủ tên phần mềm và phiên bản, không thiếu trường nào.
> - AC-2: Host mất kết nối thì ghi log lỗi rõ ràng, không làm sập tiến trình thu thập.
> - AC-3: Kết quả lưu đúng cấu trúc dữ liệu đã quy định trong SRS.

RESULT rút gọn tương ứng:

> **RESULT-001 — mục 7 đối chiếu AC:**
>
> - AC-1: Đạt — bằng chứng: bảng kết quả kiểm thử TC-1 ở mục 6, output mẫu đính kèm.
> - AC-2: Đạt — bằng chứng: log lỗi khi ngắt kết nối ở mục 6.
> - AC-3: Chưa đạt — lý do: thiếu 1 trường dữ liệu, đã ghi ở mục 9, chờ Team Lead xác nhận có cần bổ sung ngay hay tách task mới.

Chỉ cần nhìn mục 7 này, Muse biết ngay task đạt hay chưa, còn thiếu gì, và quyết định tiếp theo là gì — đó là lý do mẫu RESULT luôn đối chiếu theo AC thay vì kể lại quá trình làm việc.
