CREATE TABLE IF NOT EXISTS risksmart.custom_ribbon
(
  "Id"                  uuid                                                   NOT NULL DEFAULT gen_random_uuid(),
  "ParentType"          text                                                   NOT NULL,
  "OrgKey"              text                                                   NOT NULL,
  "CreatedByUser"       text                                                   NOT NULL,
  "ModifiedByUser"      text                                                   NOT NULL,
  "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
  "CreatedAtTimestamp"  timestamp with time zone default statement_timestamp() NOT NULL,
  "Filters"             jsonb                                                  NOT NULL,
  PRIMARY KEY ("Id"),
  CONSTRAINT "Organisation_Id_fkey" FOREIGN KEY ("OrgKey") REFERENCES "auth"."organisation" ("OrgKey") ON UPDATE restrict ON DELETE restrict,
  FOREIGN KEY ("CreatedByUser") REFERENCES "auth"."user" ("Id") ON UPDATE restrict ON DELETE restrict,
  FOREIGN KEY ("ModifiedByUser") REFERENCES "auth"."user" ("Id") ON UPDATE restrict ON DELETE restrict,
  FOREIGN KEY ("ParentType") REFERENCES risksmart.parent_type ("Value") ON UPDATE restrict ON DELETE restrict
);

CREATE UNIQUE INDEX idx_customRibbon_orgKey_parentType ON risksmart.custom_ribbon("OrgKey", "ParentType");

CREATE TABLE IF NOT EXISTS risksmart.custom_ribbon_audit
(
  "Id"                  uuid                                                   NOT NULL,
  "OrgKey"              text                                                   NOT NULL,
  "CreatedByUser"       text                                                   NOT NULL,
  "ModifiedByUser"      text                                                   NOT NULL,
  "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
  "CreatedAtTimestamp"  timestamp with time zone default statement_timestamp() NOT NULL,
  "Action"              risksmart.db_action                                    NOT NULL,
  "ParentType"          text                                                   NOT NULL,
  "Filters"             jsonb                                                  NOT NULL,
  PRIMARY KEY ("Id", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.custom_ribbon_modified() RETURNS trigger AS
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

  insert into risksmart.custom_ribbon_audit("Id",
                                            "OrgKey",
                                            "ModifiedByUser",
                                            "ModifiedAtTimestamp",
                                            "CreatedByUser",
                                            "CreatedAtTimestamp",
                                            "Action",
                                            "ParentType",
                                            "Filters")
  values (anr."Id",
          anr."OrgKey",
          a_updated_user,
          a_update_timestamp,
          anr."CreatedByUser",
          anr."CreatedAtTimestamp",
          TG_OP,
          anr."ParentType",
          anr."Filters");

  RETURN anr;

END;

$body$ LANGUAGE plpgsql;

create trigger custom_ribbon_audit_trigger
  after insert or update or delete
  on risksmart.custom_ribbon
  for each row
execute procedure risksmart.custom_ribbon_modified();

INSERT INTO risksmart.parent_type ("Value", "Comment")
VALUES ('custom_ribbon', 'Custom Ribbon Item');

INSERT INTO risksmart.role_access ("RoleKey",
                                   "ObjectType",
                                   "ContributorType",
                                   "AccessType")
VALUES ('RiskManager', 'custom_ribbon', 'any', 'read'),
       ('RiskManager', 'custom_ribbon', 'any', 'update'),
       ('RiskManager', 'custom_ribbon', 'any', 'delete'),
       ('RiskManager', 'custom_ribbon', 'any', 'insert'),
       ('CustomerSupport', 'custom_ribbon', 'any', 'read'),
       ('CustomerSupport', 'custom_ribbon', 'any', 'update'),
       ('CustomerSupport', 'custom_ribbon', 'any', 'delete'),
       ('CustomerSupport', 'custom_ribbon', 'any', 'insert');
