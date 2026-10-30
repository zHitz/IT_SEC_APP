# Fresh simulator installation — exactly five steps

This is an executable **Windows/Node SQLite Linux-inventory simulator** guide, not a native Linux or real osquery installation claim. It tests the same collector batching/queue/HTTP API/store with an isolated fresh fourth host. Prerequisites: Node24, repo dependencies already installed from lockfile, loopback access. Run from a fresh checkout/worktree where `var/osquery/fresh-install-lab` does not exist; the runner refuses to overwrite an existing lab. No real system/service/package/network/firewall settings are touched.

1. **Prepare a distinct fresh target.** Run `node scripts/osquery-install-lab.mjs 1`. Expected: STEP1 PASS, a new host.sqlite with its own system_info, no previous collector queue. The fixture explicitly identifies itself as synthetic.
2. **Capture before-state.** Run `node scripts/osquery-install-lab.mjs 2`. Expected: STEP2 PASS and baseline.json fingerprint covering the immutable simulated packages/services/network/firewall/config.
3. **Configure collector.** Run `node scripts/osquery-install-lab.mjs 3`. Expected: STEP3 PASS and collector.json with source path, separate queue, batch/interval/retry settings. The runner uses only a public synthetic identity marker, never real credentials.
4. **Run collector and delivery.** Run `node scripts/osquery-install-lab.mjs 4`. Expected: STEP4 PASS; a fresh collector child reads the five logical tables, queues batches and sends authenticated HTTP to a temporary local backend using persistent PostgreSQLWASM. No host mutation is performed.
5. **Verify inventory and after-state.** Run `node scripts/osquery-install-lab.mjs 5`. Expected: STEP5 PASS, one fresh host with2packages/1listening port, matching host-state fingerprint. Output is retained in Docs/evidence/S0-003/fresh-install.json. The simulated database remains under the ignored var/ directory for inspection.

Actual run output is attached in install-v2.txt. Native Linux/osquery deployment is described separately in README.md and remains unexecuted here; do not treat simulator evidence as real host installation evidence.
