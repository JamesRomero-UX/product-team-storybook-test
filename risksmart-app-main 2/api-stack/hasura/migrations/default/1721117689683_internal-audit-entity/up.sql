-- Internal audit entities
CREATE TABLE risksmart.business_area
(
  "Id"                   uuid                     default gen_random_uuid()     NOT NULL,
  "Title"                text                                                   NOT NULL,
  "OrgKey"               text                                                   NOT NULL,
  "ModifiedByUser"       text                                                   NOT NULL,
  "ModifiedAtTimestamp"  timestamp with time zone default statement_timestamp() NOT NULL,
  "CreatedByUser"        text                                                   NOT NULL,
  "CreatedAtTimestamp"   timestamp with time zone default statement_timestamp() NOT NULL,
  primary key ("Id"),
  constraint "business_area_orgKey_fkey"
    foreign key ("OrgKey") references auth.organisation,
  constraint "business_area_createdByUser_fkey"
    foreign key ("CreatedByUser") references auth."user",
  constraint "business_area_modifiedByUser_fkey"
    foreign key ("ModifiedByUser") references auth."user",
  constraint "business_area_orgkey_title"
    unique ("OrgKey", "Title")
);

CREATE TABLE risksmart.business_area_audit
(
  "Id"                   uuid                     default gen_random_uuid()     NOT NULL,
  "Title"                text                                                   NOT NULL,
  "OrgKey"               text                                                   NOT NULL,
  "ModifiedByUser"       text                                                   NOT NULL,
  "ModifiedAtTimestamp"  timestamp with time zone default statement_timestamp() NOT NULL,
  "CreatedByUser"        text                                                   NOT NULL,
  "CreatedAtTimestamp"   timestamp with time zone default statement_timestamp() NOT NULL,
  "Action"               risksmart.db_action,
  PRIMARY KEY ("Id", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.business_area_modified() RETURNS trigger AS $body$
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

insert into risksmart.business_area_audit(
  "Id",
  "Title",
  "OrgKey",
  "ModifiedByUser",
  "ModifiedAtTimestamp",
  "CreatedByUser",
  "CreatedAtTimestamp",
  "Action"
)
values (
         anr."Id",
         anr."Title",
         anr."OrgKey",
         a_updated_user,
         a_update_timestamp,
         anr."CreatedByUser",
         anr."CreatedAtTimestamp",
         TG_OP
       );

RETURN anr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER business_area_audit_trigger
  after insert or update or delete
  ON risksmart.business_area
  FOR EACH ROW
EXECUTE PROCEDURE risksmart.business_area_modified();

CREATE TABLE risksmart.internal_audit_entity
(
  "Id"                   uuid                     default gen_random_uuid()     NOT NULL,
  "SequentialId"         integer,
  "Title"                text                                                   NOT NULL,
  "Description"          text,
  "BusinessAreaId"       uuid                                                   NOT NULL,
  "OrgKey"               text                                                   NOT NULL,
  "ModifiedByUser"       text                                                   NOT NULL,
  "ModifiedAtTimestamp"  timestamp with time zone default statement_timestamp() NOT NULL,
  "CreatedByUser"        text                                                   NOT NULL,
  "CreatedAtTimestamp"   timestamp with time zone default statement_timestamp() NOT NULL,
  "CustomAttributeData"  jsonb,
  primary key ("Id"),
  constraint "internal_audit_entity_orgKey_fkey"
    foreign key ("OrgKey") references auth.organisation,
  constraint "internal_audit_entity_createdByUser_fkey"
    foreign key ("CreatedByUser") references auth."user",
  constraint "internal_audit_entity_modifiedByUser_fkey"
    foreign key ("ModifiedByUser") references auth."user",
  constraint node_internal_audit_entity_id_fkey
    foreign key ("Id") references risksmart.node,
  constraint internal_audit_entity_businessArea_fkey
    foreign key ("BusinessAreaId") references risksmart.business_area
);

CREATE TABLE risksmart.internal_audit_entity_audit
(
  "Id"                   uuid                     default gen_random_uuid()     NOT NULL,
  "SequentialId"         integer,
  "Title"                text                                                   NOT NULL,
  "Description"          text,
  "BusinessAreaId"       uuid                                                   NOT NULL,
  "OrgKey"               text                                                   NOT NULL,
  "ModifiedByUser"       text                                                   NOT NULL,
  "ModifiedAtTimestamp"  timestamp with time zone default statement_timestamp() NOT NULL,
  "CreatedByUser"        text                                                   NOT NULL,
  "CreatedAtTimestamp"   timestamp with time zone default statement_timestamp() NOT NULL,
  "CustomAttributeData"  jsonb,
  "Action"               risksmart.db_action,
  PRIMARY KEY ("Id", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.internal_audit_entity_modified() RETURNS trigger AS $body$
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

insert into risksmart.internal_audit_entity_audit(
  "Id",
  "SequentialId",
  "Title",
  "Description",
  "BusinessAreaId",
  "OrgKey",
  "ModifiedByUser",
  "ModifiedAtTimestamp",
  "CreatedByUser",
  "CreatedAtTimestamp",
  "CustomAttributeData",
  "Action"
)
values (
         anr."Id",
         anr."SequentialId",
         anr."Title",
         anr."Description",
         anr."BusinessAreaId",
         anr."OrgKey",
         a_updated_user,
         a_update_timestamp,
         anr."CreatedByUser",
         anr."CreatedAtTimestamp",
         anr."CustomAttributeData",
         TG_OP
       );

RETURN anr;

END;

$body$ LANGUAGE plpgsql;

create unique index idx_internal_audit_entity_orgkey_sequentialid
  ON risksmart.internal_audit_entity ("OrgKey", "SequentialId");

CREATE TRIGGER node_insert_trigger
  before insert
  ON risksmart.internal_audit_entity
  FOR EACH ROW
EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
  AFTER DELETE
  ON risksmart.internal_audit_entity
  FOR EACH ROW
EXECUTE PROCEDURE risksmart.node_delete();

CREATE TRIGGER internal_audit_entity_audit_trigger
  after insert or update or delete
  ON risksmart.internal_audit_entity
  FOR EACH ROW
EXECUTE PROCEDURE risksmart.internal_audit_entity_modified();

CREATE TRIGGER set_sequential_id_trigger BEFORE
  INSERT ON risksmart.internal_audit_entity for each ROW EXECUTE PROCEDURE risksmart.set_sequential_id();

INSERT INTO
  risksmart."parent_type" ("Value", "Comment")
VALUES
  ('internal_audit_entity', 'Internal Audit');

INSERT INTO risksmart."role_access" (
  "RoleKey",
  "ObjectType",
  "ContributorType",
  "AccessType"
)
VALUES
  ('RiskManager','internal_audit_entity','any','insert'),
  ('RiskManager','internal_audit_entity','any','read'),
  ('RiskManager','internal_audit_entity','any','update'),
  ('RiskManager','internal_audit_entity','any','delete');

DELETE FROM  risksmart."role_access" WHERE "ObjectType" = 'internal_audit';
DELETE FROM risksmart.parent_type WHERE "Value" = 'internal_audit';

-- Action Parent updates
ALTER TABLE risksmart.action_parent ADD COLUMN "ParentType" text;
ALTER TABLE risksmart.action_parent_audit ADD COLUMN "ParentType" text;
UPDATE risksmart.action_parent as ap
SET "ParentType" = n."ObjectType",
    "ModifiedByUser" = 'SYSTEM',
    "ModifiedAtTimestamp" = now()
FROM (
       SELECT "Id", "ObjectType"
       FROM risksmart.node INNER JOIN risksmart.action_parent ON node."Id" = action_parent."ParentId"
     ) AS n
WHERE ap."ParentId" = n."Id";

ALTER TABLE risksmart.action_parent ALTER COLUMN "ParentType" SET NOT NULL;
ALTER TABLE risksmart.action_parent ADD CONSTRAINT "ActionParent_ParentType_fkey"
  FOREIGN KEY ("ParentType") REFERENCES risksmart.parent_type;

CREATE OR REPLACE FUNCTION risksmart.action_parent_modified() RETURNS trigger AS $body$
DECLARE nr RECORD;

  DECLARE updated_user TEXT;

  DECLARE update_timestamp timestamp with time zone;

BEGIN if (
  TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
  ) then nr := NEW;

updated_user := NEW."ModifiedByUser";

update_timestamp := NEW."ModifiedAtTimestamp";

elsif (TG_OP = 'DELETE') then nr := OLD;

updated_user := risksmart.get_hasura_user_id();

update_timestamp := statement_timestamp();

END IF;

insert into risksmart.action_parent_audit(
  "ActionId",
  "ParentId",
  "ParentType",
  "OrgKey",
  "CreatedByUser",
  "ModifiedByUser",
  "ModifiedAtTimestamp",
  "CreatedAtTimestamp",
  "Action"
)
values (
         nr."ActionId",
         nr."ParentId",
         nr."ParentType",
         nr."OrgKey",
         nr."CreatedByUser",
         updated_user,
         update_timestamp,
         nr."CreatedAtTimestamp",
         TG_OP
       );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

-- Issue Parent updates
ALTER TABLE risksmart.issue_parent ADD COLUMN "ParentType" text;
ALTER TABLE risksmart.issue_parent_audit ADD COLUMN "ParentType" text;
UPDATE risksmart.issue_parent as ap
SET "ParentType" = n."ObjectType",
    "ModifiedByUser" = 'SYSTEM',
    "ModifiedAtTimestamp" = now()
FROM (
       SELECT "Id", "ObjectType"
       FROM risksmart.node INNER JOIN risksmart.issue_parent ON node."Id" = issue_parent."ParentId"
     ) AS n
WHERE ap."ParentId" = n."Id";

ALTER TABLE risksmart.issue_parent ALTER COLUMN "ParentType" SET NOT NULL;
ALTER TABLE risksmart.issue_parent ADD CONSTRAINT "IssueParent_ParentType_fkey"
        FOREIGN KEY ("ParentType") REFERENCES risksmart.parent_type;

CREATE OR REPLACE FUNCTION risksmart.issue_parent_modified() RETURNS trigger AS $body$
DECLARE nr RECORD;

  DECLARE updated_user TEXT;

  DECLARE update_timestamp timestamp with time zone;

BEGIN if (
  TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
  ) then nr := NEW;

updated_user := NEW."ModifiedByUser";

update_timestamp := NEW."ModifiedAtTimestamp";

elsif (TG_OP = 'DELETE') then nr := OLD;

updated_user := risksmart.get_hasura_user_id();

update_timestamp := statement_timestamp();

END IF;

insert into risksmart.issue_parent_audit(
  "IssueId",
  "ParentId",
  "ParentType",
  "OrgKey",
  "CreatedByUser",
  "ModifiedByUser",
  "ModifiedAtTimestamp",
  "CreatedAtTimestamp",
  "Action"
)
values (
         nr."IssueId",
         nr."ParentId",
         nr."ParentType",
         nr."OrgKey",
         nr."CreatedByUser",
         updated_user,
         update_timestamp,
         nr."CreatedAtTimestamp",
         TG_OP
       );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;
