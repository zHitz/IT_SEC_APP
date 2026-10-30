# Osquery batch ingest API — TASK-S0-003

`POST /api/v1/ingest/osquery`, Content-Type application/json, Authorization Bearer token. TLS is required except numeric-loopback HTTP for local lab. Token values come only from OSQUERY_INGEST_TOKEN at collector and OSQUERY_AGENT_TOKENS at backend. The backend registration is a JSON object mapping allowed host_uuid to secret token; no default production credential. A token for one host cannot submit another host_uuid. Do not paste token/registration values into results or ClickUp.

## Request

```json
{
  "batch_id": "00000000-0000-4000-8000-000000000001",
  "collected_at": "2026-10-25T00:00:00+07:00",
  "host": {"hostname":"synthetic.example.test","host_uuid":"synthetic-host","os":"Synthetic Linux","os_version":"1"},
  "packages": [{"name":"synthetic-package","version":"1.0","ecosystem":"deb"}],
  "listening_ports": [{"port":8080,"protocol":"tcp","bind_address":"192.0.2.10","pid":123,"process":"synthetic-web"}],
  "process_evidence": {"non_listening_count":1,"records":[{"pid":456,"name":"synthetic-worker"}]}
}
```

The example timestamp must be replaced with collection time; future>5min or older>30days is rejected. Unknown fields at every object level are rejected. Each array is bounded at1000rows; collector batches at most configured maxBatchRows (default200 combined package/port/evidence rows). Body cap1MiB. Host identity/name/OS/version, package name/version and listener fields are mandatory. No cmdline, environment variables, file contents, history, credential/cookie fields are accepted.

## Success

HTTP200 returns `{ "batch_id":"...", "host_id":"...", "accepted":true, "packages":1, "listening_ports":1, "non_listening_evidence":1 }`. This acknowledges a complete transaction. Collector removes a queue file only for accepted=true with the exact batch_id. Non-listening process records are retained in raw evidence only, not a Process entity/table.

## Acceptance mapping: S0-003 AC-5 and accepted S0-002 schema

[TASK-S0-003 AC-5](../../Docs/TASK-S0-003.md) literally names four entities, Host / Package / Port / Process. That wording conflicts with the accepted schema in [TASK-S0-002 §5.3](../../Docs/TASK-S0-002.md), which explicitly prohibits a separate Process entity/table. The implemented mapping is Host → `host`, Package → `package`, and Port → `listening_port`; listener process name and `pid` are attributes of `listening_port`. Non-listening process `pid`/name records remain sanitized raw evidence referenced by `raw_ref`, not a fourth business entity. See `readSource`/`buildBatches` in `source.mjs` and `createOsqueryStore` in `backend/src/ingest/osquery-store.mjs`.

This note documents the accepted mapping and the unresolved literal wording conflict. It does not demonstrate four separate business entities, rewrite AC-5, waive acceptance gaps, or supply native/live evidence. Existing declared simulator/lab evidence retains its accepted scope; native Linux installation/nonmutation proof and later native UI follow-ups remain separate evidence limits. No schema change is implied.

## Errors

Errors are JSON `{ "error": { "code":"...", "message":"Batch was not accepted", "request_id":"..." } }`; request_id matches X-Request-Id. No SQL errors/payload/token are returned.

| HTTP | Code / meaning | Collector policy |
|---|---|---|
|400|INVALID_JSON|Retain file, stop this delivery cycle; operator fixes input.|
|401|UNAUTHORIZED|Retain file; do not discard on credential failure.|
|403|HOST_IDENTITY_MISMATCH|Retain file; wrong identity/token registration.|
|413|PAYLOAD_TOO_LARGE|Retain file; reduce/configure batching.|
|415|UNSUPPORTED_MEDIA_TYPE|Retain file; JSON required.|
|422|INVALID_PAYLOAD|Retain file; missing/unknown/out-of-range fields.|
|503|INGEST_UNAVAILABLE|Finite retry with backoff, then retain for next delivery cycle.|
|404|NOT_FOUND|Route disabled/not configured or unknown path; no implicit enrollment.|

Only collector/backend ingest uses POST. This endpoint is unrelated to Cloudflare: the separate Cloudflare worker remains GET-only with no DNS mutation path.

## Identity / transactions / audit

Host dedupe uses host_uuid; Package identity uses host+ecosystem+name+version; ListeningPort identity uses host+protocol+bind_address+port. SHA256-derived UUIDv8 avoids duplicate rows on repeated batches. Host/port data from older observations does not overwrite newer observations; first_seen_at is not updated on conflict. Version changes create a separate Package observation, not silent replacement. source=osquery, confidence=confirmed, physical first_seen_at/last_seen_at/observed_at fields follow S0-002.

Each batch is one transaction on a serialized dedicated connection. A sanitized raw batch is written under the configured directory and referenced by raw_ref. Package/port records have real host FK. File writes may leave unreferenced evidence after a transaction failure; retention is a future policy. Body records are not publicly served. API logs only batch IDs, counts, observation times and internal host IDs. No password/token or commandline/body logging.

PoC limits: single backend process/connection serialization, no multi-process worker coordination, no arbitrary SQL API, no SSO/RBAC or public inventory query endpoint. Query evidence is generated by lab scripts and authorized local database queries.
