-- Use a consistent approach to linking a test result to its parent
insert into risksmart.assessment_result_parent (
        "Id",
        "ResultType",
        "ParentId",
        "ParentType",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp"
    )
select "Id",
    'test_result',
    "ParentControlId",
    'control',
    "OrgKey",
    -- You can't change the parent control after a test result has been created, so it's safe to use the same user for CreatedByUser and ModifiedByUser
    "CreatedByUser",
    "CreatedAtTimestamp",
    -- Using system and now() for ModifiedByUser and ModifiedAtTimestamp so we can track the migration
    'SYSTEM',
    now()
from risksmart.test_result tr
where not exists (
        select 1
        from risksmart.assessment_result_parent arp
        where arp."Id" = tr."Id"
            AND arp."ParentId" = tr."ParentControlId"
    );