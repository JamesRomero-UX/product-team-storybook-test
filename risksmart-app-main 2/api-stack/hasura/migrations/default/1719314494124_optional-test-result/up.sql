ALTER TABLE risksmart.test_result
ALTER COLUMN "OverallEffectiveness" DROP NOT NULL;

ALTER TABLE risksmart.test_result_audit
ALTER COLUMN "OverallEffectiveness" DROP NOT NULL;