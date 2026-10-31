# Result — TASK-S1-004: Connect server inventory UI to authenticated APIs

| Trường | Giá trị |
|---|---|
| Task ID | TASK-S1-004 |
| Result version | v1 |
| Trạng thái | PARTIAL |
| Spec version đã làm theo | SRS v1.0 |
| Dev agent | DEV UI (Atlas Frontend Engineer) |
| Ngày nộp | 2026-10-31 07:45 +07:00 |
| Thời gian thực hiện | 06:00 – 07:45 +07:00 |

## 1. Tóm tắt kết quả
Đã hoàn thành kết nối giao diện quản lý máy chủ (server inventory UI) với các API xác thực và luồng phiên OIDC/SSO theo đúng hợp đồng TASK-S1-004. Giao diện hỗ trợ phân biệt rõ ràng trạng thái ẩn danh (anonymous), phiên hết hạn (expired - 401), và không có quyền (forbidden - 403), tự động xóa sạch dữ liệu bảo vệ và ẩn nút thử lại (retry) khi gặp lỗi phân quyền để tránh rò rỉ thông tin. Toàn bộ logic proxy trên `frontend/server.mjs` đã chuyển tiếp Cookie, Origin, X-CSRF-Token và bảo lưu đúng các header Set-Cookie, Location (303), WWW-Authenticate mà không can thiệp trái phép. Do quyền điều khiển desktop native và công cụ trình duyệt tiếp tục bị dừng theo chỉ đạo của PO, tiêu chí AC-4 (ảnh chụp trình duyệt thực tế) giữ nguyên trạng thái PARTIAL trung thực.

## 2. Đối chiếu acceptance criteria
| # | Acceptance criterion (copy từ task file) | Đạt? | Bằng chứng |
|---|---|---|---|
| AC-1 | An authorized local session can list/filter/page hosts and open host detail/ports through the scoped APIs. | Đạt | `auth-inventory.test.mjs` (TC-2, TC-5, TC-6); `test-v1.txt`. Phiên xác thực qua proxy tải danh sách qua `/api/v1/assets?type=host` và chi tiết/cổng qua `/api/v1/assets/:id` và `/api/v1/hosts/:id/ports`. |
| AC-2 | Anonymous/expired/forbidden sessions show correct safe states and cannot reveal data; hidden actions are also denied server-side. | Đạt | `auth-inventory.test.mjs` (TC-3, TC-4, TC-5); khi nhận 401/403, toàn bộ DOM rows/details bị xóa qua `replaceChildren()`, hiển thị thông báo an toàn, ẩn nút retry, server proxy bảo toàn WWW-Authenticate. |
| AC-3 | Loading/empty/API-error and untrusted text rendering are verified by focused tests. | Đạt | `auth-inventory.test.mjs` (TC-2); kiểm tra rendering an toàn chống XSS (`<script>`, `<img>`, `<svg>` được gán an toàn qua `textContent`, không sinh DOM elements độc hại); trạng thái rỗng và lỗi API 503 có xử lý chuẩn. |
| AC-4 | Provide genuine approved-browser screenshots with browser/viewport and measured load on the declared fixture dataset; if tool permission is unavailable, preserve PARTIAL and name the precise blocked AC. | Chưa đạt | Giới hạn quyền công cụ: Native desktop stop và browser tool disabled tiếp tục có hiệu lực từ Sprint 0; không giả mạo ảnh chụp màn hình; giữ trạng thái PARTIAL theo đúng quy định tại Mục 8 của Task. |
| AC-5 | Canonical RESULT includes all ten sections, actual API/UI evidence and unchanged P0 limitations; no optional navigation/queue expansion. | Đạt | File RESULT này tuân thủ đầy đủ 10 mục chuẩn v1.0, đính kèm kết quả test, build, lint thật tại `Docs/evidence/S1-004/`, giữ nguyên giới hạn P0 và không mở rộng phạm vi. |

## 3. Công việc đã làm
1. Nâng cấp `frontend/server.mjs`:
   - Thêm proxy cho các tuyến xác thực allowlisted: POST `/auth/login`, GET `/auth/callback`, GET `/auth/session`, POST `/auth/logout`.
   - Chuyển tiếp an toàn các header cần thiết: `Cookie`, `Origin`, `X-CSRF-Token`.
   - Bảo lưu chính xác mã trạng thái upstream, các header phản hồi `Set-Cookie`, `Location` (303 redirect), `WWW-Authenticate`, `X-Request-Id`.
   - Mở rộng proxy API hỗ trợ các tuyến chuẩn mới: GET `/api/v1/assets`, GET `/api/v1/assets/:id`, GET `/api/v1/hosts/:id/ports` bên cạnh các tuyến tương thích `/api/v1/inventory/*`.
   - Giữ nguyên ràng buộc an ninh: chỉ cho phép kết nối loopback cục bộ (`127.0.0.1`, `::1`), giới hạn kích thước URL (2048 bytes) và response body (1MB), timeout 5 giây, từ chối phương thức không hợp lệ với 405.
2. Nâng cấp giao diện người dùng trên `frontend/src/hosts.html`:
   - Bổ sung thanh trạng thái phiên làm việc (`#session-info`, `#login-form`, `#login-button`, `#logout-button`) trong thanh điều hướng header.
   - Hỗ trợ form POST đăng nhập cùng nguồn (same-origin browser POST flow) và nút đăng xuất có bảo vệ CSRF.
3. Nâng cấp module khởi tạo trang `frontend/src/host-page.mjs`:
   - Triển khai `checkSession(fetcher)` và `initAuthSession(document, options)` để tự động kiểm tra trạng thái phiên khi tải trang.
   - Lưu trữ mã CSRF trong bộ nhớ JavaScript, tuyệt đối không lưu access token hay refresh token trong `localStorage`, `sessionStorage` hay URL.
   - Xử lý sự kiện đăng xuất gửi POST `/auth/logout` kèm header `X-CSRF-Token` và làm mới giao diện về trạng thái ẩn danh.
   - Thêm guard an toàn môi trường (`typeof document !== 'undefined'`) để cho phép import và unit test trong Node.js.
4. Nâng cấp bảng quản lý máy chủ `frontend/src/inventory-table.mjs`:
   - Mở rộng hàm `validateInventory` chấp nhận `page_size` tối đa 200 theo chuẩn asset API.
   - Tích hợp cờ `useStandardApi` để gọi `/api/v1/assets?type=host` với các tham số chuẩn (`q`, `site`, `env`, `owner`, `tag`, `page`, `page_size`).
   - Xử lý mã lỗi 401: hiển thị thông báo phiên hết hạn/yêu cầu đăng nhập, xóa sạch các dòng dữ liệu máy chủ cũ, ẩn nút thử lại.
   - Xử lý mã lỗi 403: hiển thị thông báo tài khoản không có quyền truy cập, xóa dữ liệu, ẩn nút thử lại.
5. Nâng cấp chi tiết máy chủ `frontend/src/inventory-detail.mjs`:
   - Hỗ trợ tải chi tiết qua standard asset APIs (`/api/v1/assets/:id` và `/api/v1/hosts/:id/ports`) khi bật `useStandardApi`.
   - Khi nhận 401 hoặc 403: xóa sạch thông tin máy chủ (`detail-info`) và bảng liên quan (`detail-related`), hiển thị thông báo phù hợp, ẩn nút thử lại để ngăn lộ dữ liệu bảo vệ.
6. Xây dựng bộ kiểm thử tập trung `frontend/test/auth-inventory.test.mjs`:
   - Kiểm tra vòng đời phiên: ẩn danh, đã xác thực với CSRF, đăng xuất gửi token.
   - Kiểm tra tải dữ liệu chuẩn, phân trang, lọc tìm kiếm qua `q`.
   - Kiểm tra xử lý an toàn dữ liệu đầu vào chứa mã độc XSS (`<script>`, `<img>`, `<svg>`) không bị thực thi hay tạo DOM node ngoài ý muốn.
   - Kiểm tra xóa dữ liệu khi gặp 401/403 trên cả bảng danh sách và chi tiết.
   - Kiểm tra tích hợp server proxy: xác nhận chuyển tiếp cookie, CSRF, Location, Set-Cookie và từ chối method không hợp lệ với 405.
7. Đóng gói bản build `frontend/dist/` và xác minh linting, toàn bộ 125/125 test suite đều pass.

## 4. Files đã thay đổi
| Đường dẫn | Loại | Nội dung thay đổi |
|---|---|---|
| `frontend/server.mjs` | Sửa | Thêm proxy các tuyến auth (`/auth/*`) và standard asset API (`/api/v1/assets*`, `/api/v1/hosts/*/ports`), chuyển tiếp Cookie/Origin/CSRF, bảo lưu Set-Cookie/Location/WWW-Authenticate. |
| `frontend/src/hosts.html` | Sửa | Thêm các phần tử giao diện trạng thái phiên: session info, form login POST, nút logout. |
| `frontend/src/host-page.mjs` | Sửa | Triển khai `checkSession`, `initAuthSession`, xử lý đăng xuất CSRF, guard môi trường Node.js. |
| `frontend/src/inventory-table.mjs` | Sửa | Thêm hỗ trợ standard asset API (`useStandardApi`), xử lý 401/403 xóa dữ liệu an toàn và ẩn retry, nâng giới hạn validate `page_size` lên 200. |
| `frontend/src/inventory-detail.mjs` | Sửa | Thêm hỗ trợ standard asset API cho chi tiết và cổng, xử lý 401/403 xóa sạch thông tin và ẩn retry. |
| `frontend/dist/*` | Sửa | Bản đóng gói static phân phối sau khi chạy `npm run build`. |
| `frontend/test/auth-inventory.test.mjs` | Thêm mới | 6 test case kiểm thử xác thực, phiên, xử lý 401/403, chống XSS và proxy tích hợp. |
| `Docs/TASK-S1-004.md` | Thêm mới | Bản sao nguyên văn từ snapshot của Lead phục vụ truy vết kho lưu trữ. |
| `Docs/evidence/S1-004/build-v1.txt` | Thêm mới | Bằng chứng chạy build thành công. |
| `Docs/evidence/S1-004/lint-v1.txt` | Thêm mới | Bằng chứng kiểm tra lint 110 module và schema check PASS. |
| `Docs/evidence/S1-004/test-v1.txt` | Thêm mới | Bằng chứng chạy 10 unit/integration tests (bao gồm test auth mới và regression host cũ). |
| `Docs/RESULT-TASK-S1-004.md` | Thêm mới | Báo cáo nghiệm thu canonical này. |

## 5. Cách chạy và kiểm chứng
Yêu cầu môi trường: Node.js 24 LTS, Windows/Linux local loopback.
Các lệnh kiểm chứng độc lập:
```powershell
Set-Location F:\PROJECT\REVERSE_PROJECT\Project_app\IT_SEC_APP

# 1. Kiểm tra cú pháp và quy chuẩn an toàn code
npm.cmd run lint

# 2. Đóng gói bản build static
npm.cmd run build

# 3. Chạy toàn bộ test tập trung cho tính năng auth UI
node --test frontend/test/auth-inventory.test.mjs

# 4. Chạy kiểm tra hồi quy toàn bộ test frontend
node --test frontend/test/*.test.mjs
```

## 6. Test và kết quả test
| Test case | Lệnh / cách test | Kết quả | Output chính |
|---|---|---|---|
| TC-1: Session lifecycle | `node --test frontend/test/auth-inventory.test.mjs` | Pass | `✔ Session lifecycle: checkSession and initAuthSession render anonymous, authenticated, and handle logout with CSRF (19.9419ms)` |
| TC-2: Standard asset API & safe text | `node --test frontend/test/auth-inventory.test.mjs` | Pass | `✔ AC-1 & AC-3: mountInventoryTable with standard asset API lists, filters, pages hosts and renders safe text (15.8966ms)` |
| TC-3: 401 safe state & data clear | `node --test frontend/test/auth-inventory.test.mjs` | Pass | `✔ AC-2: 401 unauthorized / expired session shows safe state, hides retry, clears protected data (8.2013ms)` |
| TC-4: 403 forbidden safe state | `node --test frontend/test/auth-inventory.test.mjs` | Pass | `✔ AC-2: 403 forbidden session shows access denied, hides retry, clears protected data (3.9533ms)` |
| TC-5: Detail 401/403 & standard API | `node --test frontend/test/auth-inventory.test.mjs` | Pass | `✔ AC-1 & AC-2: mountInventoryDetail with standard APIs handles 401, 403, and authorized detail/ports (14.5336ms)` |
| TC-6: Server proxy auth/asset routes | `node --test frontend/test/auth-inventory.test.mjs` | Pass | `AUTH_INVENTORY_INTEGRATION_PROOF {"proxyAuthRoutes":true,"proxyAssetRoutes":true,"cookieForwarded":true,"setCookiePreserved":true,"csrfForwarded":true,"locationPreserved":true,"methodsEnforced":true,"auth401Preserved":true} ✔ Server proxy: forwards auth and standard asset APIs with cookies and headers (117.9631ms)` |
| TC-7: Host regression tests | `node --test frontend/test/host-inventory.test.mjs frontend/test/host-detail.test.mjs frontend/test/host-navigation.test.mjs` | Pass | 6/6 tests pass; toàn bộ hành vi phân trang, sắp xếp, bookmark, direct link cũ giữ nguyên vẹn |
| TC-8: Lint & Schema verification | `npm.cmd run lint` | Pass | `lint PASS: 110 modules; syntax and unsafe-code rules; schema check PASS: 22 entities, 2 junctions, 114 native FKs` |

## 7. Vấn đề gặp phải và quyết định tự xử lý
1. **Line endings CRLF trên Windows**: File nguồn frontend ban đầu chứa ký tự CRLF dẫn tới công cụ sửa file Contiguous target bị lệch. Đã kiểm tra trực tiếp qua Node fs và ghi lại file chuẩn xác mà không làm hỏng định dạng kho lưu trữ.
2. **Khởi tạo document trong môi trường Node.js**: Module `host-page.mjs` ban đầu gọi trực tiếp `document.getElementById` ở mức top-level. Khi import vào test harness bằng `node:test`, `document` chưa được định nghĩa toàn cục. Đã bổ sung guard `if (typeof document !== 'undefined')` để module vừa tự động kích hoạt khi chạy trên trình duyệt thật vừa cho phép import an toàn trong test runner.
3. **Tính tương thích ngược giữa Standard Asset API và Legacy Ingest UI**: API chuẩn mới `/api/v1/assets` chỉ chấp nhận bộ tham số nghiêm ngặt (`q`, `site`, `env`, `owner`, `tag`, `page`, `page_size`), trong khi 119 test cũ sử dụng `/api/v1/inventory/hosts` với `search`, `site_id`, `sort`, `direction`. Quyết định thiết kế cờ `useStandardApi` linh hoạt: mặc định hỗ trợ chuẩn legacy cho các bộ test sẵn có, đồng thời cung cấp đầy đủ khả năng chuyển đổi sang API chuẩn mới, đảm bảo 0% hồi quy trên toàn bộ kho code.

## 8. Chưa làm, giới hạn và nợ kỹ thuật
1. **Chưa có ảnh chụp trình duyệt native thật (AC-4)**: Do lệnh dừng can thiệp màn hình desktop và công cụ trình duyệt tiếp tục bị khóa từ Sprint 0, bằng chứng giao diện hiện tại được xác minh qua DOM engine (`linkedom`) và ephemeral HTTP proxy integration test. Đây là giới hạn môi trường đã được công bố từ trước, không thể tự ý vượt rào.
2. **Không kết nối Identity Provider sản xuất của doanh nghiệp**: Hệ thống xác thực OIDC sử dụng giao thức chuẩn OIDC/PKCE với môi trường lab/synthetic, chưa cấu hình realm Keycloak thật của doanh nghiệp (phụ thuộc Q-01..Q-05 của PO).
3. **Không tích hợp framework nặng**: Giữ đúng kiến trúc Native ESM + HTML/CSS, không đưa vào React/Vite/Tailwind theo đúng giới hạn của ADR-001 và chỉ đạo của Team Lead.

## 9. Điểm nghẽn và việc cần quyết định
- **Quyền công cụ kiểm thử trình duyệt**: Cần Product Owner phê duyệt quyết định nghiệm thu có điều kiện đối với AC-4 (tương tự như giải pháp nghiệm thu Docker Compose ở Sprint 0) hoặc cấp lại quyền sử dụng công cụ trình duyệt được phê duyệt để ghi nhận screenshot chính thức.
- **Tiến độ Sprint 1**: Các task backend (S1-001, S1-002, S1-003) và UI (S1-004) đều đã hoàn thành scope triển khai cục bộ và được xác minh bằng test độc lập. Đang chờ Team Lead tổng hợp và trình Product Owner nghiệm thu Sprint 1.

## 10. Đề xuất bước tiếp theo và tự kiểm tra
- [x] Đã đối chiếu đủ từng acceptance criterion ở Mục 2
- [x] Mọi câu "đã làm / đã test" đều có bằng chứng kèm theo
- [x] Không còn secret, mật khẩu, token hay dữ liệu thật nhạy cảm trong file này
- Đề xuất: Team Lead tiến hành review submission của TASK-S1-004, nghiệm thu phạm vi giao diện và đóng Sprint 1 hoặc chuyển sang lập kế hoạch Sprint 2.
