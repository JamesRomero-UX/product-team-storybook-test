CREATE OR REPLACE VIEW risksmart.ancestor_contributor_view AS
SELECT na."Id",
    c."OrgKey",
    c."UserId",
    na."ObjectType",
    case
        -- If you are an owner of an items ancestor, you are a contributor of it, unless the object type is the same (e.g child risk)
        when na."AncestorId" <> na."Id"
        AND na."ObjectType" <> na."AncestorObjectType" -- document versions maintain ownership of the parent (required for change requests)
        AND na."ObjectType" <> 'document_file'
        AND c."ContributorType" = 'owner' then 'contributor'
        else c."ContributorType"
    end as "ContributorType",
    na."AncestorId",
    c."UserGroupId"
FROM risksmart.contributor_view c
    INNER JOIN risksmart.node_ancestor na ON na."AncestorId" = c."Id";