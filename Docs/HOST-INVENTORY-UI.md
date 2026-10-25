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


## v10 Hosts by Site

Filter hosts by Site from full list/detail. Paged Site buttons avoid silently truncating choices; select Site, search hostname, use Host page controls and read OS/version and total. Site page controls are independent of Host result pages. Return restores original full list/detail and search/page. Site choices come from existing Site inventory; no Site creation/editing. Unknown Site membership filter returns0rows; errors clear Hosts. Search panel is temporary; reload restores origin. Null Site Hosts remain available in full list but no assigned-Site filter. `node scripts/inventory-ui-lab.mjs --sites` gives Sample Site16Hosts and Secondary Test Site10Hosts; integration adds11emptySites to verify picker pages. Local synthetic only; no Cloudflare/CVE/native claim.


## v11 Unassigned Hosts

View unassigned hosts from Host list/detail reuses Site panel in null-membership mode: hides Site picker, shows exact null-Site Hosts with OS/version, hostname search/count and10-row paging. Assigned Hosts excluded. Return restores original full list/detail and context. Empty/error clears rows. No Site mutation. Temporary panel reload returns original route. `node scripts/inventory-ui-lab.mjs --hosts` has24null-Site Hosts/3pages and2assigned seed Hosts; hostname host-11 yields1. No nativeLinux/CVE/production claim.


### v12: unassigned Host links and history

In the `--hosts` local synthetic lab, open `/inventory/hosts#list=1&search=host-&page=2&page_size=10&unassigned=1&unassigned_search=host-&unassigned_page=2`. Reload restores the unassigned view, hostname search and parent page. Search/page changes push history; browser Back/Forward restores them. Return preserves origin list/detail and full-list search/page/size. OS/version remain declared inventory, not native verification.

Require unique unassigned=1. Optional unassigned_search is unique, <=200 characters without controls; unassigned_page is unique integer1..100000. Invalid marker, duplicates, controls or invalid page show explicit error and zero rows. Site picker remains a separate temporary view; no Site changes. Existing accepted GET site_assigned=false stays exact site_id IS NULL.

Reproduce: `node --test frontend/test/unassigned-navigation.test.mjs frontend/test/unassigned-hosts.test.mjs`; full `npm test`, `npm run lint`, `npm run build`. No production or credential inputs.


### v13 Site-picker routes (supersedes temporary picker limitation)
Run `node scripts/inventory-ui-lab.mjs --sites --hosts`; open `/inventory/hosts#list=1&search=host-&page=2&page_size=10&site_picker=1&selected_site=00000000-0000-4000-8000-000000000002&picker_page=2&site_search=host-&site_host_page=2`. Reload retains selected Sample Site, picker2/2, hostname search and Host2/2. Search, Site selection, picker/Host pages push browser history; return restores origin context. Existing unassigned routes remain separate.
Unique site_picker=1, optional UUID selected_site, positive picker_page/site_host_page<=100000, site_search<=200/no controls required. Invalid/duplicate/missing Site/out-of-range picker error clears all rows. Site resolution uses accepted Sites GET, bounded100pages of100 and8second timeout; selected Site may be off displayed picker page. No Site mutations. Test `node --test frontend/test/site-navigation.test.mjs frontend/test/site-hosts.test.mjs`. Synthetic substring host- also matches sample-host-a/b, giving16SampleSite Hosts.


### v14 package-to-host routes
Run `node scripts/inventory-ui-lab.mjs --packages --hosts`; open `/inventory/hosts#host=20000000-0000-4000-8000-000000000011&search=host-&page=2&page_size=10&package=20000000-0000-4000-8000-000000000111&package_search=2.0&package_page=2`. Reload restores shared-runtime/deb,2.0search,12matching observations/page2/2rows. Search/page changes push history; Back/Forward replay. Return restores Host detail or explicit full list context.
Require unique package UUID, unique package_page integer1..100000 and package_search<=200/no controls. Missing/invalid package, duplicates, bad/out-of-range page or conflicting Site/unassigned view clear rows with explicit error. Identity name/ecosystem resolved from accepted exact Package-hosts GET; no API/schema changes. Search remains package name/version, not hostname. No CVE conclusion. Test `node --test frontend/test/package-navigation.test.mjs frontend/test/package-hosts.test.mjs`.


### v15 port/process search route
`node scripts/inventory-ui-lab.mjs --hosts`; open `/inventory/hosts#list=1&search=host-&page=2&page_size=10&port_search=1&process_search=synthetic-listener&port_page=2`. Reload restores24matches/page2. Port8011 plus process ->host11/PID111; native Back/Forward replay. Return restores origin list/detail. Unique port_search=1, optional exact port1..65535, process_search<=200/no controls, port_page1..100000. At least one search required; invalid/duplicate/conflicting/out-of-range state clears all rows. Existing GET AND filters only, no scans/CVE. `node --test frontend/test/port-navigation.test.mjs frontend/test/port-search.test.mjs`.


### v16 combined main-list filters
`node scripts/inventory-ui-lab.mjs --hosts --sites`; open `/inventory/hosts#list=1&site_id=00000000-0000-4000-8000-000000000002&search=host-&page=2&page_size=10`. Main-list Site ID filter uses accepted Site UUID alongside hostname. Reload restores Site/search/page together; search/page/clear push history; detail return retains filters. SampleSite16matches/page2;host-11 ->1. UUID can be obtained from existing Site picker/accepted Sites GET; no new selector data source.
site_id/search/page/page_size must be unique when Site filtering is present; UUID format, hostname<=200/no controls, positive page<=100000 and allowed size10/25/50/100 required. Invalid combined state clears rows with error. Existing well-formed missing Site UUID returns valid empty result, as accepted API semantics; no existence claim. No Site mutation. `node --test frontend/test/combined-host-navigation.test.mjs`.


### v17 Host scoped detail: run `node scripts/inventory-ui-lab.mjs --hosts --host-detail`; open `/inventory/hosts#host=20000000-0000-4000-8000-000000000011&package_detail_page=2&port_detail_page=2&search=host-&page=2&page_size=10`. Optional30extra packages+ports yield31each/2pages/6rowseachpage2. Reload/history restores both independently; change one retains other. Unique positive child pages1..100000 require Host identity; malformed/duplicate/conflicting/out-of-range clears all detail/child data. Return keeps parent context. No native claim.
