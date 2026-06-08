CREATE INDEX IF NOT EXISTS ix_node_ancestor_ancestorid_id ON risksmart.node_ancestor("AncestorId", "Id");

CREATE OR REPLACE FUNCTION risksmart.node_ancestor_delete() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN -- Source is parent
    CREATE TEMP TABLE tmp_ancestors(id uuid primary key);

-- get all ancestors of deleted links
INSERT INTO tmp_ancestors (id)
SELECT DISTINCT na."AncestorId"
FROM deleted i
    INNER JOIN risksmart.node_ancestor na ON i."Source" = na."Id"
WHERE i."RelationshipType" = 'parent_child';

CREATE TEMP TABLE tmp_descendants(id uuid primary key);

-- get all descendants of deleted links
INSERT INTO tmp_descendants (id)
SELECT DISTINCT na."Id"
FROM deleted i
    INNER JOIN risksmart.node_ancestor na ON i."Target" = na."AncestorId"
WHERE i."RelationshipType" = 'parent_child';

-- delete all node ancestor records that are descendants/ancestors of link no longer relevant
WITH RECURSIVE flattened_nodes("Id", "AncestorId") AS (
    SELECT n."Id",
        n."Id" AS "AncestorId"
    FROM risksmart.node n
        INNER JOIN tmp_descendants td ON td.id = n."Id"
    UNION ALL
    SELECT ff."Id",
        f."Source" AS "AncestorId"
    FROM flattened_nodes ff
        INNER JOIN risksmart.linked_item f ON ff."AncestorId" = f."Target"
        AND f."RelationshipType" = 'parent_child'
),
to_delete AS (
    SELECT na."Id",
        na."AncestorId"
    FROM risksmart.node_ancestor na
        INNER JOIN tmp_descendants d ON d.id = na."Id"
        INNER JOIN tmp_ancestors a ON a.id = na."AncestorId"
    EXCEPT
    SELECT fpo."Id",
        fpo."AncestorId"
    FROM flattened_nodes fpo
        INNER JOIN tmp_ancestors ta ON ta.id = fpo."AncestorId"
)
DELETE FROM risksmart.node_ancestor na USING to_delete d
WHERE d."Id" = na."Id"
    AND d."AncestorId" = na."AncestorId";

drop table tmp_ancestors;

drop table tmp_descendants;

return null;

END;

$$;