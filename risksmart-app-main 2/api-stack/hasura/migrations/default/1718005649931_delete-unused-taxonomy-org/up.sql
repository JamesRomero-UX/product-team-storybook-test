delete from risksmart.taxonomy_org
where "OrgKey" is null;

ALTER TABLE risksmart.taxonomy_org
ALTER COLUMN "OrgKey"
SET NOT NULL;