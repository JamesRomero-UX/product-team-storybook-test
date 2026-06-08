ALTER TABLE risksmart.test_result
ADD COLUMN "SequentialId" integer NULL;

ALTER TABLE risksmart.test_result_audit
ADD COLUMN "SequentialId" integer NULL;

CREATE TRIGGER a_set_sequential_id_trigger BEFORE
INSERT ON risksmart.test_result for each ROW EXECUTE PROCEDURE risksmart.set_sequential_id();

CREATE OR REPLACE FUNCTION risksmart.test_result_modified() RETURNS TRIGGER language plpgsql AS $body$
DECLARE nr RECORD;

DECLARE updated_user TEXT;

DECLARE update_timestamp timestamp with time zone;

BEGIN IF (
    TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
) THEN nr := NEW;

updated_user := NEW."ModifiedByUser";

update_timestamp := NEW."ModifiedAtTimestamp";

ELSIF (TG_OP = 'DELETE') THEN nr := OLD;

updated_user := risksmart.get_hasura_user_id();

update_timestamp := statement_timestamp();

END IF;

INSERT INTO risksmart.test_result_audit(
        "Id",
        "CustomAttributeData",
        "Title",
        "Description",
        "Submitter",
        "ParentControlId",
        "TestType",
        "DesignEffectiveness",
        "PerformanceEffectiveness",
        "OverallEffectiveness",
        "TestDate",
        "NextTestDate",
        "RatingType",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action",
        "SequentialId"
    )
VALUES (
        nr."Id",
        nr."CustomAttributeData",
        nr."Title",
        nr."Description",
        nr."Submitter",
        nr."ParentControlId",
        nr."TestType",
        nr."DesignEffectiveness",
        nr."PerformanceEffectiveness",
        nr."OverallEffectiveness",
        nr."TestDate",
        nr."NextTestDate",
        nr."RatingType",
        nr."Meta",
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

$body$;

CREATE TEMP TABLE new_Ids ("Id" uuid, "SequentialId" integer);

INSERT INTO new_Ids ("Id", "SequentialId")
SELECT "Id",
    risksmart.getNextCounterValue("OrgKey", 'test_result') AS "SequentialId"
FROM risksmart.test_result
ORDER BY "CreatedAtTimestamp";

UPDATE risksmart.test_result i
SET "SequentialId" = ni."SequentialId",
    "ModifiedAtTimestamp" = statement_timestamp()
FROM new_Ids ni
WHERE i."Id" = ni."Id";

DROP TABLE new_Ids;

CREATE UNIQUE INDEX idx_test_result_orgKey_sequentialid ON risksmart.test_result("OrgKey", "SequentialId");

ALTER TABLE risksmart.test_result
ALTER COLUMN "SequentialId"
SET NOT NULL;