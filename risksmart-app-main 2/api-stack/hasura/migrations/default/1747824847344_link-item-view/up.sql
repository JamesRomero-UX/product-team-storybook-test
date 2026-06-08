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
    "ModifiedByUser"
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
    "ModifiedByUser"
FROM risksmart.linked_item;