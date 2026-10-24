# Docker local
compose.yaml dựng backend/frontend/database. Dockerfile build ESM/static assets trong Node image; không cần Node host. Root compose.yaml include file này (Compose >=2.20.3). .env ở root. Không publish database, không schema/seed. Chưa được chạy xác minh do máy Dev không có Docker.
