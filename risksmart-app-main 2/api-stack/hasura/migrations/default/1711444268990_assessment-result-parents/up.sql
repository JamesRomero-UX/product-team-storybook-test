CREATE TABLE IF NOT EXISTS risksmart.assessment_result_parent (
    "Id" uuid not null,
    "ResultType" text NOT NULL,
    "ParentId" uuid not null,
    -- This is the type of the parent object e.g. assessment, risk, document, obligation
    "ParentType" text NOT NULL,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    primary key ("ParentId", "Id")
);

ALTER TABLE risksmart.assessment_result_parent
ADD CONSTRAINT "assessment_result_parent_parentId_fkey" FOREIGN KEY ("ParentId") REFERENCES risksmart.node("Id") ON DELETE CASCADE;

ALTER TABLE risksmart.assessment_result_parent
ADD CONSTRAINT "assessment_result_parent_resultId_fkey" FOREIGN KEY ("Id") REFERENCES risksmart.node("Id") ON DELETE CASCADE;

ALTER TABLE risksmart.assessment_result_parent
ADD CONSTRAINT "assessment_result_parent_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user ("Id");

ALTER TABLE risksmart.assessment_result_parent
ADD CONSTRAINT "assessment_result_parent_modifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user ("Id");

ALTER TABLE risksmart.assessment_result_parent
ADD CONSTRAINT "assessment_result_parent_organisationKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.Organisation ("OrgKey");

CREATE INDEX "idx_assessment_result_parent_resultId_parentId" on risksmart.assessment_result_parent using btree ("Id", "ParentId");

CREATE TABLE IF NOT EXISTS risksmart.assessment_result_parent_audit (
    "Id" uuid not null,
    "ResultType" text NOT NULL,
    "ParentId" uuid not null,
    "ParentType" text NOT NULL,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "Action" risksmart.db_action,
    primary key (
        "Id",
        "ParentId",
        "ModifiedAtTimestamp"
    )
);

-- Migrate existing acceptance parents into new table
INSERT INTO risksmart.assessment_result_parent (
        "Id",
        "ResultType",
        "ParentId",
        "ParentType",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp"
    )
SELECT rar."Id",
    'risk_assessment_result',
    rar."RiskId",
    'risk',
    rar."OrgKey",
    rar."CreatedByUser",
    rar."CreatedByUser",
    rar."CreatedAtTimestamp",
    rar."CreatedAtTimestamp"
FROM risksmart.risk_assessment_result rar
WHERE rar."RiskId" IS NOT NULL;

INSERT INTO risksmart.assessment_result_parent (
        "Id",
        "ResultType",
        "ParentId",
        "ParentType",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp"
    )
SELECT rar."Id",
    'risk_assessment_result',
    rar."AssessmentId",
    'assessment',
    rar."OrgKey",
    rar."CreatedByUser",
    rar."CreatedByUser",
    rar."CreatedAtTimestamp",
    rar."CreatedAtTimestamp"
FROM risksmart.risk_assessment_result rar
WHERE rar."AssessmentId" IS NOT NULL;

INSERT INTO risksmart.assessment_result_parent (
        "Id",
        "ResultType",
        "ParentId",
        "ParentType",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp"
    )
SELECT oar."Id",
    'obligation_assessment_result',
    oar."ObligationId",
    'obligation',
    oar."OrgKey",
    oar."CreatedByUser",
    oar."CreatedByUser",
    oar."CreatedAtTimestamp",
    oar."CreatedAtTimestamp"
FROM risksmart.obligation_assessment_result oar
WHERE oar."ObligationId" IS NOT NULL;

INSERT INTO risksmart.assessment_result_parent (
        "Id",
        "ResultType",
        "ParentId",
        "ParentType",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp"
    )
SELECT oar."Id",
    'obligation_assessment_result',
    oar."AssessmentId",
    'assessment',
    oar."OrgKey",
    oar."CreatedByUser",
    oar."CreatedByUser",
    oar."CreatedAtTimestamp",
    oar."CreatedAtTimestamp"
FROM risksmart.obligation_assessment_result oar
WHERE oar."AssessmentId" IS NOT NULL;

INSERT INTO risksmart.assessment_result_parent (
        "Id",
        "ResultType",
        "ParentId",
        "ParentType",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp"
    )
SELECT oar."Id",
    'document_assessment_result',
    oar."DocumentId",
    'document',
    oar."OrgKey",
    oar."CreatedByUser",
    oar."CreatedByUser",
    oar."CreatedAtTimestamp",
    oar."CreatedAtTimestamp"
FROM risksmart.document_assessment_result oar
WHERE oar."DocumentId" IS NOT NULL;

INSERT INTO risksmart.assessment_result_parent (
        "Id",
        "ResultType",
        "ParentId",
        "ParentType",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp"
    )
SELECT oar."Id",
    'document_assessment_result',
    oar."AssessmentId",
    'assessment',
    oar."OrgKey",
    oar."CreatedByUser",
    oar."CreatedByUser",
    oar."CreatedAtTimestamp",
    oar."CreatedAtTimestamp"
FROM risksmart.document_assessment_result oar
WHERE oar."AssessmentId" IS NOT NULL;

-- Add audit trigger
CREATE OR REPLACE FUNCTION risksmart.assessment_result_parent_modified() RETURNS trigger AS $body$
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

insert into risksmart.assessment_result_parent_audit(
        "Id",
        "ResultType",
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
        nr."Id",
        nr."ResultType",
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

CREATE TRIGGER assessment_result_parent_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.assessment_result_parent FOR EACH ROW EXECUTE FUNCTION risksmart.assessment_result_parent_modified();

-- Risk Assessment Result triggers
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.risk_assessment_result;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.risk_assessment_result;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.risk_assessment_result;

DROP TRIGGER IF EXISTS linked_item_insert_trigger ON risksmart.risk_assessment_result;

DROP TRIGGER IF EXISTS linked_item_delete_trigger ON risksmart.risk_assessment_result;

DROP TRIGGER IF EXISTS linked_item_update_trigger ON risksmart.risk_assessment_result;

-- Document Assessment Result parents
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.document_assessment_result;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.document_assessment_result;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.document_assessment_result;

DROP TRIGGER IF EXISTS linked_item_insert_trigger ON risksmart.document_assessment_result;

DROP TRIGGER IF EXISTS linked_item_delete_trigger ON risksmart.document_assessment_result;

DROP TRIGGER IF EXISTS linked_item_update_trigger ON risksmart.document_assessment_result;

-- Obligation Assessment Result parents
DROP TRIGGER IF EXISTS node_parent_insert_trigger ON risksmart.obligation_assessment_result;

DROP TRIGGER IF EXISTS node_parent_update_trigger ON risksmart.obligation_assessment_result;

DROP TRIGGER IF EXISTS node_parent_delete_trigger ON risksmart.obligation_assessment_result;

DROP TRIGGER IF EXISTS linked_item_insert_trigger ON risksmart.obligation_assessment_result;

DROP TRIGGER IF EXISTS linked_item_delete_trigger ON risksmart.obligation_assessment_result;

DROP TRIGGER IF EXISTS linked_item_update_trigger ON risksmart.obligation_assessment_result;

-- New triggers
CREATE OR REPLACE TRIGGER linked_item_insert_trigger
AFTER
INSERT ON risksmart.assessment_result_parent REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_insert_with_parentid();

CREATE OR REPLACE TRIGGER linked_item_delete_trigger
AFTER DELETE ON risksmart.assessment_result_parent REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_delete_with_parentid();

CREATE OR REPLACE TRIGGER linked_item_update_trigger
AFTER
UPDATE ON risksmart.assessment_result_parent FOR EACH ROW EXECUTE PROCEDURE risksmart.linked_item_update_with_parentid();

-- Drop ParentId column from old tables
CREATE OR REPLACE FUNCTION risksmart.risk_assessment_result_modified() RETURNS trigger AS $body$
DECLARE nr RECORD;

updated_user TEXT := risksmart.get_hasura_user_id();

update_timestamp timestamp with time zone := statement_timestamp();

BEGIN if (
    TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
) then nr := NEW;

elsif (TG_OP = 'DELETE') then nr := OLD;

END IF;

insert into risksmart.risk_assessment_result_audit(
        "Id",
        "Rating",
        "Impact",
        "Likelihood",
        "ControlType",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CustomAttributeData",
        "Rationale",
        "TestDate"
    )
values (
        nr."Id",
        nr."Rating",
        nr."Impact",
        nr."Likelihood",
        nr."ControlType",
        nr."OrgKey",
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        TG_OP,
        updated_user,
        update_timestamp,
        nr."CustomAttributeData",
        nr."Rationale",
        nr."TestDate"
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION risksmart.obligation_assessment_result_modified() RETURNS trigger LANGUAGE 'plpgsql' AS $BODY$
DECLARE o_nr RECORD;

o_updated_user TEXT := risksmart.get_hasura_user_id();

o_update_timestamp timestamp with time zone := statement_timestamp();

BEGIN if (
    TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
) then o_nr := NEW;

elsif (TG_OP = 'DELETE') then o_nr := OLD;

END IF;

insert into risksmart.obligation_assessment_result_audit(
        "Id",
        "Rating",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CustomAttributeData",
        "Rationale",
        "TestDate"
    )
values (
        o_nr."Id",
        o_nr."Rating",
        o_nr."OrgKey",
        o_nr."CreatedByUser",
        o_nr."CreatedAtTimestamp",
        TG_OP,
        o_updated_user,
        o_update_timestamp,
        o_nr."CustomAttributeData",
        o_nr."Rationale",
        o_nr."TestDate"
    );

RETURN o_nr;

END;

$BODY$;

CREATE OR REPLACE FUNCTION risksmart.document_assessment_result_modified() RETURNS trigger LANGUAGE 'plpgsql' AS $BODY$
DECLARE d_nr RECORD;

d_updated_user TEXT := risksmart.get_hasura_user_id();

d_update_timestamp timestamp with time zone := statement_timestamp();

BEGIN if (
    TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
) then d_nr := NEW;

elsif (TG_OP = 'DELETE') then d_nr := OLD;

END IF;

insert into risksmart.document_assessment_result_audit(
        "Id",
        "Rating",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CustomAttributeData",
        "Rationale",
        "TestDate"
    )
values (
        d_nr."Id",
        d_nr."Rating",
        d_nr."OrgKey",
        d_nr."CreatedByUser",
        d_nr."CreatedAtTimestamp",
        TG_OP,
        d_updated_user,
        d_update_timestamp,
        d_nr."CustomAttributeData",
        d_nr."Rationale",
        d_nr."TestDate"
    );

RETURN d_nr;

END;

$BODY$;

-- Drop parent columns from tables
ALTER TABLE risksmart.risk_assessment_result DROP COLUMN IF EXISTS "RiskId";

ALTER TABLE risksmart.risk_assessment_result DROP COLUMN IF EXISTS "AssessmentId";

ALTER TABLE risksmart.document_assessment_result DROP COLUMN IF EXISTS "DocumentId";

ALTER TABLE risksmart.document_assessment_result DROP COLUMN IF EXISTS "AssessmentId";

ALTER TABLE risksmart.obligation_assessment_result DROP COLUMN IF EXISTS "ObligationId";

ALTER TABLE risksmart.obligation_assessment_result DROP COLUMN IF EXISTS "AssessmentId";

-- Drop parent columns from audit tables
ALTER TABLE risksmart.risk_assessment_result_audit DROP COLUMN IF EXISTS "RiskId";

ALTER TABLE risksmart.risk_assessment_result_audit DROP COLUMN IF EXISTS "AssessmentId";

ALTER TABLE risksmart.document_assessment_result_audit DROP COLUMN IF EXISTS "DocumentId";

ALTER TABLE risksmart.document_assessment_result_audit DROP COLUMN IF EXISTS "AssessmentId";

ALTER TABLE risksmart.obligation_assessment_result_audit DROP COLUMN IF EXISTS "ObligationId";

ALTER TABLE risksmart.obligation_assessment_result_audit DROP COLUMN IF EXISTS "AssessmentId";