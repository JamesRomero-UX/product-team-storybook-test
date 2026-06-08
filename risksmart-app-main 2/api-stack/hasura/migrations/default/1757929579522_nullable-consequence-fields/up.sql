ALTER TABLE risksmart.consequence
ALTER COLUMN "Description" DROP NOT NULL;

ALTER TABLE risksmart.consequence_audit
ALTER COLUMN "Description" DROP NOT NULL;

ALTER TABLE risksmart.consequence
ALTER COLUMN "Type" DROP NOT NULL;

ALTER TABLE risksmart.consequence_audit
ALTER COLUMN "Type" DROP NOT NULL;

ALTER TABLE risksmart.consequence
ALTER COLUMN "Criticality" DROP NOT NULL;

ALTER TABLE risksmart.consequence_audit
ALTER COLUMN "Criticality" DROP NOT NULL;