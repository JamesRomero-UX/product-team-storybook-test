alter table risksmart.change_request
add column "ActionUserId" text;

alter table risksmart.change_request_audit
add column "ActionUserId" text;

alter table risksmart.change_request
alter column "ParentId"
SET NOT NULL;

-- Required whilst running migration as trigger function no longer includes Changes
alter table risksmart.change_request_audit
alter column "Changes" DROP NOT NULL;

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
        "ActionUserId",
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
        nr."ActionUserId",
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

update risksmart.change_request_audit
set "ActionUserId" = "Changes"->>2;

update risksmart.change_request
set "ActionUserId" = "Changes"->>2,
    "ModifiedAtTimestamp" = now(),
    "ModifiedByUser" = 'SYSTEM';

alter table risksmart.change_request drop column "Changes";

alter table risksmart.change_request_audit drop column "Changes";

alter table risksmart.change_request
alter column "ActionUserId"
SET NOT NULL;