ALTER TABLE risksmart."enterprise_risk_instance"
ALTER COLUMN "CreatedAtTimestamp"
SET DEFAULT statement_timestamp();

ALTER TABLE risksmart."enterprise_risk_instance"
ALTER COLUMN "ModifiedAtTimestamp"
SET DEFAULT statement_timestamp();