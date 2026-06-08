ALTER TABLE risksmart.assessment
ADD COLUMN "Outcome" integer;

ALTER TABLE risksmart.assessment_audit
ADD COLUMN "Outcome" integer;

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
        "Outcome"
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
        anr."Outcome"
    );

RETURN anr;

END;

$body$ LANGUAGE plpgsql;
