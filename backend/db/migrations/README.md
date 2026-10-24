# Migration 001

001.up.sql / 001.down.sql are generated from schema.json through scripts/generate-schema.mjs, then executed by backend/db/migrate.mjs. Exactly 22 business tables and 2 technical join tables, authorized by TL decision A (2026-10-24 21:44). Tables/columns use quoted snake_case and common provenance. Down intentionally removes all synthetic/data rows in this dedicated owned schema. Do not run against production or manually edit generated SQL; use model + generator + verification in the same change.
