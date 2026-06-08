ALTER TABLE risksmart.assessment_activity
    RENAME COLUMN "ParentAssessmentId" to "ParentId";
ALTER TABLE risksmart.assessment_activity_audit
    RENAME COLUMN "ParentAssessmentId" to "ParentId";

CREATE OR REPLACE TRIGGER linked_item_insert_trigger
AFTER
INSERT ON risksmart.assessment_activity REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_insert_with_parentid();

CREATE OR REPLACE TRIGGER linked_item_delete_trigger
AFTER
DELETE ON risksmart.assessment_activity REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_delete_with_parentid();

CREATE OR REPLACE TRIGGER linked_item_update_trigger
AFTER
UPDATE ON risksmart.assessment_activity FOR EACH ROW EXECUTE PROCEDURE risksmart.linked_item_update_with_parentid();

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
        "Action"
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
        TG_OP
    );

RETURN aanr;

END;

$body$ LANGUAGE plpgsql;