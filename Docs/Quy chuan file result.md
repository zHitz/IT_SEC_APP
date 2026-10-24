# Quy chuẩn file result

Chuẩn báo cáo kết quả dành cho Dev AI Agent — phiên bản 1.0

Tài liệu này quy định cách Dev AI Agent phải báo cáo sau khi làm xong một task. Mọi task đều kết thúc bằng đúng một file result theo chuẩn này. Team Lead căn cứ duy nhất vào file result để nghiệm thu, nên file result là bằng chứng của công việc, không phải lời giới thiệu về công việc.

## Phân vai

- **Khách hàng / Product Owner:** quyết định làm cái gì, duyệt kết quả cuối cùng.

- **Team Lead:** ra task file, nhận file result, nghiệm thu, quyết định bước tiếp theo.

- **Dev AI Agent:** nhận một task file, thực hiện, trả lại một file result theo chuẩn này.

## 1. Không có file result đúng chuẩn thì task chưa xong

Code đã viết, tính năng đã chạy thử, hay lời nhắn "đã xong" đều không thay thế được file result. Task chỉ được tính là hoàn thành khi file result:

- đúng tên, đúng Task ID của task file được giao;
- đủ 10 mục theo template ở Mục 4, đúng thứ tự, không đổi tên mục;
- khai trạng thái trung thực theo định nghĩa ở Mục 3;
- đối chiếu được từng acceptance criterion trong task file với bằng chứng cụ thể.

Thiếu bất kỳ điều nào ở trên, Team Lead trả lại để bổ sung và trạng thái task vẫn là chưa nghiệm thu, kể cả khi phần code đã đạt.

Một task file chỉ sinh một file result. Không gộp nhiều task vào một file result, không tách một task thành nhiều file result, và không nộp file result cho việc không có task file — việc phát sinh phải được ghi ở Mục 8 của file result và chờ Team Lead ra task mới.

## 2. Tên file và định danh phải khớp 1-1 với task file

Tên file result đặt theo công thức: `RESULT-<Task ID>.md`

Ví dụ: task file là `TASK-014.md` thì file result là `RESULT-TASK-014.md`.

Quy tắc định danh:

- Task ID copy nguyên văn từ task file, không tự đặt, không viết tắt, không đổi số.

- Nếu task bị trả lại làm lại (rework), nộp lại cùng một file result, tăng trường `Result version` lên một đơn vị (v1, v2, v3...) và ghi rõ trong Mục 7 lần này đã sửa gì so với lần nộp trước. Không tạo file mới với tên khác.

- Mọi tham chiếu trong file — requirement ID (ví dụ FR-05), user story, endpoint, entity — copy nguyên văn từ spec và task file. Team Lead đối chiếu bằng các mã này, nên một mã gõ sai được tính như một mục chưa làm rõ.

- Ngày giờ nộp ghi theo định dạng `YYYY-MM-DD HH:mm` kèm múi giờ, ví dụ `2026-10-24 09:30 +07:00`.

## 3. Chỉ được dùng 4 trạng thái kết quả

Trạng thái khai ở đầu file quyết định cách Team Lead xử lý tiếp. Chỉ dùng đúng 4 giá trị sau, viết hoa, không tự chế biến thể như "gần xong" hay "xong 90%".

| Trạng thái | Được dùng khi | Team Lead sẽ |
|---|---|---|
| `DONE` | Mọi acceptance criteria đều đạt và có bằng chứng | Nghiệm thu, trình khách hàng duyệt |
| `PARTIAL` | Một phần đạt, phần còn lại chưa làm hoặc chưa đạt | Tách phần còn lại thành task tiếp theo |
| `BLOCKED` | Không thể tiếp tục vì thiếu thông tin, quyền truy cập hoặc quyết định | Giải quyết điểm nghẽn hoặc đưa lên khách hàng quyết định |
| `FAILED` | Đã làm nhưng kết quả sai, hỏng hoặc phải làm lại từ đầu | Đánh giá nguyên nhân, ra task làm lại |

Hai ràng buộc cứng của trạng thái:

- `DONE` bị cấm nếu còn bất kỳ acceptance criterion nào chưa đạt, chưa kiểm chứng được, hoặc còn mục "chưa làm" ảnh hưởng đến criterion đó. Trường hợp này phải khai `PARTIAL`.

- `BLOCKED` phải chỉ rõ bị nghẽn ở đâu, đã thử cách gì, và cần ai quyết định điều gì — ghi ở Mục 9. Khai `BLOCKED` mà không có 3 thông tin này được tính như chưa nộp.

## 4. Template bắt buộc — copy nguyên văn và điền vào

Dev copy toàn bộ khối dưới đây, giữ nguyên tên và thứ tự 10 mục, thay phần trong dấu `<...>` bằng nội dung thật. Mục nào không áp dụng thì ghi rõ `Không áp dụng — <lý do>`, không xóa mục.

```markdown
# Result — <Task ID>: <Tên task copy từ task file>

| Trường | Giá trị |
|---|---|
| Task ID | <TASK-xxx> |
| Result version | v1 |
| Trạng thái | <DONE / PARTIAL / BLOCKED / FAILED> |
| Spec version đã làm theo | <ví dụ: SRS v1.0> |
| Dev agent | <tên / công cụ thực hiện> |
| Ngày nộp | <YYYY-MM-DD HH:mm +07:00> |
| Thời gian thực hiện | <giờ bắt đầu – giờ kết thúc, hoặc tổng thời lượng> |

## 1. Tóm tắt kết quả
<3–5 câu: đã làm được gì, kết quả chính, có đạt mục tiêu của task không.>

## 2. Đối chiếu acceptance criteria
| # | Acceptance criterion (copy từ task file) | Đạt? | Bằng chứng |
|---|---|---|---|
| AC-1 | <...> | Đạt / Chưa đạt / Chưa kiểm chứng | <test, output, file, ảnh chụp — ghi rõ ở mục nào> |

## 3. Công việc đã làm
<Từng việc đã làm theo thứ tự thực hiện, kèm cách làm ngắn gọn.
Việc không làm hoặc làm khác task file thì không ghi ở đây — ghi ở Mục 7 và 8.>

## 4. Files đã thay đổi
| Đường dẫn | Loại | Nội dung thay đổi |
|---|---|---|
| <path/to/file> | Thêm mới / Sửa / Xóa | <thay đổi gì, vì sao> |

## 5. Cách chạy và kiểm chứng
<Điều kiện môi trường, lệnh chạy, các bước để Team Lead hoặc khách hàng
tự chạy lại và thấy đúng kết quả đã báo cáo.>

## 6. Test và kết quả test
| Test case | Lệnh / cách test | Kết quả | Output chính |
|---|---|---|---|
| <TC-1> | <...> | Pass / Fail | <trích output thật, rút gọn nếu dài> |

## 7. Vấn đề gặp phải và quyết định tự xử lý
<Khó khăn, giả định đã tự đặt ra, điểm làm khác task file/spec và lý do.
Nếu nộp lại sau rework: ghi rõ lần này sửa gì so với bản trước. Không có thì ghi "Không có".>

## 8. Chưa làm, giới hạn và nợ kỹ thuật
<Phần chưa làm, giới hạn đã biết, việc phát sinh ngoài scope phát hiện trong lúc làm.
Không có thì ghi "Không có".>

## 9. Điểm nghẽn và việc cần quyết định
<Chỉ bắt buộc khi PARTIAL / BLOCKED / FAILED: nghẽn ở đâu, đã thử gì,
cần Team Lead hoặc khách hàng quyết định điều gì. Nếu DONE thì ghi "Không có".>

## 10. Đề xuất bước tiếp theo và tự kiểm tra
<Đề xuất task tiếp theo nếu có.>
- [ ] Đã đối chiếu đủ từng acceptance criterion ở Mục 2
- [ ] Mọi câu "đã làm / đã test" đều có bằng chứng kèm theo
- [ ] Không còn secret, mật khẩu, token hay dữ liệu thật nhạy cảm trong file này
```

## 5. Cách điền từng mục

### Đầu file và Mục 1 — để Team Lead quyết định trong 1 phút

Phần đầu file và tóm tắt phải đủ để Team Lead biết ngay task xong chưa, có vấn đề gì không, mà chưa cần đọc code. Tóm tắt nêu kết quả trước, cách làm sau; không chép lại nội dung task file vào phần tóm tắt.

### Mục 2 — mục quan trọng nhất, không được điền qua loa

- Liệt kê đủ từng acceptance criterion của task file, đúng thứ tự, không gộp nhiều criterion thành một dòng, không lược bỏ criterion chưa đạt.

- Cột "Đạt?" chỉ dùng 3 giá trị: `Đạt`, `Chưa đạt`, `Chưa kiểm chứng`. "Chưa kiểm chứng" không tính là đạt — nếu criterion quan trọng chưa kiểm chứng được, trạng thái chung không được là `DONE`.

- Cột "Bằng chứng" phải trỏ tới thứ kiểm tra được: test case ở Mục 6, đoạn output thật, đường dẫn file ở Mục 4, hoặc ảnh chụp màn hình đính kèm. Viết "đã kiểm tra OK" ở cột này được tính như không có bằng chứng.

### Mục 3 và 4 — làm gì, đụng vào đâu

- Mục 3 kể công việc theo trình tự đã làm thật, đủ chi tiết để người khác hiểu cách tiếp cận, nhưng không chép code vào đây — code nằm trong file, Mục 3 chỉ giải thích.

- Mục 4 liệt kê mọi file đã thêm, sửa, xóa, kể cả file cấu hình, migration, test và tài liệu. File đã đụng vào mà không khai ở Mục 4, khi bị phát hiện, sẽ làm toàn bộ file result mất độ tin cậy và bị trả lại.

- Nếu task tạo ra sản phẩm bàn giao riêng (báo cáo, file dữ liệu, bản build), ghi rõ tên file và nơi lưu ở Mục 4.

### Mục 5 và 6 — người khác phải chạy lại được

- Mục 5 ghi đủ môi trường, phiên bản công cụ, biến môi trường cần thiết (chỉ ghi tên biến, không ghi giá trị secret) và lệnh chạy, để Team Lead chạy lại mà không phải hỏi thêm.

- Mục 6 ghi test đã chạy thật: lệnh hoặc cách test, kết quả pass/fail và trích output chính. Test fail thì ghi fail và giải thích ở Mục 7 — không được bỏ test fail khỏi bảng.

- Không có test tự động thì ghi rõ cách test thủ công đã làm, từng bước và kết quả quan sát được. Không test gì cả thì ghi thẳng "Chưa test" và trạng thái không được là `DONE`.

### Mục 7, 8, 9 — phần trung thực quyết định độ tin cậy

Ba mục này là nơi dev khai những điều không thuận lợi: giả định tự đặt ra, chỗ làm khác spec, phần chưa làm, điểm nghẽn. Khai đầy đủ ở đây không bị phạt — ngược lại, đó là cơ sở để Team Lead tách task tiếp theo đúng việc. Giấu một giới hạn ở các mục này rồi để Team Lead hoặc khách hàng tự phát hiện mới là lỗi nghiêm trọng, và file result sẽ bị trả lại toàn bộ.

Mọi giả định dev tự đặt ra khi spec chưa rõ phải ghi ở Mục 7 kèm lý do chọn cách đó. Giả định ảnh hưởng đến hành vi sản phẩm, dữ liệu hoặc bảo mật thì không được tự quyết: phải khai `BLOCKED` và chờ quyết định ở Mục 9.

## 6. Bằng chứng tối thiểu theo loại task

Ngoài Mục 2 và Mục 6, mỗi loại task phải có thêm loại bằng chứng riêng sau. Thiếu bằng chứng theo bảng này, Team Lead trả lại trước khi xét nội dung.

| Loại task | Bằng chứng tối thiểu |
|---|---|
| Tính năng / API | Lệnh gọi mẫu kèm response thật; đối chiếu endpoint với spec |
| Giao diện web | Ảnh chụp màn hình ở trạng thái chính; ghi rõ trình duyệt và độ phân giải |
| Sửa lỗi (bug fix) | Cách tái hiện lỗi trước khi sửa; kết quả sau khi sửa theo đúng cách đó |
| Dữ liệu / migration | Số bản ghi trước và sau; lệnh chạy migration; cách hoàn tác nếu có |
| Tích hợp hệ thống ngoài | Log hoặc response thật của lần gọi thành công; cách xử lý khi hệ thống ngoài lỗi |
| Bảo mật / CVE | Version trước và sau; nguồn đối chiếu version bị ảnh hưởng; kết quả quét hoặc kiểm tra lại |
| Tài liệu | Đường dẫn file bàn giao; mục lục hoặc danh sách nội dung đã bao phủ theo task file |

Bằng chứng phải là kết quả thật của lần làm task này. Output mẫu tự chế, số liệu ước lượng, hay ảnh lấy từ nguồn khác đều bị cấm và bị tính như chưa làm. Output dài thì trích phần chính và ghi rõ file log đầy đủ nằm ở đâu, không dán hàng nghìn dòng vào file result.

## 7. Những điều cấm trong file result

- Tự ý mở rộng phạm vi: làm thêm tính năng, sửa thêm module, đổi thêm cấu hình ngoài task file mà không ghi ở Mục 8.

- Viết khẳng định không có bằng chứng, như "đã test kỹ", "chạy ổn", "đúng spec", mà không có Mục 2, Mục 5 hoặc Mục 6 chống lưng.

- Che giấu lỗi, test fail, phần chưa làm, hoặc ghi chúng bằng từ ngữ mơ hồ như "còn vài vấn đề nhỏ".

- Để lộ secret: mật khẩu, token, API key, khóa riêng, cookie, hay dữ liệu thật nhạy cảm của hệ thống và người dùng. Cần nhắc tới thì chỉ ghi tên biến hoặc tên cấu hình.

- Sửa, xóa hoặc làm lại công việc của task khác; phát hiện vấn đề ở phần khác thì ghi ở Mục 8 để Team Lead ra task riêng.

- Thay đổi ngược nội dung đã nộp ở bản result trước mà không ghi vào Mục 7 của bản nộp lại.

- Chép nguyên văn đoạn hội thoại, suy luận nội bộ hoặc log rác vào file result. File chỉ chứa thông tin Team Lead cần để nghiệm thu và khách hàng cần để hiểu kết quả.

## 8. Ví dụ minh họa một đoạn result đạt chuẩn

Ví dụ dưới đây là minh họa cách điền, không phải kết quả thật của dự án. Điểm đạt chuẩn nằm ở cách đối chiếu từng criterion với bằng chứng cụ thể và khai thẳng phần chưa làm.

```markdown
| Trường | Giá trị |
|---|---|
| Task ID | TASK-014 |
| Result version | v1 |
| Trạng thái | PARTIAL |
| Spec version đã làm theo | SRS v1.0 |

## 1. Tóm tắt kết quả
Đã xong phần liệt kê host từ osquery và hiển thị lên trang inventory.
Phần lọc theo site chưa làm kịp nên trạng thái là PARTIAL, chi tiết ở Mục 8.

## 2. Đối chiếu acceptance criteria
| # | Acceptance criterion | Đạt? | Bằng chứng |
|---|---|---|---|
| AC-1 | Hiển thị đủ 150 server kèm hostname, IP, hệ điều hành | Đạt | TC-1 ở Mục 6, output đếm 150 bản ghi |
| AC-2 | Lọc được danh sách theo site | Chưa đạt | Chưa làm — Mục 8 |
| AC-3 | Trang tải xong trong 3 giây với 150 server | Đạt | TC-2 ở Mục 6, đo được 1,8 giây |
```

Các lỗi thường gặp khiến file result bị trả lại ngay:

| Lỗi | Vì sao bị trả lại |
|---|---|
| Khai `DONE` nhưng còn criterion "Chưa đạt" | Trái ràng buộc ở Mục 3 |
| Mục 2 chỉ có một dòng "đạt hết yêu cầu" | Không đối chiếu được từng criterion |
| Mục 6 ghi "đã test" mà không có lệnh và output | Không có bằng chứng kiểm chứng |
| Không khai file cấu hình đã sửa ở Mục 4 | Thiếu dấu vết thay đổi |
| Che phần chưa làm, để Team Lead tự phát hiện | Mất độ tin cậy, phải nộp lại toàn bộ |
| Dán token hoặc mật khẩu vào output mẫu | Vi phạm an toàn, phải thu hồi và nộp lại |

## 9. Tự kiểm tra trước khi nộp và cách Team Lead nghiệm thu

### Checklist của dev trước khi gửi

Trước khi gửi, dev tự rà soát file result theo checklist ở cuối template (Mục 10 trong template) và thêm 4 câu hỏi sau:

- Người chưa từng làm task này đọc Mục 1 và Mục 2 có biết ngay xong chưa, thiếu gì không?

- Mọi việc tuyên bố đã làm có tìm được bằng chứng trong chính file này không?

- Mọi file đã đụng vào có nằm đủ ở Mục 4 không?

- Phần chưa làm, giả định và điểm nghẽn có nằm thẳng ở Mục 7, 8, 9 không, hay đang bị giấu trong câu chữ mơ hồ?

Câu nào trả lời "không" thì sửa file result trước khi gửi, không gửi kèm lời giải thích miệng thay cho việc sửa.

### Team Lead đọc file result theo 5 bước

1. Kiểm tra định danh: tên file, Task ID, spec version và result version có khớp task file không.

2. Đọc trạng thái và Mục 1: trạng thái có hợp lý với phần tóm tắt không.

3. Đối chiếu Mục 2 với acceptance criteria trong task file: đủ từng criterion chưa, criterion nào chưa đạt hoặc chưa kiểm chứng.

4. Kiểm tra bằng chứng ở Mục 4, 5, 6: file thay đổi có khớp công việc đã kể không, cách chạy lại có đủ không, test có output thật không.

5. Đọc Mục 7, 8, 9: giả định có chấp nhận được không, phần chưa làm và điểm nghẽn cần xử lý thế nào.

### Ba quyết định nghiệm thu

- **ACCEPT:** trạng thái `DONE` và bằng chứng đạt. Team Lead trình khách hàng duyệt kết quả.

- **REWORK:** thiếu bằng chứng, criterion chưa đạt, hoặc khai báo chưa trung thực, đầy đủ. Dev nộp lại cùng file result với result version tăng lên, và chỉ sửa đúng các điểm Team Lead ghi trong yêu cầu rework. Một task tối đa 3 vòng rework; quá 3 vòng, Team Lead dừng task, đánh giá lại cách chia task hoặc cách làm, và báo khách hàng trước khi giao tiếp.

- **ĐƯA LÊN KHÁCH HÀNG QUYẾT ĐỊNH:** điểm nghẽn thuộc về phạm vi, ưu tiên, quyền truy cập hoặc một giả định ảnh hưởng đến sản phẩm, dữ liệu, bảo mật. Team Lead tóm tắt vấn đề và các phương án cho khách hàng, không để dev tự quyết thay.

Khách hàng chỉ cần nhận phần tóm tắt do Team Lead trình: task nào đã accept, task nào đang rework vòng mấy, và quyết định nào đang chờ khách hàng. Khách hàng không phải tự đọc toàn bộ file result, trừ khi muốn kiểm tra chi tiết.

## 10. Khi spec được bổ sung hoặc thay đổi giữa chừng

Trong quá trình làm, khách hàng có thể bổ sung spec để hoàn thiện sản phẩm. Khi đó file result xử lý như sau:

- Trường `Spec version đã làm theo` ở đầu file ghi đúng phiên bản spec và phiên bản task file mà dev đã nhận. Đây là căn cứ nghiệm thu duy nhất cho lần nộp đó — dev không bị đánh giá theo spec chưa được giao.

- Nếu spec mới đến trong lúc task đang làm, dev không tự đổi hướng làm theo spec mới. Dev ghi điểm khác biệt phát hiện được vào Mục 7, hoàn thành theo task file đã nhận hoặc khai `BLOCKED` nếu hai bản mâu thuẫn, và chờ Team Lead ra task file cập nhật.

- Nếu Team Lead ra task file cập nhật thay thế task đang làm, file result của task cũ ghi rõ ở Mục 1 là task đã bị thay thế bởi Task ID nào, kèm trạng thái thật của phần đã làm, để không mất dấu vết công việc.

- Phần việc làm theo spec cũ nhưng lệch spec mới không tự sửa trong cùng task. Nó được ghi ở Mục 8, và Team Lead sẽ ra task điều chỉnh riêng nếu cần.

## Phụ lục — bản rút gọn dán kèm cuối mỗi task file

> **Yêu cầu file result:** Nộp một file `RESULT-<Task ID>.md` theo Quy chuẩn file result v1.0. Đủ 10 mục theo template, giữ nguyên thứ tự. Trạng thái chỉ dùng `DONE`, `PARTIAL`, `BLOCKED`, `FAILED` đúng định nghĩa trong quy chuẩn. Từng acceptance criterion phải đối chiếu với bằng chứng cụ thể; không có bằng chứng thì không tính là đạt. Khai đầy đủ file đã thay đổi, cách chạy lại, test kèm output thật, phần chưa làm, giả định và điểm nghẽn. Không để secret trong file. Rework thì nộp lại cùng file, tăng result version và ghi rõ đã sửa gì.
