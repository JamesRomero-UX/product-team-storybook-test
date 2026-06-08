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
FROM risksmart.risk c;

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
FROM risksmart.risk_audit ca
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
FROM risksmart.risk_audit ca
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
    FROM risksmart.risk_audit ca
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
FROM risksmart.risk r
WHERE s."Id" = r."Id";

-- This information exists else where in the system so can just drop
ALTER TABLE risksmart.risk DROP COLUMN "LatestRatingDate";

ALTER TABLE risksmart.risk_audit DROP COLUMN "LatestRatingDate";

ALTER TABLE risksmart.risk DROP COLUMN "TestFrequency";

ALTER TABLE risksmart.risk_audit DROP COLUMN "TestFrequency";

ALTER TABLE risksmart.risk DROP COLUMN "NextTestDate";

ALTER TABLE risksmart.risk_audit DROP COLUMN "NextTestDate";

CREATE OR REPLACE FUNCTION risksmart.risk_modified() RETURNS trigger AS $body$
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

insert into risksmart.risk_audit(
        "Id",
        "CustomAttributeData",
        "Title",
        "Tier",
        "ParentRiskId",
        "Description",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action",
        "Treatment",
        "Status",
        "SequentialId"
    )
values (
        nr."Id",
        nr."CustomAttributeData",
        nr."Title",
        nr."Tier",
        nr."ParentRiskId",
        nr."Description",
        nr."Meta",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        TG_OP,
        nr."Treatment",
        nr."Status",
        nr."SequentialId"
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

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
from risksmart.risk r
where cr."ChangeRequestStatus" = 'pending'
    and cr."Type" = 'update'
    AND r."Id" = cr."ParentId";