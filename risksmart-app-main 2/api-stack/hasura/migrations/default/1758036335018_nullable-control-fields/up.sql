ALTER TABLE risksmart.control
ALTER COLUMN "Description" DROP NOT NULL;

ALTER TABLE risksmart.control_audit
ALTER COLUMN "Description" DROP NOT NULL;