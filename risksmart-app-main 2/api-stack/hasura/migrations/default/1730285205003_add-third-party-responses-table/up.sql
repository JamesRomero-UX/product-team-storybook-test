CREATE TABLE risksmart.third_party_response_status
(
  "Value"   TEXT PRIMARY KEY,
  "Comment" TEXT NOT NULL
);

INSERT INTO risksmart.third_party_response_status ("Value", "Comment")
VALUES ('not_started', 'Not started');
INSERT INTO risksmart.third_party_response_status ("Value", "Comment")
VALUES ('in_progress', 'In progress');
INSERT INTO risksmart.third_party_response_status ("Value", "Comment")
VALUES ('awaiting_review', 'Awaiting review');
INSERT INTO risksmart.third_party_response_status ("Value", "Comment")
VALUES ('completed', 'Completed');
INSERT INTO risksmart.third_party_response_status ("Value", "Comment")
VALUES ('rejected', 'Rejected');
INSERT INTO risksmart.third_party_response_status ("Value", "Comment")
VALUES ('expired', 'Expired');


CREATE TABLE IF NOT EXISTS risksmart.third_party_response
(
  "Id"                             uuid                                                   NOT NULL DEFAULT gen_random_uuid(),
  "OrgKey"                         TEXT                                                   NOT NULL,
  "CreatedByUser"                  TEXT                                                   NOT NULL,
  "ModifiedByUser"                 TEXT                                                   NOT NULL,
  "ModifiedAtTimestamp"            TIMESTAMP WITH TIME ZONE DEFAULT STATEMENT_TIMESTAMP() NOT NULL,
  "CreatedAtTimestamp"             TIMESTAMP WITH TIME ZONE DEFAULT STATEMENT_TIMESTAMP() NOT NULL,
  "ThirdPartyId"                   uuid                                                   NOT NULL,
  "QuestionnaireTemplateVersionId" uuid                                                   NOT NULL,
  "UserId"                         TEXT                                                   NOT NULL,
  "Status"                         TEXT                                                   NOT NULL REFERENCES risksmart.third_party_response_status ("Value") ON DELETE RESTRICT,
  "ResponseData"                   jsonb                                                  NOT NULL,
  PRIMARY KEY ("Id"),
  CONSTRAINT "Organisation_Id_fkey" FOREIGN KEY ("OrgKey") REFERENCES "auth"."organisation" ("OrgKey") ON UPDATE RESTRICT ON DELETE RESTRICT,
  FOREIGN KEY ("CreatedByUser") REFERENCES "auth"."user" ("Id") ON UPDATE RESTRICT ON DELETE RESTRICT,
  FOREIGN KEY ("ModifiedByUser") REFERENCES "auth"."user" ("Id") ON UPDATE RESTRICT ON DELETE RESTRICT,
  FOREIGN KEY ("UserId") REFERENCES "auth"."user" ("Id") ON UPDATE RESTRICT ON DELETE RESTRICT
);

INSERT INTO risksmart.parent_type ("Value", "Comment")
VALUES ('third_party_response', 'Third Party Response');

CREATE TRIGGER node_insert_trigger
  BEFORE INSERT
  ON risksmart.third_party_response
  FOR EACH ROW
EXECUTE FUNCTION risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
  AFTER DELETE
  ON risksmart.third_party_response
  FOR EACH ROW
EXECUTE FUNCTION risksmart.node_delete();

CREATE TABLE IF NOT EXISTS risksmart.third_party_response_audit
(
  "Id"                             uuid                                                   NOT NULL,
  "OrgKey"                         TEXT                                                   NOT NULL,
  "CreatedByUser"                  TEXT                                                   NOT NULL,
  "ModifiedByUser"                 TEXT                                                   NOT NULL,
  "ModifiedAtTimestamp"            TIMESTAMP WITH TIME ZONE DEFAULT STATEMENT_TIMESTAMP() NOT NULL,
  "CreatedAtTimestamp"             TIMESTAMP WITH TIME ZONE DEFAULT STATEMENT_TIMESTAMP() NOT NULL,
  "Action"                         risksmart.db_action                                    NOT NULL,
  "ThirdPartyId"                   uuid                                                   NOT NULL,
  "QuestionnaireTemplateVersionId" uuid                                                   NOT NULL,
  "UserId"                         TEXT                                                   NOT NULL,
  "Status"                         TEXT                                                   NOT NULL,
  "ResponseData"                   jsonb                                                  NOT NULL,
  PRIMARY KEY ("Id", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.third_party_response_modified() RETURNS TRIGGER AS
$body$
DECLARE
  anr                        RECORD;
  DECLARE a_updated_user     TEXT;
  DECLARE a_update_timestamp TIMESTAMP WITH TIME ZONE;

BEGIN
  IF (
    TG_OP = 'UPDATE'
      OR TG_OP = 'INSERT'
    ) THEN
    anr := NEW;

    a_updated_user := NEW."ModifiedByUser";
    a_update_timestamp := NEW."ModifiedAtTimestamp";

  ELSIF (TG_OP = 'DELETE') THEN
    anr := OLD;

    a_updated_user := risksmart.get_hasura_user_id();
    a_update_timestamp := STATEMENT_TIMESTAMP();

  END IF;

  INSERT INTO risksmart.third_party_response_audit("Id",
                                                   "OrgKey",
                                                   "ModifiedByUser",
                                                   "ModifiedAtTimestamp",
                                                   "CreatedByUser",
                                                   "CreatedAtTimestamp",
                                                   "Action",
                                                   "ThirdPartyId",
                                                   "QuestionnaireTemplateVersionId",
                                                   "UserId",
                                                   "Status",
                                                   "ResponseData")
  VALUES (anr."Id",
          anr."OrgKey",
          a_updated_user,
          a_update_timestamp,
          anr."CreatedByUser",
          anr."CreatedAtTimestamp",
          TG_OP,
          anr."ThirdPartyId",
          anr."QuestionnaireTemplateVersionId",
          anr."UserId",
          anr."Status",
          anr."ResponseData");

  RETURN anr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER third_party_response_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE
  ON risksmart.third_party_response
  FOR EACH ROW
EXECUTE PROCEDURE risksmart.third_party_response_modified();

INSERT INTO risksmart.role_access ("RoleKey",
                                   "ObjectType",
                                   "ContributorType",
                                   "AccessType")
VALUES
  -- Create
  ('RiskManager', 'third_party_response', 'any', 'insert'),
  ('CustomerSupport', 'third_party_response', 'any', 'insert'),

  -- Read
  ('InternalAudit', 'third_party_response', 'any', 'read'),
  ('ReadOnly', 'third_party_response', 'any', 'read'),
  ('RiskManager', 'third_party_response', 'any', 'read'),
  ('CustomerSupport', 'third_party_response', 'any', 'read'),
  ('ThirdPartyRespondent', 'third_party_response', 'contributor', 'read'),

  -- Update
  ('RiskManager', 'third_party_response', 'any', 'update'),
  ('CustomerSupport', 'third_party_response', 'any', 'update'),
  ('ThirdPartyRespondent', 'third_party_response', 'contributor', 'update'),

  -- Delete
  ('RiskManager', 'third_party_response', 'any', 'delete'),
  ('CustomerSupport', 'third_party_response', 'any', 'delete');
