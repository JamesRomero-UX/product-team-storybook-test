CREATE TABLE risksmart.assessment_type ("Value" text PRIMARY KEY, "Comment" text);

INSERT INTO risksmart.assessment_type ("Value", "Comment")
VALUES ('rating', 'Rating'),
    ('internal_audit_report', 'Internal Audit Report'),
    ('compliance_monitoring_assessment', 'Compliance Monitoring Assessment');

ALTER TABLE risksmart.assessment
ADD COLUMN "Type" text NOT NULL default 'rating';

ALTER TABLE risksmart.assessment_audit
ADD COLUMN "Type" text NULL;

ALTER TABLE risksmart.assessment
ADD CONSTRAINT "assessment_type_fkey" FOREIGN KEY ("Type") REFERENCES risksmart.assessment_type("Value");

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
        "Type"
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
        anr."Type"
    );

RETURN anr;

END;

$body$ LANGUAGE plpgsql;




INSERT INTO
  risksmart."parent_type" ("Value", "Comment")
VALUES
  ('internal_audit', 'Internal Audit'),
  ('compliance_monitoring_assessment', 'Compliance Monitoring Assessment'),
  ('internal_audit_report', 'Internal Audit Report');

INSERT INTO risksmart."role_access" (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES
('RiskManager','internal_audit','any','insert'),
('RiskManager','internal_audit','any','read'),
('RiskManager','internal_audit','any','update'),
('RiskManager','internal_audit','any','delete'),
('RiskManager','internal_audit_report','any','insert'),
('RiskManager','internal_audit_report','any','read'),
('RiskManager','internal_audit_report','any','update'),
('RiskManager','internal_audit_report','any','delete'),
('RiskManager','compliance_monitoring_assessment','any','insert'),
('RiskManager','compliance_monitoring_assessment','any','read'),
('RiskManager','compliance_monitoring_assessment','any','update'),
('RiskManager','compliance_monitoring_assessment','any','delete');
