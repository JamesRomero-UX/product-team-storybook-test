-- 1) Create the materialized view for all descendants of every entity
CREATE MATERIALIZED VIEW risksmart."entity_descendants_mv" AS WITH RECURSIVE descendants AS (
    -- Seed: direct children of every entity as a potential root
    SELECT e."Id" AS "RootId",
        c."Id",
        c."Name",
        c."Description",
        c."ParentId",
        c."OrgKey",
        c."CreatedAtTimestamp",
        c."ModifiedAtTimestamp",
        c."CreatedByUser",
        c."ModifiedByUser"
    FROM risksmart."entity" e
        JOIN risksmart."entity" c ON c."ParentId" = e."Id"
    UNION ALL
    -- Recurse: walk down the tree
    SELECT d."RootId",
        c."Id",
        c."Name",
        c."Description",
        c."ParentId",
        c."OrgKey",
        c."CreatedAtTimestamp",
        c."ModifiedAtTimestamp",
        c."CreatedByUser",
        c."ModifiedByUser"
    FROM descendants d
        JOIN risksmart."entity" c ON c."ParentId" = d."Id"
)
SELECT "RootId",
    "Id",
    "Name",
    "Description",
    "ParentId",
    "OrgKey",
    "CreatedAtTimestamp",
    "ModifiedAtTimestamp",
    "CreatedByUser",
    "ModifiedByUser"
FROM descendants WITH NO DATA;

-- 2) Add a unique index so we can REFRESH CONCURRENTLY
CREATE UNIQUE INDEX ON risksmart."entity_descendants_mv" ("RootId", "Id");

-- (Optional) Helpful secondary indexes for common lookups
CREATE INDEX ON risksmart."entity_descendants_mv" ("RootId");

CREATE INDEX ON risksmart."entity_descendants_mv" ("Id");

-- find ancestors/peers of a node
CREATE INDEX ON risksmart."entity_descendants_mv" ("ParentId");

-- local neighborhood queries
-- 3) Initial population (now concurrent-safe thanks to the unique index)
REFRESH MATERIALIZED VIEW risksmart."entity_descendants_mv";

CREATE OR REPLACE FUNCTION risksmart.entity_modified() RETURNS trigger LANGUAGE 'plpgsql' COST 100 VOLATILE NOT LEAKPROOF AS $BODY$
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

insert into risksmart.entity_audit(
        "Id",
        "Name",
        "Description",
        "ParentId",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."Name",
        nr."Description",
        nr."ParentId",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        TG_OP
    );

REFRESH MATERIALIZED VIEW CONCURRENTLY risksmart."entity_descendants_mv";

RETURN nr;

END;

$BODY$;