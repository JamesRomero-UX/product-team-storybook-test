-- Migration: Bidirectional Sibling Links
-- This migration extends the linked_item_modified() trigger to also handle sibling relationships
-- and creates reverse records for existing sibling relationships.

-- Step 1: Create reverse records for existing sibling relationships
-- This must happen BEFORE updating the trigger to avoid the trigger creating duplicates
INSERT INTO risksmart.linked_item (
    "OrgKey",
    "Source",
    "Target",
    "RelationshipType",
    "CreatedByUser",
    "ModifiedByUser",
    "SourceType",
    "TargetType",
    "CreatedAtTimestamp",
    "ModifiedAtTimestamp"
)
SELECT
    "OrgKey",
    "Target" as "Source",
    "Source" as "Target",
    'sibling',
    "CreatedByUser",
    "ModifiedByUser",
    "TargetType" as "SourceType",
    "SourceType" as "TargetType",
    "CreatedAtTimestamp",
    "ModifiedAtTimestamp"
FROM risksmart.linked_item
WHERE "RelationshipType" = 'sibling'
ON CONFLICT ("Source", "Target") DO NOTHING;

-- Step 2: Update the trigger function to handle sibling relationships
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

-- Handle parent_child INSERT: Create reverse child_parent record
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

-- Handle sibling INSERT: Create reverse sibling record
IF TG_OP = 'INSERT'
AND NEW."RelationshipType" = 'sibling' THEN
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
        'sibling',
        NEW."CreatedByUser",
        NEW."ModifiedByUser",
        NEW."TargetType",
        NEW."SourceType"
    ) ON CONFLICT ("Source", "Target") DO NOTHING;

END IF;

-- Handle parent_child DELETE: Delete reverse child_parent record
IF TG_OP = 'DELETE'
AND OLD."RelationshipType" = 'parent_child' THEN
DELETE FROM risksmart.linked_item
WHERE "Source" = OLD."Target"
    AND "Target" = OLD."Source"
    AND "RelationshipType" = 'child_parent';

END IF;

-- Handle sibling DELETE: Delete reverse sibling record
IF TG_OP = 'DELETE'
AND OLD."RelationshipType" = 'sibling' THEN
DELETE FROM risksmart.linked_item
WHERE "Source" = OLD."Target"
    AND "Target" = OLD."Source"
    AND "RelationshipType" = 'sibling';

END IF;

IF TG_OP = 'DELETE' THEN RETURN OLD;

ELSE RETURN NEW;

END IF;

END;

$BODY$;
