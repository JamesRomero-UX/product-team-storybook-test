-- Rollback: Recreate linked_item_view
-- Note: This view is obsolete. Only recreate if rolling back to before bidirectional siblings.

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
