# Osquery collector PoC — TASK-S0-003

The source adapter issues fixed SELECT projections for system_info, os_version, packages, listening_ports and processes. Data is batched into an authenticated backend endpoint, with a durable disk queue, finite retry/backoff and deterministic inventory upsert. The Lead decision at00:38 on2026-10-25 maps Port to ListeningPort and Process to its process/pid fields. Non-listening processes remain count/raw evidence only. Accepted S0-002 schema stays unchanged.

## Reproduce evidence

`npm test` runs fast safety/integration tests. `npm run osquery:verify` runs a **real ten-minute** backend outage with three separate source databases and repeated collector process exits/restarts, then drains disk queues and queries inventory. It writes Docs/evidence/S0-003/verification.json. Fast tests do not substitute their short outage for the ten-minute evidence. A separate fresh fourth-source install follows exactly five executed steps in INSTALL-LAB.md.

Environment disclosure: the available workstation is Windows. WSL enumeration could not return a usable distribution, Docker/osquery were absent. The lab uses three **SQLite Linux inventory simulations**, distinct hostnames/system_info UUIDs/OS versions/package sets. These are not real Linux kernels, containers, or a running osquery binary. Backend HTTP and PostgreSQL17.5WASM are real. SQLite source databases are opened readOnly, and full before/after file hashes cover all simulated host state. This proves the simulator was unchanged, not a native Linux service/package/firewall checklist. Native osquery/Linux installation and compatibility must not be claimed without a real run.

## Native adapter configuration (not executed here)

An authorized lab host must already have the Node24 runtime and approved osquery package available. Only install the osquery agent and this collector component; do not change network/firewall/system services or install unrelated dependencies. Copy collector source plus backend/src/ingest/osquery-model.mjs for shared validation. Set OSQUERY_COLLECTOR_CONFIG to a local JSON based on config.example.json and supply OSQUERY_INGEST_TOKEN through the secret environment. Run `npm run start:osquery`; `-- --collect-once`, `-- --flush-once`, `-- --once` are troubleshooting modes. Existing app source/dependencies are assumed installed, not downloaded by the collector.

On Linux, standard osquery has OS-specific package tables. To preserve the TASK's five logical names, osquery.deb.conf / osquery.rpm.conf defines a SELECT-only `packages` view over deb_packages / rpm_packages respectively. The collector itself still issues only SELECT name,version FROM packages. This technical mapping is documented under the Lead's self-resolution rule; the physical package table underneath the logical view is not a sixth discovery dataset or permission to query arbitrary tables. Config disables event collection and the collector passes disable_events=true. The native osqueryi/config-view path has not been executed here.

Configuration controls collectIntervalMs60s, sendIntervalMs15s, maxBatchRows200, maxQueueBytes64MiB, attempts3, backoffMs1000, query/HTTP timeout15s by default. Collection and delivery loops are independent, so finite network retries do not stop scheduled collection. Use one collector process per queue directory; no multi-process queue locking is claimed. A single host must have a unique stable system_info.uuid and its token must be bound to that UUID at the backend. No automatic enrollment or trust from hostname alone.

## Queue / idempotency / failure rules

Each batch is fsynced to a .tmp file then atomically renamed to a queue JSON file before delivery. Fresh collector processes read the same disk directory. Queue files are ordered by observation time and batch ID. Only a successful accepted=true response acknowledging the exact batch_id removes the file. Network/server errors retry at most configured attempts per delivery cycle, with exponential delay capped30s, then retain the file for the next cycle. Permanent400/401/403/413/415/422 errors retain the file and stop the cycle. No discard or infinite tight retry. Stale .tmp files from interrupted writes are not silently imported; power-loss filesystem durability is not proven by the process-restart test.

At queue capacity the collector refuses a new enqueue with backpressure, preserving every existing queued batch. This does not promise infinite storage or preservation of new observations while the queue is full; size/monitoring policy is explicit. A full/invalid queue is logged as a failed collector cycle and must be investigated; it is not silently cleared. Raw input fields are validated before disk enqueue.

Host identity is host_uuid; Package uses host+ecosystem+name+version; ListeningPort uses host+protocol+bind_address+port. Stable UUIDs and upsert preserve first_seen_at and advance last_seen_at. Existing owner/site metadata is not erased. normalized_version currently preserves the observed version string; package normalization/CVE matching is a future task. Non-listening processes never create a Process table or inventory row. Raw batch evidence includes their safe PID/name records and count. See API.md for limits/auth/errors.

## Privacy and read-only boundary

Queries explicitly select only hostname/UUID, OS name/version, package name/version, listener port/protocol/address/PID and process PID/name. They never select environment variables, command lines, file contents, shell history, credentials, cookies or private keys. Backend and collector reject unknown payload keys, rather than retaining arbitrary raw source objects. Synthetic fixtures contain cmdline/environ canaries; tests prove those columns do not enter the sent payload.

Collector writes only its queue/log/evidence paths and sends data to the configured internal ingest endpoint; it does not alter host configuration, services, network/firewall or unrelated packages. HTTPS is required except numeric-loopback HTTP for local lab. Backend optional API uses environment-only per-host bearer registration; missing config leaves ingest disabled. No token, full payload or raw exception body is logged. JSONL logs carry collection time, batch/retry status, counts and pending queue size. Raw files are excluded by var/ and should have restrictive deployment ACLs. No production/real-token access was used.

## Limitations

Native Linux/osquery evidence remains missing; the simulator is disclosed on every evidence artifact. No auto-deploy, Windows/macOS discovery, Docker/Kubernetes discovery, CVE matching, UI or production enrollment. No multi-process locking/load test, hard-power-loss guarantee or resource profiling. The endpoint is a bounded PoC interface, not deployment-ready SSO/RBAC. Docker wiring is supplied but not executed here.

Official references checked2026-10-25: [osquery configuration/views](https://osquery.readthedocs.io/en/5.12.1/deployment/configuration/), [deb_packages schema](https://github.com/osquery/osquery/blob/master/specs/linux/deb_packages.table), [rpm_packages schema](https://github.com/osquery/osquery/blob/master/specs/linux/rpm_packages.table).
