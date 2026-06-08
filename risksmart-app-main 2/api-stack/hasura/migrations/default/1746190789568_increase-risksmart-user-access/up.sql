-- grant usage for risksmart schema
GRANT USAGE ON SCHEMA risksmart TO risksmartuser;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA risksmart TO risksmartuser;

ALTER DEFAULT PRIVILEGES IN SCHEMA risksmart
GRANT ALL PRIVILEGES ON TABLES TO risksmartuser;

-- grant usage for auth schema
GRANT USAGE ON SCHEMA auth TO risksmartuser;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth TO risksmartuser;

ALTER DEFAULT PRIVILEGES IN SCHEMA auth
GRANT ALL PRIVILEGES ON TABLES TO risksmartuser;

-- grant usage for hasura event trigger function
GRANT USAGE ON SCHEMA hdb_catalog TO risksmartuser;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA hdb_catalog TO risksmartuser;

ALTER DEFAULT PRIVILEGES IN SCHEMA hdb_catalog
GRANT ALL PRIVILEGES ON TABLES TO risksmartuser;

-- grant usage for switching to trpc role
GRANT trpc to risksmartuser;
