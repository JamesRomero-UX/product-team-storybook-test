ALTER TABLE risksmart.node_ancestor
ADD COLUMN IF NOT EXISTS "AncestorObjectType" text;

UPDATE risksmart.node_ancestor na
SET "AncestorObjectType" = n."ObjectType"
FROM risksmart.node n
WHERE n."Id" = na."AncestorId"
    AND na."AncestorObjectType" is null;

CREATE OR REPLACE FUNCTION risksmart.node_insert() RETURNS trigger LANGUAGE 'plpgsql' AS $BODY$
DECLARE sequential_id integer;

BEGIN BEGIN sequential_id := NEW."SequentialId";

EXCEPTION
WHEN undefined_column THEN sequential_id := NULL;

END;

INSERT INTO risksmart.node ("Id", "ObjectType", "OrgKey", "SequentialId")
VALUES(
        NEW."Id",
        TG_TABLE_NAME,
        NEW."OrgKey",
        sequential_id
    )
RETURNING "Id" INTO NEW."Id";

/*
 Avoid full rebuild of node_ancestor from node table triggers
 Note: a full rebuild will happen anyway if there are any relationships are inserted
 */
INSERT INTO risksmart.node_ancestor(
        "Id",
        "AncestorId",
        "ObjectType",
        "AncestorObjectType",
        "OrgKey"
    )
VALUES (
        NEW."Id",
        NEW."Id",
        TG_TABLE_NAME,
        TG_TABLE_NAME,
        NEW."OrgKey"
    );

RETURN NEW;

END;

$BODY$;

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
        "AncestorObjectType",
        "OrgKey"
    )
SELECT descendants."Id",
    ancestors."AncestorId",
    n."ObjectType",
    an."ObjectType",
    n."OrgKey"
FROM risksmart.node_ancestor descendants
    CROSS JOIN risksmart.node_ancestor ancestors
    INNER JOIN risksmart.node n ON n."Id" = descendants."Id"
    INNER JOIN risksmart.node an ON an."Id" = ancestors."Id"
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

CREATE OR REPLACE VIEW risksmart.ancestor_contributor_view AS
SELECT na."Id",
    c."OrgKey",
    c."UserId",
    na."ObjectType",
    case
        -- If you are an owner of an items ancestor, you are a contributor of it, unless the object type is the same (e.g child risk)
        when na."AncestorId" <> na."Id"
        AND na."ObjectType" <> na."AncestorObjectType"
        AND c."ContributorType" = 'owner' then 'contributor'
        else c."ContributorType"
    end as "ContributorType",
    na."AncestorId",
    c."UserGroupId"
FROM risksmart.contributor_view c
    INNER JOIN risksmart.node_ancestor na ON na."AncestorId" = c."Id";