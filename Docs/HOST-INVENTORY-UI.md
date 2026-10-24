# Host inventory page — S0-003 v5

## Explicit synthetic lab

Node24: `npm ci`, then `node scripts/inventory-ui-lab.mjs --hosts`. Open the printed loopback `/inventory/hosts` URL. Lab creates disposable PostgreSQL17.5WASM using accepted schema/seed and synthetic rows:26hosts,24host packages (image seed package excluded by API),25host listening ports. This is declared fixture data, not a native Linux/osquery deployment. No credential/production target/Cloudflare connection. Ctrl+C stops servers/database. Plain lab command without--hosts preserves the Domain-only fixture profile.

## Existing local database

Same opt-in flags as Domain page: INVENTORY_READ_ENABLED=true on backend, INVENTORY_UI_ENABLED=true on frontend; explicit numeric loopback BACKEND_HOST/FRONTEND_HOST and BACKEND_ORIGIN, local synthetic DATABASE_URL/ports. `npm run build` then existing backend/frontend start scripts. See HOST-INVENTORY-API.md for API contract and DOMAIN-INVENTORY-UI.md for shared proxy setup. Default disabled pages/modules/proxy404; no exposure through public proxy/tunnel. Local-only unauthenticated prototype is not production RBAC or authorization.

## UI and behavior

One page with Hosts/Packages/Listening ports resource buttons, existing Atlas sidebar/header/design tokens/dark-light behavior. Host rows show hostname,OS/version and first/last times. Packages show name/version/ecosystem/host ID. Listening ports show host ID/protocol/port/bind address/process/PID. Data is fetched solely from the accepted v4 GET endpoints; no frontend fixture fallback or schema copy. Package image rows/container-only listeners follow the existing host-only API scope.

Search hostname or package name using literal case-insensitive substring; Enter/Search applies and resets page1. Switching resources resets search/page to prevent interpreting a hostname as a package name. Listener search is disabled because the accepted v4 API has no such search field; no unsupported API query invented. Page size10/25/50/100, Previous/Next, filtered totals and page count. Clear removes search; loading/error/empty/retry states and stale-response protection are shared. Tags/flag filter is absent on Host page. All displayed stored values are inserted as text; process/PID is inventory, no command lines/env or Process entity.

The reusable implementation is frontend/src/inventory-table.mjs; Domain entry remains a compatibility wrapper and original Domain tests stay green. This shares UI behavior, not domain schema or business logic. Both pages have working navigation; the skeleton adds links only when explicitly enabled. Host resource paths were added to the same fixed GET-only loopback proxy allowlist; no arbitrary paths, user credentials/cookies or write requests forwarded.

## Verification

`node --test frontend/test/host-inventory.test.mjs`; `npm run lint`; `npm test`; `npm run build`. DOM test asserts OS/version, Host/Package search, page reset/next/total and process/PID. Actual HTTP/PostgreSQL test asserts accepted API responses through frontend proxy and disabled404. Shared Domain tests prove safe text/error/empty/retry/stale-response behavior remains intact. Actual browser proof/screenshots:26host count,10rows/page->page2,HOST-01 search->1host,package-01 search->1package/version1.2.3,listener tab->25ports/process/PID. Native Linux/osquery=false. Exact mobile/tablet viewport override and reduced-motion emulation unavailable, so not claimed; responsive CSS/focus/labels/reduced-motion rules retained.

Original native AC1/3/4 follow-ups and actual600010ms queue experiment evidence are unchanged. This UI work does not close those native gaps and does not repeat the outage run. See RESULT-TASK-S0-003.md for truthful overall PARTIAL status.
