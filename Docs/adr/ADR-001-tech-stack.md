# ADR-001 — Tech stack skeleton

Đây là đề xuất, cần Team Lead xác nhận trước khi áp dụng cho các task sau.

Status: PROPOSED. Date: 2026-10-24. Task: TASK-S0-001.

## Bối cảnh

SRS v1.0 §7 mô tả kiến trúc logic, không khóa framework. Hệ thống đích 150 server, 500 workstation theo site và 2 cluster; NFR-05 cần chịu được 3 lần quy mô. §20 yêu cầu REST/JSON, request_id; §21 cấm lộ dữ liệu/secret. S0-001 chỉ dựng nền, không schema 22 entity, ingest, queue, SSO hay tích hợp. Ưu tiên package local nhẹ, không chuyển nguyên nghiệp vụ của IT_ASSET_MAP.

## Đề xuất và phương án đã cân nhắc

| Phần | Chọn cho skeleton | Lý do theo yêu cầu | Phương án chưa chọn và lý do |
|---|---|---|---|
| Backend | Node.js 24 LTS, native ESM, node:http | Health HTTP rõ ràng; tách app/config/bootstrap; khung node:test dùng tiếp cho adapter/API, không phụ thuộc nguồn thật | FastAPI/Python thêm runtime thứ hai; NestJS thêm framework/DI chưa cần cho endpoint liveness. Trước module nghiệp vụ phải đánh giá bổ sung validation, routing, auth, observability. |
| Frontend | Native ESM + HTML/CSS, module health riêng | S0-001 là một trang shell, chưa có state nghiệp vụ; giữ token/layout/spacing/style cũ, không kéo theo model/store graph cũ; không tải dependency để làm đẹp | React + Vite phù hợp UI nghiệp vụ lớn nhưng chưa cần cho một shell; phải đánh giá lại tại task UI được giao. Chưa khẳng định frontend vanilla hiện tại đủ cho toàn app lớn. Không tự đưa graph framework vào skeleton. |
| Database | PostgreSQL 17, Compose service độc lập | Quan hệ/FK, transaction, JSON và truy vấn nhiều bậc phù hợp SRS §8/NFR-06; service chưa chứa schema, chưa có kết nối backend, migration/seed thuộc S0-002 | Neo4j tăng vận hành khi yêu cầu FK/migration chưa cần graph DB riêng; SQLite không tương đương mục tiêu triển khai ingest nhiều nguồn/concurrent server. Cần benchmark quan hệ/search ở task sau, chưa chứng minh NFR. |
| Local packaging | Docker Compose v2.20.3+, Node/Postgres Alpine | Máy sạch chỉ cần Docker/Git; build trong image, không cần host Node. Port/address/password qua env, DB không publish ra host | Kubernetes local tạo thêm công cụ/chi phí khởi động; không cần để nghiệm thu local skeleton. |
| CI/test | GitHub Actions workflow; node:test; syntax lint + unsafe-code rules | Theo quyết định TL repo local, local lint → unit-test → build làm bằng chứng hiện tại; test HTTP thật và kiểm tra input/failure thay vì test giả | Không thêm Jest/Vitest cho phần chưa có framework. ESLint/type checker chưa tích hợp, syntax lint chỉ là baseline; cần mở rộng quy tắc trong task tooling phù hợp trước code nghiệp vụ lớn. |

## Hệ quả và giới hạn

- Không dependency npm ngoài; build đóng gói ESM/static assets, không transpile. Không lockfile npm vì không có package dependency để resolve.
- Chia backend/src, frontend/src, collectors và deploy; không có public business API. GET /health chỉ liveness, không readiness, không xác nhận database/collector.
- Skeleton không là quyết định frontend cuối cùng cho toàn app lớn. Việc chọn native ESM là đề xuất có đánh đổi về type safety và framework UI; Team Lead phải xác nhận hoặc yêu cầu đổi trước task sau. Status task tối đa PARTIAL khi ADR chưa được chốt.
- Syntax lint không thay semantic lint/type checking. Test sử dụng HTTP server ephemeral, không truy cập production.
- Node 24/Postgres 17 tags khóa major, chưa immutable digest: cần pin digest và dependency/image security scanning ở bước hardening trước go-live; chưa tuyên bố đáp ứng toàn bộ SRS §21.
- Chưa có Docker trên máy chạy Dev nên không chứng minh Compose/clean-machine <10 phút. Không suy diễn kết quả từ code review.
- CI GitHub chưa chạy trên remote, sẽ kiểm chứng lại khi push lên GitHub.

## Quyết định Team Lead

Chưa có xác nhận ADR. Không tự chuyển PROPOSED thành ACCEPTED; ghi comment/verdict nguồn khi nhận được.
