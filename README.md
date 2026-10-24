# Atlas — IT Asset & Security

Skeleton TASK-S0-001, chỉ chạy local. SRS v1.0 trong `Docs/it-asset-security-srs.pdf` là nguồn nghiệp vụ; `docs/adr/ADR-001-tech-stack.md` là đề xuất stack chờ Team Lead xác nhận. Không có inventory, collector hay dữ liệu hạ tầng thật. UI kế thừa màu sắc, typography, layout từ IT_ASSET_MAP; không copy model/store/logic cũ.

## Repo và mapping tài liệu

Theo quyết định Team Lead 2026-10-24, `IT_SEC_APP/` chính là root tương đương `it-asset-project/`; không có root lồng bên trong. `backend/`, `frontend/`, `collectors/{osquery,docker,k8s}/`, `deploy/docker/` và `docs/adr/` là các vùng source bắt buộc.

Windows không phân biệt `Docs/` và `docs/`: giữ nguyên tên `Docs/` đang có để không phá đường dẫn tài liệu đã giao. `docs/adr/` trong TASK tương ứng vật lý `Docs/adr/`; Git lưu canonical path `Docs/adr/ADR-001-tech-stack.md`. Khi clone Linux hãy dùng `Docs/adr/`, không tự tạo thêm thư mục lowercase song song. SRS, handbook, TASK, chuẩn result và RESULT tiếp tục trong cùng `Docs/`, quản lý tài liệu không thay thế source tree. Các HTML/asset Rediver và SEC_Atlas cũ của PO được giữ nguyên ngoài Git/build/Docker context; không chạy hay dùng làm fixtures.

## Yêu cầu

- Git 2.x; Docker Engine 24+ hoặc Docker Desktop với Linux containers, Compose plugin **2.20.3+** (hỗ trợ include).
- Internet để tải Node 24 và Postgres 17 images; port local còn trống. Không cần Node/npm trên host nếu dùng Compose.
- Mục tiêu TASK: clone → frontend/health dưới 10 phút. Chưa đo trên máy sạch, không cam kết đã đạt khi chưa có bằng chứng.

## Chạy local (PowerShell, từ root repo)

Sau khi nhận checkout repo local (chưa có remote GitHub):

```powershell
Copy-Item .env.example .env
```

Mở `.env`, thay `POSTGRES_PASSWORD=REPLACE_WITH_LOCAL_PASSWORD` bằng mật khẩu chỉ dùng cho database local. Không đưa mật khẩu đó vào Git, comment hay RESULT. Các biến bắt buộc khác có giá trị mẫu local trong `.env.example`: BACKEND_HOST/PORT/PUBLISH_HOST/PUBLISH_PORT; FRONTEND_HOST/PORT/PUBLISH_HOST/PUBLISH_PORT; BACKEND_ORIGIN; POSTGRES_DB/USER/PORT. Chúng không phải địa chỉ hạ tầng công ty. BACKEND_ORIGIN mặc định dùng tên service Compose `backend`, port phải khớp BACKEND_PORT. Giữ PUBLISH_HOST loopback để không expose skeleton ra LAN/Internet.

```powershell
docker compose --env-file .env up --build -d
docker compose ps
Invoke-RestMethod http://127.0.0.1:4100/health
Start-Process http://127.0.0.1:4200
```

Frontend hiển thị shell Atlas tiếng Việt; nút Kiểm tra kết nối backend báo liveness nếu backend hoạt động. `/health` trả `{"status":"ok","service":"backend","scope":"liveness"}`. Database được tạo service rỗng, không có schema/seed; health không kiểm tra database. Các URL trên khớp giá trị mẫu .env; nếu đổi port hãy dùng port đã cấu hình.

## Lint, unit-test và build

Máy có Node.js 24 (không cần npm install, không có dependency npm):

```powershell
npm run lint
npm test
npm run build
```

Thứ tự trên giống workflow `.github/workflows/ci.yml`. Lint hiện kiểm tra syntax ESM và cấm eval/dynamic Function/innerHTML/debugger, không phải ESLint/type checker đầy đủ. Test dùng node:test với HTTP ephemeral loopback; build copy native ESM/static assets vào backend/dist và frontend/dist. CI GitHub chưa chạy trên remote, sẽ kiểm chứng lại khi push lên GitHub.

Nếu chỉ có Docker:

```powershell
docker run --rm -v "${PWD}:/app" -w /app node:24-alpine npm run lint
docker run --rm -v "${PWD}:/app" -w /app node:24-alpine npm test
docker run --rm -v "${PWD}:/app" -w /app node:24-alpine npm run build
```

Chạy không Docker cho kiểm tra Dev: sao `.env.example` sang `.env`, đổi BACKEND_HOST/FRONTEND_HOST thành `127.0.0.1`, BACKEND_ORIGIN thành `http://127.0.0.1:4100`, build rồi mở hai terminal `npm run start:backend` và `npm run start:frontend`. Cách này không thay AC Compose.

## Dừng và reset

```powershell
docker compose --env-file .env down
```

Chỉ khi chủ động muốn xóa dữ liệu database **local của project này**, dùng `docker compose --env-file .env down -v`. Lệnh này xóa volume local, không dùng cho production. Không xóa nguồn/tài liệu của PO.

## Xử lý sự cố

1. Port bận: đổi BACKEND_PUBLISH_PORT/FRONTEND_PUBLISH_PORT trong `.env`, chạy lại Compose; không dừng process lạ. Nếu đổi port nội bộ, đồng bộ BACKEND_ORIGIN.
2. Thiếu biến: Compose báo `Set ...`; bổ sung đúng biến từ `.env.example`, không dán secret lên ClickUp. Database đã có volume mà đổi password: Postgres giữ password cũ; dùng đúng password cũ hoặc reset volume local có chủ đích.
3. `include` không được hỗ trợ hoặc không tải được image: kiểm tra `docker compose version` >=2.20.3, Docker daemon/Linux containers và kết nối registry. Backend chưa lên: `docker compose logs backend` (không chia sẻ env/secret); health là liveness, không khẳng định các nguồn ngoài đã sẵn sàng.

## Ranh giới mở rộng

Không bắt đầu S0-002/003/004 trước khi được Team Lead mở task. SSO/RBAC, model 22 entity, ingest, migrations, CVE, search, scanner chưa triển khai. API nghiệp vụ tương lai theo SRS §20 `/api/v1/` và lỗi có request_id; mọi thay đổi phạm vi qua Team Lead. Tham khảo `Docs/adr/ADR-001-tech-stack.md`, không coi đề xuất ADR là quyết định đã được duyệt.
