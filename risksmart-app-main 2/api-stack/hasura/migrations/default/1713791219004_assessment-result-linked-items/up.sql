INSERT INTO risksmart."linked_item" ("Source", "Target", "OrgKey", "RelationshipType")
SELECT t."ParentId",
    t."Id",
    t."OrgKey",
    'parent_child'
FROM (
        SELECT arp.*
        FROM risksmart."assessment_result_parent" arp
            LEFT OUTER JOIN risksmart."linked_item" li ON li."Target" = arp."Id"
            AND li."Source" = arp."ParentId"
        WHERE li."Target" IS NULL
    ) AS t;