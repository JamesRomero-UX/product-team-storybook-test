/*
 Exposing ObjectType and RoleKey so that graphql queries can filter role_access and node_ancestor data out earlier in the query
 */
CREATE OR REPLACE VIEW risksmart.permission_view AS
SELECT na."Id",
    c."OrgKey",
    c."UserId",
    ra."AccessType",
    na."ObjectType",
    ra."RoleKey"
FROM risksmart.contributor_view c
    JOIN auth."user" u ON c."UserId" = u."Id"
    JOIN risksmart.node_ancestor na ON na."AncestorId" = c."Id"
    JOIN risksmart.role_access ra ON na."ObjectType" = ra."ObjectType"
    AND u."RoleKey" = ra."RoleKey"
    AND c."ContributorType" = ra."ContributorType";

CREATE INDEX IF NOT EXISTS ix_node_ancestor_ancestorId_objecttype ON risksmart.node_ancestor ("AncestorId", "ObjectType") INCLUDE("Id", "OrgKey");