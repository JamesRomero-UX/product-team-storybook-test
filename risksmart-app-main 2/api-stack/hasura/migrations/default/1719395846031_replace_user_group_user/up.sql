/**
 Move all contributor from original_contributor_id to new_user_id
 **/
CREATE OR REPLACE FUNCTION risksmart.replace_user_group_user(
        org_key text,
        original_user_id text,
        new_user_id text
    ) RETURNS VOID AS $$ BEGIN
INSERT INTO risksmart.user_group_user(
        "UserGroupId",
        "UserId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp"
    )
SELECT o."UserGroupId",
    new_user_id,
    o."OrgKey",
    'SYSTEM',
    'SYSTEM',
    now(),
    now()
FROM risksmart.user_group_user o
WHERE o."OrgKey" = org_key
    AND o."UserId" = original_user_id
    AND NOT EXISTS (
        SELECT 1
        FROM risksmart.user_group_user oo
        WHERE oo."UserGroupId" = o."UserGroupId"
            AND oo."UserId" = new_user_id
    );

DELETE FROM risksmart.user_group_user
WHERE "OrgKey" = org_key
    AND "UserId" = original_user_id;

END $$ LANGUAGE plpgsql VOLATILE;