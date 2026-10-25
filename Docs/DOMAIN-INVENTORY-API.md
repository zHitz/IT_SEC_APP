# Domain and DNS inventory API — S0-004 v4

This extends the existing opt-in local inventory reader, not the Cloudflare collector. It reads accepted synthetic Domain/DNSRecord rows only and never calls Cloudflare or modifies DNS. Enablement, loopback restrictions, separate read-only pool and startup instructions are in HOST-INVENTORY-API.md. No UI/dashboard, schema/entity, collector, osquery or production integration change is part of this assignment. No authentication/RBAC product boundary is claimed: keep the prototype on approved local synthetic data, with no proxy/tunnel/public exposure.

## Endpoint contract

| Method | Path | Query parameters | Fields |
|---|---|---|---|
| GET | /api/v1/inventory/domains | search, outside_known_range, page, page_size | id, fqdn, is_internal, source, first_seen_at, last_seen_at, confidence, tags |
| GET | /api/v1/inventory/dns-records | search, outside_known_range, page, page_size | id, domain, type, value, proxied, ttl, source, first_seen_at, last_seen_at, confidence, tags |

`search` is a trimmed case-insensitive literal substring of Domain.fqdn or DNSRecord.domain: 1–200 characters, no controls. Percent/underscore are literal. No implicit suffix/wildcard/DNS resolution or IDNA transformation. All stored DNS record types are listed, preserving existing seed/collector behavior. Fields retain database nulls and timestamp ISO values; raw_ref/raw snapshots are excluded.

`outside_known_range` accepts exactly lowercase true/false. Omitted -> no flag restriction. For DNS records this tests exact membership of `cloudflare:outside-known-range` in tags, not substring or other user tags. For domains true means at least one associated DNS record (matching accepted DNSRecord.domain=Domain.fqdn FK) has that tag; false means no associated flagged record, including domains with no records. Returned Domain.tags are the original domain tags, not copied/inferred child tags. The predicate is informational; it does not recalculate CIDRs, repair DNS, remove user tags or assert exposure/security correctness. Search and flag filters combine with AND; counts use exactly the same filter.

`page` default1/max100000, `page_size` default25/max100: positive decimal integers only, no sign/leading-zero/decimal/exponent forms. Duplicate/unknown parameters, unsupported host_id, empty/malformed filters and URL>2048 characters ->400. Stable order is fqdn/id for domains and domain/type/id for DNS records. Across concurrent updates, offset pages may shift; one response's count/data share one SQL snapshot.

## Response examples and counts

Example synthetic GET `/api/v1/inventory/dns-records?search=outside.test&outside_known_range=true&page_size=10`:

```json
{"data":[{"id":"00000000-0000-4000-8000-000000000041","domain":"outside.test","type":"A","value":"198.51.100.25","proxied":null,"ttl":300,"source":"cloudflare","first_seen_at":"2026-10-24T00:00:00+00:00","last_seen_at":"2026-10-24T00:00:00+00:00","confidence":"confirmed","tags":["cloudflare:outside-known-range","user:review"]}],"meta":{"page":1,"page_size":10,"total":1,"total_pages":1}}
```

Example is the test fixture, not a live Cloudflare record; timestamp formatting may vary with PostgreSQL serialization. `total` is all matching records, not page length; total_pages=ceil(total/page_size), zero matches means0. Beyond final page gives data=[] while preserving total. Call without filters for resource totals, or outside_known_range=true for flagged totals. No extra dashboard/count endpoint.

## Errors and headers

| Status | Code | Meaning |
|---|---|---|
| 400 | INVALID_QUERY | Invalid/duplicate/unknown/oversized query |
| 404 | NOT_FOUND | Disabled feature or nonexistent path (trailing slash unsupported) |
| 405 | METHOD_NOT_ALLOWED | Any method except GET on enabled known route; Allow:GET |
| 503 | INVENTORY_UNAVAILABLE | Query/database unavailable; internal exception suppressed |

Envelope: `{"error":{"code":"INVALID_QUERY","message":"Invalid inventory query","request_id":"UUID"}}`. JSON, Cache-Control:no-store, X-Content-Type-Options:nosniff and X-Request-Id apply. HEAD has no response body. No CORS/public access policy added.

## Run and proof

From IT_SEC_APP: `node --test backend/test/domain-inventory.test.mjs`, then `npm run lint`, `npm test`, `npm run build`. For manual local browsing use the existing HOST-INVENTORY-API.md start steps with an approved synthetic database; GET `/api/v1/inventory/domains?search=sample` or `/api/v1/inventory/dns-records?outside_known_range=true`. No token, Cloudflare worker or network fetch is needed for these endpoints.

Actual tests migrate/seed a fresh PostgreSQL17.5 WASM database and add two synthetic domain/record fixtures before opening BEGIN READ ONLY. Actual ephemeral loopback HTTP exercises3 domains/3 records, exactly1 flagged record/1 associated domain,2 unflagged, source/timestamps/confidence/tags, combined search+filter, literal search, stable pagination and matching counts, no matches/out-of-range pages, malformed/duplicate/unknown query rejection and GET-only methods. Tag lookalike `cloudflare:outside-known-range-extra` must not match the exact flag. DNS id/tags snapshot remains identical after endpoint reads. Existing Cloudflare GET-only/mock transport tests remain in the full suite; these inventory tests themselves make0 Cloudflare requests. Native daemon/live-zone authorization is not implied.


## V7 exact-owner API (local opt-in)

| Method | Path | Query | Response |
|---|---|---|---|
| GET | /api/v1/inventory/domains/:id | None | {data: Domain observation} |
| GET | /api/v1/inventory/domains/:id/dns-records | page, page_size | {data: DNSRecord[], meta:{page,page_size,total,total_pages}} |

:id is a UUID for the accepted Domain.id. Domain response includes id,fqdn,is_internal,source,first_seen_at,last_seen_at,confidence,tags. DNS response includes id,domain,type,value,proxied,ttl and the same provenance/tags. There is no new domain_id database column: SQL joins DNSRecord.domain to the selected Domain.fqdn using the accepted native FK. Equality is exact, not substring; neighboring api.sample.test never belongs to sample.test. The path ID survives a display-name change without frontend name guessing.

Child page default1/max100000, page_size default25/max100; strict positive decimals, no duplicates/unknown parameters. No search/flag query on this owner-scoped route. Counts and rows plus parent existence come from one SELECT/CTE statement. Missing parent UUID ->404DOMAIN_NOT_FOUND even for child path, existing parent/no records ->200empty withtotal0, beyond last page ->200empty withactualtotal. Malformed UUID ->400INVALID_ID, invalid query ->400INVALID_QUERY, nonGET ->405Allow:GET, database failure ->503INVENTORY_UNAVAILABLE with sanitized envelope/request_id. Disabled feature/unknownroute ->404NOT_FOUND. Parent endpoint rejects all query keys. No write method, auth-cookie forwarding or live Cloudflare call.

Same opt-in backend reader pool/default_transaction_read_only/statement_timeout and loopback frontend proxy boundary as existing APIs; no schema migration/entity. Actual integration test creates32owned records plus overlapping-name trap, performs GETs inside BEGIN READ ONLY and verifies pages/counts/missing404/input/methods. Domain UI uses parent lookup plus one requested child page, removing v6candidate scanning and its100-page bound. High count handling is server pagination, not full client collection. Frontend still has normal8second request deadline.


## v9 DNS value search

`GET /api/v1/inventory/dns-records?value_search=192.0.2.25&page=1&page_size=10` returns stored Domain owner plus record/provenance fields in the standard data/meta envelope. value_search is a trimmed1–200character, case-insensitive literal substring of DNSRecord.value; it is not an IP-range query, wildcard, live lookup or CVE conclusion. Empty/control/duplicate/unknown keys reject400; other resources reject this parameter. It composes with existing owner search and outside-known-range filter using AND. One bound SELECT supplies count/page, stable domain/type/id order, existing read-only transaction/pool/gates. No schema or collector changes.

## v18 exact DNS record

GET `/api/v1/inventory/dns-records/<UUID>` returns `{data:{id,domain,type,value,proxied,ttl,source,first_seen_at,last_seen_at,confidence,tags}}` from the exact stored UUID. UUID bound to SQL; no query parameters or relation accepted (400); invalid UUID400, missing404, POST405; disabled inventory retains404. Flag is displayed from exact stored cloudflare:outside-known-range tag; no flag algorithm change. No raw_ref or payload returned. Loopback opt-in proxy allowlist includes this GET only.

## v19 sorting contract

GET domains accepts sort=hostname (maps fqdn),direction=asc|desc;defaults hostname/asc. Stable id ascending tie,NULLS LAST;combined search and outside_known_range predicates unchanged,one-statement count/page. Invalid/duplicate sort/direction400. Actual67/67tests,lint93/schema22+2/114FK/buildPASS and3browser screenshots in respective evidence folder. No schema/collector/production mutation.

## v20 sorted related views

GET /api/v1/inventory/dns-records accepts sort=owner|value|type,direction=asc|desc. owner maps domain. Flagged view always outside_known_range=true;sort does not change stored flag algorithm. Invalid/duplicate400;existing bounded value_search/page filtering. Actual69tests/lint93/schema22+2/114FK/buildPASS. Focused tests package-navigation.test.mjs and flagged-record-navigation.test.mjs;actual3browser screenshots per task. No production/credential/liveCloudflare access.
