# Cloudflare reader — TASK-S0-004, checkpoint v1

Module hiện chỉ đọc/stage dữ liệu; chưa phải job ingest hoàn chỉnh. Không có CLI chạy định kỳ hoặc ghi inventory. Chờ quyết định Lead về lưu cờ/reason trên schema S0-002 đã ACCEPT, theo TASK §6.

`CloudflareReader` chỉ có `listZones()`, `listRecords(zoneId)`, `readTestScope(zoneIds)`. Transport duy nhất hardcode GET, origin `https://api.cloudflare.com/client/v4`, hai đường đọc allowlist, redirect bị từ chối. Không nhận URL/method từ cấu hình. `readTestScope` yêu cầu danh sách zone thử nghiệm cụ thể, liệt kê mọi zone nhưng chỉ lấy records trong danh sách này; lỗi ở trang/zone sau không trả dataset từng phần. Caller chưa được viết DB trong module này.

Token phải lấy từ `process.env.CLOUDFLARE_API_TOKEN` rồi truyền vào constructor, không ghi ra log. Quyền cần cấp: Zone / Zone / Read và Zone / DNS / Read trên các zone khách hàng cho phép. Khách hàng cấp token qua secret môi trường, không comment/upload token lên ClickUp. Không có token mặc định trong app; marker trong test là dữ liệu synthetic.

Mặc định timeout 15s, tối đa 2 retry sau lần đầu, retry network/429/5xx; 401/403 dừng ngay. Backoff 1s/2s, Retry-After dạng giây được chặn tối đa 30s. Giới hạn 10.000 trang; metadata phân trang thay đổi hoặc ID trùng làm hủy lượt đọc, không âm thầm coi đủ dữ liệu. Giới hạn này là guard chống vòng lặp, không cam kết snapshot nhất quán khi DNS thay đổi giữa hai trang. Job sau cần bắt lỗi `CloudflareReadError.code` và không log raw API body/header.

Chạy test synthetic từ repo root:

```powershell
node --test backend/test/cloudflare.test.mjs
npm run lint
npm test
npm run build
```

Test dùng fake-fetch có kiểm tra mọi request GET, không gọi Cloudflare thật. Chưa map/upsert Domain/DNSRecord, chưa so CIDR, chưa raw snapshot/scheduler/log ingest. Không khai AC-1/2/4/5 đạt.

Quyết định cần Lead: `dns_record` chỉ có domain/type/value/proxied/ttl/network_interface_id và common `tags/raw_ref`; không có flag/reason. Đề xuất dùng tag có namespace cho cờ, raw_ref trỏ snapshot có reason, không thêm migration. Đây là đề xuất, chưa áp dụng. Cần khách hàng chỉ định zone thử nghiệm và file CIDR, token qua môi trường để nghiệm thu thật.

Tham chiếu API đã kiểm tra ngày 2026-10-25: [List Zones](https://developers.cloudflare.com/api/resources/zones/methods/list/), [List DNS Records](https://developers.cloudflare.com/api/resources/dns/subresources/records/methods/list/).
