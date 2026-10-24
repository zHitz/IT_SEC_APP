# TASK-S0-001: Dựng repo và CI

## Phần A — TASK (Team Lead điền)

Phần A là phần duy nhất dev được căn cứ để làm. Nếu có điểm chưa rõ, dev ghi vào mục Blockers trong file RESULT và chờ Team Lead trả lời, không tự suy diễn để đổi hướng.

---

## 1. Thông tin chung

| Hạng mục | Nội dung |
|---|---|
| Task ID | TASK-S0-001 |
| Tên task | Dựng repo và CI |
| Dự án | IT Asset & Security Posture |
| Sprint | Sprint 0 — Nền móng |
| Độ ưu tiên | P0 — bắt buộc, chặn các task sau |
| Loại task | Hạ tầng / khởi tạo |
| Người giao | Team Lead |
| Người nhận | Dev AI Agent |
| Tài liệu gốc | SRS v1.0 "Đặc tả IT Asset & Security" |
| Sổ tay áp dụng | Sổ tay Team Lead v1.0 |
| File kết quả phải nộp | RESULT-TASK-S0-001.md |

Task này là task đầu tiên của dự án. Mọi task Sprint 0 còn lại (data model, osquery PoC, Cloudflare PoC) đều dựa trên repo và CI dựng ở task này.

---

## 2. Mục tiêu

Khởi tạo repository, kiến trúc nền và CI skeleton cho dự án IT Asset & Security Posture sao cho:

- Người mới clone repo và chạy được toàn bộ skeleton ở máy local trong dưới 10 phút, chỉ bằng hướng dẫn trong README.
- Mọi commit sau này đều qua một CI tối thiểu gồm lint, unit test skeleton và build, để lỗi cơ bản bị chặn ngay từ đầu.
- Quyết định tech stack được ghi thành văn bản trong ADR-001, có lý do chọn và lý do loại phương án khác, để các task sau không tranh luận lại từ đầu.

Task này không làm nghiệp vụ. Giá trị của nó là một nền sạch, chạy được và kiểm chứng được.

---

## 3. Tài liệu liên quan

Dev phải đọc các tài liệu sau trước khi bắt đầu:

| Tài liệu | Dùng để làm gì |
|---|---|
| SRS v1.0 "Đặc tả IT Asset & Security" | Nắm phạm vi hệ thống, module và ràng buộc toàn dự án |
| Sổ tay Team Lead v1.0, chương 3 | Cấu trúc thư mục chuẩn `it-asset-project/` và quy ước đặt tên |
| Sổ tay Team Lead v1.0, chương về quy trình task | Vòng đời task, số vòng rework tối đa và cách nghiệm thu |
| Phụ lục ở cuối file này | Quy chuẩn rút gọn để viết file RESULT |

Nếu nội dung giữa các tài liệu mâu thuẫn nhau, dev dừng ở điểm mâu thuẫn, ghi vào mục Blockers trong file RESULT và chờ Team Lead chốt. Không tự chọn một bản để làm theo.

---

## 4. Phạm vi

### 4.1. Trong phạm vi (In scope)

- Khởi tạo repository với cấu trúc thư mục theo mục 5.1.
- README hướng dẫn chạy local bằng docker-compose.
- CI pipeline tối thiểu: lint, unit test skeleton, build.
- ADR-001 chốt tech stack cho backend, frontend và cơ sở dữ liệu.
- Cơ chế cấu hình qua biến môi trường, kèm file `.env.example`.
- File `.gitignore` loại trừ file chứa secret, file build và file tạm của hệ điều hành.

### 4.2. Ngoài phạm vi (Out of scope)

- Mọi nghiệp vụ inventory: discovery host, Docker, Kubernetes.
- Mọi nghiệp vụ CVE, matching version và chấm điểm exposure.
- Giao diện chi tiết cho bất kỳ màn hình nghiệp vụ nào.
- Collector osquery, Docker hoặc Kubernetes ở dạng hoạt động thật. Các thư mục collector ở task này chỉ là skeleton rỗng có README mô tả.
- Tích hợp Cloudflare, Traefik, Pomerium, Keycloak ở dạng hoạt động thật.
- Deploy lên môi trường dev, staging hoặc production thật.
- Migration dữ liệu thật và seed dữ liệu nghiệp vụ.

Nếu trong lúc làm phát sinh nhu cầu thuộc nhóm ngoài phạm vi, dev ghi vào mục đề xuất bước tiếp theo trong file RESULT. Không tự làm.

---

## 5. Yêu cầu chi tiết

### 5.1. Cấu trúc repository

Khởi tạo repo theo cấu trúc thư mục `it-asset-project/` trong Sổ tay Team Lead chương 3. Cấu trúc tối thiểu phải có:

```text
it-asset-project/
  backend/            # API backend, có điểm khởi chạy chạy được
  frontend/           # Web frontend, có trang skeleton chạy được
  collectors/         # Nơi chứa collector ở các task sau
    osquery/
    docker/
    k8s/
  deploy/
    docker/           # Dockerfile và docker-compose cho local
  docs/
    adr/              # Nơi chứa ADR-001 và các ADR sau này
  .env.example
  .gitignore
  README.md
```

Mỗi thư mục con phải có một README ngắn hoặc file giữ chỗ giải thích thư mục đó để làm gì. Không để thư mục rỗng không giải thích.

Tên thư mục và tên file tuân theo quy ước trong Sổ tay Team Lead. Không tự đặt quy ước riêng.

### 5.2. Chạy local bằng docker-compose

- Có file docker-compose đặt trong `deploy/docker/`, hoặc ở thư mục gốc nếu Sổ tay quy định khác, dựng được tối thiểu backend, frontend và cơ sở dữ liệu (nếu stack có dùng).
- Một lệnh duy nhất phải dựng được toàn bộ skeleton, ví dụ `docker compose up`.
- Backend phải có một endpoint kiểm tra sức khỏe, ví dụ `/health`, trả về trạng thái hoạt động.
- Frontend phải mở được ở trình duyệt và hiển thị một trang skeleton xác nhận frontend đã chạy. Chưa cần nghiệp vụ và chưa cần thiết kế hoàn chỉnh.
- Toàn bộ quá trình từ lúc clone đến lúc thấy frontend và endpoint `/health` hoạt động phải dưới 10 phút trên máy sạch chỉ có Docker và Git.

### 5.3. README

README ở thư mục gốc phải đủ để người chưa từng biết dự án tự chạy được, gồm tối thiểu:

- Giới thiệu ngắn: dự án là gì, trỏ tới SRS v1.0 để đọc nghiệp vụ.
- Yêu cầu trước khi chạy: phiên bản Docker, Git và công cụ khác nếu có.
- Các bước chạy local theo thứ tự, kèm lệnh chính xác để copy.
- Cách sao chép `.env.example` thành `.env` và những biến bắt buộc phải điền.
- Cách kiểm tra đã chạy thành công: địa chỉ frontend và lệnh gọi endpoint `/health`.
- Cách chạy lint, unit test và build ở máy local.
- Cách dừng và xóa môi trường local.
- Mục xử lý sự cố ngắn cho 2 đến 3 lỗi thường gặp nhất khi chạy lần đầu, ví dụ cổng đã bị chiếm hoặc biến môi trường còn thiếu.

### 5.4. CI pipeline

- CI chạy tự động trên mỗi lần push và trên mỗi pull request hoặc merge request, tùy nền tảng quản lý repo đang dùng.
- CI gồm tối thiểu 3 bước theo thứ tự: lint, unit test skeleton, build.
- Unit test skeleton nghĩa là đã có khung test chạy được và ít nhất một test mẫu cho backend và một test mẫu cho frontend, dù logic còn đơn giản. Khung test phải là khung sẽ dùng tiếp ở các task sau, không phải file giả để CI có việc chạy.
- Build phải tạo được sản phẩm build của backend và frontend, hoặc chạy được lệnh build tương đương nếu stack chưa có bước build riêng.
- Commit đầu tiên push lên repo phải cho CI xanh toàn bộ. Nếu một bước chưa thể xanh vì lý do khách quan, dev không được tắt bước đó; phải ghi rõ lý do vào file RESULT và hạ trạng thái xuống PARTIAL.
- Tên job và tên bước trong CI phải mô tả đúng việc nó làm, ví dụ `lint`, `unit-test`, `build`.

### 5.5. ADR-001 — Quyết định tech stack

Tạo file ADR tại `docs/adr/ADR-001-tech-stack.md`, gồm tối thiểu:

- Bối cảnh: dự án cần gì ở backend, frontend và cơ sở dữ liệu, căn cứ theo SRS v1.0.
- Quyết định: tech stack được chọn cho từng phần — backend, frontend, cơ sở dữ liệu, và cách đóng gói chạy local nếu có liên quan.
- Lý do chọn: từng lý do phải gắn với nhu cầu thật của dự án, ví dụ quy mô khoảng 150 server và 2 cluster Kubernetes cần thu thập, nhu cầu tìm kiếm toàn cục, hoặc khả năng tuyển và duy trì của đội.
- Phương án đã loại: với mỗi phần, liệt kê ít nhất một phương án đã cân nhắc và lý do loại.
- Hệ quả: điểm được, điểm phải đánh đổi và rủi ro còn lại của quyết định này.

Cách xử lý khi viết ADR:

- Nếu SRS v1.0 đã chốt tech stack, ADR ghi lại đúng quyết định đó và dẫn chiếu mục tương ứng trong SRS. Không đề xuất stack khác.
- Nếu SRS v1.0 chưa chốt, ADR trình bày phương án đề xuất và ghi rõ ở đầu file dòng: "Đây là đề xuất, cần Team Lead xác nhận trước khi áp dụng cho các task sau." Trong trường hợp này trạng thái task tối đa là PARTIAL cho tới khi Team Lead xác nhận, trừ khi Team Lead đã xác nhận bằng văn bản trong quá trình làm task.

### 5.6. Secret và cấu hình

- Mọi secret, token, mật khẩu và thông tin kết nối phải đọc từ biến môi trường. Không hard-code bất kỳ giá trị nào trong mã nguồn, Dockerfile, file CI hay file cấu hình được commit.
- Có file `.env.example` liệt kê mọi biến môi trường cần thiết, kèm mô tả ngắn và giá trị mẫu không phải giá trị thật.
- File `.env` thật phải nằm trong `.gitignore`.
- Chuỗi kết nối cơ sở dữ liệu, cổng dịch vụ và địa chỉ dịch vụ cũng đi qua biến môi trường, không ghi cứng trong mã nguồn.

---

## 6. Ràng buộc kỹ thuật

- Tuân thủ SRS v1.0. Task này không được tạo ra quyết định nào mâu thuẫn với SRS.
- Cấu trúc thư mục và quy ước đặt tên tuân theo Sổ tay Team Lead v1.0, chương 3.
- Chỉ dùng công cụ và nền tảng CI sẵn có của repo. Nếu repo chưa có nền tảng CI nào, dev ghi rõ nền tảng đã giả định trong file RESULT.
- Không đưa dữ liệu thật, log thật, token thật hoặc thông tin hạ tầng thật của công ty vào repo, kể cả trong file mẫu và file test.
- Không thêm thư viện hoặc dịch vụ ngoài chỉ để làm đẹp skeleton. Mọi phụ thuộc đưa vào phải phục vụ trực tiếp một yêu cầu trong mục 5.
- Skeleton phải đủ nhẹ để lệnh chạy local ở mục 5.2 đạt giới hạn dưới 10 phút. Không đưa vào các bước tải hoặc build nặng không cần thiết cho giai đoạn này.

---

## 7. Dữ liệu vào — ra

### 7.1. Đầu vào

- SRS v1.0 "Đặc tả IT Asset & Security".
- Sổ tay Team Lead v1.0, đặc biệt chương 3 về cấu trúc repo.
- File task này.
- Quyền truy cập repo đích, do Product Owner hoặc Team Lead cấp. Nếu chưa có quyền, dev báo BLOCKED ngay, không tự tạo repo ở nơi khác thay thế.

### 7.2. Đầu ra

- Repository đã khởi tạo với cấu trúc ở mục 5.1, đã push commit đầu tiên.
- README chạy local hoàn chỉnh theo mục 5.3.
- File cấu hình CI hoạt động theo mục 5.4.
- ADR-001 tại `docs/adr/ADR-001-tech-stack.md`.
- File `.env.example` và `.gitignore` hoàn chỉnh.
- File RESULT-TASK-S0-001.md theo quy chuẩn ở phụ lục.

---

## 8. Acceptance Criteria

Mỗi tiêu chí dưới đây phải được đối chiếu riêng trong file RESULT, kèm bằng chứng cụ thể. Không gộp nhiều tiêu chí thành một dòng nhận xét chung.

- **AC-1 — Chạy local được dưới 10 phút:** Trên máy sạch chỉ có Docker và Git, làm đúng từng bước trong README thì `docker compose up` thành công, frontend mở được và endpoint `/health` của backend trả về trạng thái hoạt động. Tổng thời gian từ lúc clone đến lúc kiểm tra xong dưới 10 phút. Bằng chứng: ghi lại các lệnh đã chạy, thời gian bắt đầu và kết thúc, và kết quả gọi endpoint `/health`.
- **AC-2 — CI xanh trên commit đầu tiên:** Push commit đầu tiên lên repo, CI chạy đủ 3 bước lint, unit test skeleton và build, và cả 3 đều đạt. Bằng chứng: đường dẫn tới lần chạy CI hoặc ảnh chụp kết quả CI, ghi rõ tên các job.
- **AC-3 — ADR-001 đầy đủ:** Tồn tại file `docs/adr/ADR-001-tech-stack.md` có đủ bối cảnh, quyết định cho backend, frontend và cơ sở dữ liệu, lý do chọn, ít nhất một phương án đã loại cho mỗi phần kèm lý do loại, và hệ quả. Nếu là đề xuất chưa được chốt trong SRS thì có dòng ghi rõ cần Team Lead xác nhận.
- **AC-4 — Không có secret hard-code:** Quét toàn bộ repo không thấy token, mật khẩu, khóa bí mật hoặc chuỗi kết nối thật được ghi cứng. Mọi cấu hình nhạy cảm đều đọc từ biến môi trường và đã liệt kê trong `.env.example`. Bằng chứng: ghi rõ công cụ hoặc cách đã dùng để quét và kết quả quét.
- **AC-5 — Cấu trúc đúng chuẩn:** Cây thư mục của repo khớp cấu trúc ở mục 5.1 và quy ước đặt tên trong Sổ tay Team Lead chương 3. Mọi thư mục con đều có README ngắn hoặc file giải thích. Bằng chứng: cây thư mục thực tế của repo tại thời điểm nộp.
- **AC-6 — README đủ để tự chạy:** README có đủ các mục liệt kê ở mục 5.3, các lệnh trong README copy ra chạy được nguyên văn, không phải sửa tay. Bằng chứng: đối chiếu từng mục bắt buộc của mục 5.3 với vị trí tương ứng trong README.

---

## 9. Definition of Done

Task chỉ được coi là xong khi tất cả điều kiện sau cùng đúng:

- [ ] AC-1 đến AC-6 đều đạt và đều có bằng chứng trong file RESULT.
- [ ] Commit đầu tiên đã push và CI đã xanh trên đúng commit đó.
- [ ] Không còn file chứa secret thật, file build hoặc file tạm bị commit nhầm.
- [ ] Không có phần việc ngoài phạm vi ở mục 4.2 lẫn vào kết quả.
- [ ] Mọi giả định đã dùng đều ghi rõ trong file RESULT, đặc biệt giả định về tech stack và nền tảng CI nếu có.
- [ ] File RESULT-TASK-S0-001.md nộp đúng quy chuẩn ở phụ lục, khai trạng thái trung thực.
- [ ] Team Lead đã nghiệm thu và ghi quyết định ACCEPT. Trước khi có quyết định này, dev không tự coi task là đã đóng.

---

## 10. File cần bàn giao

| # | File hoặc sản phẩm | Vị trí |
|---|---|---|
| 1 | Repository đã khởi tạo, đã push commit đầu tiên | Repo đích do Team Lead chỉ định |
| 2 | README chạy local | `README.md` ở thư mục gốc của repo |
| 3 | File docker-compose và Dockerfile liên quan | `deploy/docker/` |
| 4 | File cấu hình CI | Theo quy ước của nền tảng CI đang dùng |
| 5 | ADR-001 | `docs/adr/ADR-001-tech-stack.md` |
| 6 | File mẫu biến môi trường | `.env.example` ở thư mục gốc của repo |
| 7 | File loại trừ khi commit | `.gitignore` ở thư mục gốc của repo |
| 8 | File kết quả | `RESULT-TASK-S0-001.md`, nộp kèm theo task này |

Thiếu bất kỳ file nào trong bảng trên, phần bàn giao được coi là chưa hoàn chỉnh và Team Lead có quyền trả lại mà chưa nghiệm thu nội dung.

---

## Phụ lục — Quy chuẩn file result (bản rút gọn)

Phụ lục này là bản rút gọn để dev viết file RESULT ngay trong task này. Khi có khác biệt giữa phụ lục này và tài liệu "Quy chuẩn file result" đầy đủ, bản đầy đủ là bản có hiệu lực và dev phải báo lại cho Team Lead biết chỗ khác biệt.

### A. Tên file và trạng thái

- Tên file: `RESULT-TASK-S0-001.md`. Một task chỉ có một file result.
- Chỉ dùng một trong bốn trạng thái sau, ghi đúng chính tả:

| Trạng thái | Khi nào dùng |
|---|---|
| DONE | Mọi Acceptance Criteria đều đạt và có bằng chứng |
| PARTIAL | Đã làm được một phần, còn tiêu chí chưa đạt hoặc còn chờ xác nhận |
| BLOCKED | Không làm tiếp được vì thiếu quyền, thiếu thông tin hoặc chờ quyết định |
| FAILED | Đã làm nhưng kết quả không đạt và không cứu được trong task này |

- Cấm khai DONE khi còn bất kỳ Acceptance Criteria nào chưa đạt, chưa kiểm chứng được, hoặc còn giả định về tech stack chưa được Team Lead xác nhận.

### B. Cấu trúc bắt buộc — 10 mục

File RESULT phải có đủ 10 mục sau, theo đúng thứ tự:

1. **Header định danh:** Task ID, tên task, người làm, ngày nộp, phiên bản SRS đã căn cứ, trạng thái.
2. **Tóm tắt:** Làm được gì trong tối đa vài đoạn ngắn, đọc mục này là hiểu kết quả chính.
3. **Đối chiếu Acceptance Criteria:** Bảng đối chiếu từng AC-1 đến AC-6, mỗi tiêu chí một dòng gồm kết quả đạt hay chưa đạt và bằng chứng cụ thể.
4. **Files đã thay đổi:** Liệt kê file đã tạo, sửa hoặc xóa, kèm mô tả ngắn cho từng file.
5. **Cách chạy và kiểm chứng:** Lệnh và các bước để Team Lead tự chạy lại và thấy đúng kết quả đã khai.
6. **Test đã chạy:** Tên test hoặc lệnh kiểm tra, kết quả thực tế và đầu ra thật. Không ghi "đã test, chạy tốt" mà không có đầu ra.
7. **Vấn đề và giả định:** Vấn đề gặp phải, cách đã xử lý, và mọi giả định đã tự dùng.
8. **Phần chưa làm:** Mọi việc trong phạm vi task mà chưa làm xong, ghi rõ ràng, không giấu.
9. **Điểm nghẽn cần quyết định:** Việc cần Team Lead hoặc Product Owner quyết định, ghi rõ cần ai quyết và quyết cái gì.
10. **Đề xuất bước tiếp theo:** Việc nên làm tiếp sau task này, chỉ ở mức đề xuất.

### C. Điều cấm khi viết file RESULT

- Tự mở rộng phạm vi ngoài mục 4 của file task này.
- Khẳng định kết quả mà không có bằng chứng kèm theo.
- Giấu test lỗi, bước CI lỗi hoặc tiêu chí chưa đạt.
- Đưa secret, token, mật khẩu hoặc thông tin hạ tầng thật vào file RESULT.
- Tự thay đổi hướng làm vì cho rằng spec chưa hợp lý. Mọi ý kiến về spec ghi vào mục 9 để Team Lead quyết định.

### D. Nghiệm thu

Team Lead đọc file RESULT theo thứ tự: trạng thái, bảng đối chiếu Acceptance Criteria, bằng chứng test, phần chưa làm và điểm nghẽn. Kết quả nghiệm thu là một trong ba quyết định: ACCEPT, REWORK hoặc đưa lên Product Owner quyết định. Mỗi vòng REWORK phải sửa đúng các điểm Team Lead đã ghi và nộp lại cùng một file RESULT đã cập nhật, tối đa 3 vòng.
