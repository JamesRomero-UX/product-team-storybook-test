ALTER TABLE risksmart.risk
ALTER COLUMN "Description" DROP NOT NULL;

ALTER TABLE risksmart.risk_audit
ALTER COLUMN "Description" DROP NOT NULL;