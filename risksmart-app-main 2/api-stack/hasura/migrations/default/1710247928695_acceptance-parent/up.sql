-- Create new acceptance many-to-many table
CREATE TABLE IF NOT EXISTS risksmart.acceptance_parent (
    "Id" uuid not null,
    "ParentId" uuid not null,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    primary key ("ParentId", "Id")
);

ALTER TABLE risksmart.acceptance_parent
ADD CONSTRAINT "acceptance_parent_parentId_fkey" FOREIGN KEY ("ParentId") REFERENCES risksmart.node("Id") ON DELETE CASCADE;

ALTER TABLE risksmart.acceptance_parent
ADD CONSTRAINT "acceptance_parent_acceptanceId_fkey" FOREIGN KEY ("Id") REFERENCES risksmart.acceptance("Id") ON DELETE CASCADE;

ALTER TABLE risksmart.acceptance_parent
ADD CONSTRAINT "acceptance_parent_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user ("Id");

ALTER TABLE risksmart.acceptance_parent
ADD CONSTRAINT "acceptance_parent_modifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user ("Id");

ALTER TABLE risksmart.acceptance_parent
ADD CONSTRAINT "acceptance_parent_organisationKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.Organisation ("OrgKey");

CREATE INDEX "idx_acceptance_parent_acceptanceId_parentId" on risksmart.acceptance_parent using btree ("Id", "ParentId");

CREATE TABLE IF NOT EXISTS risksmart.acceptance_parent_audit (
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

-- Migrate existing acceptance parents into new table
INSERT INTO risksmart.acceptance_parent (
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
FROM risksmart.acceptance ra;

-- Add audit trigger
CREATE OR REPLACE FUNCTION risksmart.acceptance_parent_modified() RETURNS trigger AS $body$
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

insert into risksmart.acceptance_parent_audit(
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

CREATE TRIGGER acceptance_parent_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.acceptance_parent FOR EACH ROW EXECUTE FUNCTION risksmart.acceptance_parent_modified();

-- Parents
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.acceptance;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.acceptance;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.acceptance;

DROP TRIGGER IF EXISTS linked_item_insert_trigger ON risksmart.acceptance;

DROP TRIGGER IF EXISTS linked_item_delete_trigger ON risksmart.acceptance;

DROP TRIGGER IF EXISTS linked_item_update_trigger ON risksmart.acceptance;

CREATE OR REPLACE TRIGGER linked_item_insert_trigger
AFTER
INSERT ON risksmart.acceptance_parent REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_insert_with_parentid();

CREATE OR REPLACE TRIGGER linked_item_delete_trigger
AFTER DELETE ON risksmart.acceptance_parent REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_delete_with_parentid();

CREATE OR REPLACE TRIGGER linked_item_update_trigger
AFTER
UPDATE ON risksmart.acceptance_parent FOR EACH ROW EXECUTE PROCEDURE risksmart.linked_item_update_with_parentid();

-- Drop ParentRiskId column from acceptance and acceptance audit tables
CREATE OR REPLACE FUNCTION risksmart.acceptance_modified() RETURNS trigger AS $body$
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

insert into risksmart.acceptance_audit(
        "Id",
        "CustomAttributeData",
        "Title",
        "DateAcceptedFrom",
        "DateAcceptedTo",
        "Details",
        "Status",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action",
        "ApprovedByUser",
        "ApprovedByUserGroup",
        "RequestedByUser",
        "RequestedByUserGroup"
    )
values (
        nr."Id",
        nr."CustomAttributeData",
        nr."Title",
        nr."DateAcceptedFrom",
        nr."DateAcceptedTo",
        nr."Details",
        nr."Status",
        nr."Meta",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        TG_OP,
        nr."ApprovedByUser",
        nr."ApprovedByUserGroup",
        nr."RequestedByUser",
        nr."RequestedByUserGroup"
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

ALTER TABLE risksmart.acceptance_audit DROP COLUMN IF EXISTS "ParentRiskId";

ALTER TABLE risksmart.acceptance DROP COLUMN IF EXISTS "ParentRiskId";