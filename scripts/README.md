# Development tooling
check.mjs: syntax lint và unsafe-code rules. build.mjs: package ESM/static assets. Không download/run code Rediver. Lệnh chuẩn trong package.json/root README.

S0-002: generate-schema.mjs sinh SQL up/down và DBML từ backend/db/schema.json; --check kiểm tra drift ở lint. verify-db.mjs tạo database PostgreSQL 17.5 WASM mới, chạy chính migration/seed/inspect/down và ghi bằng chứng synthetic. Runtime server dùng pg, dev verifier dùng PGlite; chung một migration executor ở backend/db/migrate.mjs. Không sử dụng DATABASE_URL trong verifier, không chạy migration tự động khi web khởi động.
