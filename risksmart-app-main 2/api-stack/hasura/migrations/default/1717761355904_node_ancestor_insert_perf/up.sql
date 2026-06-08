CREATE OR REPLACE FUNCTION risksmart.node_ancestor_insert() RETURNS trigger LANGUAGE plpgsql AS $$
declare rec record;

BEGIN FOR rec IN
SELECT i."Source",
    i."Target"
FROM inserted i
WHERE i."RelationshipType" = 'parent_child' LOOP
INSERT INTO risksmart.node_ancestor (
        "Id",
        "AncestorId",
        "ObjectType",
        "OrgKey"
    )
SELECT descendants."Id",
    ancestors."AncestorId",
    n."ObjectType",
    n."OrgKey"
FROM risksmart.node_ancestor descendants
    CROSS JOIN risksmart.node_ancestor ancestors
    INNER JOIN risksmart.node n ON n."Id" = descendants."Id"
WHERE descendants."AncestorId" = rec."Target"
    AND ancestors."Id" = rec."Source"
    AND NOT EXISTS (
        SELECT 1
        FROM risksmart.node_ancestor na
        WHERE na."Id" = descendants."Id"
            AND na."AncestorId" = ancestors."AncestorId"
    );

END LOOP;

return null;

END;

$$;