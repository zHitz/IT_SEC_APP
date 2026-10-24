# Backend
Native ESM HTTP skeleton. src/app.mjs là HTTP boundary; config.mjs kiểm tra env; server.mjs bootstrap. Chỉ GET /health (liveness), các route khác 404 kèm request_id. Không DB adapter/ingest nghiệp vụ. Test: npm test từ root.
