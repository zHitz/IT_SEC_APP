# Standard server inventory API — TASK-S1-003

Opt-in inventory uses the accepted loopback deployment, read-only database pool and OIDC/session policy. No schema/migration, ingest mapping or production access changed. Legacy `/api/v1/inventory/*` readers remain compatibility adapters for the existing UI; the standard routes below share their authorization boundary and schema rather than inferring new data.

| GET route | Response |
|---|---|
| /api/v1/assets | Host list: data with type=host plus safe host fields; meta page/page_size/total/total_pages/as_of |
| /api/v1/assets/{host_uuid_id} | Exact database UUID host plus packages page; meta.as_of and meta.packages pagination |
| /api/v1/hosts/{host_uuid_id}/ports | Exact host's listening ports page; meta pagination/as_of/host_id |

IDs are database UUIDs (`host.id`), not collector host_uuid or hostname. Unknown well-formed IDs return404; malformed IDs400. Missing credentials401/WWW-Authenticate, valid unsupported roles including ServiceOwner403. Accepted Admin/SecurityAnalyst/InfraEngineer/Viewer/Auditor policy is unchanged, as are session/user/collector credential separation. POST/other methods405 after authorization; disabled standard readers404.

## Query contract

List supports only `type`, `env`, `site`, `owner`, `tag`, `q`, `page`, `page_size`, each once. type defaults host and only exact host is accepted; Docker/K8s types400. env matches stored environment exactly; site/owner are exact UUID equality against site_id/owner_id, never inferred names. Absent filter includes unassigned/null records; a supplied UUID never fabricates ownership/site. tag is exact case-sensitive array membership. q is a literal case-insensitive hostname substring (SQL wildcards/quotes have no special meaning). Filters combine with AND. Empty/control-character/over200character fields and unknown/duplicate query keys400. No historical as_of input or arbitrary SQL/sort expression is accepted.

List, detail package page and ports page use default50/max200 page_size, positive page bounded100000. Detail and ports accept only page/page_size. Stable list order hostname,id breaks ties; packages name,version,id; ports port,protocol,id. Out-of-range pages return empty data with accurate total. No silent relation truncation: detail packages carry their own page metadata and can be retrieved with the same detail endpoint's page query; ports have their own endpoint.

Each reader uses one SELECT/CTE statement for existence/count/page/provenance and statement_timestamp as_of. as_of is response snapshot time, not proof all source observations are equally fresh and not a historical replay feature. Repeated list calls need not have identical as_of. No 150-company-host claim follows from fixtures.

## Safe fields and source evidence

Host: id/type,hostname,ip_addresses,os,os_version,environment,owner_id,site_id,tags plus source,observed_at,first_seen_at,last_seen_at,confidence. Detail adds only packages whose source_kind=host and source_host_or_image matches this exact host; image packages are excluded. Packages return id,name,version,ecosystem and source timestamps/confidence. Ports return id,host_id,protocol,port,bind_address,process,pid and source timestamps/confidence.

Source evidence is provenance metadata. Raw raw_ref locations/file paths and raw payload bodies are not exposed; no environment values, command lines, file contents, process history, tokens or key material is selected. process/pid remain the already accepted listener attributes, not an expanded processes collection. No joins grant access to unrelated hosts/images.

## Reproduce

`npm ci`, then `node --test backend/test/assets.test.mjs backend/test/assets-http.test.mjs backend/test/osquery.test.mjs backend/test/oidc-http.test.mjs`. Actual signed-token/JWKS HTTP and PostgreSQL17.5 WASM fixtures run in isolation. HTTP test seeds207 synthetic hosts (2 accepted seed hosts+205 tie-order/page fixtures),2 packages (one image/one host) and1 listener. Combined env/site/owner/tag/q selects102 extra fixtures; page200 then page2 returns200 then5 of205. Test source and logs document exact assertions, including unchanged counts in READ ONLY transaction. Existing ingest tests independently cover identity/upserts/timestamp preservation. No new discovery or native browser action is executed.

Runtime env and setup are the S1-001/002 configuration; standard APIs do not add a separate credential or schema. Rollback code to prior authorized revision only through normal review; do not delete data or restore anonymous access. Independent current-revision QA/required CI still gate merge.
