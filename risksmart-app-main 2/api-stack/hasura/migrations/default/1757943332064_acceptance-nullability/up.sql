ALTER TABLE risksmart.acceptance
ALTER COLUMN "Details" DROP NOT NULL;

ALTER TABLE risksmart.acceptance_audit
ALTER COLUMN "Details" DROP NOT NULL;