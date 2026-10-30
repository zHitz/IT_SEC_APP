# Real-zone readiness pack — S0-004 v3

Assigned by Lead at01:36 on2026-10-25. The v2 synthetic PoC remains ACCEPTED. This pack prepares a future authorized real-zone run; it does not contact Cloudflare, select a production zone, discover a token or grant access.

## Safe local checks now

```powershell
node --test backend/test/cloudflare-readiness.test.mjs
```

The test runs both standalone preflight and the actual worker --dry-run in child processes with a network sentinel. The sentinel intercepts fetch, TCP and TLS connection attempts before they can execute; successful checks must show attempts=0. It also tests missing token, missing zone IDs and missing CIDRs with exit1 and zero attempts, and valid config with a public fixture marker. This verifies local input handling, not real token permissions.

The committed `collectors/cloudflare/config.real.example.json` intentionally has empty zoneIds/knownCidrs and replacement markers. It must fail validation until filled by an authorized operator. There is no default real zone, token or broad CIDR.

## Future switch, configuration and credentials only

1. Obtain the explicitly approved zone IDs, CIDRs/version and environment from PO through the approved process. Receive the read-only token in the process/secret environment under CLOUDFLARE_API_TOKEN. Token permissions: Zone/Zone/Read and Zone/DNS/Read for the approved scope. Do not paste a value into the shell history, config, ClickUp or evidence. Do not search another directory/account for a token or infer a production zone.
2. Copy the real template to an ignored local configuration and edit only operator-supplied values:

```powershell
New-Item -ItemType Directory -Force var/cloudflare | Out-Null
Copy-Item -LiteralPath collectors/cloudflare/config.real.example.json -Destination var/cloudflare/config.real.json
# Edit var/cloudflare/config.real.json using the approved values.
$env:CLOUDFLARE_CONFIG = (Resolve-Path var/cloudflare/config.real.json).Path
```

Keep synthetic=false and baseUrl=https://api.cloudflare.com/client/v4. zoneIds must be explicit32hex IDs; knownCidrs must be nonempty valid IPv4/IPv6 network CIDRs with zero host bits; cidrVersion/environment must have no replacement marker. rawDirectory stays in the private local evidence directory; intervalMs is bounded. No token field belongs in JSON. Example ranges in tests are documentation-only, never real infrastructure inputs.

3. Parse/validate without credentials or network:

```powershell
npm run cloudflare:dry-run
# Equivalent actual-worker path, still config-only:
node collectors/cloudflare/main.mjs --dry-run
```

Expected exit0: event=cloudflare_readiness, mode=dry-run, status=pass, zoneCount/cidrCount correct, credentialPresenceChecked=false, networkRequests=0,databaseWrites=0. Missing/bad scope/CIDR returns exit1 with a sanitized explicit code. Dry-run never opens a database, imports the job/database modules, calls Cloudflare, writes inventory or verifies the token.

4. After the token has been supplied through the authorized secret environment, perform a local presence check:

```powershell
npm run cloudflare:check
```

Expected exit0: mode=check,credentialPresenceChecked=true,networkRequests=0,databaseWrites=0. Missing token gives CLOUDFLARE_API_TOKEN_REQUIRED; missing zones gives ZONE_IDS_REQUIRED; missing ranges gives KNOWN_CIDRS_REQUIRED. Wrong origin/synthetic config, leftover markers, unknown config keys/secret fields, invalid CIDRs or host bits fail closed. This checks presence/shape only, not token validity/permissions or zone authorization. Neither readiness command reads .env implicitly; use the process environment, or an explicitly authorized project environment file via `node --env-file=.env collectors/cloudflare/preflight.mjs --check`.

5. Only when the actual real-zone run has been authorized, provide DATABASE_URL for the approved, already migrated inventory database and execute the same existing worker once:

```powershell
node collectors/cloudflare/main.mjs --once
# Or, when explicitly using the project .env file:
npm run start:cloudflare -- --once
```

This is the first step that can call Cloudflare (GET-only) and write LOCAL inventory/raw evidence. It never writes DNS. A failed readiness check prevents database/API startup. The worker reuses v2 pagination, identity/upsert, flag and audit rules; no code/schema change is needed to switch environments. The present v3 task did NOT execute this command against real credentials or zones.

## Exact acceptance checklist for that later run

- AC-1: compare the approved zone's actual record list with inventory. Authorized database query: `SELECT domain,type,value,source,first_seen_at,last_seen_at,confidence,raw_ref FROM asset_inventory.dns_record WHERE source='cloudflare' ORDER BY domain,type,id;`. Use the exact approved scope in review; never upload real record values blindly.
- AC-2: capture `SELECT count(*) FROM asset_inventory.dns_record WHERE source='cloudflare';` and the above timestamps, run the same --once command a second time, then compare IDs/counts/first_seen_at/last_seen_at. Existing records must preserve first-seen and advance last-seen without duplicates.
- AC-3: rerun `node --test backend/test/cloudflare.test.mjs backend/test/cloudflare-readiness.test.mjs`; ensure the source gate passes and the already implemented transport is GET-only. Do not send a write request as a test.
- AC-4: query `SELECT domain,type,value,tags,raw_ref FROM asset_inventory.dns_record WHERE 'cloudflare:outside-known-range'=ANY(tags);`. Inspect the referenced private snapshot and its IP/reason/CIDR version, and compare approved in-range addresses which must lack that tag. Review/redact real evidence before sharing it.
- AC-5: inspect JSONL sync_started/zone_finished/sync_finished logs for the run IDs, start/end, approved zone IDs, fetched/created/updated/flagged/skipped/error. A401/403 aborts inventory import; do not bypass or automatically broaden token access. Native pg/Docker/remote CI remain explicitly separate verification follow-ups.

## Fail-closed result codes

| Code | Meaning / action |
|---|---|
| CLOUDFLARE_CONFIG_REQUIRED / CONFIG_FILE_UNREADABLE / CONFIG_JSON_INVALID | Supply the explicit readable JSON path; no fallback search. |
| ZONE_IDS_REQUIRED / CONFIG_TEST_SCOPE | Supply only approved zone IDs; never auto-select from production. |
| KNOWN_CIDRS_REQUIRED / CONFIG_CIDRS / CONFIG_CIDR_HOST_BITS | Supply the approved network ranges/version; no guessed defaults. |
| CLOUDFLARE_API_TOKEN_REQUIRED / SYNTHETIC_TOKEN_NOT_REAL | Supply the authorized read-only token through environment; never log it. |
| REAL_CONFIG_REQUIRED / CONFIG_PLACEHOLDERS_REMAIN / READINESS_CONFIG_KEYS | Correct the explicit real config; token/unknown fields are forbidden. |
| READINESS_MODE_REQUIRED / READINESS_MODE_INVALID | Use one unambiguous supported CLI mode; no implicit network action on typo. |

All dry-run/readiness outputs are metadata/error codes only. The source snapshot and v3 tests show zero network attempts; they are not a statement that a later live job can never encounter API errors.
