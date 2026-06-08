ALTER TABLE risksmart.test_result
ALTER COLUMN "TestType" DROP NOT NULL;

ALTER TABLE risksmart.test_result_audit
ALTER COLUMN "TestType" DROP NOT NULL;