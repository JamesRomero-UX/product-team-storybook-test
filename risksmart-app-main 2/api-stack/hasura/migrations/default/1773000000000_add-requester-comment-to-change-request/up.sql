ALTER TABLE risksmart.change_request ADD COLUMN "RequesterComment" text;

ALTER TABLE risksmart.change_request_audit ADD COLUMN "RequesterComment" text;

CREATE OR REPLACE FUNCTION risksmart.change_request_modified() RETURNS trigger LANGUAGE 'plpgsql' AS $BODY$
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
        "ActionUserId",
        "Workflow",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "Comment",
        "OverriddenByUser",
        "OverriddenAtTimestamp",
        "RequestedChanges",
        "RequesterComment",
        "Action"
    )
values (
        nr."Id",
        nr."SequentialId",
        nr."OrgKey",
        nr."ParentId",
        nr."Type",
        nr."ChangeRequestStatus",
        nr."ActionUserId",
        nr."Workflow",
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        updated_user,
        update_timestamp,
        nr."Comment",
        nr."OverriddenByUser",
        nr."OverriddenAtTimestamp",
        nr."RequestedChanges",
        nr."RequesterComment",
        TG_OP
    );

RETURN nr;

END;

$BODY$;
