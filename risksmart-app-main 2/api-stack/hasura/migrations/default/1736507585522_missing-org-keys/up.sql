ALTER TABLE risksmart.node_ancestor
ALTER COLUMN "OrgKey"
SET NOT NULL;

ALTER TABLE risksmart.approver_response
ADD COLUMN "OrgKey" text NULL;

ALTER TABLE risksmart.approver_response_audit
ADD COLUMN "OrgKey" text NULL;

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
        "Action",
        "OrgKey"
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
        TG_OP,
        nr."OrgKey"
    );

RETURN nr;

END;

$BODY$;

UPDATE risksmart.approver_response_audit ar
SET "OrgKey" = cr."OrgKey"
FROM (
        SELECT DISTINCT cra."Id",
            cra."OrgKey"
        FROM risksmart.change_request_audit cra
    ) cr
WHERE cr."Id" = ar."ChangeRequestId";

UPDATE risksmart.approver_response ar
SET "OrgKey" = cr."OrgKey",
    "ModifiedAtTimestamp" = now(),
    "ModifiedByUser" = 'SYSTEM'
FROM risksmart.change_request cr
WHERE cr."Id" = ar."ChangeRequestId";

ALTER TABLE risksmart.approver_response
ALTER COLUMN "OrgKey"
SET NOT NULL;

ALTER TABLE risksmart.approver_response_audit
ALTER COLUMN "OrgKey"
SET NOT NULL;