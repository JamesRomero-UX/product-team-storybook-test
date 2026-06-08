alter table risksmart.linked_item
add column "SourceType" text null;

alter table risksmart.linked_item
add column "TargetType" text null;

alter table risksmart.linked_item_audit
add column "SourceType" text null;

alter table risksmart.linked_item_audit
add column "TargetType" text null;

CREATE OR REPLACE FUNCTION risksmart.linked_item_modified() RETURNS trigger LANGUAGE 'plpgsql' AS $BODY$
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

insert into risksmart.linked_item_audit(
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
values (
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

RETURN nr;

END;

$BODY$;

-- Update existing sibling relationships to include type information.
-- No need to set for parent_child as these columns aren't maintains yet for this type of relationship
update risksmart.linked_item
set "SourceType" = sn."ObjectType",
    "TargetType" = tn."ObjectType",
    "ModifiedAtTimestamp" = now(),
    "ModifiedByUser" = 'SYSTEM'
from risksmart.linked_item li
    inner join risksmart.node sn on li."Source" = sn."Id"
    inner join risksmart.node tn on li."Target" = tn."Id"
where linked_item."Id" = li."Id"
    AND linked_item."RelationshipType" = 'sibling';

/**
 View listing all records from risksmart.linked_item, as well as the same records with the 
 source and target swapped around (changing the "RelationshipType" from 'parent_child' to 'child_parent').
 This should simplify querying all associated items for an entity.  
 **/
CREATE OR REPLACE VIEW risksmart.linked_item_view WITH (security_invoker = true) AS
SELECT "OrgKey",
    "Source",
    "Target",
    "RelationshipType",
    "CreatedAtTimestamp",
    "CreatedByUser",
    "Id",
    "ModifiedAtTimestamp",
    "ModifiedByUser",
    "SourceType",
    "TargetType"
FROM risksmart.linked_item
UNION ALL
SELECT "OrgKey",
    "Target" as "Source",
    "Source" as "Target",
    CASE
        WHEN "RelationshipType" = 'parent_child' THEN 'child_parent'
        ELSE "RelationshipType"
    END,
    "CreatedAtTimestamp",
    "CreatedByUser",
    "Id",
    "ModifiedAtTimestamp",
    "ModifiedByUser",
    "TargetType" as "SourceType",
    "SourceType" as "TargetType"
FROM risksmart.linked_item;