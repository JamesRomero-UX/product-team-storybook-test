ALTER TABLE risksmart.assessment
ALTER COLUMN "Summary" DROP NOT NULL;

ALTER TABLE risksmart.assessment_audit
ALTER COLUMN "Summary" DROP NOT NULL;