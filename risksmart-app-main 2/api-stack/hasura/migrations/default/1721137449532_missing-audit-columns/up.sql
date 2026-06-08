ALTER TABLE risksmart.assessment_activity_audit
ADD COLUMN "CustomAttributeData" JSONB;

CREATE OR REPLACE FUNCTION risksmart.assessment_activity_modified() RETURNS trigger AS $body$
DECLARE aanr RECORD;

DECLARE a_updated_user TEXT;

DECLARE a_update_timestamp timestamp with time zone;

BEGIN if (
    TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
) then aanr := NEW;

a_updated_user := NEW."ModifiedByUser";

a_update_timestamp := NEW."ModifiedAtTimestamp";

elsif (TG_OP = 'DELETE') then aanr := OLD;

a_updated_user := risksmart.get_hasura_user_id();

a_update_timestamp := statement_timestamp();

END IF;

insert into risksmart.assessment_activity_audit(
        "Id",
        "ActivityType",
        "ParentId",
        "OrgKey",
        "Title",
        "Summary",
        "Status",
        "CompletionDate",
        "AssignedUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action",
        "CustomAttributeData"
    )
values (
        aanr."Id",
        aanr."ActivityType",
        aanr."ParentId",
        aanr."OrgKey",
        aanr."Title",
        aanr."Summary",
        aanr."Status",
        aanr."CompletionDate",
        aanr."AssignedUser",
        a_updated_user,
        a_update_timestamp,
        aanr."CreatedByUser",
        aanr."CreatedAtTimestamp",
        TG_OP,
        aanr."CustomAttributeData"
    );

RETURN aanr;

END;

$body$ LANGUAGE plpgsql;

ALTER TABLE risksmart.assessment_audit
ADD COLUMN "OriginatingItemId" uuid;

CREATE OR REPLACE FUNCTION risksmart.assessment_modified() RETURNS trigger AS $body$
DECLARE anr RECORD;

DECLARE a_updated_user TEXT;

DECLARE a_update_timestamp timestamp with time zone;

BEGIN if (
    TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
) then anr := NEW;

a_updated_user := NEW."ModifiedByUser";

a_update_timestamp := NEW."ModifiedAtTimestamp";

elsif (TG_OP = 'DELETE') then anr := OLD;

a_updated_user := risksmart.get_hasura_user_id();

a_update_timestamp := statement_timestamp();

END IF;

insert into risksmart.assessment_audit(
        "Id",
        "SequentialId",
        "Title",
        "Summary",
        "TargetCompletionDate",
        "ActualCompletionDate",
        "StartDate",
        "NextTestDate",
        "CompletedByUser",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action",
        "CustomAttributeData",
        "Status",
        "Outcome",
        "OriginatingItemId"
    )
values (
        anr."Id",
        anr."SequentialId",
        anr."Title",
        anr."Summary",
        anr."TargetCompletionDate",
        anr."ActualCompletionDate",
        anr."StartDate",
        anr."NextTestDate",
        anr."CompletedByUser",
        anr."OrgKey",
        a_updated_user,
        a_update_timestamp,
        anr."CreatedByUser",
        anr."CreatedAtTimestamp",
        TG_OP,
        anr."CustomAttributeData",
        anr."Status",
        anr."Outcome",
        anr."OriginatingItemId"
    );

RETURN anr;

END;

$body$ LANGUAGE plpgsql;

ALTER TABLE risksmart.linked_item_audit
ADD COLUMN "Id" uuid;

CREATE OR REPLACE FUNCTION risksmart.linked_item_modified() RETURNS trigger AS $body$
DECLARE nr RECORD;

DECLARE updated_user TEXT;

DECLARE update_timestamp timestamp with time zone;

BEGIN if (
    TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
) then nr := NEW;

-- linked_item table doesn't have ModifiedAtTimestamp or ModifiedByUser, so asume only support insert
updated_user := NEW."CreatedByUser";

update_timestamp := NEW."CreatedAtTimestamp";

elsif (TG_OP = 'DELETE') then nr := OLD;

updated_user := risksmart.get_hasura_user_id();

update_timestamp := statement_timestamp();

END IF;

insert into risksmart.linked_item_audit(
        "Source",
        "Target",
        "RelationshipType",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "Action",
        "Id"
    )
values (
        nr."Source",
        nr."Target",
        nr."RelationshipType",
        nr."OrgKey",
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        updated_user,
        update_timestamp,
        TG_OP,
        nr."Id"
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;