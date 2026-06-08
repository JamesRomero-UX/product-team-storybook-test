CREATE TABLE IF NOT EXISTS risksmart.assessment_activity (
    "Id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "ActivityType" text NOT NULL,
    "ParentAssessmentId" uuid not null,
    "OrgKey" text NOT NULL,
    "Title" text NULL,
    "Summary" text NULL,
    "Status" text NULL,
    "AssignedUser" text NULL,
    "CompletionDate" timestamp with time zone NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CustomAttributeData" JSONB null,
    PRIMARY KEY ("Id"),
    FOREIGN KEY ("OrgKey") REFERENCES "auth"."organisation"("OrgKey") ON UPDATE restrict ON DELETE restrict,
    FOREIGN KEY ("CreatedByUser") REFERENCES "auth"."user"("Id") ON UPDATE restrict ON DELETE restrict,
    FOREIGN KEY ("AssignedUser") REFERENCES "auth"."user"("Id") ON UPDATE restrict ON DELETE restrict,
    FOREIGN KEY ("ModifiedByUser") REFERENCES "auth"."user"("Id") ON UPDATE restrict ON DELETE restrict,
    FOREIGN KEY ("ParentAssessmentId") REFERENCES "risksmart"."assessment"("Id") ON UPDATE restrict ON DELETE CASCADE
);

CREATE TRIGGER node_insert_trigger BEFORE
INSERT ON risksmart.assessment_activity FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.assessment_activity FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

ALTER TABLE risksmart.assessment_activity
ADD CONSTRAINT "assessment_activity_id_fkey" FOREIGN KEY ("Id") REFERENCES risksmart.node("Id");

CREATE TABLE risksmart.assessment_activity_status ("Value" text PRIMARY KEY, "Comment" text);

ALTER TABLE risksmart.assessment_activity
ADD CONSTRAINT "assessment_activity_status_fkey" FOREIGN KEY ("Status") REFERENCES risksmart.assessment_activity_status("Value");

INSERT INTO risksmart.assessment_activity_status ("Value", "Comment")
VALUES ('complete', 'Complete'),
    ('notstarted', 'Not Started'),
    ('inprogress', 'In Progress');

CREATE TABLE risksmart.assessment_activity_type ("Value" text PRIMARY KEY, "Comment" text);

ALTER TABLE risksmart.assessment_activity
ADD CONSTRAINT "assessment_activity_type_fkey" FOREIGN KEY ("ActivityType") REFERENCES risksmart.assessment_activity_type("Value");

INSERT INTO risksmart.assessment_activity_type ("Value", "Comment")
VALUES ('task', 'Task'),
    ('reminder', 'Reminder'),
    ('review', 'Review'),
    ('interview', 'Interview'),
    ('meeting', 'Meeting');

CREATE TABLE IF NOT EXISTS risksmart.assessment_activity_audit (
    "Id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "ActivityType" text NOT NULL,
    "ParentAssessmentId" uuid not null,
    "OrgKey" text NOT NULL,
    "Title" text NULL,
    "Summary" text NULL,
    "Status" text NULL,
    "AssignedUser" text NULL,
    "CompletionDate" timestamp with time zone NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "Action" risksmart.db_action,
    PRIMARY KEY ("Id", "ModifiedAtTimestamp")
);

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
        "ParentAssessmentId",
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
        aanr."ParentAssessmentId",
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

DROP TRIGGER IF EXISTS assessment_activity_audit_trigger ON risksmart.assessment_activity;

CREATE TRIGGER assessment_activity_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.assessment_activity FOR EACH ROW EXECUTE FUNCTION risksmart.assessment_activity_modified();

INSERT INTO risksmart."parent_type" ("Value", "Comment")
VALUES ('assessment_activity', 'Assessment Activity');

INSERT INTO risksmart."role_access" (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES 
('Standard','assessment_activity','owner','read'),
('Standard','assessment_activity','owner','update'),
('Standard','assessment_activity','owner','delete'),
('Standard','assessment_activity','contributor','read'),
('Standard','assessment_activity','contributor','update'),
('RiskManager','assessment_activity','any','read'),
('RiskManager','assessment_activity','any','update'),
('RiskManager','assessment_activity','any','delete'),
('RiskManager','assessment_activity','any','insert'),
('ReadOnly','assessment_activity','any','read'),
('Standard','assessment_activity','owner','insert'),
('Standard','assessment_activity','contributor','insert'),
('Standard','assessment_activity','contributor','delete'),
('Owner','assessment_activity','any','read'),
('Owner','assessment_activity','owner','update'),
('Owner','assessment_activity','owner','delete'),
('Owner','assessment_activity','contributor','update'),
('Owner','assessment_activity','owner','insert'),
('Owner','assessment_activity','contributor','insert'),
('Owner','assessment_activity','contributor','delete'),
('CustomerSupport','assessment_activity','any','read'),
('CustomerSupport','assessment_activity','any','update'),
('CustomerSupport','assessment_activity','any','delete'),
('CustomerSupport','assessment_activity','any','insert');