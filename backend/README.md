# Backend

Native Node24 ESM HTTP boundary. `src/app.mjs` routes JSON with request_id / X-Request-Id and nosniff/no-store headers; `config.mjs` validates listener configuration; `server.mjs` wires optional PostgreSQL osquery ingest. GET /health remains liveness only. All unconfigured/unknown business routes return404.

S0-003 adds POST /api/v1/ingest/osquery only when OSQUERY_AGENT_TOKENS, DATABASE_URL and OSQUERY_RAW_DIRECTORY are configured. Each bearer token is bound to a host_uuid; JSON is strict, at most1MiB, and unknown/sensitive fields are rejected. See `collectors/osquery/API.md` and `collectors/osquery/README.md`. Bootstrap failures are sanitized; the API stays disabled when no identities are registered. This is PoC authentication, not SSO/RBAC or authorization for production access.

The store serializes a dedicated connection and commits one batch transaction. Schema/owner/site rules from S0-002 remain intact. Backend Docker source packaging includes these modules; optional Compose identity/environment settings and a raw evidence volume are supplied, but Docker/native pg startup remains unverified on this workstation.

Run `npm test` from root. The lab scenario uses actual loopback HTTP and PostgreSQL17.5WASM with explicitly simulated source hosts. The frontend shell keeps its existing UX/style and only proxies health; no inventory UI was added.
