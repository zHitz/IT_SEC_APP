# Result — TASK-S1-004: Connect server inventory UI to authenticated APIs

| Trường | Giá trị |
|---|---|
| Task ID | TASK-S1-004 |
| Result version | v3 |
| Trạng thái | PARTIAL |
| Spec version đã làm theo | SRS v1.0 |
| Dev agent | DEV UI (Atlas Frontend Engineer) |
| Ngày nộp | 2026-10-31 09:15 +07:00 |
| Thời gian thực hiện | 08:35 – 09:15 +07:00 |

## 1. Tóm tắt kết quả
Đã hoàn thành đợt Rework Round 2 theo quyết định Review 36 của Team Lead (`s1-004-r2-9cedef1-actual401-cookie-session`), giải quyết dứt điểm các yêu cầu kỹ thuật:
1. **Kết nối mã lỗi 401 thực tế tới ranh giới hủy phiên tập trung (`LEAD-S1-004-02`)**:
   - Khi bất kỳ yêu cầu mạng nào trong trang gặp mã lỗi HTTP 401 (dù là từ danh sách máy chủ, chi tiết máy chủ, gói phần mềm hay cổng lắng nghe), bộ chặn `pageFetcher` trong `mountHostPage` lập tức gọi `auth.handleUnauthorized()`, xóa ngay lập tức CSRF (`currentCsrf = null`), chuyển trạng thái đăng nhập về `Anonymous`, hiển thị lại form đăng nhập, ẩn nút logout, và kích hoạt `clearProtectedViews()`.
   - Sự kiện DOM `atlas:session-change` và `atlas:unauthorized` được phát đi đồng bộ; các component con lập tức tăng `generation++` / `version++` và gọi `AbortController.abort()`. Phản hồi mạng bị hoãn (delayed earlier response) đến trễ sau 401 bị hủy hoàn toàn (`if (version !== generation) return;`), không để rò rỉ dữ liệu máy chủ nhạy cảm vào DOM.
   - Giữ phân biệt rạch ròi giữa 401 (hủy phiên, chuyển Anonymous, xóa CSRF), 403 (không hủy phiên, giữ CSRF và trạng thái đăng nhập, chỉ hiển thị thông báo Access forbidden trên panel tương ứng) và 503/network error (giữ phiên, hiển thị nút Retry).
2. **Chứng minh luồng xác thực Cookie-Session cục bộ qua Frontend Proxy (Khắc phục khoảng trống bằng chứng AC-1/AC-2/AC-3)**:
   - Thay thế fixture Bearer-only bằng bài kiểm thử tích hợp thực tế toàn diện: Nhà cung cấp OIDC mô phỏng chuẩn PKCE (S256), backend `createApp` gắn module `createSso` và Process-local `createSessionStore`, database PostgreSQL 17.5 WASM (PGlite), và Reverse Proxy `frontend/server.mjs`.
   - Quy trình đăng nhập PKCE cục bộ cấp cookie HttpOnly `atlas_session` hoàn toàn opaque (chuỗi base64url ngẫu nhiên, không chứa token JWT hay khóa bí mật). Frontend proxy chuyển tiếp trơn tru cookie tới backend.
   - Trình duyệt DOM (`linkedom`) tải danh sách máy chủ từ PostgreSQL qua proxy, mở chi tiết và cổng lắng nghe an toàn. Khi bấm nút logout, UI gửi POST `/auth/logout` kèm `X-CSRF-Token` và Origin; backend xác thực CSRF thành công, xóa phiên và thu hồi cookie; các yêu cầu tiếp theo trả về 401 Unauthorized; UI tự động dọn sạch mọi dữ liệu bảo vệ.
   - Xác thực role `Service Owner` bị từ chối truy cập ngay tại ranh giới SSO callback (403 Forbidden) và token Bearer qua proxy nhận 403 với giao diện hiển thị Access forbidden an toàn. Yêu cầu anonymous nhận 401 kèm header `WWW-Authenticate: Bearer`.
3. **Trung thực về bằng chứng và giới hạn**:
   - Bộ test tập trung xác thực UI gồm 10/10 test đều PASS (thời gian thực thi 3.22 giây), được đính kèm tại `Docs/evidence/S1-004/test-v3.txt`.
   - Kết quả kiểm tra cú pháp và quy chuẩn (`npm run lint`): 110 modules PASS tại `Docs/evidence/S1-004/lint-v3.txt`.
   - Kết quả đóng gói (`npm run build`): native ESM PASS tại `Docs/evidence/S1-004/build-v3.txt`.
   - Tiêu chí AC-4 giữ nguyên trạng thái PARTIAL trung thực do lệnh dừng can thiệp native desktop và công cụ trình duyệt tiếp tục có hiệu lực từ PO.

## 2. Đối chiếu acceptance criteria
| # | Acceptance criterion (copy từ task file) | Đạt? | Bằng chứng |
|---|---|---|---|
| AC-1 | An authorized local session can list/filter/page hosts and open host detail/ports through the scoped APIs. | Đạt | `auth-inventory.test.mjs` (TC-1 đến TC-10); `test-v3.txt`. Cấu thành trang `mountHostPage` gọi `/api/v1/assets?type=host` để lấy danh sách máy chủ, mở chi tiết qua `/api/v1/assets/:id` và danh sách cổng qua `/api/v1/hosts/:id/ports` sử dụng database UUIDs. Đã xác minh tích hợp thực tế với cookie phiên HttpOnly `atlas_session` qua proxy loopback tới PostgreSQL WASM. |
| AC-2 | Anonymous/expired/forbidden sessions show correct safe states and cannot reveal data; hidden actions are also denied server-side. | Đạt | `auth-inventory.test.mjs` (TC-3, TC-4, TC-8, TC-9, TC-10); khi gặp 401 thực tế từ bất kỳ view nào, toàn bộ bảng máy chủ, chi tiết, header session và token CSRF đều bị xóa ngay lập tức; phản hồi mạng đến trễ bị vô hiệu hóa; 403 hiển thị Access forbidden nhưng giữ nguyên phiên; đăng xuất bảo vệ bằng CSRF xóa phiên triệt để trên backend. |
| AC-3 | Loading/empty/API-error and untrusted text rendering are verified by focused tests. | Đạt | `auth-inventory.test.mjs` (TC-2, TC-7, TC-8, TC-9, TC-10); hiển thị text an toàn qua `textContent` (không tiêm HTML); phân biệt rõ 401 (Authentication required), 403 (Access forbidden) và 503 (Could not load inventory kèm nút Retry). |
| AC-4 | Provide genuine approved-browser screenshots with browser/viewport and measured load on the declared fixture dataset; if tool permission is unavailable, preserve PARTIAL and name the precise blocked AC. | Chưa đạt | Giới hạn quyền công cụ: Quyền can thiệp native desktop và công cụ trình duyệt bị dừng từ Sprint 0 và chưa được PO cấp mới. Giữ nguyên trạng thái PARTIAL trung thực, không giả lập bằng chứng trình duyệt hay vượt rào. |
| AC-5 | Canonical RESULT includes all ten sections, actual API/UI evidence and unchanged P0 limitations; no optional navigation/queue expansion. | Đạt | Báo cáo đầy đủ 10 mục chuẩn v1.0, đính kèm kết quả test, build, lint thật tại `Docs/evidence/S1-004/test-v3.txt`, giữ nguyên giới hạn P0 và ranh giới Sprint 1; không mở rộng phạm vi ngoài nhiệm vụ được giao. |

## 3. Công việc đã làm
1. **Sửa dứt điểm LEAD-S1-004-02 (Lan truyền mã lỗi 401 thực tế trên toàn trang và đồng bộ ranh giới phiên)**:
   - Trong `frontend/src/host-page.mjs`:
     - Bọc hàm `fetcher` thành `pageFetcher` trong `mountHostPage`: Khi bất kỳ lời gọi API nào trả về hoặc ném ra mã lỗi HTTP 401, tự động kích hoạt `handle401()` gọi tới `auth.handleUnauthorized()`.
     - Cập nhật `initAuthSession`: Khi `handleUnauthorized()` được gọi, xóa token CSRF (`currentCsrf = null`), đặt lại `sessionInfo` thành `Anonymous`, hiển thị form đăng nhập, ẩn nút đăng xuất, và gọi `clearProtectedViews()` làm rỗng `#inventory-rows`, `#detail-info`, `#detail-related`, đặt lại tiêu đề `#detail-title` về `Host details`, đặt `#detail-status` thành `Session expired or not authenticated. Please log in again.` và ẩn nút retry.
     - Lắng nghe sự kiện `atlas:unauthorized` trên `document` để đồng bộ hủy phiên trong mọi kịch bản.
   - Trong `frontend/src/inventory-detail.mjs` và `frontend/src/inventory-table.mjs`:
     - Khi bắt được lỗi 401, phát sự kiện DOM `atlas:unauthorized` để thông báo cho toàn bộ trang.
     - Lắng nghe sự kiện `atlas:session-change`: Hủy request mạng đang chờ qua `active?.abort()`, tăng `generation++` / `version++` và xóa các phần tử DOM bảo vệ. Phản hồi mạng bị hoãn nếu đến sau khi hủy sẽ bị bỏ qua lập tức (`if (version !== generation) return;`).

2. **Khắc phục khoảng trống bằng chứng AC-1/AC-2/AC-3 (Kiểm thử tích hợp Cookie-Session qua Proxy)**:
   - Xây dựng bài kiểm thử TC-10 hoàn chỉnh trong `frontend/test/auth-inventory.test.mjs`:
     - Khởi tạo PGlite (PostgreSQL 17.5 WASM), chạy migration schema và seed dữ liệu thực tế (host, package, listening port).
     - Khởi tạo mock OIDC Provider với cặp khóa RS256, hỗ trợ endpoint `/jwks`, `/authorize` và `/token` với mã hóa PKCE (S256).
     - Khởi tạo backend `createApp` gắn `sso` (`createSso` + `createSessionStore`) và các hàm đọc dữ liệu chuẩn (`createAssetReader`, `createAssetDetailsReader`).
     - Khởi tạo frontend reverse proxy `createFrontend` với cờ `inventoryEnabled: true`.
     - Thực hiện chu trình đăng nhập SSO chuẩn: POST `/auth/login` -> nhận cookie transaction `atlas_login` -> chuyển hướng `/authorize` nhận code -> gọi `/auth/callback` thực hiện PKCE code grant -> nhận cookie `atlas_session=...; HttpOnly; SameSite=Lax`. Xác nhận cookie hoàn toàn opaque, không lộ JWT token.
     - Gọi `/auth/session` qua frontend proxy, nhận phản hồi `{ authenticated: true, csrf: '...' }` không chứa access_token hay id_token.
     - Khởi tạo giao diện DOM (`mountHostPage` trong `linkedom`) sử dụng proxy fetcher chuyển tiếp cookie: Render chính xác dữ liệu máy chủ từ PostgreSQL, mở bảng chi tiết và danh sách cổng lắng nghe.
     - Thực hiện đăng xuất từ UI bằng cách click `#logout-button`: Gửi POST `/auth/logout` kèm `X-CSRF-Token` qua proxy tới backend; backend xác thực thành công, hủy session và xóa cookie; giao diện chuyển sang `Anonymous` và dọn sạch dữ liệu bảng.
     - Xác thực các yêu cầu tiếp theo với cookie đó nhận 401 từ backend.
     - Xác thực role `Service Owner` bị từ chối ngay tại ranh giới SSO callback (403 Forbidden), và token Bearer `Service Owner` qua proxy nhận 403 Forbidden với giao diện xử lý an toàn.
     - Xác thực anonymous nhận 401 với `WWW-Authenticate: Bearer`.

3. **Mở rộng bộ test tập trung (10 tests)**:
   - Thêm TC-9: Kiểm tra chi tiết việc lan truyền mã lỗi 401 thực tế từ detail làm sạch bảng máy chủ, xóa CSRF, cập nhật header về Anonymous, và chứng minh phản hồi mạng bị hoãn không thể điền lại DOM.
   - Thêm TC-10: Kiểm tra tích hợp đầy đủ cookie-session SSO qua proxy tới PostgreSQL.

4. **Kiểm tra chất lượng và đóng gói**:
   - Chạy `npm run lint`: 110 modules PASS, 114 native FKs PASS.
   - Chạy `npm run build`: hoàn tất đóng gói native ESM không lỗi.
   - Toàn bộ 10/10 test auth UI chạy độc lập đạt 100% PASS trong 3.22 giây.

## 4. Files đã thay đổi
| Đường dẫn | Loại | Nội dung thay đổi |
|---|---|---|
| `frontend/src/host-page.mjs` | Sửa | Thêm bộ chặn `pageFetcher` bắt 401 gọi `handleUnauthorized()`, xóa CSRF và đặt lại header khi gặp 401, lắng nghe sự kiện `atlas:unauthorized`. |
| `frontend/src/inventory-detail.mjs` | Sửa | Phát sự kiện `atlas:unauthorized` khi gặp 401, làm sạch title về `Host details`. |
| `frontend/src/inventory-table.mjs` | Sửa | Phát sự kiện `atlas:unauthorized` khi gặp 401, bảo vệ generation chống hoãn phản hồi. |
| `frontend/test/auth-inventory.test.mjs` | Sửa | Bổ sung TC-9 (lan truyền 401 và phản hồi hoãn), nâng cấp TC-10 (tích hợp đầy đủ cookie-session SSO PKCE qua proxy tới PostgreSQL). |
| `Docs/evidence/S1-004/test-v3.txt` | Thêm mới | Bằng chứng chạy 10 test auth tập trung PASS (3.22s). |
| `Docs/evidence/S1-004/auth-test-v3.txt` | Thêm mới | Bản sao bằng chứng chi tiết 10 test auth. |
| `Docs/evidence/S1-004/lint-v3.txt` | Thêm mới | Bằng chứng lint 110 modules và schema PASS. |
| `Docs/evidence/S1-004/build-v3.txt` | Thêm mới | Bằng chứng build native ESM PASS. |
| `Docs/RESULT-TASK-S1-004.md` | Sửa | Cập nhật báo cáo nghiệm thu version v3 ghi nhận kết quả Rework Round 2. |

## 5. Cách chạy và kiểm chứng
Yêu cầu môi trường: Node.js 24 LTS, Windows/Linux local loopback.
Các lệnh kiểm chứng độc lập:
```powershell
Set-Location F:\PROJECT\REVERSE_PROJECT\Project_app\IT_SEC_APP

# 1. Kiểm tra cú pháp và quy chuẩn an toàn code
cmd.exe /c npm run lint

# 2. Đóng gói bản build static
cmd.exe /c npm run build

# 3. Chạy toàn bộ test tập trung cho tính năng auth UI (bao gồm lan truyền 401 và tích hợp cookie-session SSO qua proxy)
node --test frontend/test/auth-inventory.test.mjs

# 4. Chạy kiểm tra file repro độc lập từ Team Lead (chứng minh không còn rò rỉ dòng dữ liệu sau 401)
node -e "
import { mountHostPage } from './frontend/src/host-page.mjs';
import { readFile } from 'node:fs/promises';
import { parseHTML } from 'linkedom';

const html = await readFile('./frontend/src/hosts.html', 'utf8');
const { document } = parseHTML(html);
const row = { id: '00000000-0000-4000-8000-000000000001', hostname: 'protected-server', os: 'Debian', os_version: '12', first_seen_at: '2026-10-30', last_seen_at: '2026-10-30' };
let fail401 = false;
const fetcher = async url => {
  if (url === '/auth/session') return { ok: true, status: 200, json: async () => ({ authenticated: true, csrf: 'tok' }) };
  if (url.startsWith('/api/v1/assets?type=host')) return { ok: true, status: 200, json: async () => ({ data: [row], meta: { page: 1, page_size: 25, total: 1, total_pages: 1 } }) };
  if (fail401) return { ok: false, status: 401, json: async () => ({ error: { code: 'UNAUTHORIZED' } }) };
  return { ok: true, status: 200, json: async () => ({ data: [row], meta: { page: 1, page_size: 25, total: 1, total_pages: 1 } }) };
};
const nav = { events: new EventTarget(), location: new URL('http://local/inventory/hosts#list=1'), history: { replaceState() {}, pushState() {} } };
const page = mountHostPage(document, { fetcher, navigation: nav, useStandardApi: true });
await page.ready;
fail401 = true;
await page.navUi.core.open(row);
if (document.getElementById('inventory-rows').textContent === '' && document.getElementById('session-info').textContent === 'Anonymous' && page.auth.getCsrf() === null) {
  console.log('REPRO_FIX_VERIFIED: 401 completely wiped protected rows, set Anonymous and cleared CSRF');
}
"
```

## 6. Test và kết quả test
| Test case | Lệnh / cách test | Kết quả | Output chính |
|---|---|---|---|
| TC-1: Session lifecycle | `node --test frontend/test/auth-inventory.test.mjs` | Pass | `✔ Session lifecycle: checkSession and initAuthSession render anonymous, authenticated, and handle logout with CSRF (27.0119ms)` |
| TC-2: Standard asset API & safe text | `node --test frontend/test/auth-inventory.test.mjs` | Pass | `✔ AC-1 & AC-3: mountInventoryTable with standard asset API lists, filters, pages hosts and renders safe text (16.5879ms)` |
| TC-3: 401 safe state & data clear | `node --test frontend/test/auth-inventory.test.mjs` | Pass | `✔ AC-2: 401 unauthorized / expired session shows safe state, hides retry, clears protected data (7.1108ms)` |
| TC-4: 403 forbidden safe state | `node --test frontend/test/auth-inventory.test.mjs` | Pass | `✔ AC-2: 403 forbidden session shows access denied, hides retry, clears protected data (4.7062ms)` |
| TC-5: Detail 401/403 & standard API | `node --test frontend/test/auth-inventory.test.mjs` | Pass | `✔ AC-1 & AC-2: mountInventoryDetail with standard APIs handles 401, 403, and authorized detail/ports (15.678ms)` |
| TC-6: Server proxy auth/asset routes | `node --test frontend/test/auth-inventory.test.mjs` | Pass | `AUTH_INVENTORY_INTEGRATION_PROOF {"proxyAuthRoutes":true,"proxyAssetRoutes":true,"cookieForwarded":true,"setCookiePreserved":true,"csrfForwarded":true,"locationPreserved":true,"methodsEnforced":true,"auth401Preserved":true}` |
| TC-7: Page composition standard API | `node --test frontend/test/auth-inventory.test.mjs` | Pass | `✔ AC-1 Page composition: mountHostPage mounts standard asset APIs for list/detail/ports, preserving secondary panels and UUID links (26.0803ms)` |
| TC-8: Session boundary & logout failure | `node --test frontend/test/auth-inventory.test.mjs` | Pass | `✔ AC-2 & C5 Session boundary: logout and expiry immediately clear protected list and detail DOM, prevent deferred responses repopulating, and handle logout failure cleanly (20.3143ms)` |
| TC-9: Actual 401 propagation & delayed response | `node --test frontend/test/auth-inventory.test.mjs` | Pass | `✔ AC-2 LEAD-S1-004-02: Actual 401 propagation from detail or list wipes all protected views, CSRF and header state across the page (16.4668ms)` |
| TC-10: Genuine local cookie-session SSO through proxy | `node --test frontend/test/auth-inventory.test.mjs` | Pass | `ACTUAL_LOCAL_COOKIE_SSO_PROXY_PROOF {"livePostgresWasm":true,"syntheticOidcPkce":true,"backendSsoSessionStore":true,"opaqueSessionCookieHttpOnly":true,"noTokensExposedToClient":true,"frontendReverseProxyPassThrough":true,"authenticatedViewerDbRows200":true,"uiDetailAndPortsRendered":true,"csrfProtectedLogoutSuccess":true,"backendSessionInvalidated401":true,"uiViewsClearedOnLogout":true,"serviceOwner403":true,"anonymous401Bearer":true} (2416.7402ms)` |
| TC-11: Lint & Schema verification | `cmd /c npm run lint` | Pass | `lint PASS: 110 modules; syntax and unsafe-code rules; schema check PASS: 22 entities, 2 junctions, 114 native FKs` |
| TC-12: Build verification | `cmd /c npm run build` | Pass | `build PASS: backend/src -> backend/dist (native ESM); frontend/src -> frontend/dist (native ESM)` |

## 7. Vấn đề gặp phải và quyết định tự xử lý
1. **Lan truyền lỗi 401 thực tế từ chi tiết máy chủ sang danh sách (`LEAD-S1-004-02`)**:
   - *Nguyên nhân*: Khối bắt lỗi `catch` của `inventory-detail.mjs` chỉ dọn sạch view chi tiết của nó mà không thông báo cho controller phiên ở cấp trang `host-page.mjs`. Do đó `#inventory-rows` vẫn giữ dữ liệu và `#session-info` vẫn hiển thị Authenticated.
   - *Giải pháp*: Bọc `fetcher` ở cấp trang `mountHostPage` thành `pageFetcher`. Bất kỳ endpoint nào trả về 401 đều tự động kích hoạt `auth.handleUnauthorized()`, xóa sạch toàn bộ hàng máy chủ, đặt lại trạng thái đăng nhập về `Anonymous`, xóa token CSRF, và phát sự kiện `atlas:session-change` để tăng generation của mọi component con.
2. **Ngăn chặn phản hồi mạng đến trễ (Delayed response) điền lại DOM sau 401**:
   - *Nguyên nhân*: Nếu một yêu cầu danh sách máy chủ được gửi đi trước khi mã lỗi 401 xuất hiện, khi phản hồi của yêu cầu này về sau thời điểm 401, nó có thể vẽ lại các dòng máy chủ lên giao diện đã bị hủy.
   - *Giải pháp*: `clearProtected()` tăng biến đếm `generation++`. Trong hàm `load()`, trước khi render, kiểm tra `if (version !== generation) return;`. Nhờ vậy, mọi phản hồi mạng đến trễ đều bị hủy bỏ lập tức.
3. **Sự kiện Linkedom click không tương thích với global `new Event()`**:
   - *Nguyên nhân*: `linkedom` sử dụng cơ chế sự kiện riêng của window; việc gọi `new Event('click')` toàn cục của Node.js gây lỗi `TypeError: Cannot set property eventPhase of #<Event> which has only a getter`.
   - *Giải pháp*: Sử dụng `new window.Event('click', { bubbles: true, cancelable: true })` lấy trực tiếp từ `parseHTML(html)`, đảm bảo dispatch sự kiện click DOM hoàn toàn mượt mà và chuẩn xác.
4. **Phân biệt rạch ròi giữa 401 và 403**:
   - *Nguyên nhân*: 401 biểu thị phiên hết hạn hoặc không xác thực (cần xóa phiên, xóa CSRF và chuyển sang Anonymous), trong khi 403 biểu thị người dùng đã xác thực nhưng không đủ quyền trên tài nguyên cụ thể (không được xóa phiên hay đăng xuất người dùng).
   - *Giải pháp*: Bộ chặn `pageFetcher` chỉ kích hoạt `handleUnauthorized()` khi gặp đúng mã lỗi 401. Đối với 403, phiên làm việc được giữ nguyên, chỉ có panel cụ thể hiển thị `Access forbidden`.

## 8. Chưa làm, giới hạn và nợ kỹ thuật
1. **Chưa có ảnh chụp trình duyệt native thật (AC-4)**: Do lệnh dừng can thiệp màn hình desktop và công cụ trình duyệt tiếp tục bị khóa từ Sprint 0, bằng chứng giao diện hiện tại được xác minh qua DOM engine (`linkedom`) và ephemeral HTTP proxy integration test với cookie thật. Đây là giới hạn môi trường đã được công bố từ trước, không thể tự ý vượt rào.
2. **Không kết nối Identity Provider sản xuất của doanh nghiệp**: Hệ thống xác thực OIDC sử dụng giao thức chuẩn OIDC/PKCE với môi trường lab/synthetic, chưa cấu hình realm Keycloak thật của doanh nghiệp (phụ thuộc Q-01..Q-05 của PO).
3. **Giới hạn PR/CI từ xa**: Kiểm thử hiện tại được thực thi đầy đủ trên môi trường cục bộ; các bước tạo PR và CI từ xa trên GitHub tiếp tục phụ thuộc vào quyền truy cập token từ xa được phê duyệt riêng.

## 9. Điểm nghẽn và việc cần quyết định
- **Quyền công cụ kiểm thử trình duyệt**: Cần Product Owner phê duyệt quyết định nghiệm thu có điều kiện đối với AC-4 (tương tự như giải pháp nghiệm thu Docker Compose ở Sprint 0) hoặc cấp lại quyền sử dụng công cụ trình duyệt được phê duyệt để ghi nhận screenshot chính thức.
- **Quy trình nghiệm thu Sprint 1**: TASK-S1-004 đã hoàn thành toàn bộ mã nguồn, kiểm thử 10/10 test auth UI với cookie SSO qua proxy, và đã giải quyết trọn vẹn cả hai defect trong Review 33 và Review 36. Chờ Team Lead tiến hành đánh giá lại.

## 10. Đề xuất bước tiếp theo và tự kiểm tra
- [x] Đã đối chiếu đủ từng acceptance criterion ở Mục 2
- [x] Mọi câu "đã làm / đã test" đều có bằng chứng kèm theo (`test-v3.txt`, `auth-test-v3.txt`, `lint-v3.txt`, `build-v3.txt`)
- [x] Không còn secret, mật khẩu, token hay dữ liệu thật nhạy cảm trong file này
- [x] Giải quyết đầy đủ defect `LEAD-S1-004-02` và cung cấp bằng chứng local cookie session SSO qua proxy
- Đề xuất: Team Lead tiến hành nghiệm thu submission v3 của TASK-S1-004.
