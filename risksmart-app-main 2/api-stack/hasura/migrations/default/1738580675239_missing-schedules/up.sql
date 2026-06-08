-- Retrieve latest schedule record from audit so that we can get the original test frequency
with latest_audit as (
    select distinct on ("Id") sa."Id",
        sa."Frequency",
        sa."TimeToCompleteValue",
        sa."TimeToCompleteUnit",
        sa."StartDate",
        sa."ManualDueDate",
        sa."OrgKey",
        sa."CreatedByUser",
        sa."ModifiedByUser",
        sa."ModifiedAtTimestamp",
        sa."CreatedAtTimestamp",
        sa."Action"
    from risksmart.schedule_audit sa
    order by "Id",
        "ModifiedAtTimestamp" desc
) -- Create schedules where one does not exist
INSERT INTO risksmart.schedule (
        "Id",
        "Frequency",
        "TimeToCompleteValue",
        "TimeToCompleteUnit",
        "StartDate",
        "ManualDueDate",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp"
    )
select la."Id",
    la."Frequency",
    -- Default time to complete of 1 day
    1,
    'day',
    -- The original migrations created risksmart.schedule_state, so we can get the latest result date as the new start date as originally planned
    ss."LatestDate",
    la."ManualDueDate",
    la."OrgKey",
    coalesce(created_user."Id",'SYSTEM'),
    coalesce(modified_user."Id",'SYSTEM'),
    now(),
    la."CreatedAtTimestamp"
from latest_audit la -- Only get schedules for nodes that haven't been deleted. Check against node table also confirmed this
    left join risksmart.schedule_state ss on ss."Id" = la."Id"
    left join auth."user" created_user on created_user."Id" = la."CreatedByUser"
    left join auth."user" modified_user on modified_user."Id" = la."ModifiedByUser"
WHERE la."Action" in ('UPDATE', 'INSERT') -- Only get schedules for nodes that exist
    AND la."Id" in (
        SELECT "Id"
        from risksmart.node
    ) -- Only create is a schedule does not exist
    AND la."Id" not in (
        SELECT "Id"
        from risksmart.schedule
    );
