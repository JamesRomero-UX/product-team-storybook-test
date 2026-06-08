ALTER TABLE risksmart.obligation
ADD COLUMN "ExternalId" TEXT NULL,
    ADD COLUMN "ExternalProvider" TEXT NULL,
    ADD COLUMN "ExternalSyncedAt" TIMESTAMPTZ NULL,
    ADD COLUMN "ContentHash" TEXT NULL;

-- Composite unique constraint to ensure one external obligation per org
-- This allows multiple manually-created obligations without external IDs
ALTER TABLE risksmart.obligation
ADD CONSTRAINT "uq_obligation_external" UNIQUE ("OrgKey", "ExternalProvider", "ExternalId");

-- Query optimization for filtering external obligations
CREATE INDEX "idx_obligations_org_external" ON risksmart.obligation("OrgKey")
WHERE "ExternalId" IS NOT NULL;

ALTER TABLE risksmart.obligation_audit
ADD COLUMN "ExternalId" TEXT NULL,
    ADD COLUMN "ExternalProvider" TEXT NULL,
    ADD COLUMN "ExternalSyncedAt" TIMESTAMPTZ NULL,
    ADD COLUMN "ContentHash" TEXT NULL;

-- Update Obligation audit trigger to include new columns
CREATE OR REPLACE FUNCTION risksmart.obligation_modified() RETURNS trigger AS $body$
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

insert into risksmart.obligation_audit(
        "Id",
        "CustomAttributeData",
        "ParentId",
        "Title",
        "Description",
        "Interpretation",
        "Adherence",
        "Type",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action",
        "SequentialId",
        "ExternalId",
        "ExternalProvider",
        "ExternalSyncedAt",
        "ContentHash"
    )
values (
        nr."Id",
        nr."CustomAttributeData",
        nr."ParentId",
        nr."Title",
        nr."Description",
        nr."Interpretation",
        nr."Adherence",
        nr."Type",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        TG_OP,
        nr."SequentialId",
        nr."ExternalId",
        nr."ExternalProvider",
        nr."ExternalSyncedAt",
        nr."ContentHash"
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;