-- Temp function to increment a date by a given frequency
CREATE OR REPLACE FUNCTION pg_temp.incrementFrequency(
        "Frequency" TEXT,
        "StartDate" TIMESTAMP WITH TIME ZONE
    ) RETURNS TIMESTAMP WITH TIME ZONE LANGUAGE sql BEGIN ATOMIC
SELECT (
        CASE
            WHEN "Frequency" = 'daily' THEN "StartDate" + INTERVAL '1 day'
            WHEN "Frequency" = 'weekly' THEN "StartDate" + INTERVAL '7 day'
            WHEN "Frequency" = 'fortnightly' THEN "StartDate" + INTERVAL '2 week'
            WHEN "Frequency" = 'fourweekly' THEN "StartDate" + INTERVAL '4 week'
            WHEN "Frequency" = 'monthly' THEN "StartDate" + INTERVAL '1 month'
            WHEN "Frequency" = 'quarterly' THEN "StartDate" + INTERVAL '3 month'
            WHEN "Frequency" = 'biannually' THEN "StartDate" + INTERVAL '6 month'
            WHEN "Frequency" = 'annually' THEN "StartDate" + INTERVAL '1 year'
        END
    );

END;

-- Temp function to get the next due date for a given frequency, state date and test date.
CREATE OR REPLACE FUNCTION pg_temp.getNextDueDate(
        "Frequency" TEXT,
        "StartDate" TIMESTAMP WITH TIME ZONE,
        "TestDate" TIMESTAMP WITH TIME ZONE
    ) RETURNS TIMESTAMP WITH TIME ZONE LANGUAGE plpgsql AS $$
DECLARE NextTestDate TIMESTAMP WITH TIME ZONE;

BEGIN NextTestDate := "StartDate";

BEGIN WHILE NextTestDate < "TestDate" LOOP NextTestDate := pg_temp.incrementFrequency("Frequency", NextTestDate);

END LOOP;

RETURN NextTestDate;

END;

END;

$$;

-- Temp function to get the next over due date by taking the next due date and adding the time to complete values
CREATE OR REPLACE FUNCTION pg_temp.getNextOverDueDate(
        "NextDueDate" TIMESTAMP WITH TIME ZONE,
        "TimeToCompleteUnit" TEXT,
        "TimeToCompleteValue" INTEGER
    ) RETURNS TIMESTAMP WITH TIME ZONE LANGUAGE sql BEGIN ATOMIC
SELECT (
        CASE
            WHEN "TimeToCompleteUnit" = 'day' THEN "NextDueDate" + ("TimeToCompleteValue" * INTERVAL '1 day')
            WHEN "TimeToCompleteUnit" = 'week' THEN "NextDueDate" + ("TimeToCompleteValue" * INTERVAL '1 week')
        END
    );

END;

with latest_test_results as (
    select distinct on (c."Id") c."Id",
        tr."TestDate" as "LatestDate"
    from risksmart.control c
        left join risksmart.schedule_state ss on c."Id" = ss."Id"
        left join risksmart.test_result tr on tr."ParentControlId" = c."Id"
    order by c."Id",
        tr."TestDate" desc
),
latest_with_next_due as (
    select pg_temp.getNextDueDate(
            s."Frequency",
            s."StartDate",
            ltr."LatestDate"
        ) as "DueDate",
        ltr."LatestDate",
        ltr."Id",
        s."TimeToCompleteUnit",
        s."TimeToCompleteValue"
    FROM latest_test_results ltr
        INNER JOIN risksmart.schedule s ON s."Id" = ltr."Id"
)
UPDATE risksmart.schedule_state ss
SET "LatestDate" = l."LatestDate",
    "DueDate" = l."DueDate",
    "OverdueDate" = pg_temp.getNextOverDueDate(
        l."DueDate",
        l."TimeToCompleteUnit",
        l."TimeToCompleteValue"
    ),
    "ModifiedByUser" = 'SYSTEM',
    "ModifiedAtTimestamp" = NOW()
FROM latest_with_next_due l
WHERE ss."Id" = l."Id";