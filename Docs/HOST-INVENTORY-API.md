# Host inventory API — S0-003 v4 local prototype

This is a read-only, opt-in local development API over the accepted Host/Package/ListeningPort schema. Use only the existing synthetic seed/collector lab. It has no user authorization layer: do not expose it through a proxy, tunnel or production deployment. Native Linux AC-1/3/4 remain unverified; these endpoints do not change that evidence boundary.

## Start and database boundary

From the repository root, configure the existing local `.env` with BACKEND_HOST=127.0.0.1 (or ::1), BACKEND_PORT, and DATABASE_URL for your approved local synthetic database. Run the existing `npm run db:up` and `npm run db:seed` only when creating that local lab. Then set INVENTORY_READ_ENABLED=true and run `npm run start:backend`. No new credentials are created or discovered. The default is disabled (404); any other nonempty enable flag fails startup. External bind addresses are rejected before inventory connects. No changes to frontend are needed.

The inventory connection is a separate pool (max 2), with default_transaction_read_only=on and statement_timeout=5000. Every inventory query is one parameterized SELECT/CTE statement, with an explicit field whitelist. It does not use the ingest transaction connection. Health/ingest behavior remains separate. Actual integration tests use PostgreSQL17.5 WASM in a read-only transaction; native pg Pool/server startup against a daemon has not been exercised here.

## Endpoints

| Method | Path | Query | Returned row fields |
|---|---|---|---|
| GET | /api/v1/inventory/hosts | page, page_size, search | id, hostname, os, os_version, first_seen_at, last_seen_at |
| GET | /api/v1/inventory/packages | page, page_size, search, host_id | id, name, version, ecosystem, host_id, first_seen_at, last_seen_at |
| GET | /api/v1/inventory/listening-ports | page, page_size, host_id | id, host_id, protocol, port, bind_address, process, pid, first_seen_at, last_seen_at |

`search` is a case-insensitive **literal substring** of hostname or package name, trimmed, 1–200 characters, no control characters. Percent/underscore are literal, not SQL wildcards. `host_id` is an optional UUID equality filter. Packages are deliberately limited to source_kind=host (image packages remain outside this host prototype); ports require host_id, excluding container-only ports. A valid unmatched host UUID returns empty data, not 404. No raw_ref, process command line, environment, secret or raw source payload is exposed. Null schema fields remain null.

`page`: default 1, maximum 100000. `page_size`: default 25, maximum 100. Both accept positive decimal integers only (no sign, decimal, exponent or leading zeros). Unknown or duplicate query parameters are rejected. URL limit 2048 characters. Results have stable ordering by hostname/id, name/version/id or port/protocol/id. Concurrent changes between requests can still shift offset pages; count and rows within one response use the same SQL statement/snapshot.

## Response and counts

Example GET `/api/v1/inventory/hosts?search=sample-host&page_size=1` on the existing seed:

```json
{"data":[{"id":"00000000-0000-4000-8000-000000000003","hostname":"sample-host-a","os":"Sample Linux","os_version":"1.0","first_seen_at":"2026-10-24T00:00:00+00:00","last_seen_at":"2026-10-24T00:00:00+00:00"}],"meta":{"page":1,"page_size":1,"total":2,"total_pages":2}}
```

Timestamp formatting can vary by PostgreSQL JSON serialization; values represent ISO timestamps. `total` counts **all filtered matching rows**, not just the page. `total_pages=ceil(total/page_size)`; zero matches -> 0 pages. Beyond the last page: data=[], preserved total. For global host/package/port counts, call the corresponding endpoint without filters; no separate dashboard/count endpoint is invented.

## Errors and headers

| Status | Code | Meaning |
|---|---|---|
| 400 | INVALID_QUERY | Malformed, repeated, unknown, oversized or unsupported query input |
| 404 | NOT_FOUND | Disabled inventory feature or nonexistent route (including trailing slash) |
| 405 | METHOD_NOT_ALLOWED | Known enabled route requested with anything except GET; Allow: GET |
| 503 | INVENTORY_UNAVAILABLE | Database/query unavailable; raw database exception suppressed |

Errors: `{"error":{"code":"INVALID_QUERY","message":"Invalid inventory query","request_id":"generated UUID"}}`. HEAD follows HTTP semantics with no response body. Responses use JSON, Cache-Control:no-store, X-Content-Type-Options:nosniff and X-Request-Id. No CORS/public API policy is introduced.

## Reproduce and verify

```powershell
node --test backend/test/inventory.test.mjs
npm run lint
npm test
npm run build
curl.exe "http://127.0.0.1:3001/api/v1/inventory/hosts?search=sample-host&page_size=1"
```

Replace 3001 with the configured local port; the manual curl example is not a claim of a running daemon. Automated tests start an actual ephemeral loopback HTTP server, migrate/seed a fresh PostgreSQL WASM database and add a synthetic host through the accepted osquery store. Assertions cover OS/version, host-only packages/version, listener process/PID, case-insensitive/literal/injection-shaped search, filtered/global counts, empty/out-of-range pages, stable pagination, limits/duplicate/unknown query rejection, GET-only methods, sanitized database failures, read-only transaction and refused non-loopback startup. Fixture writes occur only in test setup before BEGIN READ ONLY; no migration/schema edits belong to this assignment.


## V7 Host identity lookup for reloadable details

GET /api/v1/inventory/hosts/:id returns {data:{id,hostname,os,os_version,first_seen_at,last_seen_at}} for exact Host.id UUID equality. It accepts no query parameters. Missing UUID ->404HOST_NOT_FOUND; malformed UUID ->400INVALID_ID; any query ->400INVALID_QUERY; nonGET ->405Allow:GET; query failure ->503INVENTORY_UNAVAILABLE with sanitized error/request_id; disabled gate ->404NOT_FOUND. Unsupported child paths remain404. This uses the existing opt-in separate read-only pool, bound UUID, same loopback proxy and accepted Host table. No schema, discovery, write endpoint or production authorization is added. Packages/ListeningPorts still use accepted list routes with exact host_id.

The lookup is the technical identity source for direct/reloaded Host details; it avoids guessing names, trusting history-stored data or scanning host pages. Actual test executes lookup/not-found/input/method checks inside PostgreSQL17.5WASM BEGIN READ ONLY.


## v8 Package-to-hosts GET

`GET /api/v1/inventory/packages/:packageUuid/hosts?page=1&page_size=10&search=2.0` is opt-in, loopback-only and read-only. The selected host-sourced package identifies exact name plus null-safe ecosystem; all stored versions across hosts are included. Search is a literal, case-insensitive substring over package name OR version, within that exact identity. UUID and strict unique query keys are validated; values are bound. One SQL statement returns package identity, page/count and existence. Response includes `package:{name,ecosystem}`, `data:[{id,name,version,ecosystem,host_id,hostname}]` and standard `meta`. Stable hostname/version/id order. Count represents host/version observation rows, not unique hosts when multiple versions coexist. Missing/non-host package404, invalid400, nonGET405; gate disabled404. No schema change or CVE inference.


## v9 Listening port/process search

Existing `GET /api/v1/inventory/listening-ports?port=8011&process_search=synthetic&page=1&page_size=10` now supports optional exact integer port1–65535 and case-insensitive literal process substring1–200characters. Both combine with AND, including existing host_id scope. Unknown/duplicate/control/empty/malformed filters reject400; other resources reject these keys. A read-only host join adds hostname to existing fields; no schema change. Standard data/meta and stable port/protocol/id paging remain. Counts are listening records, not distinct hosts. Query is stored inventory, not a live scan or CVE inference.


## v10 Site Host filter

`GET /api/v1/inventory/sites?page=1&page_size=10` lists existing Site id/name/address_summary, optional literal name search, standard count/page. `GET /api/v1/inventory/hosts?site_id=<UUID>&search=host-&page=1&page_size=10` filters exact accepted Host.site_id FK and existing literal hostname search with AND, adds site_id to returned Host fields. Invalid/duplicate UUID400; valid nonexistent Site yields empty Host filter (not a lookup404). Other resources reject site_id. Existing loopback opt-in GET/read-only pool and bounded query validation retained. No schema/entity/collector change.


## v11 Unassigned Hosts

`GET /api/v1/inventory/hosts?site_assigned=false&search=host-&page=1&page_size=10` applies exact site_id IS NULL with existing literal hostname search. true means IS NOT NULL. Only explicit true/false, unique key; combining with site_id rejects400 to avoid contradictory scope. No Site rows are created/updated/deleted. Existing response site_id field and read-only loopback gates retained.

## v18 Host ordering

GET `/api/v1/inventory/hosts?sort=os_version&direction=desc&search=host-&page=2&page_size=10`. `sort` accepts hostname (default), os, os_version; direction asc (default) or desc. Unknown/duplicate parameters return400. Ordering uses stored PostgreSQL text, NULLS LAST, then id ascending to make ties stable. OS version ordering is lexical, not semantic version comparison. Search/Site predicates and count/page consistency remain unchanged. No schema writes.

## v19 sorting contract

GET packages accepts sort=name|version; listening-ports accepts sort=port|pid; both direction=asc|desc (defaultasc). Whitelist identifiers only;values bound,stable id ascending ties,NULLS LAST. Host scope remains host_id UUID;invalid/duplicatequery400. Stored version ordering lexical. Actual67/67tests,lint93/schema22+2/114FK/buildPASS and3browser screenshots in respective evidence folder. No schema/collector/production mutation.
