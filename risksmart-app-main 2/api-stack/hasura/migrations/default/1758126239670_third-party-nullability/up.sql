ALTER TABLE risksmart.third_party
ALTER COLUMN "Criticality" DROP NOT NULL;

ALTER TABLE risksmart.third_party
ALTER COLUMN "CompanyName" DROP NOT NULL;

ALTER TABLE risksmart.third_party_audit
ALTER COLUMN "Criticality" DROP NOT NULL;

ALTER TABLE risksmart.third_party_audit
ALTER COLUMN "CompanyName" DROP NOT NULL;