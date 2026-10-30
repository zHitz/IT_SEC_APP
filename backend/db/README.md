# PostgreSQL schema — S0-002

Source of truth: schema.json (22 business entities + 2 technical many-to-many junctions). Generated migration up/down and DBML are committed together; `npm run db:generate` refreshes them and lint checks drift. This is the project's first migration mechanism; no previous migration tool existed in S0-001. One SQL migration boundary `migrate.mjs` runs the same files through pg (server) or PGlite (tests), not two competing migration systems. No business logic, API or collector.

## Verify without PostgreSQL daemon

From repo root, Node 24: `npm ci`, `npm run db:verify`, `npm test`. Verification uses a new in-memory **PostgreSQL 17.5 WASM / PGlite 0.3.16** database, executes up/seed/inspection/down, and writes `Docs/evidence/S0-002/schema-inspect.json`. It does not read DATABASE_URL or contact outside systems. This does not prove Docker/native daemon operational parity or concurrency/load behavior. Seed is synthetic and explicit, never run at app startup.

## PostgreSQL 17 server

Set DATABASE_URL in ignored root .env to a disposable local/test database; use a dedicated test account. Do not use production. `npm run db:up`, `npm run db:seed`, `npm run db:inspect`, `npm run db:down`.

Up creates only `asset_inventory` schema and marks it `atlas:s0-002:001`. It fails if already present (does not silently mutate existing data). Each file is transaction-wrapped. Down refuses unmarked/absent schema, then drops only this owned schema and its data. No public tables are dropped, no migration-history business entity is added. Run only on a disposable test database. If down/up needs a different migration version later, add a new explicit version and plan; do not overwrite applied migrations.

Compose does not publish DB host port. If testing inside backend container, set DATABASE_URL to its internal database service and run `docker compose exec backend node backend/dist/db/migrate.mjs up` (and seed/inspect/down). Container path has production pg dependency; Docker validation remains S0-001 follow-up, not claimed tested here.

See `Docs/DATA_MODEL.md` for SRS mapping, nullability/cardinality/identity and technical junctions. SQL source/seed do not include real secret/token/infra values. Seed is not idempotent: intended for fresh database only, rerun must fail rather than duplicate an inventory. Discovery idempotency belongs to future ingest tasks.
