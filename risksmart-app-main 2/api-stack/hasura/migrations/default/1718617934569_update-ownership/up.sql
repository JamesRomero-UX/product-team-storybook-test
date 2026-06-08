-- Fix for get_hasura_user_id to not throw an error when hasura.user is not defined.
CREATE OR REPLACE FUNCTION risksmart.get_hasura_user_id() RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE user_id TEXT;

BEGIN
SELECT cast(current_setting('hasura.user', 't') as JSON)->>'x-hasura-user-id' into user_id;

IF user_id IS NULL THEN user_id := 'SYSTEM';

END IF;

RETURN user_id;

END;

$$;

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
    AND o."UserId" = original_owner_id;

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
    AND o."UserId" = original_contributor_id;

DELETE FROM risksmart.contributor
WHERE "OrgKey" = org_key
    AND "UserId" = original_contributor_id;

END $$ LANGUAGE plpgsql VOLATILE;