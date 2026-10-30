SELECT current_setting('server_version') AS postgres_version;
SELECT table_name, column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = 'asset_inventory' ORDER BY table_name, ordinal_position;
SELECT c.conname, c.conrelid::regclass::text AS source, pg_get_constraintdef(c.oid) AS definition FROM pg_constraint c JOIN pg_namespace n ON n.oid=c.connamespace WHERE n.nspname='asset_inventory' AND c.contype='f' ORDER BY source,c.conname;
SELECT schemaname, tablename FROM pg_tables WHERE schemaname='asset_inventory' ORDER BY tablename;
