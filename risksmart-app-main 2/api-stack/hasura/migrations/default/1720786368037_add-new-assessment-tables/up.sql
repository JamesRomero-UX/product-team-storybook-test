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

DROP INDEX risksmart.idx_assessment_orgKey_sequentialid;
CREATE UNIQUE INDEX idx_assessment_orgKey_sequentialid ON risksmart.assessment("OrgKey", "SequentialId");

DROP TRIGGER IF EXISTS set_sequential_id_trigger ON risksmart.assessment;
CREATE TRIGGER set_sequential_id_trigger BEFORE
  INSERT ON risksmart.assessment for each ROW EXECUTE PROCEDURE risksmart.set_sequential_id();

DROP FUNCTION risksmart.set_assessment_sequential_id;

ALTER TABLE risksmart.assessment DROP COLUMN "Type";
ALTER TABLE risksmart.assessment_audit DROP COLUMN "Type";
DROP TABLE risksmart.assessment_type;

-- Internal audit report entities

CREATE TABLE risksmart.internal_audit_report
(
  "Id"                   uuid                     default gen_random_uuid()     NOT NULL,
  "SequentialId"         integer,
  "Title"                text                                                   NOT NULL,
  "Summary"              text                                                   NOT NULL,
  "TargetCompletionDate" timestamp with time zone,
  "ActualCompletionDate" timestamp with time zone,
  "StartDate"            timestamp with time zone,
  "NextTestDate"         timestamp with time zone,
  "OrgKey"               text                                                   NOT NULL,
  "ModifiedByUser"       text                                                   NOT NULL,
  "ModifiedAtTimestamp"  timestamp with time zone default statement_timestamp() NOT NULL,
  "CreatedByUser"        text                                                   NOT NULL,
  "CreatedAtTimestamp"   timestamp with time zone default statement_timestamp() NOT NULL,
  "CompletedByUser"      text,
  "OriginatingItemId"    uuid,
  "CustomAttributeData"  jsonb,
  "Status"               text                     default 'notstarted'          NOT NULL,
  "Outcome"              integer,
  primary key ("Id"),
  constraint "internal_audit_report_orgKey_fkey"
    foreign key ("OrgKey") references auth.organisation,
  constraint "internal_audit_report_createdByUser_fkey"
    foreign key ("CreatedByUser") references auth."user",
  constraint "internal_audit_report_modifiedByUser_fkey"
    foreign key ("ModifiedByUser") references auth."user",
  constraint node_internal_audit_report_id_fkey
    foreign key ("Id") references risksmart.node,
  constraint "internal_audit_report_completedByUser_fkey"
    foreign key ("CompletedByUser") references auth."user",
  constraint internal_audit_report_status_fkey
    foreign key ("Status") references risksmart.assessment_status
);

CREATE TABLE risksmart.internal_audit_report_audit
(
  "Id"                   uuid                     default gen_random_uuid()     NOT NULL,
  "SequentialId"         integer,
  "Title"                text                                                   NOT NULL,
  "Summary"              text                                                   NOT NULL,
  "TargetCompletionDate" timestamp with time zone,
  "ActualCompletionDate" timestamp with time zone,
  "StartDate"            timestamp with time zone,
  "NextTestDate"         timestamp with time zone,
  "OrgKey"               text                                                   NOT NULL,
  "ModifiedByUser"       text                                                   NOT NULL,
  "ModifiedAtTimestamp"  timestamp with time zone default statement_timestamp() NOT NULL,
  "CreatedByUser"        text                                                   NOT NULL,
  "CreatedAtTimestamp"   timestamp with time zone default statement_timestamp() NOT NULL,
  "CompletedByUser"      text,
  "OriginatingItemId"    uuid,
  "CustomAttributeData"  jsonb,
  "Status"               text                     default 'notstarted'          NOT NULL,
  "Outcome"              integer,
  "Action"               risksmart.db_action,
  PRIMARY KEY ("Id", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.internal_audit_report_modified() RETURNS trigger AS $body$
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

insert into risksmart.internal_audit_report_audit(
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
  "CustomAttributeData",
  "Status",
  "Outcome",
  "Action"
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
         anr."CustomAttributeData",
         anr."Status",
         anr."Outcome",
         TG_OP
       );

RETURN anr;

END;

$body$ LANGUAGE plpgsql;

create unique index idx_internal_audit_report_orgkey_sequentialid
  ON risksmart.internal_audit_report ("OrgKey", "SequentialId");

CREATE TRIGGER node_insert_trigger
  before insert
  ON risksmart.internal_audit_report
  FOR EACH ROW
EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
  AFTER DELETE
  ON risksmart.internal_audit_report
  FOR EACH ROW
EXECUTE PROCEDURE risksmart.node_delete();

CREATE TRIGGER internal_audit_report_audit_trigger
  after insert or update or delete
  ON risksmart.internal_audit_report
  FOR EACH ROW
EXECUTE PROCEDURE risksmart.internal_audit_report_modified();

CREATE TRIGGER linked_item_insert_trigger
  after insert
  ON risksmart.internal_audit_report
  referencing new table inserted
EXECUTE PROCEDURE risksmart.linked_item_insert_with_originatingitemid();

CREATE TRIGGER linked_item_delete_trigger
  AFTER DELETE
  ON risksmart.internal_audit_report
  referencing old table deleted
EXECUTE PROCEDURE risksmart.linked_item_delete_with_originatingitemid();

CREATE TRIGGER linked_item_update_trigger
  AFTER UPDATE
  ON risksmart.internal_audit_report
  FOR EACH ROW
EXECUTE PROCEDURE risksmart.linked_item_update_with_originatingitemid();

CREATE TRIGGER set_sequential_id_trigger BEFORE
  INSERT ON risksmart.internal_audit_report for each ROW EXECUTE PROCEDURE risksmart.set_sequential_id();

-- Compliance monitoring assessment entities
CREATE TABLE risksmart.compliance_monitoring_assessment
(
  "Id"                   uuid                     default gen_random_uuid()     NOT NULL,
  "SequentialId"         integer,
  "Title"                text                                                   NOT NULL,
  "Summary"              text                                                   NOT NULL,
  "TargetCompletionDate" timestamp with time zone,
  "ActualCompletionDate" timestamp with time zone,
  "StartDate"            timestamp with time zone,
  "NextTestDate"         timestamp with time zone,
  "OrgKey"               text                                                   NOT NULL,
  "ModifiedByUser"       text                                                   NOT NULL,
  "ModifiedAtTimestamp"  timestamp with time zone default statement_timestamp() NOT NULL,
  "CreatedByUser"        text                                                   NOT NULL,
  "CreatedAtTimestamp"   timestamp with time zone default statement_timestamp() NOT NULL,
  "CompletedByUser"      text,
  "OriginatingItemId"    uuid,
  "CustomAttributeData"  jsonb,
  "Status"               text                     default 'notstarted'          NOT NULL,
  "Outcome"              integer,
  primary key ("Id"),
  constraint "compliance_monitoring_assessment_orgKey_fkey"
    foreign key ("OrgKey") references auth.organisation,
  constraint "compliance_monitoring_assessment_createdByUser_fkey"
    foreign key ("CreatedByUser") references auth."user",
  constraint "compliance_monitoring_assessment_modifiedByUser_fkey"
    foreign key ("ModifiedByUser") references auth."user",
  constraint node_compliance_monitoring_assessment_id_fkey
    foreign key ("Id") references risksmart.node,
  constraint "compliance_monitoring_assessment_completedByUser_fkey"
    foreign key ("CompletedByUser") references auth."user",
  constraint compliance_monitoring_assessment_status_fkey
    foreign key ("Status") references risksmart.assessment_status
);

CREATE TABLE risksmart.compliance_monitoring_assessment_audit
(
  "Id"                   uuid                     default gen_random_uuid()     NOT NULL,
  "SequentialId"         integer,
  "Title"                text                                                   NOT NULL,
  "Summary"              text                                                   NOT NULL,
  "TargetCompletionDate" timestamp with time zone,
  "ActualCompletionDate" timestamp with time zone,
  "StartDate"            timestamp with time zone,
  "NextTestDate"         timestamp with time zone,
  "OrgKey"               text                                                   NOT NULL,
  "ModifiedByUser"       text                                                   NOT NULL,
  "ModifiedAtTimestamp"  timestamp with time zone default statement_timestamp() NOT NULL,
  "CreatedByUser"        text                                                   NOT NULL,
  "CreatedAtTimestamp"   timestamp with time zone default statement_timestamp() NOT NULL,
  "CompletedByUser"      text,
  "OriginatingItemId"    uuid,
  "CustomAttributeData"  jsonb,
  "Status"               text                     default 'notstarted'          NOT NULL,
  "Outcome"              integer,
  "Action"               risksmart.db_action,
  PRIMARY KEY ("Id", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.compliance_monitoring_assessment_modified() RETURNS trigger AS $body$
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

insert into risksmart.compliance_monitoring_assessment_audit(
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
  "CustomAttributeData",
  "Status",
  "Outcome",
  "Action"
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
         anr."CustomAttributeData",
         anr."Status",
         anr."Outcome",
         TG_OP
       );

RETURN anr;

END;

$body$ LANGUAGE plpgsql;

create unique index idx_compliance_monitoring_assessment_orgkey_sequentialid
  ON risksmart.compliance_monitoring_assessment ("OrgKey", "SequentialId");

CREATE TRIGGER node_insert_trigger
  before insert
  ON risksmart.compliance_monitoring_assessment
  FOR EACH ROW
EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
  AFTER DELETE
  ON risksmart.compliance_monitoring_assessment
  FOR EACH ROW
EXECUTE PROCEDURE risksmart.node_delete();

CREATE TRIGGER compliance_monitoring_assessment_audit_trigger
  after insert or update or delete
  ON risksmart.compliance_monitoring_assessment
  FOR EACH ROW
EXECUTE PROCEDURE risksmart.compliance_monitoring_assessment_modified();

CREATE TRIGGER linked_item_insert_trigger
  after insert
  ON risksmart.compliance_monitoring_assessment
  referencing new table inserted
EXECUTE PROCEDURE risksmart.linked_item_insert_with_originatingitemid();

CREATE TRIGGER linked_item_delete_trigger
  AFTER DELETE
  ON risksmart.compliance_monitoring_assessment
  referencing old table deleted
EXECUTE PROCEDURE risksmart.linked_item_delete_with_originatingitemid();

CREATE TRIGGER linked_item_update_trigger
  AFTER UPDATE
  ON risksmart.compliance_monitoring_assessment
  FOR EACH ROW
EXECUTE PROCEDURE risksmart.linked_item_update_with_originatingitemid();

CREATE TRIGGER set_sequential_id_trigger BEFORE
  INSERT ON risksmart.compliance_monitoring_assessment for each ROW EXECUTE PROCEDURE risksmart.set_sequential_id();

ALTER TABLE risksmart.assessment_activity
  DROP CONSTRAINT "assessment_activity_ParentAssessmentId_fkey";
