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
    c."LatestResultDate",
    c."NextResultDate",
    c."NextResultDate" + interval '1 day',
    c."OrgKey",
    'SYSTEM',
    'SYSTEM',
    now(),
    now()
FROM risksmart.indicator c;

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
FROM risksmart.indicator_audit ca
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
FROM risksmart.indicator_audit ca
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
    FROM risksmart.indicator_audit ca
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
    "StartDate" = r."LatestResultDate",
    "ModifiedAtTimestamp" = now(),
    "ModifiedByUser" = 'SYSTEM'
FROM risksmart.indicator r
WHERE s."Id" = r."Id";

-- This information exists else where in the system so can just drop
ALTER TABLE risksmart.indicator DROP COLUMN "LatestResultDate";

ALTER TABLE risksmart.indicator_audit DROP COLUMN "LatestResultDate";

ALTER TABLE risksmart.indicator DROP COLUMN "TestFrequency";

ALTER TABLE risksmart.indicator_audit DROP COLUMN "TestFrequency";

ALTER TABLE risksmart.indicator DROP COLUMN "NextResultDate";

ALTER TABLE risksmart.indicator_audit DROP COLUMN "NextResultDate";

CREATE OR REPLACE FUNCTION risksmart.indicator_modified() RETURNS trigger LANGUAGE 'plpgsql' AS $BODY$
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

insert into risksmart.indicator_audit(
        "Id",
        "CustomAttributeData",
        "Title",
        "Description",
        "Type",
        "Unit",
        "UpperToleranceNum",
        "LowerToleranceNum",
        "TargetValueTxt",
        "UpperAppetiteNum",
        "LowerAppetiteNum",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "SequentialId",
        "Action"
    )
values (
        nr."Id",
        nr."CustomAttributeData",
        nr."Title",
        nr."Description",
        nr."Type",
        nr."Unit",
        nr."UpperToleranceNum",
        nr."LowerToleranceNum",
        nr."TargetValueTxt",
        nr."UpperAppetiteNum",
        nr."LowerAppetiteNum",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        nr."SequentialId",
        TG_OP
    );

RETURN nr;

END;

$BODY$;