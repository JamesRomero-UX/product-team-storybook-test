-- QUESTIONNAIRE TEMPLATE
CREATE TABLE IF NOT EXISTS risksmart.questionnaire_template
(
  "Id"                  uuid                                                   NOT NULL DEFAULT gen_random_uuid(),
  "OrgKey"              text                                                   NOT NULL,
  "CreatedByUser"       text                                                   NOT NULL,
  "ModifiedByUser"      text                                                   NOT NULL,
  "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
  "CreatedAtTimestamp"  timestamp with time zone default statement_timestamp() NOT NULL,
  "Title"               text                                                   NOT NULL,
  "Description"         text,
  "CustomAttributeData" jsonb,
  PRIMARY KEY ("Id"),
  CONSTRAINT "Organisation_Id_fkey" FOREIGN KEY ("OrgKey") REFERENCES "auth"."organisation" ("OrgKey") ON UPDATE restrict ON DELETE restrict,
  FOREIGN KEY ("CreatedByUser") REFERENCES "auth"."user" ("Id") ON UPDATE restrict ON DELETE restrict,
  FOREIGN KEY ("ModifiedByUser") REFERENCES "auth"."user" ("Id") ON UPDATE restrict ON DELETE restrict
);

INSERT INTO risksmart.parent_type ("Value", "Comment")
VALUES ('questionnaire_template', 'Questionnaire Template');

CREATE TRIGGER node_insert_trigger
  BEFORE INSERT
  ON risksmart.questionnaire_template
  FOR EACH ROW
EXECUTE FUNCTION risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
  AFTER DELETE
  ON risksmart.questionnaire_template
  FOR EACH ROW
EXECUTE FUNCTION risksmart.node_delete();

CREATE TABLE IF NOT EXISTS risksmart.questionnaire_template_audit
(
  "Id"                  uuid                                                   NOT NULL,
  "OrgKey"              text                                                   NOT NULL,
  "CreatedByUser"       text                                                   NOT NULL,
  "ModifiedByUser"      text                                                   NOT NULL,
  "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
  "CreatedAtTimestamp"  timestamp with time zone default statement_timestamp() NOT NULL,
  "Action"              risksmart.db_action                                    NOT NULL,
  "Title"               text                                                   NOT NULL,
  "Description"         text,
  "CustomAttributeData" jsonb,
  PRIMARY KEY ("Id", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.questionnaire_template_modified() RETURNS trigger AS
$body$
DECLARE
  anr                        RECORD;
  DECLARE a_updated_user     TEXT;
  DECLARE a_update_timestamp timestamp with time zone;

BEGIN
  if (
    TG_OP = 'UPDATE'
      OR TG_OP = 'INSERT'
    ) then
    anr := NEW;

    a_updated_user := NEW."ModifiedByUser";
    a_update_timestamp := NEW."ModifiedAtTimestamp";

  elsif (TG_OP = 'DELETE') then
    anr := OLD;

    a_updated_user := risksmart.get_hasura_user_id();
    a_update_timestamp := statement_timestamp();

  END IF;

  insert into risksmart.questionnaire_template_audit("Id",
                                                     "OrgKey",
                                                     "ModifiedByUser",
                                                     "ModifiedAtTimestamp",
                                                     "CreatedByUser",
                                                     "CreatedAtTimestamp",
                                                     "Action",
                                                     "Title",
                                                     "Description",
                                                     "CustomAttributeData")
  values (anr."Id",
          anr."OrgKey",
          a_updated_user,
          a_update_timestamp,
          anr."CreatedByUser",
          anr."CreatedAtTimestamp",
          TG_OP,
          anr."Title",
          anr."Description",
          anr."CustomAttributeData");

  RETURN anr;

END;

$body$ LANGUAGE plpgsql;

create trigger questionnaire_template_audit_trigger
  after insert or update or delete
  on risksmart.questionnaire_template
  for each row
execute procedure risksmart.questionnaire_template_modified();

INSERT INTO risksmart.role_access ("RoleKey",
                                   "ObjectType",
                                   "ContributorType",
                                   "AccessType")
VALUES
  -- Create
  ('RiskManager', 'questionnaire_template', 'any', 'insert'),
  ('CustomerSupport', 'questionnaire_template', 'any', 'insert'),

  -- Read
  ('InternalAudit', 'questionnaire_template', 'any', 'read'),
  ('ReadOnly', 'questionnaire_template', 'any', 'read'),
  ('RiskManager', 'questionnaire_template', 'any', 'read'),
  ('CustomerSupport', 'questionnaire_template', 'any', 'read'),

  -- Update
  ('RiskManager', 'questionnaire_template', 'any', 'update'),
  ('CustomerSupport', 'questionnaire_template', 'any', 'update'),

  -- Delete
  ('RiskManager', 'questionnaire_template', 'any', 'delete'),
  ('CustomerSupport', 'questionnaire_template', 'any', 'delete');

-- QUESTIONNAIRE TEMPLATE VERSION STATUS ENUM
CREATE TABLE IF NOT EXISTS risksmart.questionnaire_template_version_status
(
  "Value"   text NOT NULL PRIMARY KEY,
  "Comment" text
);

INSERT INTO risksmart.questionnaire_template_version_status ("Value", "Comment")
VALUES ('published', 'Published'),
       ('draft', 'Draft'),
       ('archived', 'Archived');

-- QUESTIONNAIRE TEMPLATE VERSION
CREATE TABLE IF NOT EXISTS risksmart.questionnaire_template_version
(
  "Id"                  uuid                                                   NOT NULL DEFAULT gen_random_uuid(),
  "OrgKey"              text                                                   NOT NULL,
  "CreatedByUser"       text                                                   NOT NULL,
  "ModifiedByUser"      text                                                   NOT NULL,
  "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
  "CreatedAtTimestamp"  timestamp with time zone default statement_timestamp() NOT NULL,
  "Version"             text                                                   NOT NULL,
  "Status"              text                                                   NOT NULL,
  "Schema"              jsonb                                                  NOT NULL,
  "UISchema"            jsonb                                                  NOT NULL,
  "ParentId"      uuid                                                   NOT NULL,
  "CustomAttributeData" jsonb,
  PRIMARY KEY ("Id"),
  CONSTRAINT "Organisation_Id_fkey" FOREIGN KEY ("OrgKey") REFERENCES "auth"."organisation" ("OrgKey") ON UPDATE restrict ON DELETE restrict,
  CONSTRAINT "questionnaire_template_version_status_fkey" FOREIGN KEY ("Status") REFERENCES risksmart.questionnaire_template_version_status ("Value"),
  CONSTRAINT "questionnaire_template_version_parentId_fkey" FOREIGN KEY ("ParentId") REFERENCES risksmart.questionnaire_template ("Id") ON UPDATE restrict ON DELETE restrict,
  FOREIGN KEY ("CreatedByUser") REFERENCES "auth"."user" ("Id") ON UPDATE restrict ON DELETE restrict,
  FOREIGN KEY ("ModifiedByUser") REFERENCES "auth"."user" ("Id") ON UPDATE restrict ON DELETE restrict
);

INSERT INTO risksmart.parent_type ("Value", "Comment")
VALUES ('questionnaire_template_version', 'Questionnaire Template Version');

CREATE TRIGGER node_insert_trigger
  BEFORE INSERT
  ON risksmart.questionnaire_template_version
  FOR EACH ROW
EXECUTE FUNCTION risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
  AFTER DELETE
  ON risksmart.questionnaire_template_version
  FOR EACH ROW
EXECUTE FUNCTION risksmart.node_delete();

CREATE TABLE IF NOT EXISTS risksmart.questionnaire_template_version_audit
(
  "Id"                  uuid                                                   NOT NULL,
  "OrgKey"              text                                                   NOT NULL,
  "CreatedByUser"       text                                                   NOT NULL,
  "ModifiedByUser"      text                                                   NOT NULL,
  "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
  "CreatedAtTimestamp"  timestamp with time zone default statement_timestamp() NOT NULL,
  "Action"              risksmart.db_action                                    NOT NULL,
  "Version"             text                                                   NOT NULL,
  "Status"              text                                                   NOT NULL,
  "Schema"              jsonb                                                  NOT NULL,
  "UISchema"            jsonb                                                  NOT NULL,
  "ParentId"      uuid                                                   NOT NULL,
  "CustomAttributeData" jsonb,
  PRIMARY KEY ("Id", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.questionnaire_template_version_modified() RETURNS trigger AS
$body$
DECLARE
  anr                        RECORD;
  DECLARE a_updated_user     TEXT;
  DECLARE a_update_timestamp timestamp with time zone;

BEGIN
  if (
    TG_OP = 'UPDATE'
      OR TG_OP = 'INSERT'
    ) then
    anr := NEW;

    a_updated_user := NEW."ModifiedByUser";
    a_update_timestamp := NEW."ModifiedAtTimestamp";

  elsif (TG_OP = 'DELETE') then
    anr := OLD;

    a_updated_user := risksmart.get_hasura_user_id();
    a_update_timestamp := statement_timestamp();

  END IF;

  insert into risksmart.questionnaire_template_version_audit("Id",
                                                             "OrgKey",
                                                             "CreatedByUser",
                                                             "ModifiedByUser",
                                                             "ModifiedAtTimestamp",
                                                             "CreatedAtTimestamp",
                                                             "Action",
                                                             "Status",
                                                             "Schema",
                                                             "UISchema",
                                                             "Version",
                                                             "ParentId",
                                                             "CustomAttributeData")
  values (anr."Id",
          anr."OrgKey",
          anr."CreatedByUser",
          a_updated_user,
          a_update_timestamp,
          anr."CreatedAtTimestamp",
          TG_OP,
          anr."Status",
          anr."Schema",
          anr."UISchema",
          anr."Version",
          anr."ParentId",
          anr."CustomAttributeData");

  RETURN anr;

END;

$body$ LANGUAGE plpgsql;

create trigger questionnaire_template_version_audit_trigger
  after insert or update or delete
  on risksmart.questionnaire_template_version
  for each row
execute procedure risksmart.questionnaire_template_version_modified();

INSERT INTO risksmart.role_access ("RoleKey",
                                   "ObjectType",
                                   "ContributorType",
                                   "AccessType")
VALUES
  -- Create
  ('RiskManager', 'questionnaire_template_version', 'any', 'insert'),
  ('CustomerSupport', 'questionnaire_template_version', 'any', 'insert'),

  -- Read
  ('InternalAudit', 'questionnaire_template_version', 'any', 'read'),
  ('ReadOnly', 'questionnaire_template_version', 'any', 'read'),
  ('RiskManager', 'questionnaire_template_version', 'any', 'read'),
  ('CustomerSupport', 'questionnaire_template_version', 'any', 'read'),

  -- Update
  ('RiskManager', 'questionnaire_template_version', 'any', 'update'),
  ('CustomerSupport', 'questionnaire_template_version', 'any', 'update'),

  -- Delete
  ('RiskManager', 'questionnaire_template_version', 'any', 'delete'),
  ('CustomerSupport', 'questionnaire_template_version', 'any', 'delete');
