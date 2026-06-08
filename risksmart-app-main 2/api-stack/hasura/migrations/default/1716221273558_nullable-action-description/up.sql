ALTER TABLE risksmart."action"
ALTER COLUMN "Description" DROP NOT NULL;

ALTER TABLE risksmart."action_audit"
ALTER COLUMN "Description" DROP NOT NULL;