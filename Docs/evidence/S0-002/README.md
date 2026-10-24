# S0-002 verification

schema-inspect.json comes from a fresh PGlite 0.3.16 / PostgreSQL 17.5 WASM instance using the committed migration/seed files: version, columns, native FKs, 0→24→0 tables, fixture counts and synthetic relational path. Local CI log records lint/test/build commands and times. Not a Docker/native daemon claim. Run `npm ci`, `npm run db:verify` to reproduce. No real infrastructure or credentials.
