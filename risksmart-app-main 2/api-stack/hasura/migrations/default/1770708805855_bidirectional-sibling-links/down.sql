-- Rollback: Bidirectional Sibling Links
-- This migration reverts the trigger to only handle parent_child relationships
-- and removes the reverse sibling records.

-- Step 1: Revert the trigger function to only handle parent_child
CREATE OR REPLACE FUNCTION risksmart.linked_item_modified() RETURNS trigger LANGUAGE 'plpgsql' COST 100 VOLATILE NOT LEAKPROOF AS $BODY$
DECLARE nr RECORD;

updated_user TEXT;

update_timestamp TIMESTAMP WITH TIME ZONE;

BEGIN IF (
    TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
) THEN nr := NEW;

updated_user := NEW."ModifiedByUser";

update_timestamp := NEW."ModifiedAtTimestamp";

ELSIF (TG_OP = 'DELETE') THEN nr := OLD;

updated_user := risksmart.get_hasura_user_id();

update_timestamp := statement_timestamp();

END IF;

INSERT INTO risksmart.linked_item_audit(
        "Source",
        "SourceType",
        "Target",
        "TargetType",
        "RelationshipType",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "Action",
        "Id"
    )
VALUES (
        nr."Source",
        nr."SourceType",
        nr."Target",
        nr."TargetType",
        nr."RelationshipType",
        nr."OrgKey",
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        updated_user,
        update_timestamp,
        TG_OP,
        nr."Id"
    );

IF TG_OP = 'INSERT'
AND NEW."RelationshipType" = 'parent_child' THEN
INSERT INTO risksmart.linked_item (
        "OrgKey",
        "Source",
        "Target",
        "RelationshipType",
        "CreatedByUser",
        "ModifiedByUser",
        "SourceType",
        "TargetType"
    )
VALUES (
        NEW."OrgKey",
        NEW."Target",
        NEW."Source",
        'child_parent',
        NEW."CreatedByUser",
        NEW."ModifiedByUser",
        NEW."TargetType",
        NEW."SourceType"
    ) ON CONFLICT ("Source", "Target") DO NOTHING;

END IF;

IF TG_OP = 'DELETE'
AND OLD."RelationshipType" = 'parent_child' THEN
DELETE FROM risksmart.linked_item
WHERE "Source" = OLD."Target"
    AND "Target" = OLD."Source"
    AND "RelationshipType" = 'child_parent';

END IF;

IF TG_OP = 'DELETE' THEN RETURN OLD;

ELSE RETURN NEW;

END IF;

END;

$BODY$;

-- Step 2: Remove the reverse sibling records
-- We identify them by: for each sibling pair (A,B) and (B,A), keep only one
-- Keep records where Source < Target (lexicographic), delete where Source > Target
DELETE FROM risksmart.linked_item
WHERE "RelationshipType" = 'sibling'
AND "Source" > "Target";
