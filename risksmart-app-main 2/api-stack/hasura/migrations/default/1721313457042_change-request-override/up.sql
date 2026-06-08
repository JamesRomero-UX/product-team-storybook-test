ALTER TABLE risksmart."change_request"
ADD COLUMN "OverriddenByUser" TEXT,
    ADD COLUMN "OverriddenAtTimestamp" TIMESTAMP WITH TIME ZONE;

ALTER TABLE risksmart."change_request"
ADD CONSTRAINT "change_request_OverriddenByUser_fkey" FOREIGN KEY ("OverriddenByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart."change_request_audit"
ADD COLUMN "OverriddenByUser" TEXT,
    ADD COLUMN "OverriddenAtTimestamp" TIMESTAMP WITH TIME ZONE;

ALTER TABLE risksmart."change_request_audit"
ADD CONSTRAINT "change_request_audit_OverriddenByUser_fkey" FOREIGN KEY ("OverriddenByUser") REFERENCES auth.user("Id");

CREATE OR REPLACE FUNCTION risksmart.change_request_modified() RETURNS trigger LANGUAGE 'plpgsql' COST 100 VOLATILE NOT LEAKPROOF AS $BODY$
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
        "OverriddenByUser",
        "OverriddenAtTimestamp",
        "RequestedChanges",
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
        nr."OverriddenByUser",
        nr."OverriddenAtTimestamp",
        nr."RequestedChanges",
        TG_OP
    );

RETURN nr;

END;

$BODY$;

ALTER TABLE risksmart."approver_response"
ADD COLUMN "OverriddenByUser" TEXT,
    ADD COLUMN "OverriddenAtTimestamp" TIMESTAMP WITH TIME ZONE;

ALTER TABLE risksmart."approver_response"
ADD CONSTRAINT "approver_response_OverriddenByUser_fkey" FOREIGN KEY ("OverriddenByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart."approver_response_audit"
ADD COLUMN "OverriddenByUser" TEXT,
    ADD COLUMN "OverriddenAtTimestamp" TIMESTAMP WITH TIME ZONE;

ALTER TABLE risksmart."approver_response_audit"
ADD CONSTRAINT "approver_response_audit_OverriddenByUser_fkey" FOREIGN KEY ("OverriddenByUser") REFERENCES auth.user("Id");

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
        "OverriddenByUser",
        "OverriddenAtTimestamp",
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
        nr."OverriddenByUser",
        nr."OverriddenAtTimestamp",
        TG_OP
    );

RETURN nr;

END;

$BODY$;