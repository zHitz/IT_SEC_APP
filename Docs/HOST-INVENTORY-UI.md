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


## V6 Host details and QA fix

Click a hostname link to open its detail view within the local page. Header uses the selected row's API observation (hostname, OS/version, host ID); related Package and ListeningPort lists are fetched from the accepted GET APIs with exact host_id. Each related list has independent25-row paging/counts, full package versions and listener process/PID. No new backend endpoint/schema or fixture fallback. The page validates child host IDs before rendering, clears stale rows on failures, exposes Retry details and Back to list. Back preserves the existing list controller/DOM/search/page/page-size; browser Back is also supported via popstate. Focus moves to the detail heading and returns to the selected list link. A detail URL fragment is navigation context, not a standalone deep link: full reload starts the list; retention guarantee is within current page session/Back, not cross-reload persistence.

Reproduce: explicit synthetic lab --hosts; choose10rows/page, search host-, go Next, click host-11.test, verify OS12.3, package version1.2.3 and listenerPID111, then Back and confirm list query/page2. Actual integration test repeats this over real HTTP/PostgreSQLWASM. No nativeLinux/osquery claim. Detail implementation is shared frontend/src/inventory-detail.mjs with Host mode; table onSelect is only wired for Host/Domain identity columns.

QA PR comment4368355476 additionally identified package raw_ref stale replay mismatch. The accepted upsert still preserves observation timestamps, and now raw_ref changes only for an incoming observation at least as recent. Regression opens the actual referenced raw JSON for Host/Package/ListeningPort after new/repeat/stale batches and asserts it matches the latest collected_at. No schema/source query/privacy expansion and no repeat of the real ten-minute experiment.
