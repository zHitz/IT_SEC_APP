# Cloudflare DNS ingestion — TASK-S0-004

The worker reads Cloudflare DNS into the accepted Domain / DNSRecord schema. It never changes DNS. The Lead decision at00:38 on2026-10-25 approved synthetic acceptance data and flags in existing `tags` / `raw_ref`. No migration was added.

## Reproduce the acceptance scenario

With Node24 and dependencies installed from the lockfile, run from IT_SEC_APP:

```powershell
npm ci
npm run lint
npm test
npm run build
npm run cloudflare:verify
```

`cloudflare:verify` starts a real loopback HTTP mock server with two **synthetic .test zones**, runs the actual worker job against fresh **PostgreSQL17.5 WASM**, then writes `Docs/evidence/S0-004/verification.json`. It requires no token, native database daemon or Docker. It imports seven A/AAAA/CNAME/MX/TXT records, schedules two runs at25ms, checks idempotency and flags, then checks content changes, late403,503 and transaction rollback. The scheduler uses actual timers; retry-delay unit tests use an injected wait to avoid real30s delays. All API requests in the integration scenario are real HTTP GET to the local mock, never external Cloudflare.

The test database/raw files are disposable and cleaned up. The evidence JSON embeds queried rows, logs, requests and the raw reason snapshot before cleanup; raw_ref paths in that historical test artifact are not persistent files. In normal worker operation raw files remain in the configured directory and references resolve there.

## Configuration and continuous operation

`config.synthetic.json` documents the JSON format. Set `CLOUDFLARE_CONFIG` to a local JSON file and provide `DATABASE_URL` for your already-migrated PostgreSQL17 database. Set `CLOUDFLARE_API_TOKEN` through the environment/secret manager. Do not paste credentials into ClickUp or logs.

```powershell
npm run start:cloudflare -- --once
# Or run continuously, with a fixed delay after each completed sync:
npm run start:cloudflare
```

The npm command reads `.env` using Node24. For the sample synthetic configuration the mock endpoint must already be running on127.0.0.1:4401 and the token must be the public synthetic marker `synthetic-test-marker`; `cloudflare:verify` creates an ephemeral server automatically and is the recommended self-contained test. An actual token is rejected for a mock endpoint, and synthetic mode refuses the official API. The CLI PostgreSQL connection has not been exercised against a native daemon here; acceptance uses the same job/query boundary with PostgreSQL WASM.

For a later authorized real-zone check, use a separate config file with `synthetic:false`, `baseUrl:"https://api.cloudflare.com/client/v4"`, explicit permitted `zoneIds`, actual `knownCidrs`, a version identifier, `environment`, `rawDirectory`, and `intervalMs` (10–86,400,000ms; normal sample60,000ms). Supply a read-only token with Zone / Zone / Read and Zone / DNS / Read for those zones. This is a configuration-only switch using the same worker, not permission to contact production now. The official HTTPS origin is fixed; only numeric loopback HTTP endpoints are allowed for synthetic mode. Redirects are rejected.

## Data and identity rules

- Each distinct DNS owner name becomes a Domain; the zone apex is also retained. DNSRecord.domain uses the existing FK to Domain.fqdn. Host/service mapping is outside scope.
- DNSRecord.id is a deterministic UUIDv8 derived from SHA256 of zoneID + recordID. Content/name/type updates reuse the identity. Domain IDs are deterministic from normalized FQDN; the existing FQDN unique constraint also reuses pre-existing domains. `first_seen_at` is never overwritten on conflict; `last_seen_at` / `observed_at` use the maximum observation timestamp.
- Source=`cloudflare`, confidence=`confirmed`, environment from config. Owner/site/other metadata is preserved. The worker owns only `cloudflare:outside-known-range`; unrelated tags survive. CollectionRun rows are not invented: the required execution audit is JSONL stdout.
- For A/AAAA, PostgreSQL `inet <<= cidr` compares the target against every configured CIDR, including IPv6. Outside addresses get the approved tag. Inside addresses have that tag removed. CNAME resolution is deliberately omitted, so CNAME is unflagged with an explicit non-address explanation.
- `raw_ref` is an immutable per-run/zone JSON file URL plus external record ID. The snapshot stores observed IP/value, reason, CIDR version and ranges. Each file is written before a transaction commits references to it. A rollback can leave an unreferenced file; it cannot commit a reference before the file exists. Files are local, mode0600 where supported, excluded by `var/`; Windows deployments should restrict the raw directory ACL. Tokens/headers never enter snapshots.
- Types accepted by the canonical schema are stored; other types are counted as skipped and their IDs/types appear in raw evidence. Structured record data and MX priority remain in raw evidence; value uses content or JSON data. No schema edits. Record deletion/reconciliation and CNAME resolution are outside this PoC; missing records are not silently deleted.

## Failure handling and logs

The reader paginates zones and records, detects duplicate IDs/page-count drift, and applies timeout15s plus at most2 retries for network/429/5xx (backoff1s/2s; numeric Retry-After capped30s). Invalid envelopes/auth failures are not retried indefinitely. API error bodies, tokens and database connection strings are not logged.

Fetch all selected zones before writes. A401/403 anywhere aborts inventory writes for every zone. Other zone failures are isolated; successful zones may commit, all zones retain log entries. Each zone is one database transaction; invalid input or database/file failure rolls it back. No entire-job atomicity is claimed for non-auth failures. Use one worker process per database/scope; the job rejects concurrent calls within a process. Multi-process scheduling/locking is a later hardening task.

JSONL logs contain sync_started / zone_finished / sync_finished, runID, synthetic marker, timestamps, zoneID, fetched/created/updated/flagged/skipped and sanitized error codes. No raw values or token headers. Fixed-delay scheduling prevents overlap; SIGINT/SIGTERM stop after the current bounded run. `--once` exits nonzero when the job fails/partially fails.

The source audit scans every Cloudflare worker module; the only HTTP transport is hardcoded GET with no mutation method/interface. Tests exercise pagination, late auth failure, finite retries, destination guards, actual HTTP mock ingestion, flags, idempotency, logs and rollback. New transport or worker modules must remain covered by that audit.

Official references checked on2026-10-25: [List Zones](https://developers.cloudflare.com/api/resources/zones/methods/list/), [List DNS Records](https://developers.cloudflare.com/api/resources/dns/subresources/records/methods/list/).

## Real-zone readiness (v3)

Use config.real.example.json and `npm run cloudflare:dry-run` / `npm run cloudflare:check` before any authorized real run. Both are local-only with zero API/database calls; the token is required only for the presence-check mode. The worker also supports --dry-run/--check and rejects ambiguous/unknown flags. Exact future switch/verification commands are in `Docs/evidence/S0-004/followup-readiness.md`. Empty template scope/CIDRs intentionally fail closed. V3 does not use real credentials or select a production zone.
