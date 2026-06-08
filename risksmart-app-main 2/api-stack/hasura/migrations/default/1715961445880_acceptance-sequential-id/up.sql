ALTER TABLE risksmart.acceptance
ADD COLUMN "SequentialId" integer NULL;

ALTER TABLE risksmart.acceptance_audit
ADD COLUMN "SequentialId" integer NULL;

CREATE OR REPLACE FUNCTION risksmart.acceptance_modified() RETURNS trigger LANGUAGE 'plpgsql' COST 100 VOLATILE NOT LEAKPROOF AS $BODY$
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

insert into risksmart.acceptance_audit(
        "Id",
        "CustomAttributeData",
        "Title",
        "DateAcceptedFrom",
        "DateAcceptedTo",
        "Details",
        "Status",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action",
        "ApprovedByUser",
        "ApprovedByUserGroup",
        "RequestedByUser",
        "RequestedByUserGroup",
        "SequentialId"
    )
values (
        nr."Id",
        nr."CustomAttributeData",
        nr."Title",
        nr."DateAcceptedFrom",
        nr."DateAcceptedTo",
        nr."Details",
        nr."Status",
        nr."Meta",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        TG_OP,
        nr."ApprovedByUser",
        nr."ApprovedByUserGroup",
        nr."RequestedByUser",
        nr."RequestedByUserGroup",
        nr."SequentialId"
    );

RETURN nr;

END;

$BODY$;

CREATE TRIGGER a_set_sequential_id_trigger BEFORE
INSERT ON risksmart.acceptance for each ROW EXECUTE PROCEDURE risksmart.set_sequential_id();

CREATE TEMP TABLE new_Ids ("Id" uuid, "SequentialId" integer);

INSERT INTO new_Ids ("Id", "SequentialId")
SELECT "Id",
    risksmart.getNextCounterValue("OrgKey", 'acceptance') AS "SequentialId"
FROM risksmart.acceptance
ORDER BY "CreatedAtTimestamp";

UPDATE risksmart.acceptance i
SET "SequentialId" = ni."SequentialId",
    "ModifiedAtTimestamp" = statement_timestamp(),
    "ModifiedByUser" = 'SYSTEM'
FROM new_Ids ni
WHERE i."Id" = ni."Id";

DROP TABLE new_Ids;

CREATE UNIQUE INDEX idx_acceptance_orgKey_sequentialid ON risksmart.acceptance("OrgKey", "SequentialId");

UPDATE risksmart.node n
SET "SequentialId" = o."SequentialId"
FROM risksmart.acceptance o
WHERE n."Id" = o."Id";