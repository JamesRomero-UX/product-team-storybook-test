ALTER TABLE risksmart.obligation_change DROP COLUMN IF EXISTS "Description",
  ADD COLUMN IF NOT EXISTS "DescriptionBefore" text,
  ADD COLUMN IF NOT EXISTS "DescriptionAfter" text,
  ADD COLUMN IF NOT EXISTS "Rationale" text,
  ADD COLUMN IF NOT EXISTS "ContentHash" text;

ALTER TABLE risksmart.obligation_change
ADD CONSTRAINT obligation_change_OrgKey_ExternalId_ObligationId_unique UNIQUE ("OrgKey", "ExternalId", "ObligationId");

/***************************************
 * Update obligation_change_audit table *
 ****************************************/
ALTER TABLE risksmart.obligation_change_audit DROP COLUMN IF EXISTS "Description",
  ADD COLUMN IF NOT EXISTS "DescriptionBefore" text,
  ADD COLUMN IF NOT EXISTS "DescriptionAfter" text,
  ADD COLUMN IF NOT EXISTS "Rationale" text,
  ADD COLUMN IF NOT EXISTS "ContentHash" text;

/***************************************
 * Recreate obligation_change_modified trigger function *
 ****************************************/
CREATE OR REPLACE FUNCTION risksmart.obligation_change_modified() RETURNS trigger AS $body$
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

insert into risksmart.obligation_change_audit(
    "Id",
    "SequentialId",
    "ObligationId",
    "ExternalId",
    "EffectiveDate",
    "Title",
    "DescriptionBefore",
    "DescriptionAfter",
    "Rationale",
    "ContentHash",
    "Regulator",
    "Reference",
    "OrgKey",
    "CreatedAtTimestamp",
    "ModifiedAtTimestamp",
    "ModifiedByUser",
    "CreatedByUser",
    "SourceUrl",
    "Action"
  )
values (
    nr."Id",
    nr."SequentialId",
    nr."ObligationId",
    nr."ExternalId",
    nr."EffectiveDate",
    nr."Title",
    nr."DescriptionBefore",
    nr."DescriptionAfter",
    nr."Rationale",
    nr."ContentHash",
    nr."Regulator",
    nr."Reference",
    nr."OrgKey",
    nr."CreatedAtTimestamp",
    update_timestamp,
    updated_user,
    nr."CreatedByUser",
    nr."SourceUrl",
    TG_OP
  );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;