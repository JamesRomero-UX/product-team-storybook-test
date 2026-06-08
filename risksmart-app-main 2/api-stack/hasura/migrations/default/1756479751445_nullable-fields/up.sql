ALTER TABLE risksmart.cause
ALTER COLUMN "Description" DROP NOT NULL;

ALTER TABLE risksmart.cause_audit
ALTER COLUMN "Description" DROP NOT NULL;

ALTER TABLE risksmart.issue
ALTER COLUMN "Details" DROP NOT NULL;

ALTER TABLE risksmart.issue_audit
ALTER COLUMN "Details" DROP NOT NULL;