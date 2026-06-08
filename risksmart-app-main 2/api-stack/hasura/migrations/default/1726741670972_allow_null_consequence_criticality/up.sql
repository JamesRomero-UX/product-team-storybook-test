ALTER TABLE risksmart."consequence"
  ALTER COLUMN "Criticality" DROP NOT NULL;

ALTER TABLE risksmart."consequence_audit"
  ALTER COLUMN "Criticality" DROP NOT NULL;
