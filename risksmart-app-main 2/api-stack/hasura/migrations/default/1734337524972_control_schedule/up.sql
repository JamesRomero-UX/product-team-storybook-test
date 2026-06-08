INSERT INTO risksmart.schedule_state (
        "Id",
        "LatestDate",
        "DueDate",
        "OverdueDate",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp"
    )
SELECT c."Id",
    c."LatestRatingDate",
    c."NextTestDate",
    c."NextTestDate" + interval '1 day',
    c."OrgKey",
    'SYSTEM',
    'SYSTEM',
    now(),
    now()
FROM risksmart.control c;

-- Recreate frequency change history in schedule table
INSERT INTO risksmart.schedule_audit (
        "Id",
        "Frequency",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "Action"
    )
SELECT ca."Id",
    ca."TestFrequency",
    ca."OrgKey",
    ca."CreatedByUser",
    ca."CreatedAtTimestamp",
    ca."ModifiedByUser",
    ca."ModifiedAtTimestamp",
    ca."Action"
FROM risksmart.control_audit ca
WHERE ca."Action" = 'INSERT';

INSERT INTO risksmart.schedule_audit (
        "Id",
        "Frequency",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "Action"
    )
SELECT ca."Id",
    ca."TestFrequency",
    ca."OrgKey",
    ca."CreatedByUser",
    ca."CreatedAtTimestamp",
    ca."ModifiedByUser",
    ca."ModifiedAtTimestamp",
    ca."Action"
FROM risksmart.control_audit ca
WHERE ca."Action" = 'DELETE';

with frequency_diff as (
    SELECT ca."Id",
        ca."TestFrequency",
        LAG(ca."TestFrequency") OVER (
            PARTITION BY ca."Id"
            ORDER BY ca."ModifiedAtTimestamp"
        ) AS "PreviousTestFrequency",
        ca."OrgKey",
        ca."CreatedByUser",
        ca."ModifiedByUser",
        ca."ModifiedAtTimestamp",
        ca."CreatedAtTimestamp",
        ca."Action"
    FROM risksmart.control_audit ca
    WHERE ca."Action" = 'UPDATE'
)
INSERT INTO risksmart.schedule_audit (
        "Id",
        "Frequency",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "Action"
    )
select fd."Id",
    fd."TestFrequency",
    fd."OrgKey",
    fd."CreatedByUser",
    fd."CreatedAtTimestamp",
    fd."ModifiedByUser",
    fd."ModifiedAtTimestamp",
    fd."Action"
from frequency_diff fd
where coalesce(fd."TestFrequency", '') != coalesce(fd."PreviousTestFrequency", '');

UPDATE risksmart.schedule s
SET "TimeToCompleteValue" = 1,
    "TimeToCompleteUnit" = 'day',
    -- Use last rating date as initial start date
    "StartDate" = r."LatestRatingDate",
    "ModifiedAtTimestamp" = now(),
    "ModifiedByUser" = 'SYSTEM'
FROM risksmart.control r
WHERE s."Id" = r."Id";

-- This information exists else where in the system so can just drop
ALTER TABLE risksmart.control DROP COLUMN "LatestRatingDate";

ALTER TABLE risksmart.control_audit DROP COLUMN "LatestRatingDate";

ALTER TABLE risksmart.control DROP COLUMN "NextTestDate";

ALTER TABLE risksmart.control_audit DROP COLUMN "NextTestDate";

ALTER TABLE risksmart.control DROP COLUMN "TestFrequency";

-- TODO: re-create history in schedule_audit
ALTER TABLE risksmart.control_audit DROP COLUMN "TestFrequency";

CREATE OR REPLACE FUNCTION risksmart.control_modified() RETURNS trigger AS $body$
DECLARE nr RECORD;

DECLARE updated_user TEXT;

DECLARE update_timestamp timestamp with time zone;

BEGIN if (
    TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
) then nr := NEW;

updated_user := NEW."ModifiedByUser";

update_timestamp := NEW."ModifiedAtTimestamp";

elsif (TG_OP = 'DELETE') then nr := OLD;

updated_user := risksmart.get_hasura_user_id();

update_timestamp := statement_timestamp();

END IF;

insert into risksmart.control_audit(
        "Id",
        "CustomAttributeData",
        "Title",
        "Description",
        "Type",
        "Meta",
        "OrgKey",
        "SequentialId",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."CustomAttributeData",
        nr."Title",
        nr."Description",
        nr."Type",
        nr."Meta",
        nr."OrgKey",
        nr."SequentialId",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

-- Fix Control Tests Due by Month to use the control data source 
with widgets as (
    select "Id",
        (
            '{widgets,' || idx - 1 || ',"settings","dataSource"}'
        )::TEXT [] AS path,
        widget.dd as widget,
        widget.idx
    from risksmart.dashboard,
        jsonb_array_elements("Content"#>'{widgets}') with ordinality as widget(dd, idx)
),
dashboards_to_update as (
    select w."Id",
        w.path
    from widgets w
    where w.widget->'settings'->>'dataSource' = 'controlTest'
        and w.widget->'settings'->>'categoryGetter' = 'nextTestDate'
)
update risksmart.dashboard d
SET "Content" = jsonb_set("Content", u.path, to_jsonb('control'::text)),
    "ModifiedAtTimestamp" = now(),
    "ModifiedByUser" = 'SYSTEM'
from dashboards_to_update u
WHERE d."Id" = u."Id";

-- Ensure any inflight change requests have the new payload format
update risksmart.change_request cr
SET "RequestedChanges" = jsonb_set(
        cr."RequestedChanges",
        '{schedule}',
        jsonb_build_object(
            'Frequency',
            cr."RequestedChanges"->>'TestFrequency',
            'ManualDueDate',
            null,
            'TimeToCompleteUnit',
            'day',
            'TimeToCompleteValue',
            1,
            'Id',
            cr."ParentId",
            'StartDate',
            null
        )
    ) - 'TestFrequency' - 'NextTestDate',
    "ModifiedAtTimestamp" = now(),
    "ModifiedByUser" = 'SYSTEM'
from risksmart.control r
where cr."ChangeRequestStatus" = 'pending'
    and cr."Type" = 'update'
    AND r."Id" = cr."ParentId";