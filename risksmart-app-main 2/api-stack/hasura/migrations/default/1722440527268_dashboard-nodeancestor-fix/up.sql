-- Usually this table gets populated on the node_insert trigger when a record is created, but node records for dashboard were created manually, so are missing this record.
INSERT INTO risksmart.node_ancestor("Id", "AncestorId", "ObjectType", "OrgKey")
SELECT d."Id",
    d."Id",
    'dashboard',
    d."OrgKey"
FROM risksmart.dashboard d
WHERE NOT EXISTS (
        SELECT 1
        FROM risksmart.node_ancestor na
        WHERE na."Id" = d."Id"
            AND na."AncestorId" = d."Id"
    );