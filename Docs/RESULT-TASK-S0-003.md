# Result — TASK-S0-003: Reloadable Host detail navigation

| Field | Value |
|---|---|
| Task ID | TASK-S0-003 |
| Result version | v7 |
| Status | PARTIAL |
| Spec version followed | SRSv1.0; TASK-S0-003; latest Lead03:53 v7assignment; v6ACCEPT retained |
| Dev agent | Codex — Dev AI Agent |
| Submitted at | 2026-10-25T04:13:02.225974+07:00 |
| Source/evidence commit | 7fa45a3415f4110acd84d6fe9873db29efe2c8d0 |

## 1. Summary

Completed all newly assigned Host navigation requirements: direct UUID fragment links, correct detail after reload, browser Back/Forward and retained list search/page/page-size. Unknown or malformed identity shows a clear error and clears detail metadata/related rows. Fresh read-only Host identity lookup avoids scanning lists or trusting stale history data. Actual DOM/HTTP/PostgreSQL and real browser proof;42/42tests,lint63modules/schema parity,buildPASS. Overall PARTIAL retains original native AC1/3/4 gaps; new v7work is complete. No Cloudflare/schema/production change.

## 2. Acceptance criteria

Original and V4–V6/QA rows retain their previously accepted evidence boundaries. V7 below supersedes the old full-reload limitation.

| ID | Criterion | Result / actual evidence |
|---|---|---|
| AC-1 | Three native Linux hosts with OS/packages | Native portion unverified; accepted v2 simulator evidence retained; v4 adds no native claim. |
| AC-2 | Actual ten-minute outage/recovery without loss | Previously accepted actual 600010 ms/60 batches/69 executions/pending0 retained in verification.json; not rerun. Fast regression remains green. |
| AC-3 | Native host changes limited to agent | Native portion unverified; v3 readiness/runbook retained, accepted. |
| AC-4 | Five-step native install works | Native portion unverified; accepted fresh simulator evidence and future native runbook retained. |
| AC-5 | Correct entity/upsert/timestamps | Accepted v2 evidence and full-suite regression pass; v4 reads existing schema only. |
| AC-6 | SELECT-only source and safe payload | Accepted source/privacy regression passes; v4 fixed field projections exclude raw payload and sensitive fields. |
| V4-1 | GET Host with OS/version, Package with version, ListeningPort with process/PID | Pass: actual ephemeral HTTP server and PostgreSQL17.5 WASM assertions in inventory.test.mjs; inventory-v4.json and test-v4.txt. |
| V4-2 | Hostname/package search, pagination and counts | Pass: case-insensitive literal substring (including %/_ and injection-shaped text), filtered/global totals, empty results, out-of-range pages and non-overlapping ordered pages. |
| V4-3 | Tests and endpoint documentation | Pass: HOST-INVENTORY-API.md covers methods, paths, query bounds, examples, fields, response/count semantics, errors, enabling and security boundary. 25/25 complete suite. |
| V4-4 | No schema/entity/Cloudflare/UI changes; synthetic only | Pass: scoped source commit lists only inventory reader, backend wiring, tests, guide and evidence; schema checker 22+2/114 FK. Actual integration queries execute inside BEGIN READ ONLY. |

| V5-1 | One frontend page showing Host OS/version, Package version, ListeningPort process/PID from accepted v4API | Pass: hosts.html/shared inventory-table/controller and real HTTP/PostgreSQL/browser screenshots. |
| V5-2 | Hostname/package search, pagination/counts, existing frame style | Pass: actual DOM tests, accepted API proxy tests and browser26hosts/10rows/page2/hostname1match/package1match/25listeners; Atlas tokens/shell/theme retained. |
| V5-3 | Local opt-in, no native/production/auth/schema/Cloudflare expansion | Pass: default404, explicit loopback page/proxy; accepted schema22+2/114FK unchanged, no collector/backend schema changes. |
| V5-4 | Frontend tests/docs and full checks | Pass:33/33tests,lint55modules,build pass; HOST-INVENTORY-UI.md exact commands/boundaries/behavior/limits. |

| V6-1 | Click Host -> detail with OS/version, scoped Packages/version and ListeningPorts/process/PID through accepted APIs | Pass: host-detail.test.mjs actual HTTP/PostgreSQL and browser host-11.test/OS12.3/package1.2.3/port8011/PID111; detail-v6.json/png. |
| V6-2 | Back returns to list preserving search/page and frame style | Pass: DOM and actual browser retain host- search, page2of3/10rows. back-v6.png. Shared Atlas tokens/shell remain. |
| V6-3 | Opt-in/local/no schema/Cloudflare/native expansion | Pass: same gated frontend/proxy/API; no backend contract/schema change. Existing disabled404 tests retained. |
| V6-4 | Frontend detail/render/back tests/docs and full checks | Pass:35/35tests,lint57modules/schema22+2/114FK,buildPASS; Host guide updated. |
| QA-1 | PR comment4368355476: stale replay must preserve Package latest raw_ref | Pass: conditional incoming>=observed_at update; regression opens actual referenced Host/Package/Port rawJSON after latest/repeat/stale replay and confirms latest collected_at. |
| V7-1 | Direct Host identity link and reload reconstruct correct detail | Pass: UUID fragment and legacy detail fragment; fresh Host lookup, no list scan/history-data trust. DOM fresh-document and actual browser reload proofs. |
| V7-2 | Native browser Back/Forward and list search/page retention | Pass: URL carries validated list context; actual browser and history tests return to searchhost-/page2 and forward to Host12/PID112. |
| V7-3 | Unknown/invalid Host has clear error and no other Host partial data | Pass: exact lookup404/400; metadata/related rows cleared; actual browser and HTTP/DOM tests. |
| V7-4 | Same local opt-in/style/schema boundaries, tests/docs/full checks | Pass:42/42tests,lint63/schema22+2/114FK,buildPASS; API/UI guides updated; no Cloudflare/schema/production change. |

## 3. Work completed

Read live STATE, ClickUp assignments and actual git/GitHub PR/CI/reviews before execution. Lead accepted v6 and assigned direct links/reload/history. Completed the active Domainv7 package first, then added Host identity lookup and isolated navigation controller, validated fragment/list context and error isolation, with hooks into the existing detail renderer. Posted [DEV][START] with actual targeted5/5tests. Ran full checks and real browser direct/reload/Back/Forward/error walkthrough, saved proof/screenshots, scanned and committed.

## 4. Files changed

Source commit7fa45a3 contains19files; this canonical RESULT is a separate report update.

| File | Specific change |
|---|---|
| Docs/HOST-INVENTORY-API.md | Documents exact Host identity endpoint fields/errors/read-only boundary. |
| Docs/HOST-INVENTORY-UI.md | Current direct-link/reload/history behavior, reproduction and superseded v6limitation. |
| Docs/evidence/S0-003/build-v7.txt | Actual ESM/database packaging output. |
| Docs/evidence/S0-003/history-v7.png | Actual native Back/Forward restored Host12/PID112. |
| Docs/evidence/S0-003/lint-v7.txt | Actual63module/schema parity output. |
| Docs/evidence/S0-003/missing-v7.png | Actual unknown-Host error with metadata/related rows empty. |
| Docs/evidence/S0-003/navigation-v7.json | Observed actual navigation/SQL/browser proof, limits and source/log hashes. |
| Docs/evidence/S0-003/reload-v7.png | Actual direct link after real browser reload, Host11/PID111. |
| Docs/evidence/S0-003/secret-scan-v7.json | Actual tracked-text known-pattern scan; binary files excluded. |
| Docs/evidence/S0-003/test-v7.txt | Actual full42test output. |
| backend/src/app.mjs | Allows Host identity route in the same optional GET-only exact dispatcher. |
| backend/src/inventory/exact-reader.mjs | Adds bound Host UUID identity lookup, missing400/404 handling and fixed field projection; shared Domain reader preserved. |
| backend/test/host-exact.test.mjs | Actual read-only SQL/HTTP lookup/OS/version/missing/invalid/query/method tests. |
| frontend/server.mjs | Whitelists Host identity GET proxy and new navigation module, retaining fixed loopback gates. |
| frontend/src/host-navigation.mjs | Parses identity/list fragment, validates context, manages direct/reload/list URLs and Back/Forward without copied Host metadata. |
| frontend/src/host-page.mjs | Bootstraps reloadable Host navigation controller. |
| frontend/src/inventory-detail.mjs | Adds navigation hooks, fresh Host lookup option and cleared metadata/title on error, without changing Domain exact behavior. |
| frontend/src/inventory-table.mjs | Accepts trusted initial list state from validated navigation context. |
| frontend/test/host-navigation.test.mjs | Actual synthetic API plus fresh DOM/history: direct/reload, Back/Forward, search/page retention, missing/invalid clearing and parser bounds. |
| Docs/RESULT-TASK-S0-003.md | Canonical v7 report with original native gaps, prior acceptance and current proof. |

## 5. Run and verify

Node24 from IT_SEC_APP: `npm ci`; `node scripts/inventory-ui-lab.mjs --hosts`. Open printed origin plus /inventory/hosts#host=20000000-0000-4000-8000-000000000011&search=host-&page=2&page_size=10. Reload: Host11, package11 and PID111 remain. Back to list retains searchhost-/page2. Open Host12, use native browser Back then Forward: Host12/PID112 restore. Replace fragment Host UUID with ffffffff-ffff-ffff-ffff-ffffffffffff for clear not-found; not-a-uuid for invalid link. `node --test frontend/test/host-navigation.test.mjs backend/test/host-exact.test.mjs`; full `npm run lint`, `npm test`, `npm run build`. All lab data synthetic, no token or nativeLinux claim.

## 6. Tests and actual results

Targeted5/5 passed including Domain exact-owner regression. Full sequence all exit0:42tests/pass42/fail0/duration9311.0947ms; lint63modules; schema22business+2junctions/114FK unchanged; build backend/frontendESM/database assetsPASS. Actual Host lookup SQL runs inside BEGIN READ ONLY; lookup/OS/version, missing404, invalid400/query400, unsupported404 and nonGET405 pass. Navigation test uses actual synthetic HTTP/PostgreSQL plus new DOM mount for reload and event-driven history for Back/Forward; URI context retained and error metadata/rows empty. Actual browser separately opened direct Host11, reloaded successfully, returned to searchhost-/page2, opened Host12 then native Back/Forward restored PID112. Unknown UUID displayed Host not found with empty metadata/related; malformed ID displayed Invalid host link. Three screenshots recorded. No final test failure. Native/browser-simulator evidence distinctions remain explicit.

## 7. Issues and implementation decisions

Chose UUID fragment identity, as Lead permits id or hostname. Added the small read-only Host lookup needed to resolve a standalone link without scanning host pages; no table/entity or accepted data mapping changed. URL stores identity and bounded list context only, not copied Host observations or credentials. Old #detail=UUID links still work. Direct-open Back returns safely to encoded list context; app-created detail entries use native history. Fresh parent lookup and matching child IDs prevent stale/cross-host partial results. Browser history behavior is isolated with injected navigation for tests and separately checked in real browser. No security/production policy decision or Cloudflare code change.

## 8. Not done, limitations and technical debt

Original nativeLinux/osquery AC1/3/4 remain unverified; accepted actual600010ms outage evidence retained without repetition. No production/token/Cloudflare/schema/authRBAC/nativePG/Docker changes. Hostname aliases and query-string routing are not promised; canonical UUID fragment and legacy detail fragment meet the assigned alternative. List context captures the Host list when entering detail; this is not a global application session-storage policy. Exact viewport/reduced-motion runtime emulation, assistive technology certification and huge-map performance are not claimed. PostgreSQL17.5WASM remains the actual lab engine.

## 9. Blockers and decisions required

No hard blocker for v7; all newly assigned navigation requirements pass. Original native verification still requires approved real Linux/osquery inputs. No Q01–05 answer or scope/priority/security decision was taken.

## 10. Next step and self-check

Push source/report to the live recorded feature branch and update the existing QA PR without merge. Upload actual canonical v7RESULT, API/UI guides, proof/logs/screenshots with one [DEV][SUBMISSION]PARTIAL comment; verify links and current GitHub CI/checkpoint. Await specific Lead/QA feedback rather than duplicate accepted work.

- [x] Ten ordered sections and exact task/version/status/spec.
- [x] Original/native limits and each V7criterion mapped separately.
- [x] Every changed file, real command/output and browser limit disclosed.
- [x] No secrets, production/native claim or repeated ten-minute run.
- [x] One canonical RESULT and accepted history preserved.

History: v2PoC accepted; v3readiness accepted; v4API accepted; v5frontend accepted; v6detail/QA raw-reference fix accepted by latest Lead03:53; v7Host direct/reload/history complete, overallPARTIAL for original native gaps. Prior canonical reports remain Git/ClickUp.

