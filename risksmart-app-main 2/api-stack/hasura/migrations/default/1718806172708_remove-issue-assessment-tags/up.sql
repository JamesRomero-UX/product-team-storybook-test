-- Add any tags to an Issue that exist on the issue assessment
insert into risksmart.tag (
        "ParentId",
        "TagTypeId",
        "ModifiedAtTimestamp",
        "OrgKey",
        "ModifiedByUser",
        "CreatedByUser",
        "CreatedAtTimestamp"
    )
SELECT
    ia."ParentIssueId",
    t."TagTypeId",
    now(),
    t."OrgKey",
    -- Keeping original creator/creation date, but using current time and SYSTEM for update so we can trace the chance
    'SYSTEM',
    t."CreatedByUser",
    t."CreatedAtTimestamp"
FROM risksmart.tag t
    INNER JOIN risksmart.issue_assessment ia ON t."ParentId" = ia."Id"
WHERE NOT EXISTS (
        SELECT 1
        FROM risksmart.tag tt
        WHERE tt."TagTypeId" = t."TagTypeId"
            AND tt."ParentId" = ia."ParentIssueId"
    );

-- Delete all issue assessment tags
DELETE FROM risksmart.tag
WHERE "ParentId" in (
        SELECT ia."Id"
        FROM risksmart.issue_assessment ia
    );
