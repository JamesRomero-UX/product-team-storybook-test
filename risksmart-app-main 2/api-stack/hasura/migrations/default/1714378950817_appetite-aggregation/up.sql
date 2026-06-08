ALTER TABLE risksmart."aggregation_org"
ALTER COLUMN "RiskScoringModel" DROP NOT NULL;

ALTER TABLE risksmart."aggregation_org"
ADD COLUMN IF NOT EXISTS "Appetite" TEXT NULL;

-- Create new appetite many-to-many table
CREATE TABLE IF NOT EXISTS risksmart.appetite_parent (
    "Id" uuid not null,
    "ParentId" uuid not null,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    primary key ("ParentId", "Id")
);

ALTER TABLE risksmart.appetite_parent
ADD CONSTRAINT "appetite_parent_parentId_fkey" FOREIGN KEY ("ParentId") REFERENCES risksmart.node("Id") ON DELETE CASCADE;

ALTER TABLE risksmart.appetite_parent
ADD CONSTRAINT "appetite_parent_appetiteId_fkey" FOREIGN KEY ("Id") REFERENCES risksmart.appetite("Id") ON DELETE CASCADE;

ALTER TABLE risksmart.appetite_parent
ADD CONSTRAINT "appetite_parent_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user ("Id");

ALTER TABLE risksmart.appetite_parent
ADD CONSTRAINT "appetite_parent_modifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user ("Id");

ALTER TABLE risksmart.appetite_parent
ADD CONSTRAINT "appetite_parent_organisationKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.Organisation ("OrgKey");

CREATE INDEX "idx_appetite_parent_appetiteId_parentId" on risksmart.appetite_parent using btree ("Id", "ParentId");

CREATE TABLE IF NOT EXISTS risksmart.appetite_parent_audit (
    "Id" uuid not null,
    "ParentId" uuid not null,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "Action" risksmart.db_action,
    primary key (
        "ParentId",
        "Id",
        "ModifiedAtTimestamp"
    )
);

-- Migrate existing appetite parents into new table
INSERT INTO risksmart.appetite_parent (
        "Id",
        "ParentId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp"
    )
SELECT ra."Id",
    ra."ParentRiskId",
    ra."OrgKey",
    ra."CreatedByUser",
    ra."CreatedByUser",
    ra."CreatedAtTimestamp",
    ra."CreatedAtTimestamp"
FROM risksmart.appetite ra;

-- Add audit trigger
CREATE OR REPLACE FUNCTION risksmart.appetite_parent_modified() RETURNS trigger AS $body$
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

insert into risksmart.appetite_parent_audit(
        "Id",
        "ParentId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."ParentId",
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

CREATE TRIGGER appetite_parent_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.appetite_parent FOR EACH ROW EXECUTE FUNCTION risksmart.appetite_parent_modified();

-- Parents
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.appetite;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.appetite;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.appetite;

DROP TRIGGER IF EXISTS linked_item_insert_trigger ON risksmart.appetite;

DROP TRIGGER IF EXISTS linked_item_delete_trigger ON risksmart.appetite;

DROP TRIGGER IF EXISTS linked_item_update_trigger ON risksmart.appetite;

CREATE OR REPLACE TRIGGER linked_item_insert_trigger
AFTER
INSERT ON risksmart.appetite_parent REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_insert_with_parentid();

CREATE OR REPLACE TRIGGER linked_item_delete_trigger
AFTER DELETE ON risksmart.appetite_parent REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_delete_with_parentid();

CREATE OR REPLACE TRIGGER linked_item_update_trigger
AFTER
UPDATE ON risksmart.appetite_parent FOR EACH ROW EXECUTE PROCEDURE risksmart.linked_item_update_with_parentid();

-- Drop ParentRiskId column from appetite and appetite audit tables
CREATE OR REPLACE FUNCTION risksmart.appetite_modified() RETURNS trigger AS $body$
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

insert into risksmart.appetite_audit(
        "Id",
        "CustomAttributeData",
        "Statement",
        "LowerAppetite",
        "UpperAppetite",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."CustomAttributeData",
        nr."Statement",
        nr."LowerAppetite",
        nr."UpperAppetite",
        nr."Meta",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

ALTER TABLE risksmart.appetite_audit DROP COLUMN IF EXISTS "ParentRiskId";

ALTER TABLE risksmart.appetite DROP COLUMN IF EXISTS "ParentRiskId";