CREATE OR REPLACE VIEW risksmart.owner_and_owner_group_view WITH (security_invoker = true) AS
SELECT c."ParentId" AS "Id",
    c."OrgKey",
    u."FriendlyName"
FROM risksmart.owner c
    INNER JOIN risksmart.user_view_active u ON c."UserId" = u."Id"
UNION ALL
SELECT cg."ParentId" AS "Id",
    cg."OrgKey",
    ug."Name"
FROM risksmart.owner_group cg
    INNER JOIN risksmart.user_group ug ON cg."UserGroupId" = ug."Id";

CREATE OR REPLACE VIEW risksmart.contributor_and_contributor_group_view WITH (security_invoker = true) AS
SELECT c."ParentId" AS "Id",
    c."OrgKey",
    u."FriendlyName"
FROM risksmart.contributor c
    INNER JOIN risksmart.user_view_active u ON c."UserId" = u."Id"
UNION ALL
SELECT cg."ParentId" AS "Id",
    cg."OrgKey",
    ug."Name"
FROM risksmart.contributor_group cg
    INNER JOIN risksmart.user_group ug ON cg."UserGroupId" = ug."Id"