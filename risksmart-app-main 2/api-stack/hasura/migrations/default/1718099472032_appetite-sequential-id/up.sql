ALTER TABLE risksmart.appetite
ADD COLUMN "SequentialId" integer NULL;

ALTER TABLE risksmart.appetite_audit
ADD COLUMN "SequentialId" integer NULL;

CREATE TRIGGER a_set_sequential_id_trigger BEFORE
INSERT ON risksmart.appetite for each ROW EXECUTE PROCEDURE risksmart.set_sequential_id();

CREATE OR REPLACE FUNCTION risksmart.appetite_modified() RETURNS trigger LANGUAGE 'plpgsql' COST 100 VOLATILE NOT LEAKPROOF AS $BODY$
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

insert into risksmart.appetite_audit(
        "Id",
        "CustomAttributeData",
        "Statement",
        "LowerAppetite",
        "UpperAppetite",
        "EffectiveDate",
        "AppetiteType",
        "ImpactAppetite",
        "Meta",
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
        nr."Statement",
        nr."LowerAppetite",
        nr."UpperAppetite",
        nr."EffectiveDate",
        nr."AppetiteType",
        nr."ImpactAppetite",
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

$BODY$;

CREATE TEMP TABLE new_Ids ("Id" uuid, "SequentialId" integer);

INSERT INTO new_Ids ("Id", "SequentialId")
SELECT "Id",
    risksmart.getNextCounterValue("OrgKey", 'appetite') AS "SequentialId"
FROM risksmart.appetite
ORDER BY "CreatedAtTimestamp";

UPDATE risksmart.appetite i
SET "SequentialId" = ni."SequentialId",
    "ModifiedAtTimestamp" = statement_timestamp(),
    "ModifiedByUser" = 'SYSTEM'
FROM new_Ids ni
WHERE i."Id" = ni."Id";

DROP TABLE new_Ids;

CREATE UNIQUE INDEX idx_appetite_orgKey_sequentialid ON risksmart.appetite("OrgKey", "SequentialId");