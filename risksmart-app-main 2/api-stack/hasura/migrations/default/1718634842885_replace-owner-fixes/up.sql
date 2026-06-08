/**
 Move all ownership from original_owner_id to new_owner_id
 **/
CREATE OR REPLACE FUNCTION risksmart.replace_owner(
        org_key text,
        original_owner_id text,
        new_owner_id text
    ) RETURNS VOID AS $$ BEGIN
INSERT INTO risksmart.owner(
        "ParentId",
        "UserId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp"
    )
SELECT o."ParentId",
    new_owner_id,
    o."OrgKey",
    'SYSTEM',
    'SYSTEM',
    now(),
    now()
FROM risksmart.owner o
WHERE o."OrgKey" = org_key
    AND o."UserId" = original_owner_id
    AND NOT EXISTS (
        SELECT 1
        FROM risksmart.owner oo
        WHERE oo."ParentId" = o."ParentId"
            AND oo."UserId" = new_owner_id
    );

DELETE FROM risksmart.owner
WHERE "OrgKey" = org_key
    AND "UserId" = original_owner_id;

END $$ LANGUAGE plpgsql VOLATILE;

/**
 Move all contributor from original_contributor_id to new_contributor_id
 **/
CREATE OR REPLACE FUNCTION risksmart.replace_contributor(
        org_key text,
        original_contributor_id text,
        new_contributor_id text
    ) RETURNS VOID AS $$ BEGIN
INSERT INTO risksmart.contributor(
        "ParentId",
        "UserId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp"
    )
SELECT o."ParentId",
    new_contributor_id,
    o."OrgKey",
    'SYSTEM',
    'SYSTEM',
    now(),
    now()
FROM risksmart.contributor o
WHERE o."OrgKey" = org_key
    AND o."UserId" = original_contributor_id
    AND NOT EXISTS (
        SELECT 1
        FROM risksmart.contributor oo
        WHERE oo."ParentId" = o."ParentId"
            AND oo."UserId" = new_contributor_id
    );

DELETE FROM risksmart.contributor
WHERE "OrgKey" = org_key
    AND "UserId" = original_contributor_id;

END $$ LANGUAGE plpgsql VOLATILE;