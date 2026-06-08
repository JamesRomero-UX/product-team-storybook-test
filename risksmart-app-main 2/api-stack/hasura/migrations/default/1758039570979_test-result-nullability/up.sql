ALTER TABLE risksmart.test_result
ALTER COLUMN "Description" DROP NOT NULL;

ALTER TABLE risksmart.test_result_audit
ALTER COLUMN "Description" DROP NOT NULL;