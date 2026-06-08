
ALTER TABLE risksmart.approver_response RENAME "OverriddenByUser" TO "ApprovedByUser";
ALTER TABLE risksmart.approver_response RENAME "OverriddenAtTimestamp" TO "ApprovedAtTimestamp";
ALTER TABLE risksmart.approver_response RENAME CONSTRAINT "approver_response_OverriddenByUser_fkey" TO "approver_response_ApprovedByUser_fkey";

ALTER TABLE risksmart.approver_response_audit RENAME "OverriddenByUser" TO "ApprovedByUser";
ALTER TABLE risksmart.approver_response_audit RENAME "OverriddenAtTimestamp" TO "ApprovedAtTimestamp";
ALTER TABLE risksmart.approver_response_audit DROP CONSTRAINT "approver_response_audit_OverriddenByUser_fkey";

CREATE OR REPLACE FUNCTION risksmart.approver_response_modified() RETURNS trigger LANGUAGE 'plpgsql' COST 100 VOLATILE NOT LEAKPROOF AS $BODY$
DECLARE nr RECORD;

  DECLARE updated_user TEXT;

  DECLARE update_timestamp timestamp with time zone;

BEGIN IF (
  TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
  ) then nr := NEW;

updated_user := NEW."ModifiedByUser";

update_timestamp := NEW."ModifiedAtTimestamp";

ELSEIF (TG_OP = 'DELETE') THEN nr := OLD;

updated_user := risksmart.get_hasura_user_id();

update_timestamp := statement_timestamp();

END IF;

insert into risksmart.approver_response_audit(
  "Id",
  "ApproverId",
  "Approved",
  "ChangeRequestId",
  "ModifiedByUser",
  "ModifiedAtTimestamp",
  "CreatedByUser",
  "CreatedAtTimestamp",
  "Comment",
  "ApprovedByUser",
  "ApprovedAtTimestamp",
  "Action"
)
values (
         nr."Id",
         nr."ApproverId",
         nr."Approved",
         nr."ChangeRequestId",
         updated_user,
         update_timestamp,
         nr."CreatedByUser",
         nr."CreatedAtTimestamp",
         nr."Comment",
         nr."ApprovedByUser",
         nr."ApprovedAtTimestamp",
         TG_OP
       );

RETURN nr;

END;

$BODY$;
