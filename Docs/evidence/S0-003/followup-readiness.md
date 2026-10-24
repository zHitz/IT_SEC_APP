# Native follow-up readiness — S0-003 v3

Assigned by Lead at01:36 on2026-10-25; v2 PARTIAL PoC ACCEPT remains unchanged. V3 is a local readiness deliverable, not native Linux/osquery acceptance. No distribution installation, production host selection, token discovery, remote connection or native binary execution is performed by the readiness script.

## Current local checks

```powershell
node --test backend/test/osquery-native-readiness.test.mjs
npm run osquery:native-check
```

Expected on this machine: valid deb/rpm JSON/content checks, then exit2 with status=NATIVE_NOT_AVAILABLE and reason=PLATFORM_NOT_LINUX. Fields nativeExecuted=false,binaryExecuted=false,tokenRead=false,networkRequests=0,distributionInstalled=false must remain explicit. Exit2 is the intended fail-closed outcome, not a reason to fabricate a native run. Invalid JSON/options/view/query content returns exit1/CONFIG_INVALID. Only a Linux executable-file candidate returns exit0/NATIVE_CANDIDATE_PRESENT; actual version/queries/install/host checks remain separate.

Config validation requires only disable_events=true and exactly the packages view: SELECT name, version FROM deb_packages (deb) or rpm_packages (rpm). Unsafe extra keys/views, SELECT-star, commandline/environment projections or unexpected source SQL fail. The collector retains the five logical dataset projections; underlying package view mapping is documented in v2. Readiness does not execute these queries.

## Remaining native follow-ups and exact evidence

Follow collectors/osquery/NATIVE-RUNBOOK.md on each of three approved Linux/osquery lab hosts. It contains the five setup/verification stages and expected output. Host approval, trusted runtime/package delivery and secret provisioning must already exist; do not infer them from this file or choose a production machine.

### AC-1: real OS/package inventory on three distinct hosts

On each host record `hostname`, `uname -s`, `/usr/bin/osqueryi --version` and `/usr/bin/osqueryi --json "SELECT hostname, uuid FROM system_info"`. Use the configured native collector, not sqlite-lab. Backend SQL:

```sql
SELECT h.host_uuid,h.hostname,h.os,h.os_version,h.source,h.first_seen_at,h.last_seen_at,h.confidence,
       count(DISTINCT p.id) AS package_count
FROM asset_inventory.host h
LEFT JOIN asset_inventory.package p ON p.source_host_id=h.id
WHERE h.host_uuid = ANY($1::text[])
GROUP BY h.id ORDER BY h.host_uuid;
SELECT p.name,p.version,p.ecosystem,p.source,p.first_seen_at,p.last_seen_at,p.confidence
FROM asset_inventory.package p JOIN asset_inventory.host h ON p.source_host_id=h.id
WHERE h.host_uuid = ANY($1::text[]) ORDER BY h.host_uuid,p.name,p.version;
```

Bind $1 to exactly the approved native host UUIDs in the operator's SQL client; do not run with a guessed broader scope. Expect3distinct hosts, real Linux OS versions, nonempty package/version rows and osquery provenance. Simulator rows are excluded by the explicit UUID list and never counted as native.

### AC-3: filled before/after native checklist

For each host record exact before/after timestamps, operator/approval reference, distro/osquery/Node versions and a result for each row below. Use the same approved read command both times. Keep sensitive raw outputs local and attach only reviewed/redacted evidence.

| Check | Before/after read command | Required result |
|---|---|---|
| Installed packages | dpkg-query -W (deb) / rpm -qa (rpm) | Only approved osquery/collector installation difference. |
| Service configuration | systemctl list-unit-files --no-pager | No unrelated service changes/restarts; installation log records any allowed agent action. |
| Addresses/routes | ip -j address; ip -j route | Unchanged except pre-existing fluctuations explicitly explained; collector must not reconfigure. |
| Firewall configuration | Approved platform read command, e.g. sudo nft list ruleset | Unchanged rules; never call add/delete/flush. |
| Collector paths | Configured queue/raw/log directories only | Own component writes only; no commandline/env/file-content discovery. |

An immutable SQLite fixture hash is NOT a replacement for this checklist. If a platform lacks a listed read tool, use an already approved installed read-only equivalent and record it; do not install unrelated tools or alter policy to obtain evidence.

### AC-4: fresh native install in exactly five stages

Execute the five NATIVE-RUNBOOK.md rows on a fresh approved lab target, preserving each command/output and backend SQL confirmation. State whether osquery/Node were preinstalled or installed from the approved component package. Native fresh-install evidence must show a real running osquery source; the existing simulator installation remains separate evidence. At most5hosts under the PoC scope.

### AC-2/AC-5/AC-6 regression alongside native evidence

Do not rerun the accepted600010ms simulator outage merely for a checkpoint. For the native follow-up, retain collection/retry/queue IDs during an authorized600000ms backend-side outage, restore it and query counts/timestamps before/after. Example listener query:

```sql
SELECT h.host_uuid,l.protocol,l.port,l.bind_address,l.process,l.pid,l.source,
       l.first_seen_at,l.last_seen_at,l.confidence,l.raw_ref
FROM asset_inventory.listening_port l JOIN asset_inventory.host h ON h.id=l.host_id
WHERE h.host_uuid = ANY($1::text[]) ORDER BY h.host_uuid,l.protocol,l.port;
```

Expect first_seen_at preserved, last_seen_at advanced to latest observation, no duplicate natural identities, only listening process data in inventory. Non-listening PID/name/count stays raw-only. Use the actual native collector's sanitized batch evidence; verify excluded keys/canaries as appropriate. No new Process table/schema. Run `npm test`, retain actual output and distinguish local checks from native evidence.

## Boundaries

V3 validates readiness without claiming Linux/osquery availability on Windows. It does not read a token, install WSL/Docker/distributions, pick a host, SSH, change system/network/firewall policy, bypass auth, or touch production. Optional future native commands are for already approved operators/targets; a candidate-file check does not grant authorization or prove binary authenticity. Follow-up evidence must preserve these distinctions in the same canonical RESULT version history.
