-- Temp function to increment a date by a given frequency
CREATE OR REPLACE FUNCTION pg_temp.incrementFrequency("Frequency" TEXT, "StartDate" TIMESTAMP WITH TIME ZONE)
  RETURNS TIMESTAMP WITH TIME ZONE
  LANGUAGE sql
BEGIN
  ATOMIC
  SELECT (CASE
            WHEN "Frequency" = 'daily'
              THEN "StartDate" + INTERVAL '1 day'
            WHEN "Frequency" = 'weekly'
              THEN "StartDate" + INTERVAL '7 day'
            WHEN "Frequency" = 'fortnightly'
              THEN "StartDate" + INTERVAL '2 week'
            WHEN "Frequency" = 'fourweekly'
              THEN "StartDate" + INTERVAL '4 week'
            WHEN "Frequency" = 'monthly'
              THEN "StartDate" + INTERVAL '1 month'
            WHEN "Frequency" = 'quarterly'
              THEN "StartDate" + INTERVAL '3 month'
            WHEN "Frequency" = 'biannually'
              THEN "StartDate" + INTERVAL '6 month'
            WHEN "Frequency" = 'annually'
              THEN "StartDate" + INTERVAL '1 year'
    END);
END;

-- Temp function to get the next due date for a given frequency, state date and test date.
CREATE OR REPLACE FUNCTION pg_temp.getNextDueDate("Frequency" TEXT, "StartDate" TIMESTAMP WITH TIME ZONE,
                                                  "TestDate" TIMESTAMP WITH TIME ZONE)
  RETURNS TIMESTAMP WITH TIME ZONE
  LANGUAGE plpgsql
AS
$$
DECLARE
  NextTestDate TIMESTAMP WITH TIME ZONE;
BEGIN
  NextTestDate := "StartDate";
  BEGIN
    WHILE NextTestDate < "TestDate"
      LOOP
        NextTestDate := pg_temp.incrementFrequency("Frequency", NextTestDate);
      END LOOP;
    RETURN NextTestDate;
  END;
END;
$$;

-- Temp function to get the next over due date by taking the next due date and adding the time to complete values
CREATE OR REPLACE FUNCTION pg_temp.getNextOverDueDate("NextDueDate" TIMESTAMP WITH TIME ZONE, "TimeToCompleteUnit" TEXT,
                                                      "TimeToCompleteValue" INTEGER)
  RETURNS TIMESTAMP WITH TIME ZONE
  LANGUAGE sql
BEGIN
  ATOMIC
  SELECT (CASE
            WHEN "TimeToCompleteUnit" = 'day'
              THEN "NextDueDate" + ("TimeToCompleteValue" * INTERVAL '1 day')
            WHEN "TimeToCompleteUnit" = 'week'
              THEN "NextDueDate" + ("TimeToCompleteValue" * INTERVAL '1 week')
    END);
END;


UPDATE risksmart.schedule_state
SET "DueDate"             = filter_unioned_schedules."NextDueDate",
    "OverdueDate"         = filter_unioned_schedules."NextOverDueDate",
    "ModifiedByUser"      = 'SYSTEM',
    "ModifiedAtTimestamp" = NOW()
FROM (
       -- Get distinct schedules with the latest next due dates
       SELECT DISTINCT ON (unioned_schedules."Id") unioned_schedules."Id",
                                                   unioned_schedules."StartDate",
                                                   unioned_schedules."NextDueDate",
                                                   unioned_schedules."NextOverDueDate"
       FROM (
              -- Get all schedules, calculate next due date and overdue date
              SELECT ntd."Id",
                     ntd."StartDate",
                     ntd."NextDueDate",
                     pg_temp.getNextOverDueDate(ntd."NextDueDate", ntd."TimeToCompleteUnit",
                                                ntd."TimeToCompleteValue") AS "NextOverDueDate"
              FROM (SELECT *, viable_schedules."StartDate" AS "NextDueDate"
                    FROM (SELECT s."Id",
                                 s."Frequency",
                                 s."StartDate",
                                 s."TimeToCompleteUnit",
                                 s."TimeToCompleteValue"
                          FROM risksmart.risk AS r
                                 INNER JOIN risksmart.schedule AS s ON s."Id" = r."Id"
                                 INNER JOIN risksmart.schedule_state AS ss ON ss."Id" = s."Id"
                          WHERE s."Frequency" IS NOT NULL
                            AND s."StartDate" IS NOT NULL) AS viable_schedules) AS ntd
              UNION ALL
              -- Get all schedules where risk ratings exist, calculate next due date and overdue date based on latest test date
              SELECT ntd."Id",
                     ntd."StartDate",
                     ntd."NextDueDate",
                     pg_temp.getNextOverDueDate(ntd."NextDueDate", ntd."TimeToCompleteUnit",
                                                ntd."TimeToCompleteValue") AS "NextOverDueDate"
              FROM (SELECT *,
                           CASE
                             WHEN (viable_schedules_with_ratings."TestDate" IS NULL) <>
                                  (viable_schedules_with_ratings."StartDate" >
                                   viable_schedules_with_ratings."TestDate")
                               THEN viable_schedules_with_ratings."StartDate"
                             ELSE
                               pg_temp.getNextDueDate(viable_schedules_with_ratings."Frequency",
                                                      viable_schedules_with_ratings."StartDate",
                                                      viable_schedules_with_ratings."TestDate")
                             END AS "NextDueDate"
                    FROM (SELECT latest_ratings."TestDate",
                                 s."Id",
                                 s."Frequency",
                                 s."StartDate",
                                 s."TimeToCompleteUnit",
                                 s."TimeToCompleteValue"
                          FROM (SELECT DISTINCT ON (arp."ParentId") arp."ParentId", rar."TestDate", arp."ParentType"
                                FROM risksmart.assessment_result_parent AS arp
                                       INNER JOIN risksmart.risk_assessment_result AS rar ON arp."Id" = rar."Id"
                                WHERE "RatingType" IN ('rating', 'assessment')
                                  AND "ParentType" = 'risk'
                                ORDER BY arp."ParentId", "TestDate" DESC) AS latest_ratings
                                 INNER JOIN risksmart.schedule AS s ON s."Id" = latest_ratings."ParentId"
                                 INNER JOIN risksmart.schedule_state AS ss ON ss."Id" = s."Id"
                          WHERE s."Frequency" IS NOT NULL
                            AND s."StartDate" IS NOT NULL) AS viable_schedules_with_ratings) AS ntd
              ORDER BY "Id", "NextDueDate" DESC) AS unioned_schedules) AS filter_unioned_schedules
WHERE schedule_state."Id" = filter_unioned_schedules."Id"
