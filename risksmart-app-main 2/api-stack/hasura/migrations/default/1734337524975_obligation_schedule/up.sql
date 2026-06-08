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
FROM risksmart.obligation c;

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
FROM risksmart.obligation_audit ca
WHERE ca."Action" in ('INSERT', 'DELETE');

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
    FROM risksmart.obligation_audit ca
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
FROM risksmart.obligation r
WHERE s."Id" = r."Id";

-- This information exists else where in the system so can just drop
ALTER TABLE risksmart.obligation DROP COLUMN "LatestRatingDate";

ALTER TABLE risksmart.obligation_audit DROP COLUMN "LatestRatingDate";

ALTER TABLE risksmart.obligation DROP COLUMN "TestFrequency";

ALTER TABLE risksmart.obligation_audit DROP COLUMN "TestFrequency";

ALTER TABLE risksmart.obligation DROP COLUMN "NextTestDate";

ALTER TABLE risksmart.obligation_audit DROP COLUMN "NextTestDate";

CREATE OR REPLACE FUNCTION risksmart.obligation_modified() RETURNS trigger AS $body$
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

insert into risksmart.obligation_audit(
        "Id",
        "CustomAttributeData",
        "ParentId",
        "Title",
        "Description",
        "Interpretation",
        "Adherence",
        "Type",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action",
        "SequentialId"
    )
values (
        nr."Id",
        nr."CustomAttributeData",
        nr."ParentId",
        nr."Title",
        nr."Description",
        nr."Interpretation",
        nr."Adherence",
        nr."Type",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        TG_OP,
        nr."SequentialId"
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;