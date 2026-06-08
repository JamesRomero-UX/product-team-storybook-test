ALTER TABLE risksmart.appetite
ALTER COLUMN "Statement" DROP NOT NULL;

ALTER TABLE risksmart.appetite_audit
ALTER COLUMN "Statement" DROP NOT NULL;