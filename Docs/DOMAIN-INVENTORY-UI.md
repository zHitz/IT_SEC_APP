# Domain/DNS inventory page — S0-004 v5

## Local synthetic quick start

Node24: `npm ci`, then `node scripts/inventory-ui-lab.mjs`. Open the printed loopback URL ending `/inventory/domains`. This explicit lab command creates a disposable PostgreSQL17.5WASM database, loads the accepted schema/seed, adds synthetic .test/documentation-range fixtures (25 domains/25 records,6flagged), and connects the existing v4 reader/API plus frontend proxy. It does not install an agent, use a token, contact Cloudflare or read production data. Ctrl+C closes servers/database; fixtures do not persist. This lab starts only when invoked; default frontend remains the existing skeleton.

## Existing local database mode

Use only an approved local synthetic database. Backend: BACKEND_HOST=127.0.0.1 (or::1), BACKEND_PORT, local DATABASE_URL, INVENTORY_READ_ENABLED=true. Frontend: FRONTEND_HOST=127.0.0.1 (or::1), FRONTEND_PORT, BACKEND_ORIGIN=http://127.0.0.1:<backend-port>, INVENTORY_UI_ENABLED=true. Run `npm run build`, then the existing start:backend/start:frontend scripts with the local `.env` configuration. Enabling backend API and frontend page are separate explicit flags. Do not put credentials in Git or URL parameters.

Feature disabled: page/module/API proxy routes return404 and skeleton does not expose the inventory link. Enabled: frontend requires loopback CLI binding and numeric loopback backend; inventory requests must arrive on a loopback socket. This is a local unauthenticated prototype, not auth/RBAC or permission to expose a tunnel/proxy. No production deployment is included.

## UI contract

One page, two resource buttons (Domains/DNS records). Reuses Atlas shell,224pxsidebar,56pxheader, dark/light tokens, violet selection, subtle borders, spacing and typography; no architecture/model logic imported from old frame. All new UI prose is English. Tags and explicit labels distinguish flags. Domain flag filter follows API v4's associated-DNS semantics; Domain.tags itself is not changed.

Search domain and submit/Enter; optional stored outside-known-range flag applies immediately. Search/filter/resource/rows-per-page changes reset page1. Clear removes search and flag. Pagination has bounded Previous/Next with filtered total, page count and10/25/50/100rows. Source, first/last timestamps (UTC), confidence and tags render on both resources; DNS also shows type/value. API contract remains Docs/DOMAIN-INVENTORY-API.md; no schema/API business logic changes.

Loading status disables paging; latest-request-wins and abort prevent stale results overwriting current filters. Errors clear old rows/totals and expose Try again; empty data explains how to clear filters. Requests time out after8s; proxy upstream after5s. Response envelope/page metadata and visible row field types are validated. All stored values use textContent, never HTML insertion. Keyboard-focusable semantic table scroll region, labels, aria-pressed resource buttons, live status, focus outlines and existing reduced-motion styles retained. Narrow layouts stack form controls and scroll table horizontally; no virtualized/thousands-row claim.

## Proxy boundary

Only GET /api/v1/inventory/domains and /dns-records (with query) forward to the fixed numeric loopback backend. No user-supplied origin or cookie/auth forwarding, redirect following, write method, arbitrary path or host-package proxy. Responses are JSON with no-store/CSP/nosniff. Unexpected/network/oversized upstream response becomes502. The known static page and two JS modules are an explicit route allowlist; source/env/docs are not served. No Cloudflare client or credentials imported.

## Verification

`node --test frontend/test/domain-inventory.test.mjs frontend/test/domain-proxy.test.mjs`; `npm run lint`; `npm test`; `npm run build`. DOM tests use pinned dev-only linkedom0.18.12; actual HTTP tests use PostgreSQLWASM and the accepted v4 API. Real browser checks recorded in Docs/evidence/S0-004/ui-v5.json: rendering25domains,10rows/page and Next ->page2, DNSresource, flag->6records, search sample-08+flag->1record, dark/light screenshots. Browser viewport override is unavailable; exact390/1024/1440responsive runs and reduced-motion runtime emulation are not claimed. CSS responsive/reduced-motion rules are provided; screenshots show the actual available browser size.

Troubleshoot: page404 ->frontend flag off; API404 ->backend flag off; unavailable ->check local backend/port/flags. No automatic fallback to fixture data hides errors. The explicit lab is separate from actual local database mode.
