ALTER TABLE risksmart."appetite"
ALTER COLUMN "Statement" DROP NOT NULL;

ALTER TABLE risksmart."appetite"
ALTER COLUMN "LowerAppetite" DROP NOT NULL;

ALTER TABLE risksmart."appetite"
ALTER COLUMN "UpperAppetite" DROP NOT NULL;

ALTER TABLE risksmart."appetite_audit"
ALTER COLUMN "LowerAppetite" DROP NOT NULL;

ALTER TABLE risksmart."appetite_audit"
ALTER COLUMN "UpperAppetite" DROP NOT NULL;

ALTER TABLE risksmart."appetite"
ADD COLUMN "EffectiveDate" timestamptz NULL DEFAULT now();

ALTER TABLE risksmart."appetite_audit"
ADD COLUMN "EffectiveDate" timestamptz NULL DEFAULT now();

ALTER TABLE risksmart."appetite"
ADD COLUMN "AppetiteType" TEXT NOT NULL DEFAULT 'risk';

ALTER TABLE risksmart."appetite_audit"
ADD COLUMN "AppetiteType" TEXT NULL;

ALTER TABLE risksmart."appetite"
ADD COLUMN "ImpactAppetite" INTEGER NULL;

ALTER TABLE risksmart."appetite_audit"
ADD COLUMN "ImpactAppetite" INTEGER NULL;

-- Set created date as effective date for existing records
-- UPDATE risksmart."appetite"
-- SET "EffectiveDate" = "CreatedAtTimestamp",
--     "ModifiedAtTimestamp" = now(),
--     "ModifiedByUser" = 'SYSTEM';
-- Update audit trigger
CREATE OR REPLACE FUNCTION risksmart.appetite_modified() RETURNS trigger AS $body$
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

insert into risksmart.appetite_audit(
        "Id",
        "CustomAttributeData",
        "Statement",
        "LowerAppetite",
        "UpperAppetite",
        "EffectiveDate",
        "AppetiteType",
        "ImpactAppetite",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."CustomAttributeData",
        nr."Statement",
        nr."LowerAppetite",
        nr."UpperAppetite",
        nr."EffectiveDate",
        nr."AppetiteType",
        nr."ImpactAppetite",
        nr."Meta",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;