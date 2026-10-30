BEGIN;
DO $$ BEGIN
  IF obj_description(to_regnamespace('asset_inventory'), 'pg_namespace') IS DISTINCT FROM 'atlas:s0-002:001' THEN
    RAISE EXCEPTION 'Refusing to remove an absent or unowned schema';
  END IF;
END $$;
DROP SCHEMA asset_inventory CASCADE;
COMMIT;
