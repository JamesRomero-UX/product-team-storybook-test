-- grant usage for hasura event trigger function
GRANT USAGE ON SCHEMA hdb_catalog TO trpc;

GRANT SELECT,
    INSERT,
    UPDATE,
    DELETE ON ALL TABLES IN SCHEMA hdb_catalog TO trpc;

ALTER DEFAULT PRIVILEGES IN SCHEMA hdb_catalog
GRANT SELECT,
    INSERT,
    UPDATE,
    DELETE ON TABLES TO trpc;