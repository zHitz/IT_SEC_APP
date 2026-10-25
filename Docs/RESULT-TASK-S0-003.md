# Result — TASK-S0-003: Unassigned Hosts

| Field | Value |
|---|---|
| Task ID | TASK-S0-003 |
| Result version | v11 |
| Status | PARTIAL |
| Spec version followed | SRSv1.0; TASK-S0-003; Lead09:06 ACCEPT v10 and v11 assignment |
| Dev agent | Codex — Dev AI Agent |
| Submitted at | 2026-10-25T09:20:02.533229+07:00 |
| Source/evidence commit | dc45a7314989ee0d58fb1500921ddf42738f9bc0 |

## 1. Summary

PARTIAL overall retains original nativeLinux/osquery AC1/3/4 gaps. All assigned v11 unassigned-Host requirements complete: exact nullSite filter, OS/version, hostname search/count/pages and full list/detail return.51/51tests,lint77/schema22+2/114FK,buildPASS. No Site/schema/entity/Cloudflare/CVE/production mutation or expansion.

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

| V8-1 | Host package opens all matching hosts and versions | PASS: exact-name/null-safe ecosystem GET; actual24host/two-version READ ONLY SQL and browser proof. |
| V8-2 | Package-name/version search, pagination and total | PASS: literal bound search, page/count one statement,24records/3pages;2.0 search12records/2pages; empty state and invalid queries tested. |
| V8-3 | Return to originating Host and Host list with context | PASS: test restores Host11; actual browser restores Host11/PID111 and list host-/page2/3/size10. |
| V8-4 | Atlas style/local opt-in/no schema or CVE inference; docs/full checks | PASS: existing tokens/frame and fixed loopback GET proxy;45/45tests,lint67/schema22+2/114FK,buildPASS. |

| V9-1 | Search listening port or process and show matching Host/port/process/PID | PASS: exact8011 ->Host11/PID111; case-insensitive process24matches; real read-only SQL and browser proof. |
| V9-2 | Pagination and total | PASS:24listening records/3pages,10/page; actual second page Host11–20; both filters AND and empty matches tested. |
| V9-3 | Return list/detail and existing style/context | PASS: actual browser Host11 and list host-/page2/3/size10 retained; existing frame/tokens. |
| V9-4 | Docs/tests/local opt-in/schema unchanged/no CVE/Cloudflare | PASS:48tests,lint72/schema22+2/114FK,buildPASS; no schema/collector/Cloudflare changes. |
| R8-1 | Record exact v8 commit and exact v9 header | PASS: v8 hash914f875363559acb1dc870bfb60f78a3592f83ce recorded in section7; exact v9 implementation hash above. |

| V10-1 | Filter Hosts by existing Site with OS/version | PASS: exact accepted FK site_id; Sample16hosts/Secondary10; Host15 excluded from Sample; OS12.3 shown. |
| V10-2 | Hostname search/count/pages | PASS:16hosts/2pages, hostname11 ->1; Site picker13Sites/2pages in integration; valid unknown UUID0rows, invalid400. |
| V10-3 | Return full list/detail, existing style/context | PASS: browser Host11detail and full list host-/page2/3/size10 retained; Atlas tokens/frame. |
| V10-4 | Docs/full tests/local read-only/schema unchanged/current hash | PASS:50tests,lint76/schema22+2/114FK,buildPASS; exact source above; no forbidden expansion. |

| V11-1 | Only Hosts with site_id null, OS/version | PASS: exact IS NULL predicate;24nullSite Hosts,2assigned excluded; OS12.3 rendered. |
| V11-2 | Hostname search/count/pagination | PASS:24hosts/3pages, host11 ->1; assigned sample-host searchempty; invalid/conflicting query400. |
| V11-3 | Return full list/detail and existing style/context | PASS: browser Host11detail and full list host-/page2/3/size10 retained; dedicated unassigned controls. |
| V11-4 | Docs/full checks/read-only/schema unchanged/current hash | PASS:51tests,lint77/schema22+2/114FK,buildPASS; no Site writes, exact current source above. |

## 3. Work completed

Extended existing Host GET with explicit site_assigned=false ->IS NULL and true ->IS NOT NULL. Conflicting site_id is rejected. Existing Site panel gains dedicated unassigned mode with hidden picker, accurate accessible labels, scoped search/count/pages and origin return; no new component architecture or backend mutation.

## 4. Files changed

| File | Purpose |
|---|---|
| backend/src/inventory/reader.mjs | Strict unique site_assigned validation and null/non-null predicate. |
| frontend/src/site-hosts.mjs | Unassigned entry/mode/labels/query/count/errors/return; Site picker hidden. |
| frontend/test/unassigned-hosts.test.mjs | Actual read-only HTTP/PostgreSQL nullmembership/search/pages/errors/return/noMutation. |
| Docs/HOST-INVENTORY-API.md | Boolean filter/conflict contract. |
| Docs/HOST-INVENTORY-UI.md | Unassigned flow/reproduction/limits. |
| Docs/evidence/S0-003/unassigned-v11.json | Observed proof and limits. |
| Docs/evidence/S0-003/test-v11.txt | Complete51test output. |
| Docs/evidence/S0-003/lint-v11.txt | Actual77module/schema check. |
| Docs/evidence/S0-003/build-v11.txt | Actual buildPASS. |
| Docs/evidence/S0-003/unassigned-page-v11.png | Browser24nullSite Hosts/page2/OS versions. |
| Docs/evidence/S0-003/unassigned-search-v11.png | Host11single unassigned result. |
| Docs/evidence/S0-003/unassigned-back-v11.png | Full-list return retains context. |
| Docs/RESULT-TASK-S0-003.md | Current-source canonical v11 report. |

## 5. Run and verify

Repo root: `npm ci`, `npm run lint`, `npm test`, `npm run build`. `node scripts/inventory-ui-lab.mjs --hosts` emits local origin. Open `/inventory/hosts#host=20000000-0000-4000-8000-000000000011&search=host-&page=2&page_size=10`; View unassigned hosts ->24/3pages, Next, search host-11 ->1. Return detail/full list retains context. API `/api/v1/inventory/hosts?site_assigned=false&page=1&page_size=10`. Synthetic only.

## 6. Tests and actual results

51/51tests pass, lint77modules, unchanged22entities+2junctions/114FK, buildPASS. Actual HTTP/PostgreSQL17.5WASM BEGIN READ ONLY proves24nullSite versus2assigned, OS/version/search/pages, no stale503/empty rows, strict invalid/duplicate/conflicting filter400, both returns and no Site mutation. Real browser independently verifies24/page2, Host11search and returns. Prior Site/Domain/collector tests pass;600010ms experiment not rerun.

## 7. Issues and implementation decisions

Unassigned means literal SQL NULL Site membership, not missing names/tags/inferred locations. Boolean true filter also supported symmetrically; no Site lookup or write. Combining site_assigned with site_id rejects400. Site panel reuse hides picker and changes accessible search/paging labels; initial/updated final51test suite passed, no failed task tests. Temporary view reload returns origin. Exact current hash/time/Summary above; historical v8 source914f875363559acb1dc870bfb60f78a3592f83ce retained.

## 8. Not done, limitations and technical debt

Original nativeAC1/3/4 remain unverified; prior Windows SQLite Linux-inventory simulation plus real HTTP/PostgreSQLWASM is not native deployment. No Site create/edit/delete, schema/entity, Cloudflare/CVE/production/RBAC change. No panel reload persistence or scale benchmark. Prior mandatory native follow-ups/600010ms evidence preserved. No viewport/reduced-motion runtime claim.

## 9. Blockers and decisions required

No hard blocker for v11; no new PO/security/spec decision or Q01–05 answer. Native follow-ups remain separate.

## 10. Next step and self-check

Attach actual RESULT/guides/proof/logs/screenshots; update existing QA PR without merge. Continue separately assigned flagged-Domain route persistence after this handoff.

- [x] Ten sections and individual original/historical/new ACs.
- [x] Exact current source/time/Summary, every file and actual command/output.
- [x] Limits/assumptions retained; PARTIAL honest about native gaps.
- [x] Local/read-only/no-secret/no-Site-write boundaries; actual attachments prepared.

History: v10Site filter accepted Lead09:06; v11unassigned complete. Prior versions retained in Git/ClickUp.
