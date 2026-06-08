/**
 
 postgres is sometimes choosing a poor query plan when using risksmart.owner_and_owner_group_view and risksmart.contributor_and_contributor_group_view.
 This appears to happen as postgres isn't always pushing down the predicates into the views, causing it to do a full scan of the view.
 To fix this, we are creating functions that will return the same data as the views, but with the predicates pushed down.
 This should improve performance when querying these views with a parentId predicate.
 The functions will be used in place of the views in the codebase.
 This is a temporary solution.
 A better long term solution would be to change the primary key on auth.user table to be a UUID instead of text, allowing users and groups to also be stored
 in the node table with the name for a quick lookup.
 
 **/
CREATE OR REPLACE FUNCTION risksmart.get_owners_and_owner_groups(parentId uuid) RETURNS TABLE("ParentId" uuid, "OrgKey" text, "Name" text) LANGUAGE SQL STABLE AS $$
SELECT c."ParentId",
    c."OrgKey",
    u."FriendlyName"
FROM risksmart.owner c
    INNER JOIN risksmart.user_view_active u ON c."UserId" = u."Id"
WHERE c."ParentId" = parentId
UNION ALL
SELECT cg."ParentId",
    cg."OrgKey",
    ug."Name"
FROM risksmart.owner_group cg
    INNER JOIN risksmart.user_group ug ON cg."UserGroupId" = ug."Id"
WHERE cg."ParentId" = parentId $$;

CREATE OR REPLACE FUNCTION risksmart.get_contributors_and_contributor_groups(parentId uuid) RETURNS TABLE("ParentId" uuid, "OrgKey" text, "Name" text) LANGUAGE SQL STABLE AS $$
SELECT c."ParentId",
    c."OrgKey",
    u."FriendlyName"
FROM risksmart.contributor c
    INNER JOIN risksmart.user_view_active u ON c."UserId" = u."Id"
WHERE c."ParentId" = parentId
UNION ALL
SELECT cg."ParentId",
    cg."OrgKey",
    ug."Name"
FROM risksmart.contributor_group cg
    INNER JOIN risksmart.user_group ug ON cg."UserGroupId" = ug."Id"
WHERE cg."ParentId" = parentId $$;