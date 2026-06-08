CREATE USER risksmartuser;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rds_iam') THEN
    GRANT rds_iam TO risksmartuser;
END IF;
END $$;
