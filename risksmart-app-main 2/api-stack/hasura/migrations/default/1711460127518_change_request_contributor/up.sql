
CREATE TABLE "risksmart"."change_request_contributor" (
  "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "OrgKey" text not null,
  "ChangeRequestId" UUID NOT NULL,
  "UserId" text NOT NULL,
  "CreatedAtTimestamp" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "ModifiedAtTimestamp" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("ChangeRequestId", "UserId"),
  FOREIGN KEY ("ChangeRequestId") REFERENCES risksmart.change_request("Id") ON DELETE CASCADE,
  FOREIGN KEY ("UserId") REFERENCES auth.user("Id") ON DELETE CASCADE
);

CREATE TABLE "risksmart"."change_request_contributor_audit" (LIKE risksmart.change_request_contributor);

ALTER TABLE "risksmart"."change_request_contributor_audit"
ADD PRIMARY KEY ("Id", "ModifiedAtTimestamp");

ALTER TABLE "risksmart"."change_request_contributor_audit"
ADD COLUMN "Action" risksmart.db_action;


CREATE OR REPLACE FUNCTION risksmart.change_request_contributor_modified() RETURNS trigger AS $body$
DECLARE nr RECORD;
DECLARE updated_user TEXT;
DECLARE update_timestamp timestamp with time zone;

BEGIN IF (
    TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
) then
  nr := NEW;
  update_timestamp := NEW."ModifiedAtTimestamp";
ELSEIF (TG_OP = 'DELETE') THEN
  nr := OLD;
  update_timestamp := statement_timestamp();
END IF;

insert into risksmart.change_request_contributor_audit(
  "Id",
  "OrgKey",
  "ChangeRequestId",
  "UserId",
  "CreatedAtTimestamp",
  "ModifiedAtTimestamp",
  "Action"
)
values (
        nr."Id",
        nr."OrgKey",
        nr."ChangeRequestId",
        nr."UserId",
        nr."CreatedAtTimestamp",
        update_timestamp,
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER change_request_contributor_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.change_request_contributor FOR EACH ROW EXECUTE FUNCTION risksmart.change_request_contributor_modified();
