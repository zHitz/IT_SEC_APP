# Result — TASK-S1-004: Connect server inventory UI to authenticated APIs

| Trường | Giá trị |
|---|---|
| Task ID | TASK-S1-004 |
| Result version | v2 |
| Trạng thái | PARTIAL |
| Spec version đã làm theo | SRS v1.0 |
| Dev agent | DEV UI (Atlas Frontend Engineer) |
| Ngày nộp | 2026-10-31 08:35 +07:00 |
| Thời gian thực hiện | 06:00 – 08:35 +07:00 |

## 1. Tóm tắt kết quả
Đã hoàn thành đợt Rework Round 1 theo quyết định Review 33 của Team Lead, giải quyết dứt điểm hai lỗi tích hợp `LEAD-S1-004-01` và `LEAD-S1-004-02`:
1. **Kết nối hoàn chỉnh luồng cấu thành trang (Page Composition) với Standard Asset APIs (`LEAD-S1-004-01`)**: Module cấu thành trang `frontend/src/host-page.mjs` (`mountHostPage`), thanh điều hướng `frontend/src/host-navigation.mjs`, bảng chi tiết `inventory-detail.mjs` và bảng danh sách `inventory-table.mjs` đã được kết nối đồng bộ tới các endpoint chuẩn (`/api/v1/assets?type=host`, detail `/api/v1/assets/:id`, ports `/api/v1/hosts/:id/ports`) sử dụng database UUIDs. Các panel phụ kế thừa (`sitePicker`, `unassigned`, `portRoute`, `packageRoute`) tiếp tục được bảo toàn tuyến tương thích.
2. **Thiết lập ranh giới hủy phiên tập trung (`LEAD-S1-004-02`)**: Tạo kênh đồng bộ trạng thái phiên qua custom event `atlas:session-change` và hàm hủy `clearProtected()` / `invalidate()` trên toàn bộ các tầng UI. Khi xảy ra đăng xuất (logout), phiên hết hạn (`expiresAt` timer hoặc 401), toàn bộ DOM rows của bảng máy chủ và bảng chi tiết bị xóa ngay lập tức (`replaceChildren()`), bộ đếm `generation`/`version` tăng lên và `AbortController` hủy yêu cầu mạng đang chờ, đảm bảo phản hồi mạng bị hoãn (deferred in-flight responses) không thể điền lại dữ liệu bảo vệ vào bảng. Lỗi đăng xuất (non-200) được xử lý an toàn: không tự ý giả định phiên đã kết thúc và giữ nguyên nút thao tác để người dùng thử lại.
3. **Bổ sung kiểm thử tích hợp thực tế với PostgreSQL, OIDC JWKS, JWT ký số và Proxy**: Bổ sung kiểm thử tích hợp hoàn chỉnh với database PostgreSQL 17.5 WASM (PGlite), mock server JWKS phát hành token RS256 có chữ ký số (Viewer và Service Owner), backend thật và frontend loopback proxy. Toàn bộ 9/9 test auth mới và 128/128 test trong toàn bộ repository đều PASS (0% hồi quy).
4. **Giới hạn bằng chứng**: Giữ nguyên trạng thái PARTIAL trung thực cho tiêu chí AC-4 do lệnh dừng can thiệp native desktop và công cụ trình duyệt tiếp tục có hiệu lực từ PO.

## 2. Đối chiếu acceptance criteria
| # | Acceptance criterion (copy từ task file) | Đạt? | Bằng chứng |
|---|---|---|---|
| AC-1 | An authorized local session can list/filter/page hosts and open host detail/ports through the scoped APIs. | Đạt | `auth-inventory.test.mjs` (TC-2, TC-5, TC-6, TC-7, TC-9); `test-v2.txt`. Cấu thành trang `mountHostPage` thực tế gọi `/api/v1/assets?type=host` để lấy danh sách máy chủ, mở chi tiết qua `/api/v1/assets/:id` và danh sách cổng qua `/api/v1/hosts/:id/ports` sử dụng database UUIDs. Đã xác minh tích hợp end-to-end qua proxy cục bộ với phiên có chữ ký số OIDC thật. |
| AC-2 | Anonymous/expired/forbidden sessions show correct safe states and cannot reveal data; hidden actions are also denied server-side. | Đạt | `auth-inventory.test.mjs` (TC-3, TC-4, TC-8, TC-9); khi đăng xuất hoặc gặp 401/403/hết hạn, ranh giới hủy phiên xóa ngay lập tức các dòng DOM trong danh sách và chi tiết, hiển thị thông báo an toàn, ẩn nút retry, hủy các request in-flight và vô hiệu hóa generation để ngăn phản hồi hoãn điền lại dữ liệu. Thất bại khi đăng xuất (500) không tự ý báo Anonymous. |
| AC-3 | Loading/empty/API-error and untrusted text rendering are verified by focused tests. | Đạt | `auth-inventory.test.mjs` (TC-2, TC-7, TC-8, TC-9); kiểm tra an toàn text chống XSS (gán qua `textContent`, không sinh DOM elements độc hại); phân biệt rạch ròi 401 (Authentication required), 403 (Access forbidden) và 503/network error (Inventory unavailable với nút retry). |
| AC-4 | Provide genuine approved-browser screenshots with browser/viewport and measured load on the declared fixture dataset; if tool permission is unavailable, preserve PARTIAL and name the precise blocked AC. | Chưa đạt | Giới hạn quyền công cụ: Quyền can thiệp native desktop và công cụ trình duyệt bị dừng từ Sprint 0 và chưa được PO cấp mới. Giữ nguyên trạng thái PARTIAL trung thực, không giả lập bằng chứng trình duyệt hay vượt rào. |
| AC-5 | Canonical RESULT includes all ten sections, actual API/UI evidence and unchanged P0 limitations; no optional navigation/queue expansion. | Đạt | Báo cáo đầy đủ 10 mục chuẩn v1.0, đính kèm kết quả test, build, lint thật tại `Docs/evidence/S1-004/`, giữ nguyên giới hạn P0 và ranh giới Sprint 1; không mở rộng phạm vi ngoài nhiệm vụ được giao. |

## 3. Công việc đã làm
1. **Sửa lỗi LEAD-S1-004-01 (Tích hợp thực tế Page Composition với Standard Asset APIs)**:
   - Trong `frontend/src/host-navigation.mjs`:
     - Nhận tham số `useStandardApi` và truyền tiếp xuống `mountInventoryDetail(document, { ..., useStandardApi, ... })`.
     - Xuất các phương thức `clear()` và `invalidate()` để đồng bộ ranh giới hủy phiên từ trang cấp cao xuống bảng và chi tiết.
   - Trong `frontend/src/inventory-detail.mjs`:
     - Nhận tham số `useStandardApi` và truyền tiếp tới `mountInventoryTable(document, { ..., useStandardApi })`.
     - Khi `useStandardApi` bật, tải thông tin máy chủ qua `/api/v1/assets/${id}`, danh sách gói qua `/api/v1/assets/${id}?page=${page}&page_size=25` và danh sách cổng qua `/api/v1/hosts/${id}/ports?page=${page}&page_size=25`.
     - Bổ sung ánh xạ `host_id: selected.id` cho từng gói phần mềm trả về từ endpoint asset lồng nhau để thỏa mãn schema kiểm tra của `validateInventory`.
   - Trong `frontend/src/host-page.mjs`:
     - Bổ sung hàm xuất `mountHostPage(document, { fetcher, navigation, useStandardApi = true })` làm cổng tích hợp chuẩn cho trang `hosts.html`.
     - Kết nối tự động sự kiện thay đổi phiên `onSessionChange` từ `initAuthSession` tới `navUi.invalidate()`.
     - Khi chạy trong trình duyệt thật (`typeof document !== 'undefined'`), tự động kích hoạt `mountHostPage(document, { useStandardApi: true })`.

2. **Sửa lỗi LEAD-S1-004-02 (Ranh giới hủy phiên tập trung và xử lý lỗi đăng xuất)**:
   - Trong `frontend/src/host-page.mjs`:
     - Bổ sung `clearProtectedViews()` để xóa ngay lập tức các phần tử DOM nhạy cảm (`inventory-rows`, `detail-info`, `detail-related`, trạng thái lỗi) khi phiên chuyển về unauthenticated.
     - Phát sự kiện DOM chuẩn `atlas:session-change` trên `document` để các component con hủy request và tăng version.
     - Cấu hình timer tự động kích hoạt khi phiên có trường `expiresAt` để hủy phiên đúng hạn.
     - Nút đăng xuất (`logoutButton`): gửi POST `/auth/logout` kèm `X-CSRF-Token`. Chỉ khi backend trả về phản hồi thành công (`res.ok`) mới chuyển UI về Anonymous; nếu thất bại (mã lỗi 500 hoặc mất mạng), giữ nguyên phiên làm việc, kích hoạt lại nút bấm và thông báo "Logout failed. Session still active." để tránh đánh lừa người dùng.
   - Trong `frontend/src/inventory-table.mjs` và `inventory-detail.mjs`:
     - Triển khai hàm `clearProtected()` lắng nghe sự kiện `atlas:session-change`.
     - Khi hủy phiên: tăng biến đếm `generation++` / `version++`, gọi `active?.abort()`, làm rỗng các dòng DOM bằng `replaceChildren()`.
     - Trong hàm `load()`: nếu generation thay đổi trong lúc chờ mạng (kể cả khi phản hồi mạng đến trễ), hàm lập tức thoát (`if (version !== generation) return;`), ngăn chặn tuyệt đối việc dữ liệu cũ/hoãn điền đè lên giao diện đã đăng xuất.

3. **Mở rộng bộ kiểm thử tập trung `frontend/test/auth-inventory.test.mjs`**:
   - Thêm TC-7: Kiểm tra cấu thành trang `mountHostPage` thực tế gọi `/api/v1/assets?type=host`, mở chi tiết database UUID và bảo toàn các panel phụ legacy.
   - Thêm TC-8: Kiểm tra ranh giới hủy phiên khi đăng xuất, kiểm tra phản hồi mạng bị hoãn không điền lại dữ liệu sau khi đăng xuất, và kiểm tra xử lý lỗi khi đăng xuất thất bại.
   - Thêm TC-9: Kiểm tra tích hợp đầy đủ end-to-end giữa PostgreSQL WASM, OIDC JWKS, token ký số RS256, backend app và frontend proxy (xác nhận Viewer tải được dữ liệu thật qua proxy, Service Owner bị chặn 403, anonymous bị chặn 401).

4. **Kiểm tra hồi quy toàn diện**:
   - Chạy `npm run lint` đạt 110 modules và 114 native FKs.
   - Chạy `npm run build` hoàn tất đóng gói native ESM không lỗi.
   - Chạy `npm test` toàn bộ repository: 128/128 tests PASS (bao gồm 9 test auth mới và 119 test hệ thống có sẵn).

## 4. Files đã thay đổi
| Đường dẫn | Loại | Nội dung thay đổi |
|---|---|---|
| `frontend/src/host-navigation.mjs` | Sửa | Truyền `useStandardApi` xuống `mountInventoryDetail`, xuất phương thức `clear()`/`invalidate()`. |
| `frontend/src/host-page.mjs` | Sửa | Xuất `mountHostPage`, tích hợp `onSessionChange` với navigation, ranh giới xóa DOM `clearProtectedViews()`, xử lý timer `expiresAt`, bắt lỗi thất bại khi logout. |
| `frontend/src/inventory-detail.mjs` | Sửa | Bổ sung `clearProtected()`, lắng nghe `atlas:session-change`, gán `host_id` cho gói lồng nhau trong standard asset detail. |
| `frontend/src/inventory-table.mjs` | Sửa | Bổ sung `clearProtected()`, lắng nghe `atlas:session-change`, bảo vệ generation chống hoãn phản hồi mạng. |
| `frontend/test/auth-inventory.test.mjs` | Sửa | Bổ sung TC-7, TC-8, TC-9 kiểm thử cấu thành trang, ranh giới hủy phiên, phản hồi hoãn và tích hợp PostgreSQL/JWKS/Proxy. |
| `Docs/evidence/S1-004/test-v2.txt` | Thêm mới | Bằng chứng chạy 9 test auth tập trung PASS (3.16s). |
| `Docs/evidence/S1-004/lint-v2.txt` | Thêm mới | Bằng chứng lint 110 modules và schema PASS. |
| `Docs/evidence/S1-004/build-v2.txt` | Thêm mới | Bằng chứng build native ESM PASS. |
| `Docs/RESULT-TASK-S1-004.md` | Sửa | Cập nhật báo cáo nghiệm thu version v2 ghi nhận kết quả Rework Round 1. |

## 5. Cách chạy và kiểm chứng
Yêu cầu môi trường: Node.js 24 LTS, Windows/Linux local loopback.
Các lệnh kiểm chứng độc lập:
```powershell
Set-Location F:\PROJECT\REVERSE_PROJECT\Project_app\IT_SEC_APP

# 1. Kiểm tra cú pháp và quy chuẩn an toàn code
npm.cmd run lint

# 2. Đóng gói bản build static
npm.cmd run build

# 3. Chạy toàn bộ test tập trung cho tính năng auth UI (bao gồm tích hợp PG/JWKS/Proxy)
node --test frontend/test/auth-inventory.test.mjs

# 4. Chạy kiểm tra hồi quy toàn bộ repository (128 tests)
npm.cmd test
```

## 6. Test và kết quả test
| Test case | Lệnh / cách test | Kết quả | Output chính |
|---|---|---|---|
| TC-1: Session lifecycle | `node --test frontend/test/auth-inventory.test.mjs` | Pass | `✔ Session lifecycle: checkSession and initAuthSession render anonymous, authenticated, and handle logout with CSRF` |
| TC-2: Standard asset API & safe text | `node --test frontend/test/auth-inventory.test.mjs` | Pass | `✔ AC-1 & AC-3: mountInventoryTable with standard asset API lists, filters, pages hosts and renders safe text` |
| TC-3: 401 safe state & data clear | `node --test frontend/test/auth-inventory.test.mjs` | Pass | `✔ AC-2: 401 unauthorized / expired session shows safe state, hides retry, clears protected data` |
| TC-4: 403 forbidden safe state | `node --test frontend/test/auth-inventory.test.mjs` | Pass | `✔ AC-2: 403 forbidden session shows access denied, hides retry, clears protected data` |
| TC-5: Detail 401/403 & standard API | `node --test frontend/test/auth-inventory.test.mjs` | Pass | `✔ AC-1 & AC-2: mountInventoryDetail with standard APIs handles 401, 403, and authorized detail/ports` |
| TC-6: Server proxy auth/asset routes | `node --test frontend/test/auth-inventory.test.mjs` | Pass | `AUTH_INVENTORY_INTEGRATION_PROOF {"proxyAuthRoutes":true,"proxyAssetRoutes":true,"cookieForwarded":true,"setCookiePreserved":true,"csrfForwarded":true,"locationPreserved":true,"methodsEnforced":true,"auth401Preserved":true}` |
| TC-7: Page composition standard API | `node --test frontend/test/auth-inventory.test.mjs` | Pass | `✔ AC-1 Page composition: mountHostPage mounts standard asset APIs for list/detail/ports, preserving secondary panels and UUID links (26.0733ms)` |
| TC-8: Session boundary & deferred response | `node --test frontend/test/auth-inventory.test.mjs` | Pass | `✔ AC-2 & C5 Session boundary: logout and expiry immediately clear protected list and detail DOM, prevent deferred responses repopulating, and handle logout failure cleanly (20.6795ms)` |
| TC-9: Live PostgreSQL/JWKS/JWT/Proxy | `node --test frontend/test/auth-inventory.test.mjs` | Pass | `SIGNED_LOCAL_AUTH_UI_PROOF {"livePostgresWasm":true,"jwksIssuer":true,"signedViewerToken":true,"signedServiceOwnerToken":true,"frontendProxyPassThrough":true,"viewer200DbRows":true,"serviceOwner403":true,"anonymous401Bearer":true,"liveDomCompositionRender":true,"sessionInvalidationClear":true} (2336.6078ms)` |
| TC-10: Full test suite (128 tests) | `npm.cmd test` | Pass | `ℹ tests 128, pass 128, fail 0, skipped 0, duration_ms 204592.3856` |
| TC-11: Lint & Schema verification | `npm.cmd run lint` | Pass | `lint PASS: 110 modules; syntax and unsafe-code rules; schema check PASS: 22 entities, 2 junctions, 114 native FKs` |

## 7. Vấn đề gặp phải và quyết định tự xử lý
1. **LEAD-S1-004-01: Cấu thành trang thực tế bị ngắt kết nối với standard asset API**:
   - *Nguyên nhân*: `host-page.mjs` gọi `mountHostNavigation` không truyền cờ kích hoạt, và `host-navigation.mjs` không chuyển tiếp cờ này xuống `mountInventoryDetail`, khiến luồng điều hướng thực tế vẫn gọi tuyến cũ `/api/v1/inventory/hosts`.
   - *Giải pháp*: Thiết kế hàm xuất `mountHostPage` kích hoạt `useStandardApi: true` mặc định cho trang máy chủ; chuyển tiếp xuyên suốt qua `host-navigation.mjs` xuống `mountInventoryDetail` và `mountInventoryTable`; bảo toàn tuyến cũ cho các panel phụ không thuộc phạm vi Sprint 1.
2. **LEAD-S1-004-02: Thiếu ranh giới hủy dữ liệu phiên bảo vệ**:
   - *Nguyên nhân*: Component `initAuthSession` hoạt động độc lập với cây DOM của bảng máy chủ; khi đăng xuất hoặc hết hạn, các dòng dữ liệu máy chủ cũ vẫn tồn tại trong DOM nếu trang không reload; các request mạng đang chạy dở có thể điền lại dữ liệu sau khi đăng xuất.
   - *Giải pháp*: Xây dựng ranh giới hủy phiên hai lớp: (a) Lớp DOM trực tiếp `clearProtectedViews()` xóa ngay lập tức mọi hàng bảng và chi tiết; (b) Lớp trạng thái qua sự kiện `atlas:session-change` tăng generation và gọi `AbortController.abort()`, loại bỏ mọi phản hồi mạng đến trễ. Khi đăng xuất gặp lỗi HTTP 500, không tự ý chuyển UI sang Anonymous mà giữ nguyên trạng thái phiên và cho phép thử lại.
3. **Lỗi kiểm tra tính hợp lệ của gói phần mềm lồng nhau trong standard asset detail**:
   - *Nguyên nhân*: Endpoint `/api/v1/assets/:id` trả về mảng `packages` không có cột `host_id` (do đã nằm trong đối tượng máy chủ cha), khiến hàm `validateInventory` ném lỗi `INVALID_RESPONSE`.
   - *Giải pháp*: Bổ sung ánh xạ gán `host_id: selected.id` cho từng gói trong `inventory-detail.mjs` trước khi xác thực, đảm bảo tính toàn vẹn của dữ liệu chi tiết máy chủ.
4. **Giữ kết nối HTTP keep-alive trong kiểm thử proxy cục bộ**:
   - *Nguyên nhân*: Node.js `fetch` sử dụng keep-alive khiến `server.close()` bị treo chờ đóng kết nối socket trong teardown của test.
   - *Giải pháp*: Bổ sung gọi `closeAllConnections()` trên instance server trước khi gọi `close()`, giúp teardown kiểm thử hoàn tất ngay lập tức (toàn bộ 9 test chỉ mất 3.16 giây).

## 8. Chưa làm, giới hạn và nợ kỹ thuật
1. **Chưa có ảnh chụp trình duyệt native thật (AC-4)**: Do lệnh dừng can thiệp màn hình desktop và công cụ trình duyệt tiếp tục bị khóa từ Sprint 0, bằng chứng giao diện hiện tại được xác minh qua DOM engine (`linkedom`) và ephemeral HTTP proxy integration test. Đây là giới hạn môi trường đã được công bố từ trước, không thể tự ý vượt rào.
2. **Không kết nối Identity Provider sản xuất của doanh nghiệp**: Hệ thống xác thực OIDC sử dụng giao thức chuẩn OIDC/PKCE với môi trường lab/synthetic, chưa cấu hình realm Keycloak thật của doanh nghiệp (phụ thuộc Q-01..Q-05 của PO).
3. **Giới hạn PR/CI từ xa**: Kiểm thử hiện tại được thực thi đầy đủ trên môi trường cục bộ; các bước tạo PR và CI từ xa trên GitHub tiếp tục phụ thuộc vào quyền truy cập token từ xa được phê duyệt riêng.

## 9. Điểm nghẽn và việc cần quyết định
- **Quyền công cụ kiểm thử trình duyệt**: Cần Product Owner phê duyệt quyết định nghiệm thu có điều kiện đối với AC-4 (tương tự như giải pháp nghiệm thu Docker Compose ở Sprint 0) hoặc cấp lại quyền sử dụng công cụ trình duyệt được phê duyệt để ghi nhận screenshot chính thức.
- **Quy trình nghiệm thu Sprint 1**: TASK-S1-004 đã hoàn thành toàn bộ mã nguồn, kiểm thử hồi quy 128/128 test, và đã giải quyết trọn vẹn cả hai defect trong Review 33. Chờ Team Lead tiến hành đánh giá lại.

## 10. Đề xuất bước tiếp theo và tự kiểm tra
- [x] Đã đối chiếu đủ từng acceptance criterion ở Mục 2
- [x] Mọi câu "đã làm / đã test" đều có bằng chứng kèm theo (`test-v2.txt`, `lint-v2.txt`, `build-v2.txt`)
- [x] Không còn secret, mật khẩu, token hay dữ liệu thật nhạy cảm trong file này
- [x] Giải quyết đầy đủ 2 defect `LEAD-S1-004-01` và `LEAD-S1-004-02`
- Đề xuất: Team Lead tiến hành nghiệm thu submission v2 của TASK-S1-004.
