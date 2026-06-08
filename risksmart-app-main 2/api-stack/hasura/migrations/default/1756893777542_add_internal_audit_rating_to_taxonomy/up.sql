-- Add InternalAuditRating column to taxonomy table (if it doesn't exist)
ALTER TABLE risksmart.taxonomy ADD COLUMN IF NOT EXISTS "InternalAuditRating" JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Add InternalAuditRating column to taxonomy_audit table (if it doesn't exist)
ALTER TABLE risksmart.taxonomy_audit ADD COLUMN IF NOT EXISTS "InternalAuditRating" JSONB;

-- Remove the default constraint to be consistent with other JSONB fields (Common, Library, Rating, Taxonomy)
ALTER TABLE risksmart.taxonomy ALTER COLUMN "InternalAuditRating" DROP DEFAULT;

-- Update the taxonomy_modified trigger function to include InternalAuditRating
CREATE OR REPLACE FUNCTION risksmart.taxonomy_modified() RETURNS trigger AS $body$
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

insert into risksmart.taxonomy_audit(
        "Id",
        "Description",
        "Common",
        "Library",
        "Rating",
        "Taxonomy",
        "InternalAuditRating",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."Description",
        nr."Common",
        nr."Library",
        nr."Rating",
        nr."Taxonomy",
        nr."InternalAuditRating",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;
