ALTER TABLE risksmart.impact_rating
ALTER COLUMN "CompletedBy" DROP NOT NULL;

ALTER TABLE risksmart.impact_rating_audit
ALTER COLUMN "CompletedBy" DROP NOT NULL;