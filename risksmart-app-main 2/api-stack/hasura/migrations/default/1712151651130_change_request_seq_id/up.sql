INSERT INTO "risksmart"."parent_type" ("Value", "Comment") VALUES ('change_request', 'Change Request');

ALTER TABLE risksmart.change_request ADD COLUMN "SequentialId" integer NULL;
ALTER TABLE risksmart.change_request_audit ADD COLUMN "SequentialId" integer NULL;

CREATE OR REPLACE FUNCTION risksmart.change_request_modified() RETURNS trigger AS $body$
DECLARE nr RECORD;
DECLARE updated_user TEXT;
DECLARE update_timestamp timestamp with time zone;

BEGIN IF (
    TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
) then
  nr := NEW;
  updated_user := NEW."ModifiedByUser";
  update_timestamp := NEW."ModifiedAtTimestamp";
ELSEIF (TG_OP = 'DELETE') THEN
  nr := OLD;
  updated_user := risksmart.get_hasura_user_id();
  update_timestamp := statement_timestamp();
END IF;

insert into risksmart.change_request_audit(
  "Id",
  "SequentialId",
  "OrgKey",
  "ParentId",
  "ChangeRequestStatus",
  "Changes",
  "CreatedByUser",
  "CreatedAtTimestamp",
  "ModifiedByUser",
  "ModifiedAtTimestamp",
  "Comment",
  "Action"
)
values (
        nr."Id",
        nr."SequentialId",
        nr."OrgKey",
        nr."ParentId",
        nr."ChangeRequestStatus",
        nr."Changes",
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        updated_user,
        update_timestamp,
        nr."Comment",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER set_sequential_id_trigger BEFORE
INSERT ON risksmart.change_request for each ROW EXECUTE PROCEDURE risksmart.set_sequential_id();

CREATE TEMP TABLE new_Ids ("Id" uuid, "SequentialId" integer);

INSERT INTO new_Ids ("Id", "SequentialId")
SELECT "Id",
    risksmart.getNextCounterValue("OrgKey", 'change_request') AS "SequentialId"
FROM risksmart.change_request
ORDER BY "CreatedAtTimestamp";

UPDATE risksmart.change_request i
SET "SequentialId" = ni."SequentialId",
    "ModifiedAtTimestamp" = statement_timestamp()
FROM new_Ids ni
WHERE i."Id" = ni."Id";

DROP TABLE new_Ids;

CREATE UNIQUE INDEX idx_changeRequest_orgKey_sequentialid ON risksmart.change_request("OrgKey", "SequentialId");
