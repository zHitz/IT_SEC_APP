# Data model S0-002

SRS v1.0 §8/8.1, TASK-S0-002 and TL decision **A, 2026-10-24 21:44**. Task remains S0-002 only. S0-001's Docker and ADR follow-ups do not block this task; TL authorized temporary stack reuse at 21:17. No Pod/Process/Cluster/Remediation Recommendation business table is added. Graph identity is internal UUID, never IP/hostname alone.

## SRS → physical mapping (22 business entities)

| SRS entity | Table in asset_inventory |
|---|---|
| Host / Server | host |
| Workstation | workstation |
| Site | site |
| Service / Application | service |
| Deployment | deployment |
| Container | container |
| Image | image |
| Package / Library | package |
| Runtime / Stack | runtime_stack |
| Network Interface / IP | network_interface |
| Listening Port | listening_port |
| Firewall Rule | firewall_rule |
| Domain | domain |
| DNS Record | dns_record |
| Certificate | certificate |
| Route (Traefik) | route |
| Access Policy | access_policy |
| Identity Group / Role | identity_group_role |
| Vulnerability (CVE) | vulnerability |
| Finding | finding |
| Owner / Team | owner_team |
| Scan / Collection Run | collection_run |

Fields retain their SRS names; arrays remove the notation [] from the column identifier but keep PostgreSQL array type. `references` and all column/table names are quoted identifiers. `schema.json` defines entity-specific columns and required common columns. Source, timestamps, confidence, raw_ref, tags and environment are non-null; owner/site are nullable with real FK when present. Site/Owner source is **manual**, also in seed; seed tags and raw_ref identify their synthetic origin without contradicting the SRS manual-source rule.

## Technical junctions and source projections

| Table | Native FKs | Purpose |
|---|---|---|
| access_policy_identity_group | policy_id → access_policy.id; identity_group_id → identity_group_role.id | Many policies can allow many identity rows, no duplicate pair. |
| package_vulnerability | package_id → package.id; vulnerability_id → vulnerability.id | Many packages/CVEs, no duplicate pair; relation is fixture/config data, no matching algorithm. |

TL A permits technical many-to-many tables beyond the 22 business entities. Applied the same technical pattern to Package–CVE, reported explicitly for review. These tables have composite PKs and FK indexes, no business entity identity or invented provenance entity. **24 physical tables = 22 business + 2 technical**, never claim 22 total physical tables.

`access_policy.allowed_groups` remains the SRS array column but is a derived projection of junction identity UUIDs, sorted and refreshed on membership changes. Clients write the junction, not that array; a constraint trigger rejects divergence. FK membership checks are native constraints on the junction; triggers only maintain/verify the projection. Identity row's groups/roles contain names from IdP, with no extra user PII.

`finding.entity_ref` remains UUID; additional `entity_type` selects one of the 21 other existing business table names. Generated nullable typed columns each carry a native FK to that table. CHECK restricts the discriminator; invalid/nonexistent reference cannot be inserted. This adds columns/FKs, **not** a 23rd entity or a free-text relation. Self-referential Finding→Finding is not supported because not required by SRS. `vulnerability_id` is required when type=cve.

`package.source_host_or_image` is retained with source_kind (host/image). Two generated FK columns enforce the selected target without a new asset supertable; `normalized_version` preserves a second string alongside original `version`, not computed matching logic. Container/Deployment image_digest references the UNIQUE Image.digest, not the mutable tag.

## Relationship and extra-column mapping

- Domain.primary_service_id → Service; DNSRecord.domain / Certificate.domain → Domain.fqdn (UNIQUE business key), DNSRecord.network_interface_id → Network Interface → Host. Text `domain` is a constrained FK, not free text.
- Route.host_id → Host, Route.service_target → Service; AccessPolicy.route_ref → Route and AccessPolicy.service_id → Service. Service → Deployment.service_id → Container.deployment_id → Image.digest → Package.source_image_id. Optional branches may be unknown until collected; no artificial row is invented for unknown data.
- Host → ListeningPort.host_id (XOR Container parent), Host → FirewallRule.host_id. Process name/pid are columns on ListeningPort only.
- RuntimeStack.service_id → Service and Package.runtime_id → RuntimeStack link service stack/package instances; no separate global stack catalog assumption.
- Every business entity owner_id/site_id/collection_run_id has native FK, including optional self-links for Owner/Site/CollectionRun. Collection run provenance is optional until collected; raw_ref still required. Manual/seed rows use raw_ref, not fake collection events.
- Deployment has exactly one of host_id (native Host FK) or cluster_id (external Kubernetes cluster identifier). SRS has no Cluster entity, so **cluster_id is external metadata, not a FK to an invented table**. Internal relations among 22 entities have FK; external metadata cannot be inspected as a nonexistent entity relation. This interpretation is disclosed for TL review, not a hidden schema addition.
- Site.workstation_count/server_count are maintained by DB triggers as active-record counts when Host/Workstation moves site or changes record_status; clients treat these as read-only. Row updates use atomic deltas. Cross-connection stress/concurrency testing has not been performed.

## Data validity and deletion

All business tables have record_status active/missing/retired (separate from Finding/workstation/collection-run statuses); schema supports retaining rows and chronology. No deletion job/retention workflow or automatic risk scoring is added. FK ON DELETE RESTRICT protects references; migration down is the explicit destructive rollback in a dedicated disposable schema. All timestamp fields use timestamptz; first_seen_at <= last_seen_at; confidence is confirmed/inferred/stale. Service criticality, Finding type, port 1..65535 and Image digest uniqueness are DB constraints. Unknown environment strings are preserved per SRS “khác”.

## Diagram and evidence

`Docs/data-model.dbml` is generated with all 24 physical tables, entity columns including projections, and 114 native FK references; this file is the required dbdiagram artifact, not a screenshot of an unrelated graph. `npm run lint` checks SQL and diagram do not drift from schema.json. `npm run db:verify` executes SQL on fresh embedded PostgreSQL 17.5 and outputs full columns/FKs plus a synthetic Domain → Finding path. This is real SQL execution, not an in-memory JavaScript mock, and is not Docker/native daemon verification.

Seed uses sample.test and RFC5737 documentation IPs only. CVE-2099-00001 is a **synthetic placeholder, not a real advisory**. Never use fixture versions/risk scores as a security finding. Workstation has no package/process/port fields, only lightweight assigned_user/check-in data. Secret values are not collected or stored.
