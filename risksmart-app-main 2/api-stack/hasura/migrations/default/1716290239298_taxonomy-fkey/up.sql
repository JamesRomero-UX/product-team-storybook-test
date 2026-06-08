ALTER TABLE risksmart.taxonomy_org
ADD CONSTRAINT "taxonomy_org_taxonomyid_fkey" FOREIGN KEY ("TaxonomyId") REFERENCES risksmart.taxonomy("Id");

ALTER TABLE risksmart.taxonomy_org
ADD COLUMN "OrgKey" text NULL;

ALTER TABLE risksmart.taxonomy_org_audit
ADD COLUMN "OrgKey" text NULL;

ALTER TABLE risksmart.taxonomy_org
ADD CONSTRAINT "taxonomy_org_orgkey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.taxonomy_org_audit
ALTER COLUMN "ModifiedByUser" DROP NOT NULL;

ALTER TABLE risksmart.taxonomy_audit
ALTER COLUMN "ModifiedByUser" DROP NOT NULL;

CREATE OR REPLACE FUNCTION risksmart.taxonomy_org_modified() RETURNS trigger LANGUAGE 'plpgsql' COST 100 VOLATILE NOT LEAKPROOF AS $BODY$
DECLARE nr RECORD;

DECLARE updated_user TEXT;

DECLARE update_timestamp timestamp with time zone;

BEGIN if (
    TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
) then nr := NEW;

updated_user := NEW."ModifiedByUser";

update_timestamp := NEW."ModifiedAtTimestamp";

elsif (TG_OP = 'DELETE') then nr := OLD;

updated_user := risksmart.get_hasura_user_id();

update_timestamp := statement_timestamp();

END IF;

insert into risksmart.taxonomy_org_audit(
        "Id",
        "TaxonomyId",
        "OrgName",
        "Locale",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action",
        "OrgKey"
    )
values (
        nr."Id",
        nr."TaxonomyId",
        nr."OrgName",
        nr."Locale",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        TG_OP,
        nr."OrgKey"
    );

RETURN nr;

END;

$BODY$;

DROP INDEX risksmart.idx_taxonomy_org;

-- Create a new set of taxonomy records, populated with the org key
INSERT INTO risksmart.taxonomy_org (
        "TaxonomyId",
        "Locale",
        "OrgName",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "OrgKey"
    )
select t."TaxonomyId",
    t."Locale",
    t."OrgName",
    t."CreatedByUser",
    'SYSTEM',
    t."ModifiedAtTimestamp",
    t."CreatedAtTimestamp",
    o."OrgKey"
from auth.organisation o
    inner join risksmart.taxonomy_org as t ON o."Meta"::jsonb->>'taxonomy' = t."OrgName"
where o."Meta"::jsonb->>'taxonomy' is not null;

CREATE INDEX "idx_taxonomy_org_orgkey_locale" on risksmart.taxonomy_org ("OrgKey", "Locale");