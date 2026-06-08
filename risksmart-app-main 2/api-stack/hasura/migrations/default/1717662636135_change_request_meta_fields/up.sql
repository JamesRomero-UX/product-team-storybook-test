

ALTER TABLE risksmart.change_request ADD COLUMN "Type" text NOT NULL DEFAULT 'update' CHECK ("Type" IN ('create', 'update', 'delete'));
ALTER TABLE risksmart.change_request ALTER COLUMN "Type" DROP DEFAULT;

ALTER TABLE risksmart.change_request_audit ADD COLUMN "Type" text NOT NULL DEFAULT 'update' CHECK ("Type" IN ('create', 'update', 'delete'));
ALTER TABLE risksmart.change_request_audit ALTER COLUMN "Type" DROP DEFAULT;

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
  "Type",
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
        nr."Type",
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
