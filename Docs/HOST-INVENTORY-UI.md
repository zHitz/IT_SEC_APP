# Host inventory page — S0-003

Current V7 supports direct links and reload. The V6 reload limitation below is historical and superseded.

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


## V7 direct links, reload and browser history

Canonical example: /inventory/hosts#host=20000000-0000-4000-8000-000000000011&search=host-&page=2&page_size=10. UUID is the identity; hostname aliases are not needed for the assigned id-or-name alternative. Legacy #detail=:uuid links also resolve. The fragment carries only identity and validated list context, never credentials or copied Host metadata. A fresh GET /api/v1/inventory/hosts/:id resolves current Host details after direct navigation/reload, followed by accepted exact-host Package/Port requests. No full-list scan or fixture fallback.

Opening a row records the list URL/context then pushes the detail entry. Native browser Back/Forward follows those entries; reload reconstructs selected Host and list search/page/page-size from the URL, not stale history rows. Back to list uses browser history for an app-created entry; a directly opened detail safely returns to the encoded list context instead of leaving the app. List data is retained when its context already matches, otherwise reloaded. URL page bounds1..100000; supported page sizes10/25/50/100; invalid list context falls back safely. Search trimmed/max200/no controls. Location/history logic is isolated in host-navigation.mjs; shared detail controller validates fresh parent and matching child IDs.

Unknown UUID shows Host not found and clears metadata/related records; malformed identity shows Invalid host link. Retry/Back remain available; no other Host detail is rendered as a partial fallback. Synthetic unknown UUID can be tested with ffffffff-ffff-ffff-ffff-ffffffffffff. No global storage/state policy, auth/RBAC, schema or Cloudflare behavior changes.

Verify with `node --test frontend/test/host-navigation.test.mjs backend/test/host-exact.test.mjs`; full lint/test/build. DOM+actual HTTP/PostgreSQL tests open a direct link, mount a fresh document to model reload, traverse Back/Forward, retain search/page and reject unknown/invalid IDs without partial data. Actual browser reload/Back/Forward/error checks are separately recorded in navigation-v7.json/screenshots. Native Linux/osquery and exact responsive viewport/reduced-motion runtime verification remain unclaimed.


## v8 Package hosts

From Host details select a package name to view matching hosts and their stored versions. Search package name/version, use Previous/Next (10 records/page), read the total, then Back to host details or Back to host list. Exact identity is name+ecosystem, with all versions. Counts are host/version rows, not CVEs or vulnerability conclusions. Context remains on the originating Host link; a reload while viewing packages restores Host detail, not package subview. Browser navigation exits the package panel safely. Requests time out after8seconds; errors clear rows and permit search retry. Existing Atlas tokens/layout, local opt-in and synthetic boundaries are retained. `node scripts/inventory-ui-lab.mjs --packages` creates24synthetic host records for one package/two versions. Test: `node --test frontend/test/package-hosts.test.mjs`.


## v9 Search port/process

From Host inventory or detail choose Search port or process. Enter an exact port or process substring (both means AND), then Find listening hosts. Results show hostname/HostID/protocol/port/process/PID/bind address, total and10rows/page. Empty/invalid input guidance and cleared failure/empty states prevent stale results. Back restores entry list/detail and list search/page context. Search is global stored inventory independent of origin list search. Temporary search panel is not persisted; reload restores originating Host/list route. `node scripts/inventory-ui-lab.mjs --hosts`:8011 ->Host11/PID111,synthetic-listener ->24records/3pages. No Cloudflare access, scan or CVE conclusions.
