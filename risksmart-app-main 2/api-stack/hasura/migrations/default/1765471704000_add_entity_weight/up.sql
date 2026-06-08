-- Add Weight column to entity table
ALTER TABLE risksmart.entity
ADD COLUMN "Weight" NUMERIC(5, 2) NOT NULL DEFAULT 1.0;

-- Add constraint to ensure weight is positive
ALTER TABLE risksmart.entity
ADD CONSTRAINT entity_weight_positive CHECK ("Weight" > 0);

-- Add Weight column to entity_audit table (nullable for audit history)
ALTER TABLE risksmart.entity_audit
ADD COLUMN "Weight" NUMERIC(5, 2);

CREATE OR REPLACE FUNCTION risksmart.entity_modified() RETURNS trigger AS $body$
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
        "Action",
        "Weight"
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
        TG_OP,
        nr."Weight"
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

DROP MATERIALIZED VIEW IF EXISTS risksmart."entity_descendants_mv";

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
        c."ModifiedByUser",
        c."Weight"
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
        c."ModifiedByUser",
        c."Weight"
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
    "ModifiedByUser",
    "Weight"
FROM descendants WITH NO DATA;

CREATE OR REPLACE FUNCTION risksmart.entity_descendants(entity_row risksmart."entity") RETURNS SETOF risksmart."entity" AS $$ WITH RECURSIVE descendants (
        "Id",
        "Name",
        "Description",
        "ParentId",
        "OrgKey",
        "CreatedAtTimestamp",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "ModifiedByUser",
        "Weight"
    ) AS (
        SELECT "Id",
            "Name",
            "Description",
            "ParentId",
            "OrgKey",
            "CreatedAtTimestamp",
            "ModifiedAtTimestamp",
            "CreatedByUser",
            "ModifiedByUser",
            "Weight"
        FROM risksmart."entity"
        WHERE "ParentId" = entity_row."Id"
        UNION ALL
        SELECT e."Id",
            e."Name",
            e."Description",
            e."ParentId",
            e."OrgKey",
            e."CreatedAtTimestamp",
            e."ModifiedAtTimestamp",
            e."CreatedByUser",
            e."ModifiedByUser",
            e."Weight"
        FROM risksmart."entity" e
            INNER JOIN descendants d ON e."ParentId" = d."Id"
    )
SELECT "Id",
    "Name",
    "Description",
    "ParentId",
    "OrgKey",
    "CreatedAtTimestamp",
    "ModifiedAtTimestamp",
    "CreatedByUser",
    "ModifiedByUser",
    "Weight"
FROM descendants;

$$ LANGUAGE sql STABLE;