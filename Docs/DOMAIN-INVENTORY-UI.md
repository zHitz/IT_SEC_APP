# Domain/DNS inventory page — S0-004

Current V7 detail uses exact-owner API. The V6 candidate-search description below is historical and superseded.

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

Only GET /api/v1/inventory/domains and /dns-records (with query) forward to the fixed numeric loopback backend. No user-supplied origin or cookie/auth forwarding, redirect following, write method or arbitrary path. Host/Package/ListeningPort GET routes were subsequently added under S0-003 v5, using the same opt-in boundary. Responses are JSON with no-store/CSP/nosniff. Unexpected/network/oversized upstream response becomes502. The known static page and two JS modules are an explicit route allowlist; source/env/docs are not served. No Cloudflare client or credentials imported.

## Verification

`node --test frontend/test/domain-inventory.test.mjs frontend/test/domain-proxy.test.mjs`; `npm run lint`; `npm test`; `npm run build`. DOM tests use pinned dev-only linkedom0.18.12; actual HTTP tests use PostgreSQLWASM and the accepted v4 API. Real browser checks recorded in Docs/evidence/S0-004/ui-v5.json: rendering25domains,10rows/page and Next ->page2, DNSresource, flag->6records, search sample-08+flag->1record, dark/light screenshots. Browser viewport override is unavailable; exact390/1024/1440responsive runs and reduced-motion runtime emulation are not claimed. CSS responsive/reduced-motion rules are provided; screenshots show the actual available browser size.

Troubleshoot: page404 ->frontend flag off; API404 ->backend flag off; unavailable ->check local backend/port/flags. No automatic fallback to fixture data hides errors. The explicit lab is separate from actual local database mode.


## V6 Domain details

Click a Domain name on the Domains resource to open an in-page detail view in the existing Atlas frame. Header shows the selected API observation: fqdn/id/source/first_seen_at/last_seen_at/confidence/tags. Related DNS table includes type/value/proxied/TTL/tags and exact stored outside-known-range flag status (Flagged/Not flagged). False is explicitly displayed, null is an em dash. No live DNS/CIDR recomputation. Back preserves the existing list DOM/controller search, flag, page and page size; browser popstate also returns to the list, with focus restoration. Full reload starts the list; fragment is session navigation context, not a standalone deep-link promise.

Uses only the accepted v4/v5 GET list APIs, with no new backend contract/schema. Because DNS search is literal substring rather than exact equality, detail reads all bounded candidate pages for the selected fqdn (up to100pages x100candidates), then enforces row.domain===selected.fqdn before rendering/local25-rowpaging and exact-owner counts. For fqdn longer than200characters, existing API search uses the first200 as candidate prefix while full equality remains mandatory. Overlapping names such as api.sample-12.test cannot leak into sample-12.test detail. More than100candidate pages or any error yields explicit unavailable/limit state with no partial records; timeout8seconds and Retry/Back remain. No claimed support for unbounded inventory; narrow exact-owner API can be separately assigned later. Candidate snapshots can change between requests; no new cross-page transaction guarantee.

Reproduce in explicit lab: search sample-, select10rows, Next, click sample-12.test. Verify sourcecloudflare/confidenceconfirmed/observationtimestamps, DNSA/198.51.100.25/proxiedfalse/TTL300/tags/Flagged; Back keeps sample- and page2. Apply Flagged, open sample-08.test and Back; filtertrue retained. Automated DOM+actual HTTP/PostgreSQL test additionally creates31records for one exact owner plus one overlapping-name trap; detail shows31/2childpages and excludes trap, then confirms Backsearch/filter/page. Above100candidatepages fails closed. No real Cloudflare request or osquery change.


## V7 exact-owner detail

Detail now re-reads GET /api/v1/inventory/domains/:id for authoritative current metadata, then GET /domains/:id/dns-records?page=N&page_size=25. One parent and one requested child page; no substring candidate collection or100-page candidate cap. Counts/page bounds are supplied by exact-owner SQL. Returned child domains are validated against current parent fqdn before rendering. All existing visible fields, stored flag semantics, Atlas style, Back/search/filter/page retention remain.

Unknown owner returns Domain not found and clears metadata/related rows; other failures expose Retry/Back with no previous-owner partial data. This version does not add Domain standalone deep-link/reload persistence; context navigation remains as documented. No backend/schema or live data capability beyond the exact read-only lookup assigned by Lead.

Run `node --test backend/test/domain-exact.test.mjs frontend/test/domain-detail.test.mjs frontend/test/domain-proxy.test.mjs`; full lint/test/build. Actual SQL/HTTP tests prove exact-owner equality with overlapping trap, server pages/counts,32owned records, missing404 and disabled gates. Frontend tests retain31record/2childpage/back proof and verify10001server-count metadata without scanning; no claim that10001fixture records were inserted. Explicit synthetic lab remains the same command; no token required.


## v8 Domain navigation

Direct local links use `/inventory/domains#domain=<UUID>&search=sample-&outside_known_range=true&page=1&page_size=10`. UUID identity is sufficient for the assigned UUID-or-fqdn alternative. Legacy `#detail=<UUID>` remains supported. Only identity and validated list context enter history, never a saved entity snapshot. Reload resolves the parent and exact-owner DNS page anew through the v7 GET API. Native Back/Forward restores selection; the Back button returns to the prior list, or reconstructs list context for a direct entry. Missing and malformed identities clear metadata and DNS rows before showing an explicit error. Search/filter/page/page-size survive a detail round trip. No production auth or external API access is enabled.

Regression: `node --test frontend/test/domain-navigation.test.mjs`. Uses actual synthetic HTTP/PostgreSQL WASM with fresh DOM remount for reload and an injected browser-history model; it is not native Linux or scale evidence.


## v9 Search DNS values

Choose Search DNS values from either Domain/DNS list or Domain detail. Enter an IP, hostname or other stored value; Find DNS records displays Domain, type, value, proxied,TTL,tags with10rows/page and total. Matching is a case-insensitive literal substring, not CIDR or wildcard. Back to previous list or detail restores the entry view and its existing list search/filter/page state. Search is global stored DNS inventory, independent of the list filter; that filter remains retained on return. Empty input shows guidance; errors clear rows and can be retried by searching. Browser route navigation closes this temporary panel; reload restores original Domain/list route, not search results. No external DNS/Cloudflare calls. Synthetic lab: `node scripts/inventory-ui-lab.mjs`;192.0.2.25 yields18records/2pages,198.51.100.25 yields6records.


## v10 Reloadable DNS search routes

Direct link: `/inventory/domains#value_search=192.0.2.25&dns_page=2&search=sample-&page=2&page_size=10`. Optional `domain=<UUID>` preserves the originating detail; list search/filter/page use existing keys, while `dns_page` is independent. Reload fetches fresh results through accepted value_search GET. Submitting a new value or changing DNS page creates a native history entry; Back/Forward restores the value and result page. The explicit return button navigates to the origin list/detail route without value_search. Empty/control/duplicate values show an error with zero result rows. DNS page defaults1 and is bounded100000. Value length1–200 and literal matching unchanged. Previous v9 non-persistent panel limitation is superseded. No live DNS/Cloudflare/schema/osquery change.


## v11 Flagged domains

View flagged domains from list/detail uses accepted `domains?outside_known_range=true` (exact stored DNS tag),10domains/page with domain total and hostname search. Each Domain card shows its exact-owner DNS records, child total and10-record independent child pagination; includes both flagged and unflagged records belonging to that flagged Domain. No tag/algorithm recalculation. Back restores entry list/detail and context. Empty/error clears all cards. One parent request plus at most10child-page requests per load, bounded8second timeout; child pages explicit, never silently truncate. Temporary view is not URL-persisted; reload returns original route. Synthetic `--flagged` lab uses48domains/12flagged for2parent pages; integration adds12records to one owner to prove child pagination. No liveCloudflare/schema/osquery change.


### v12: flagged view links and browser history

Open `/inventory/domains#list=1&search=sample-&page=2&page_size=10&flagged=1&flagged_search=sample-&flagged_page=2` in the `--flagged` synthetic lab. Reload retains the flagged view, search and parent page. Searches and parent page buttons push browser history; Back/Forward replay them. Return restores the origin list/detail and parent context. Existing owner DNS type/value/proxied/TTL/tags and child paging remain. Child pages reset to 1 when restoring a route; child paging itself stays local.

`flagged=1` is required and unique. Optional flagged_search is unique, at most 200 characters without controls; flagged_page is a unique integer 1..100000. Invalid values, duplicates or combining flagged view with value_search show an explicit error and zero cards. Parent list page/search parameters retain their existing meaning. No schema, tag algorithm, osquery or Cloudflare changes.

Reproduce: `node --test frontend/test/flagged-navigation.test.mjs frontend/test/flagged-domains.test.mjs`, then `npm test`, `npm run lint`, `npm run build`. Actual HTTP/PostgreSQL and browser evidence is under `Docs/evidence/S0-004/*v12*`.


### v13 child DNS routes (supersedes local child-page reset limitation)
Run `node scripts/inventory-ui-lab.mjs --flagged-child`; open `/inventory/domains#flagged=1&flagged_search=sample-04&flagged_page=1&flagged_owner=10000000-0000-4000-8000-000000000004&child_page=2`. Optional fixture adds11synthetic DNS to existing sample04, total12/2pages. Reload and Back/Forward retain owner and child page; parent search/page changes clear child selection.
Unique flagged_owner UUID and child_page integer1..100000 required together; owner must belong to the encoded flagged parent page. Missing/nonflagged/offpage owner or child page outside actual record pages fails closed with explicit error and0cards. One child selection per fragment; other owners start page1. Type/value/proxied/TTL/tags unchanged, no flag algorithm or Cloudflare requests. Test `node --test frontend/test/flagged-child-navigation.test.mjs`.


### v14 Domain detail DNS page routes
Run `node scripts/inventory-ui-lab.mjs --detail-dns`; open `/inventory/domains#domain=10000000-0000-4000-8000-000000000004&detail_dns_page=2&search=sample-&page=2&page_size=10`. Optional fixture adds30syntheticDNS to sample04;31records/25perpage/page2has6rows. Reload/Back/Forward restore owner/page and preserve provenance/type/value/proxied/TTL/tags. Return keeps list search/page/size.
Unique detail_dns_page integer1..100000 requires Domain identity, cannot combine flagged/value-search state. Invalid/duplicate/out-of-range page clears details and DNS with explicit error. Uses accepted Domain exact GET and exact-owner DNS GET, no schema/flagalgorithm changes. `dns_page` remains DNS-value-search state; distinct detail_dns_page avoids collision. Test `node --test frontend/test/detail-dns-navigation.test.mjs`.


### v15 flagged DNS records (record level)
`node scripts/inventory-ui-lab.mjs --flagged`; open Domain list/detail, choose View flagged DNS records. Shows only records whose own tags include exact cloudflare:outside-known-range via accepted GET outside_known_range=true. Owner/type/value/proxied/TTL/tags shown; value_search combines with exact flag;10records/page and filtered total.12fixture records/2pages;page2sample44/48. Search198.51.100.25 ->12;192.0.2.25 ->0 despite unflagged stored matches. Empty/failed results clear table;8second abort timeout. Back restores origin list/detail. Temporary panel state resets on reload; flagged-owner view remains separate. No tag recalculation/API/schema/Cloudflare change. `node --test frontend/test/flagged-records.test.mjs`.


### v16 flagged-record route persistence
Supersedes v15 temporary-view reload limit. `node scripts/inventory-ui-lab.mjs --flagged`; open `/inventory/domains#list=1&search=sample-&page=2&page_size=10&flagged_records=1&record_search=198.51.100.25&record_page=2`. Reload/Back/Forward restores flagged record search/page; existing owner/type/value/proxied/TTL/tags/count retained. Return restores parent list/detail.
Unique flagged_records=1, optional record_search<=200/no controls and record_page1..100000 required; duplicate/invalid/conflicting flagged-owner/value/detailDNS state fails closed. Out-of-range real record page clears rows. Parent search/page separate. `node --test frontend/test/flagged-record-navigation.test.mjs frontend/test/flagged-records.test.mjs`. No API/schema/tag changes.
