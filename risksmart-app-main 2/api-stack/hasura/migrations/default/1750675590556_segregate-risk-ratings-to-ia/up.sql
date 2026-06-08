-- Create new parent types
INSERT INTO risksmart.parent_type
    ("Value", "Comment") VALUES
    ('risk_controlled_internal_audit_result', 'Risk controlled internal audit result'),
    ('risk_uncontrolled_internal_audit_result', 'Risk uncontrolled internal audit result'),
    ('document_internal_audit_result', 'Document internal audit result'),
    ('obligation_internal_audit_result', 'Obligation internal audit result'),
    ('control_test_internal_audit_result', 'Control test internal audit result'),
    ('impact_internal_audit_rating', 'Impact internal audit rating');

-- Update parent type - Form Configuration
INSERT INTO risksmart.form_configuration
    ("CustomAttributeSchemaId", "ParentType", "OrgKey", "CreatedByUser", "ModifiedByUser", "CreatedAtTimestamp", "ModifiedAtTimestamp")
SELECT
    "CustomAttributeSchemaId", 'risk_controlled_internal_audit_result', "OrgKey", "CreatedByUser", 'SYSTEM', "CreatedAtTimestamp", NOW()
FROM
    risksmart.form_configuration
WHERE
    "ParentType" = 'internal_audit_report_controlled_risk_assessment_result';

INSERT INTO risksmart.form_configuration
    ("CustomAttributeSchemaId", "ParentType", "OrgKey", "CreatedByUser", "ModifiedByUser", "CreatedAtTimestamp", "ModifiedAtTimestamp")
SELECT
    "CustomAttributeSchemaId", 'risk_uncontrolled_internal_audit_result', "OrgKey", "CreatedByUser", 'SYSTEM', "CreatedAtTimestamp", NOW()
FROM
    risksmart.form_configuration
WHERE
    "ParentType" = 'internal_audit_report_uncontrolled_risk_assessment_result';

INSERT INTO risksmart.form_configuration
    ("CustomAttributeSchemaId", "ParentType", "OrgKey", "CreatedByUser", "ModifiedByUser", "CreatedAtTimestamp", "ModifiedAtTimestamp")
SELECT
    "CustomAttributeSchemaId", 'document_internal_audit_result', "OrgKey", "CreatedByUser", 'SYSTEM', "CreatedAtTimestamp", NOW()
FROM
    risksmart.form_configuration
WHERE
    "ParentType" = 'internal_audit_report_document_assessment_result';

INSERT INTO risksmart.form_configuration
    ("CustomAttributeSchemaId", "ParentType", "OrgKey", "CreatedByUser", "ModifiedByUser", "CreatedAtTimestamp", "ModifiedAtTimestamp")
SELECT
    "CustomAttributeSchemaId", 'obligation_internal_audit_result', "OrgKey", "CreatedByUser", 'SYSTEM', "CreatedAtTimestamp", NOW()
FROM
    risksmart.form_configuration
WHERE
    "ParentType" = 'internal_audit_report_obligation_assessment_result';

INSERT INTO risksmart.form_configuration
    ("CustomAttributeSchemaId", "ParentType", "OrgKey", "CreatedByUser", "ModifiedByUser", "CreatedAtTimestamp", "ModifiedAtTimestamp")
SELECT
    "CustomAttributeSchemaId", 'control_test_internal_audit_result', "OrgKey", "CreatedByUser", 'SYSTEM', "CreatedAtTimestamp", NOW()
FROM
    risksmart.form_configuration
WHERE
    "ParentType" = 'internal_audit_report_test_result';

-- Update parent type - Form field Configuration
UPDATE risksmart.form_field_configuration
    SET "FormConfigurationParentType" = 'risk_controlled_internal_audit_result',
        "ModifiedAtTimestamp" = now(),
        "ModifiedByUser"  = 'SYSTEM'
     WHERE "FormConfigurationParentType" = 'internal_audit_report_controlled_risk_assessment_result';
UPDATE risksmart.form_field_configuration
    SET "FormConfigurationParentType" = 'risk_uncontrolled_internal_audit_result',
        "ModifiedAtTimestamp" = now(),
        "ModifiedByUser"  = 'SYSTEM'
     WHERE "FormConfigurationParentType" = 'internal_audit_report_uncontrolled_risk_assessment_result';
UPDATE risksmart.form_field_configuration
    SET "FormConfigurationParentType" = 'document_internal_audit_result',
        "ModifiedAtTimestamp" = now(),
        "ModifiedByUser"  = 'SYSTEM'
     WHERE "FormConfigurationParentType" = 'internal_audit_report_document_assessment_result';
UPDATE risksmart.form_field_configuration
    SET "FormConfigurationParentType" = 'obligation_internal_audit_result',
        "ModifiedAtTimestamp" = now(),
        "ModifiedByUser"  = 'SYSTEM'
     WHERE "FormConfigurationParentType" = 'internal_audit_report_obligation_assessment_result';
UPDATE risksmart.form_field_configuration
    SET "FormConfigurationParentType" = 'control_test_internal_audit_result',
        "ModifiedAtTimestamp" = now(),
        "ModifiedByUser"  = 'SYSTEM'
     WHERE "FormConfigurationParentType" = 'internal_audit_report_test_result';

-- Update parent type - Form field ordering
UPDATE risksmart.form_field_ordering
    SET "FormConfigurationParentType" = 'risk_controlled_internal_audit_result',
        "ModifiedAtTimestamp" = now(),
        "ModifiedByUser"  = 'SYSTEM'
     WHERE "FormConfigurationParentType" = 'internal_audit_report_controlled_risk_assessment_result';
UPDATE risksmart.form_field_ordering
    SET "FormConfigurationParentType" = 'risk_uncontrolled_internal_audit_result',
        "ModifiedAtTimestamp" = now(),
        "ModifiedByUser"  = 'SYSTEM'
     WHERE "FormConfigurationParentType" = 'internal_audit_report_uncontrolled_risk_assessment_result';
UPDATE risksmart.form_field_ordering
    SET "FormConfigurationParentType" = 'document_internal_audit_result',
        "ModifiedAtTimestamp" = now(),
        "ModifiedByUser"  = 'SYSTEM'
     WHERE "FormConfigurationParentType" = 'internal_audit_report_document_assessment_result';
UPDATE risksmart.form_field_ordering
    SET "FormConfigurationParentType" = 'obligation_internal_audit_result',
        "ModifiedAtTimestamp" = now(),
        "ModifiedByUser"  = 'SYSTEM'
     WHERE "FormConfigurationParentType" = 'internal_audit_report_obligation_assessment_result';
UPDATE risksmart.form_field_ordering
    SET "FormConfigurationParentType" = 'control_test_internal_audit_result',
        "ModifiedAtTimestamp" = now(),
        "ModifiedByUser"  = 'SYSTEM'
     WHERE "FormConfigurationParentType" = 'internal_audit_report_test_result';


-- Internal audit result parent
CREATE TABLE IF NOT EXISTS risksmart.internal_audit_result_parent (
    "Id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ResultType" TEXT NOT NULL REFERENCES risksmart.parent_type("Value"),
    "ParentId" UUID NOT NULL REFERENCES risksmart.node("Id"),
    "ParentType" TEXT NOT NULL REFERENCES risksmart.parent_type("Value"),
    "OrgKey" TEXT NOT NULL REFERENCES auth."organisation"("OrgKey"),
    "CreatedAtTimestamp" TIMESTAMP WITH TIME ZONE DEFAULT statement_timestamp() NOT NULL,
    "ModifiedAtTimestamp" TIMESTAMP WITH TIME ZONE DEFAULT statement_timestamp() NOT NULL,
    "CreatedByUser" TEXT NOT NULL REFERENCES auth."user"("Id"),
    "ModifiedByUser" TEXT NOT NULL REFERENCES auth."user"("Id"),
    PRIMARY KEY ("ParentId", "Id")
);

CREATE TABLE IF NOT EXISTS risksmart.internal_audit_result_parent_audit (
    "Id" UUID NOT NULL,
    "ResultType" TEXT NOT NULL,
    "ParentId" UUID NOT NULL,
    "ParentType" TEXT NOT NULL,
    "OrgKey" TEXT NOT NULL,
    "CreatedAtTimestamp" TIMESTAMP WITH TIME ZONE NOT NULL,
    "ModifiedAtTimestamp" TIMESTAMP WITH TIME ZONE NOT NULL,
    "CreatedByUser" TEXT NOT NULL,
    "ModifiedByUser" TEXT NOT NULL,
    "Action" risksmart.db_action NOT NULL,
    PRIMARY KEY (
        "Id",
        "ParentId",
        "ModifiedAtTimestamp"
    )
);

CREATE OR REPLACE FUNCTION risksmart.internal_audit_result_parent_modified() RETURNS TRIGGER AS $body$
DECLARE anr RECORD;
DECLARE a_updated_user TEXT;
DECLARE a_update_timestamp TIMESTAMP WITH TIME ZONE;
BEGIN IF (
    TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
) THEN anr := NEW;
a_updated_user := NEW."ModifiedByUser";
a_update_timestamp := NEW."ModifiedAtTimestamp";
ELSIF (TG_OP = 'DELETE') THEN anr := OLD;
a_updated_user := risksmart.get_hasura_user_id();
a_update_timestamp := STATEMENT_TIMESTAMP();
END IF;
INSERT INTO risksmart.internal_audit_result_parent_audit(
        "Id",
        "ResultType",
        "ParentId",
        "ParentType",
        "OrgKey",
        "CreatedAtTimestamp",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "ModifiedByUser",
        "Action"
    )
VALUES (
        anr."Id",
        anr."ResultType",
        anr."ParentId",
        anr."ParentType",
        anr."OrgKey",
        anr."CreatedAtTimestamp",
        a_update_timestamp,
        anr."CreatedByUser",
        a_updated_user,
        TG_OP
    );
RETURN anr;

END;
$body$ LANGUAGE plpgsql;

CREATE TRIGGER internal_audit_result_parent_audit_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.internal_audit_result_parent FOR EACH ROW EXECUTE PROCEDURE risksmart.internal_audit_result_parent_modified();
ALTER TABLE risksmart.internal_audit_result_parent_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE risksmart.internal_audit_result_parent ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_org ON risksmart.internal_audit_result_parent TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);
CREATE POLICY own_org ON risksmart.internal_audit_result_parent_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);
CREATE POLICY own_org_rw ON risksmart.internal_audit_result_parent TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);
CREATE POLICY own_org_rw ON risksmart.internal_audit_result_parent_audit TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE OR REPLACE FUNCTION risksmart.linked_item_insert_with_parentid_temp() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO risksmart.linked_item (
        "Target",
        "Source",
        "OrgKey",
        "CreatedAtTimestamp",
        "ModifiedAtTimestamp"
    )
SELECT i."Id",
    i."ParentId",
    i."OrgKey",
    i."CreatedAtTimestamp",
    i."ModifiedAtTimestamp"
FROM inserted i
WHERE i."ParentId" IS NOT NULL;

return null;

END;

$$;

CREATE TRIGGER linked_item_insert_trigger
    AFTER INSERT
    ON risksmart.internal_audit_result_parent
    REFERENCING new TABLE inserted
EXECUTE PROCEDURE risksmart.linked_item_insert_with_parentid_temp();

CREATE TRIGGER linked_item_delete_trigger
    AFTER DELETE
    ON risksmart.internal_audit_result_parent
    REFERENCING old TABLE deleted
EXECUTE PROCEDURE risksmart.linked_item_delete_with_parentid();

CREATE TRIGGER linked_item_update_trigger
    AFTER UPDATE
    ON risksmart.internal_audit_result_parent
    FOR EACH ROW
EXECUTE PROCEDURE risksmart.linked_item_update_with_parentid();

-- Risk --
-- Create the risk controlled internal audit result table and its audit table
CREATE TABLE IF NOT EXISTS risksmart.risk_controlled_internal_audit_result (
    "Id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "Likelihood"          INTEGER,
    "Impact"              INTEGER,
    "Rating"              INTEGER,
    "Rationale"           TEXT,
    "TestDate"            TIMESTAMP WITH TIME ZONE,
    "CustomAttributeData" jsonb NULL,
    "OrgKey" TEXT NOT NULL REFERENCES auth."organisation"("OrgKey"),
    "CreatedAtTimestamp" TIMESTAMP WITH TIME ZONE DEFAULT statement_timestamp() NOT NULL,
    "ModifiedAtTimestamp" TIMESTAMP WITH TIME ZONE DEFAULT statement_timestamp() NOT NULL,
    "CreatedByUser" TEXT NOT NULL REFERENCES auth."user"("Id"),
    "ModifiedByUser" TEXT NOT NULL REFERENCES auth."user"("Id")
);

CREATE TABLE IF NOT EXISTS risksmart.risk_controlled_internal_audit_result_audit (
    "Id" UUID NOT NULL,
    "Likelihood"          INTEGER,
    "Impact"              INTEGER,
    "Rating"              INTEGER,
    "Rationale"           TEXT,
    "TestDate"            TIMESTAMP WITH TIME ZONE,
    "CustomAttributeData" jsonb NULL,
    "OrgKey" text NOT NULL,
    "CreatedAtTimestamp" TIMESTAMP WITH TIME ZONE NOT NULL,
    "ModifiedAtTimestamp" TIMESTAMP WITH TIME ZONE NOT NULL,
    "CreatedByUser" TEXT NOT NULL,
    "ModifiedByUser" TEXT NOT NULL,
    "Action" risksmart.db_action NOT NULL,
    PRIMARY KEY ("Id", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.risk_controlled_internal_audit_result_modified() RETURNS TRIGGER AS $body$
DECLARE anr RECORD;

DECLARE a_updated_user TEXT;

DECLARE a_update_timestamp TIMESTAMP WITH TIME ZONE;

BEGIN IF (
    TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
) THEN anr := NEW;

a_updated_user := NEW."ModifiedByUser";

a_update_timestamp := NEW."ModifiedAtTimestamp";

ELSIF (TG_OP = 'DELETE') THEN anr := OLD;

a_updated_user := risksmart.get_hasura_user_id();

a_update_timestamp := STATEMENT_TIMESTAMP();

END IF;

INSERT INTO risksmart.risk_controlled_internal_audit_result_audit(
        "Id",
        "Likelihood",
        "Impact",
        "Rating",
        "Rationale",
        "TestDate",
        "CustomAttributeData",
        "OrgKey",
        "CreatedAtTimestamp",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "ModifiedByUser",
        "Action"
    )
VALUES (
        anr."Id",
        anr."Likelihood",
        anr."Impact",
        anr."Rating",
        anr."Rationale",
        anr."TestDate",
        anr."CustomAttributeData",
        anr."OrgKey",
        anr."CreatedAtTimestamp",
        a_update_timestamp,
        anr."CreatedByUser",
        a_updated_user,
        TG_OP
    );

RETURN anr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER risk_controlled_internal_audit_result_audit_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.risk_controlled_internal_audit_result FOR EACH ROW EXECUTE PROCEDURE risksmart.risk_controlled_internal_audit_result_modified();

ALTER TABLE risksmart.risk_controlled_internal_audit_result_audit ENABLE ROW LEVEL SECURITY;

ALTER TABLE risksmart.risk_controlled_internal_audit_result ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_org ON risksmart.risk_controlled_internal_audit_result TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.risk_controlled_internal_audit_result_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.risk_controlled_internal_audit_result TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.risk_controlled_internal_audit_result_audit TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE TRIGGER node_insert_trigger before
insert ON risksmart.risk_controlled_internal_audit_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.risk_controlled_internal_audit_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();


-- Create the risk uncontrolled internal audit result table and its audit table
CREATE TABLE IF NOT EXISTS risksmart.risk_uncontrolled_internal_audit_result (
    "Id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "Likelihood"          INTEGER,
    "Impact"              INTEGER,
    "Rating"              INTEGER,
    "Rationale"           TEXT,
    "TestDate"            TIMESTAMP WITH TIME ZONE,
    "CustomAttributeData" jsonb NULL,
    "OrgKey" TEXT NOT NULL REFERENCES auth."organisation"("OrgKey"),
    "CreatedAtTimestamp" TIMESTAMP WITH TIME ZONE DEFAULT statement_timestamp() NOT NULL,
    "ModifiedAtTimestamp" TIMESTAMP WITH TIME ZONE DEFAULT statement_timestamp() NOT NULL,
    "CreatedByUser" TEXT NOT NULL REFERENCES auth."user"("Id"),
    "ModifiedByUser" TEXT NOT NULL REFERENCES auth."user"("Id")
);

CREATE TABLE IF NOT EXISTS risksmart.risk_uncontrolled_internal_audit_result_audit (
    "Id" UUID NOT NULL,
    "Likelihood"          INTEGER,
    "Impact"              INTEGER,
    "Rating"              INTEGER,
    "Rationale"           TEXT,
    "TestDate"            TIMESTAMP WITH TIME ZONE,
    "CustomAttributeData" jsonb NULL,
    "OrgKey" text NOT NULL,
    "CreatedAtTimestamp" TIMESTAMP WITH TIME ZONE NOT NULL,
    "ModifiedAtTimestamp" TIMESTAMP WITH TIME ZONE NOT NULL,
    "CreatedByUser" TEXT NOT NULL,
    "ModifiedByUser" TEXT NOT NULL,
    "Action" risksmart.db_action NOT NULL,
    PRIMARY KEY ("Id", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.risk_uncontrolled_internal_audit_result_modified() RETURNS TRIGGER AS $body$
DECLARE anr RECORD;

DECLARE a_updated_user TEXT;

DECLARE a_update_timestamp TIMESTAMP WITH TIME ZONE;

BEGIN IF (
    TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
) THEN anr := NEW;

a_updated_user := NEW."ModifiedByUser";

a_update_timestamp := NEW."ModifiedAtTimestamp";

ELSIF (TG_OP = 'DELETE') THEN anr := OLD;

a_updated_user := risksmart.get_hasura_user_id();

a_update_timestamp := STATEMENT_TIMESTAMP();

END IF;

INSERT INTO risksmart.risk_uncontrolled_internal_audit_result_audit(
        "Id",
        "Likelihood",
        "Impact",
        "Rating",
        "Rationale",
        "TestDate",
        "CustomAttributeData",
        "OrgKey",
        "CreatedAtTimestamp",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "ModifiedByUser",
        "Action"
    )
VALUES (
        anr."Id",
        anr."Likelihood",
        anr."Impact",
        anr."Rating",
        anr."Rationale",
        anr."TestDate",
        anr."CustomAttributeData",
        anr."OrgKey",
        anr."CreatedAtTimestamp",
        a_update_timestamp,
        anr."CreatedByUser",
        a_updated_user,
        TG_OP
    );

RETURN anr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER risk_uncontrolled_internal_audit_result_audit_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.risk_uncontrolled_internal_audit_result FOR EACH ROW EXECUTE PROCEDURE risksmart.risk_uncontrolled_internal_audit_result_modified();

ALTER TABLE risksmart.risk_uncontrolled_internal_audit_result_audit ENABLE ROW LEVEL SECURITY;

ALTER TABLE risksmart.risk_uncontrolled_internal_audit_result ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_org ON risksmart.risk_uncontrolled_internal_audit_result TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.risk_uncontrolled_internal_audit_result_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.risk_uncontrolled_internal_audit_result TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.risk_uncontrolled_internal_audit_result_audit TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE TRIGGER node_insert_trigger before
insert ON risksmart.risk_uncontrolled_internal_audit_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.risk_uncontrolled_internal_audit_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

-- Document --
-- Create the document internal audit result table and its audit table
CREATE TABLE IF NOT EXISTS risksmart.document_internal_audit_result (
    "Id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "Rating"              INTEGER,
    "Rationale"           TEXT,
    "TestDate"            TIMESTAMP WITH TIME ZONE,
    "CustomAttributeData" jsonb NULL,
    "OrgKey" TEXT NOT NULL REFERENCES auth."organisation"("OrgKey"),
    "CreatedAtTimestamp" TIMESTAMP WITH TIME ZONE DEFAULT statement_timestamp() NOT NULL,
    "ModifiedAtTimestamp" TIMESTAMP WITH TIME ZONE DEFAULT statement_timestamp() NOT NULL,
    "CreatedByUser" TEXT NOT NULL REFERENCES auth."user"("Id"),
    "ModifiedByUser" TEXT NOT NULL REFERENCES auth."user"("Id")
);

CREATE TABLE IF NOT EXISTS risksmart.document_internal_audit_result_audit (
    "Id" UUID NOT NULL,
    "Rating"              INTEGER,
    "Rationale"           TEXT,
    "TestDate"            TIMESTAMP WITH TIME ZONE,
    "CustomAttributeData" jsonb NULL,
    "OrgKey" text NOT NULL,
    "CreatedAtTimestamp" TIMESTAMP WITH TIME ZONE NOT NULL,
    "ModifiedAtTimestamp" TIMESTAMP WITH TIME ZONE NOT NULL,
    "CreatedByUser" TEXT NOT NULL,
    "ModifiedByUser" TEXT NOT NULL,
    "Action" risksmart.db_action NOT NULL,
    PRIMARY KEY ("Id", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.document_internal_audit_result_modified() RETURNS TRIGGER AS $body$
DECLARE anr RECORD;

DECLARE a_updated_user TEXT;

DECLARE a_update_timestamp TIMESTAMP WITH TIME ZONE;

BEGIN IF (
    TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
) THEN anr := NEW;

a_updated_user := NEW."ModifiedByUser";

a_update_timestamp := NEW."ModifiedAtTimestamp";

ELSIF (TG_OP = 'DELETE') THEN anr := OLD;

a_updated_user := risksmart.get_hasura_user_id();

a_update_timestamp := STATEMENT_TIMESTAMP();

END IF;

INSERT INTO risksmart.document_internal_audit_result_audit(
        "Id",
        "Rating",
        "Rationale",
        "TestDate",
        "CustomAttributeData",
        "OrgKey",
        "CreatedAtTimestamp",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "ModifiedByUser",
        "Action"
    )
VALUES (
        anr."Id",
        anr."Rating",
        anr."Rationale",
        anr."TestDate",
        anr."CustomAttributeData",
        anr."OrgKey",
        anr."CreatedAtTimestamp",
        a_update_timestamp,
        anr."CreatedByUser",
        a_updated_user,
        TG_OP
    );

RETURN anr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER document_internal_audit_result_audit_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.document_internal_audit_result FOR EACH ROW EXECUTE PROCEDURE risksmart.document_internal_audit_result_modified();

ALTER TABLE risksmart.document_internal_audit_result_audit ENABLE ROW LEVEL SECURITY;

ALTER TABLE risksmart.document_internal_audit_result ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_org ON risksmart.document_internal_audit_result TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.document_internal_audit_result_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.document_internal_audit_result TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.document_internal_audit_result_audit TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE TRIGGER node_insert_trigger before
insert ON risksmart.document_internal_audit_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.document_internal_audit_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

-- Obligation
-- Create the obligation internal audit result table and its audit table
CREATE TABLE IF NOT EXISTS risksmart.obligation_internal_audit_result (
    "Id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "Rating"              INTEGER,
    "Rationale"           TEXT,
    "TestDate"            TIMESTAMP WITH TIME ZONE,
    "CustomAttributeData" jsonb NULL,
    "OrgKey" TEXT NOT NULL REFERENCES auth."organisation"("OrgKey"),
    "CreatedAtTimestamp" TIMESTAMP WITH TIME ZONE DEFAULT statement_timestamp() NOT NULL,
    "ModifiedAtTimestamp" TIMESTAMP WITH TIME ZONE DEFAULT statement_timestamp() NOT NULL,
    "CreatedByUser" TEXT NOT NULL REFERENCES auth."user"("Id"),
    "ModifiedByUser" TEXT NOT NULL REFERENCES auth."user"("Id")
);

CREATE TABLE IF NOT EXISTS risksmart.obligation_internal_audit_result_audit (
    "Id" UUID NOT NULL,
    "Rating"              INTEGER,
    "Rationale"           TEXT,
    "TestDate"            TIMESTAMP WITH TIME ZONE,
    "CustomAttributeData" jsonb NULL,
    "OrgKey" text NOT NULL,
    "CreatedAtTimestamp" TIMESTAMP WITH TIME ZONE NOT NULL,
    "ModifiedAtTimestamp" TIMESTAMP WITH TIME ZONE NOT NULL,
    "CreatedByUser" TEXT NOT NULL,
    "ModifiedByUser" TEXT NOT NULL,
    "Action" risksmart.db_action NOT NULL,
    PRIMARY KEY ("Id", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.obligation_internal_audit_result_modified() RETURNS TRIGGER AS $body$
DECLARE anr RECORD;

DECLARE a_updated_user TEXT;

DECLARE a_update_timestamp TIMESTAMP WITH TIME ZONE;

BEGIN IF (
    TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
) THEN anr := NEW;

a_updated_user := NEW."ModifiedByUser";

a_update_timestamp := NEW."ModifiedAtTimestamp";

ELSIF (TG_OP = 'DELETE') THEN anr := OLD;

a_updated_user := risksmart.get_hasura_user_id();

a_update_timestamp := STATEMENT_TIMESTAMP();

END IF;

INSERT INTO risksmart.obligation_internal_audit_result_audit(
        "Id",
        "Rating",
        "Rationale",
        "TestDate",
        "CustomAttributeData",
        "OrgKey",
        "CreatedAtTimestamp",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "ModifiedByUser",
        "Action"
    )
VALUES (
        anr."Id",
        anr."Rating",
        anr."Rationale",
        anr."TestDate",
        anr."CustomAttributeData",
        anr."OrgKey",
        anr."CreatedAtTimestamp",
        a_update_timestamp,
        anr."CreatedByUser",
        a_updated_user,
        TG_OP
    );

RETURN anr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER obligation_internal_audit_result_audit_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.obligation_internal_audit_result FOR EACH ROW EXECUTE PROCEDURE risksmart.obligation_internal_audit_result_modified();

ALTER TABLE risksmart.obligation_internal_audit_result_audit ENABLE ROW LEVEL SECURITY;

ALTER TABLE risksmart.obligation_internal_audit_result ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_org ON risksmart.obligation_internal_audit_result TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.obligation_internal_audit_result_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.obligation_internal_audit_result TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.obligation_internal_audit_result_audit TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE TRIGGER node_insert_trigger before
insert ON risksmart.obligation_internal_audit_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.obligation_internal_audit_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

-- Test Result --
-- Create the control test internal audit result table and its audit table
CREATE TABLE IF NOT EXISTS risksmart.control_test_internal_audit_result (
    "Id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "ParentControlId"          UUID NOT NULL REFERENCES risksmart.control("Id"),
    "Title"                    TEXT,
    "Submitter"                TEXT  NOT NULL,
    "Description"              TEXT NOT NULL,
    "TestType"                 TEXT,
    "DesignEffectiveness"      INTEGER,
    "PerformanceEffectiveness" INTEGER,
    "OverallEffectiveness"     INTEGER,
    "Meta"                     json,
    "SequentialId"             INTEGER NOT NULL,
    "TestDate"                 TIMESTAMP WITH TIME ZONE NOT NULL,
    "NextTestDate"             TIMESTAMP WITH TIME ZONE,
    "CustomAttributeData"      jsonb NULL,
    "OrgKey"                   TEXT NOT NULL REFERENCES auth."organisation"("OrgKey"),
    "CreatedAtTimestamp"       TIMESTAMP WITH TIME ZONE DEFAULT statement_timestamp() NOT NULL,
    "ModifiedAtTimestamp"      TIMESTAMP WITH TIME ZONE DEFAULT statement_timestamp() NOT NULL,
    "CreatedByUser"            TEXT NOT NULL REFERENCES auth."user"("Id"),
    "ModifiedByUser"           TEXT NOT NULL REFERENCES auth."user"("Id")
);

CREATE TABLE IF NOT EXISTS risksmart.control_test_internal_audit_result_audit (
    "Id" UUID NOT NULL,
    "ParentControlId"          UUID NOT NULL,
    "Title"                    TEXT,
    "Submitter"                TEXT  NOT NULL,
    "Description"              TEXT  NOT NULL,
    "TestType"                 TEXT,
    "DesignEffectiveness"      INTEGER,
    "PerformanceEffectiveness" INTEGER,
    "OverallEffectiveness"     INTEGER,
    "Meta"                     json,
    "TestDate"                 TIMESTAMP WITH TIME ZONE NOT NULL,
    "NextTestDate"             TIMESTAMP WITH TIME ZONE,
    "CustomAttributeData"      jsonb NULL,
    "OrgKey"                   text NOT NULL,
    "CreatedAtTimestamp"       TIMESTAMP WITH TIME ZONE NOT NULL,
    "ModifiedAtTimestamp"      TIMESTAMP WITH TIME ZONE NOT NULL,
    "CreatedByUser"            TEXT NOT NULL,
    "ModifiedByUser"           TEXT NOT NULL,
    "SequentialId"             INTEGER NOT NULL,
    "Action"                   risksmart.db_action NOT NULL,
    PRIMARY KEY ("Id", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.control_test_internal_audit_result_modified() RETURNS TRIGGER AS $body$
DECLARE anr RECORD;

DECLARE a_updated_user TEXT;

DECLARE a_update_timestamp TIMESTAMP WITH TIME ZONE;

BEGIN IF (
    TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
) THEN anr := NEW;

a_updated_user := NEW."ModifiedByUser";

a_update_timestamp := NEW."ModifiedAtTimestamp";

ELSIF (TG_OP = 'DELETE') THEN anr := OLD;

a_updated_user := risksmart.get_hasura_user_id();

a_update_timestamp := STATEMENT_TIMESTAMP();

END IF;

INSERT INTO risksmart.control_test_internal_audit_result_audit(
        "Id",
        "ParentControlId",
        "Title",
        "Submitter",
        "Description",
        "TestType",
        "DesignEffectiveness",
        "PerformanceEffectiveness",
        "OverallEffectiveness",
        "Meta",
        "TestDate",
        "NextTestDate",
        "CustomAttributeData",
        "OrgKey",
        "CreatedAtTimestamp",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "ModifiedByUser",
        "SequentialId",
        "Action"
    )
VALUES (
        anr."Id",
        anr."ParentControlId",
        anr."Title",
        anr."Submitter",
        anr."Description",
        anr."TestType",
        anr."DesignEffectiveness",
        anr."PerformanceEffectiveness",
        anr."OverallEffectiveness",
        anr."Meta",
        anr."TestDate",
        anr."NextTestDate",
        anr."CustomAttributeData",
        anr."OrgKey",
        anr."CreatedAtTimestamp",
        a_update_timestamp,
        anr."CreatedByUser",
        a_updated_user,
        anr."SequentialId",
        TG_OP
    );

RETURN anr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER control_test_internal_audit_result_audit_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.control_test_internal_audit_result FOR EACH ROW EXECUTE PROCEDURE risksmart.control_test_internal_audit_result_modified();

ALTER TABLE risksmart.control_test_internal_audit_result_audit ENABLE ROW LEVEL SECURITY;

ALTER TABLE risksmart.control_test_internal_audit_result ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_org ON risksmart.control_test_internal_audit_result TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.control_test_internal_audit_result_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.control_test_internal_audit_result TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.control_test_internal_audit_result_audit TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE TRIGGER node_insert_trigger before
insert ON risksmart.control_test_internal_audit_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.control_test_internal_audit_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

CREATE TRIGGER a_set_sequential_id_trigger
    BEFORE INSERT
    ON risksmart.control_test_internal_audit_result
    FOR EACH ROW
EXECUTE PROCEDURE risksmart.set_sequential_id();

-- Impact Rating --
-- Create the impact internal audit rating table and its audit table
CREATE TABLE IF NOT EXISTS risksmart.impact_internal_audit_rating (
    "Id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "ImpactId"                 UUID NOT NULL REFERENCES risksmart.impact("Id"),
    "RatedItemId"              UUID NOT NULL REFERENCES risksmart.node("Id"),
    "Rating"                   SMALLINT                                               NOT NULL,
    "TestDate"                 TIMESTAMP WITH TIME ZONE                               NOT NULL,
    "Likelihood"               INTEGER,
    "CompletedBy"              TEXT REFERENCES auth."user"("Id"),
    "SequentialId"             INTEGER NOT NULL,
    "CustomAttributeData"      jsonb NULL,
    "OrgKey"                   TEXT NOT NULL REFERENCES auth."organisation"("OrgKey"),
    "CreatedAtTimestamp"       TIMESTAMP WITH TIME ZONE DEFAULT statement_timestamp() NOT NULL,
    "ModifiedAtTimestamp"      TIMESTAMP WITH TIME ZONE DEFAULT statement_timestamp() NOT NULL,
    "CreatedByUser"            TEXT NOT NULL REFERENCES auth."user"("Id"),
    "ModifiedByUser"           TEXT NOT NULL REFERENCES auth."user"("Id")
);

CREATE TABLE IF NOT EXISTS risksmart.impact_internal_audit_rating_audit (
    "Id"                       UUID NOT NULL,
    "ImpactId"                 UUID,
    "RatedItemId"              UUID,
    "Rating"                   SMALLINT                                               NOT NULL,
    "TestDate"                 TIMESTAMP WITH TIME ZONE                               NOT NULL,
    "Likelihood"               INTEGER,
    "CompletedBy"              TEXT,
    "SequentialId"             INTEGER NOT NULL,
    "CustomAttributeData"      jsonb NULL,
    "OrgKey"                   text NOT NULL,
    "CreatedAtTimestamp"       TIMESTAMP WITH TIME ZONE NOT NULL,
    "ModifiedAtTimestamp"      TIMESTAMP WITH TIME ZONE NOT NULL,
    "CreatedByUser"            TEXT NOT NULL,
    "ModifiedByUser"           TEXT NOT NULL,
    "Action"                   risksmart.db_action NOT NULL,
    PRIMARY KEY ("Id", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.impact_internal_audit_rating_modified() RETURNS TRIGGER AS $body$
DECLARE anr RECORD;

DECLARE a_updated_user TEXT;

DECLARE a_update_timestamp TIMESTAMP WITH TIME ZONE;

BEGIN IF (
    TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
) THEN anr := NEW;

a_updated_user := NEW."ModifiedByUser";

a_update_timestamp := NEW."ModifiedAtTimestamp";

ELSIF (TG_OP = 'DELETE') THEN anr := OLD;

a_updated_user := risksmart.get_hasura_user_id();

a_update_timestamp := STATEMENT_TIMESTAMP();

END IF;

INSERT INTO risksmart.impact_internal_audit_rating_audit(
        "Id",
        "ImpactId",
        "RatedItemId",
        "Rating",
        "TestDate",
        "Likelihood",
        "CompletedBy",
        "SequentialId",
        "CustomAttributeData",
        "OrgKey",
        "CreatedAtTimestamp",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "ModifiedByUser",
        "SequentialId",
        "Action"
    )
VALUES (
        anr."Id",
        anr."ImpactId",
        anr."RatedItemId",
        anr."Rating",
        anr."TestDate",
        anr."Likelihood",
        anr."CompletedBy",
        anr."SequentialId",
        anr."CustomAttributeData",
        anr."OrgKey",
        anr."CreatedAtTimestamp",
        a_update_timestamp,
        anr."CreatedByUser",
        a_updated_user,
        anr."SequentialId",
        TG_OP
    );

RETURN anr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER impact_internal_audit_rating_audit_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.impact_internal_audit_rating FOR EACH ROW EXECUTE PROCEDURE risksmart.impact_internal_audit_rating_modified();

ALTER TABLE risksmart.impact_internal_audit_rating_audit ENABLE ROW LEVEL SECURITY;

ALTER TABLE risksmart.impact_internal_audit_rating ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_org ON risksmart.impact_internal_audit_rating TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.impact_internal_audit_rating_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.impact_internal_audit_rating TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.impact_internal_audit_rating_audit TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE TRIGGER node_insert_trigger before
insert ON risksmart.impact_internal_audit_rating FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.impact_internal_audit_rating FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

CREATE TRIGGER a_set_sequential_id_trigger
    BEFORE INSERT
    ON risksmart.impact_internal_audit_rating
    FOR EACH ROW
EXECUTE PROCEDURE risksmart.set_sequential_id();

-- Migrate the existing risk assessment results to the new risk internal audit result table
CREATE TEMP TABLE temp_internal_audit_parents_just_result AS
SELECT
    arp."Id",
    arp."ParentId",
    arp."ParentType",
    arp."ResultType",
    arp."OrgKey",
    arp."CreatedByUser",
    arp."ModifiedByUser",
    arp."CreatedAtTimestamp",
    arp."ModifiedAtTimestamp"
   FROM risksmart.assessment_result_parent as arp
     WHERE "ParentType" = 'internal_audit_report';

CREATE TEMP TABLE temp_internal_audit_parents AS
SELECT
    arp."Id",
    arp."ParentId",
    arp."ParentType",
    arp."ResultType",
    arp."OrgKey",
    arp."CreatedByUser",
    arp."ModifiedByUser",
    arp."CreatedAtTimestamp",
    arp."ModifiedAtTimestamp"
   FROM risksmart.assessment_result_parent as arp
     WHERE "Id"
               IN (SELECT ("Id") FROM temp_internal_audit_parents_just_result);
DROP TABLE IF EXISTS temp_internal_audit_parents_just_result;

-- Migrate the existing risk assessment results to the new risk internal audit result table
CREATE TEMP TABLE temp_internal_audit_controlled_risk_assessment_result AS
SELECT rar."Id",
       rar."ControlType",
       rar."Likelihood",
       rar."Impact",
       rar."Rating",
       rar."Rationale",
       rar."TestDate",
       rar."CustomAttributeData",
       rar."OrgKey",
       rar."CreatedAtTimestamp",
       rar."ModifiedAtTimestamp",
       rar."CreatedByUser",
       rar."ModifiedByUser"
FROM risksmart.risk_assessment_result rar
INNER JOIN risksmart.assessment_result_parent arp ON rar."Id" = arp."Id"
WHERE arp."ParentType" = 'internal_audit_report'
  AND arp."ResultType" = 'risk_assessment_result'
  AND rar."ControlType" = 'Controlled';

CREATE TEMP TABLE temp_internal_audit_uncontrolled_risk_assessment_result AS
SELECT rar."Id",
       rar."ControlType",
       rar."Likelihood",
       rar."Impact",
       rar."Rating",
       rar."Rationale",
       rar."TestDate",
       rar."CustomAttributeData",
       rar."OrgKey",
       rar."CreatedAtTimestamp",
       rar."ModifiedAtTimestamp",
       rar."CreatedByUser",
       rar."ModifiedByUser"
FROM risksmart.risk_assessment_result rar
INNER JOIN risksmart.assessment_result_parent arp ON rar."Id" = arp."Id"
WHERE arp."ParentType" = 'internal_audit_report'
  AND arp."ResultType" = 'risk_assessment_result'
  AND rar."ControlType" = 'Uncontrolled';

CREATE TEMP TABLE temp_internal_audit_document_assessment_result AS
SELECT rar."Id",
       rar."Rating",
       rar."Rationale",
       rar."TestDate",
       rar."CustomAttributeData",
       rar."OrgKey",
       rar."CreatedAtTimestamp",
       rar."ModifiedAtTimestamp",
       rar."CreatedByUser",
       rar."ModifiedByUser"
FROM risksmart.document_assessment_result rar
INNER JOIN risksmart.assessment_result_parent arp ON rar."Id" = arp."Id"
WHERE arp."ParentType" = 'internal_audit_report'
  AND arp."ResultType" = 'document_assessment_result';

CREATE TEMP TABLE temp_internal_audit_obligation_assessment_result AS
SELECT rar."Id",
       rar."Rating",
       rar."Rationale",
       rar."TestDate",
       rar."CustomAttributeData",
       rar."OrgKey",
       rar."CreatedAtTimestamp",
       rar."ModifiedAtTimestamp",
       rar."CreatedByUser",
       rar."ModifiedByUser"
FROM risksmart.obligation_assessment_result rar
INNER JOIN risksmart.assessment_result_parent arp ON rar."Id" = arp."Id"
WHERE arp."ParentType" = 'internal_audit_report'
  AND arp."ResultType" = 'obligation_assessment_result';

CREATE TEMP TABLE temp_internal_audit_test_result AS
SELECT tr."Id",
       tr."ParentControlId",
       tr."Title",
       tr."Submitter",
       tr."Description",
       tr."TestType",
       tr."DesignEffectiveness",
       tr."PerformanceEffectiveness",
       tr."OverallEffectiveness",
       tr."Meta",
       tr."SequentialId",
       tr."TestDate",
       tr."NextTestDate",
       tr."CustomAttributeData",
       tr."OrgKey",
       tr."CreatedAtTimestamp",
       tr."ModifiedAtTimestamp",
       tr."CreatedByUser",
       tr."ModifiedByUser"
FROM risksmart.test_result tr
INNER JOIN risksmart.assessment_result_parent arp ON tr."Id" = arp."Id"
WHERE arp."ParentType" = 'internal_audit_report'
  AND arp."ResultType" = 'test_result';

CREATE TEMP TABLE temp_internal_audit_impact_rating AS
SELECT ir."Id",
       ir."ImpactId",
       ir."RatedItemId",
       ir."Rating",
       ir."TestDate",
       ir."Likelihood",
       ir."CompletedBy",
       ir."SequentialId",
       ir."CustomAttributeData",
       ir."OrgKey",
       ir."CreatedAtTimestamp",
       ir."ModifiedAtTimestamp",
       ir."CreatedByUser",
       ir."ModifiedByUser"
FROM risksmart.impact_rating ir
INNER JOIN risksmart.assessment_result_parent arp ON ir."Id" = arp."Id"
WHERE arp."ParentType" = 'internal_audit_report'
  AND arp."ResultType" = 'impact_rating';

DELETE FROM risksmart.assessment_result_parent WHERE "ParentType" = 'internal_audit_report';
DELETE FROM risksmart.risk_assessment_result WHERE "Id" IN (SELECT "Id" FROM temp_internal_audit_controlled_risk_assessment_result);
DELETE FROM risksmart.risk_assessment_result WHERE "Id" IN (SELECT "Id" FROM temp_internal_audit_uncontrolled_risk_assessment_result);
DELETE FROM risksmart.document_assessment_result WHERE "Id" IN (SELECT "Id" FROM temp_internal_audit_document_assessment_result);
DELETE FROM risksmart.obligation_assessment_result WHERE "Id" IN (SELECT "Id" FROM temp_internal_audit_obligation_assessment_result);
DELETE FROM risksmart.test_result WHERE "Id" IN (SELECT "Id" FROM temp_internal_audit_test_result);
DELETE FROM risksmart.impact_rating WHERE "Id" IN (SELECT "Id" FROM temp_internal_audit_impact_rating);

-- Insert the risk assessment results into the new internal audit result table from the temp table
INSERT INTO risksmart.risk_uncontrolled_internal_audit_result (
    "Id",
    "Likelihood",
    "Impact",
    "Rating",
    "Rationale",
    "TestDate",
    "CustomAttributeData",
    "OrgKey",
    "CreatedAtTimestamp",
    "ModifiedAtTimestamp",
    "CreatedByUser",
    "ModifiedByUser"
) SELECT
    "Id",
    "Likelihood",
    "Impact",
    "Rating",
    "Rationale",
    "TestDate",
    "CustomAttributeData",
    "OrgKey",
    "CreatedAtTimestamp",
    NOW(),
    "CreatedByUser",
    'SYSTEM'
FROM temp_internal_audit_controlled_risk_assessment_result;

INSERT INTO risksmart.risk_controlled_internal_audit_result (
    "Id",
    "Likelihood",
    "Impact",
    "Rating",
    "Rationale",
    "TestDate",
    "CustomAttributeData",
    "OrgKey",
    "CreatedAtTimestamp",
    "ModifiedAtTimestamp",
    "CreatedByUser",
    "ModifiedByUser"
) SELECT
    "Id",
    "Likelihood",
    "Impact",
    "Rating",
    "Rationale",
    "TestDate",
    "CustomAttributeData",
    "OrgKey",
    "CreatedAtTimestamp",
    NOW(),
    "CreatedByUser",
    'SYSTEM'
FROM temp_internal_audit_uncontrolled_risk_assessment_result;

INSERT INTO risksmart.document_internal_audit_result (
    "Id",
    "Rating",
    "Rationale",
    "TestDate",
    "CustomAttributeData",
    "OrgKey",
    "CreatedAtTimestamp",
    "ModifiedAtTimestamp",
    "CreatedByUser",
    "ModifiedByUser"
) SELECT
    "Id",
    "Rating",
    "Rationale",
    "TestDate",
    "CustomAttributeData",
    "OrgKey",
    "CreatedAtTimestamp",
    NOW(),
    "CreatedByUser",
    'SYSTEM'
FROM temp_internal_audit_document_assessment_result;

INSERT INTO risksmart.obligation_internal_audit_result (
    "Id",
    "Rating",
    "Rationale",
    "TestDate",
    "CustomAttributeData",
    "OrgKey",
    "CreatedAtTimestamp",
    "ModifiedAtTimestamp",
    "CreatedByUser",
    "ModifiedByUser"
) SELECT
    "Id",
    "Rating",
    "Rationale",
    "TestDate",
    "CustomAttributeData",
    "OrgKey",
    "CreatedAtTimestamp",
    NOW(),
    "CreatedByUser",
    'SYSTEM'
FROM temp_internal_audit_obligation_assessment_result;

INSERT INTO risksmart.control_test_internal_audit_result (
    "Id",
    "ParentControlId",
    "Title",
    "Submitter",
    "Description",
    "TestType",
    "DesignEffectiveness",
    "PerformanceEffectiveness",
    "OverallEffectiveness",
    "Meta",
    "SequentialId",
    "TestDate",
    "NextTestDate",
    "CustomAttributeData",
    "OrgKey",
    "CreatedAtTimestamp",
    "ModifiedAtTimestamp",
    "CreatedByUser",
    "ModifiedByUser"
) SELECT
    "Id",
    "ParentControlId",
    "Title",
    "Submitter",
    "Description",
    "TestType",
    "DesignEffectiveness",
    "PerformanceEffectiveness",
    "OverallEffectiveness",
    "Meta",
    "SequentialId",
    "TestDate",
    "NextTestDate",
    "CustomAttributeData",
    "OrgKey",
    "CreatedAtTimestamp",
    NOW(),
    "CreatedByUser",
    'SYSTEM'
FROM temp_internal_audit_test_result;

INSERT INTO risksmart.impact_internal_audit_rating (
    "Id",
    "ImpactId",
    "RatedItemId",
    "Rating",
    "TestDate",
    "Likelihood",
    "CompletedBy",
    "SequentialId",
    "CustomAttributeData",
    "OrgKey",
    "CreatedAtTimestamp",
    "ModifiedAtTimestamp",
    "CreatedByUser",
    "ModifiedByUser"
) SELECT
    "Id",
    "ImpactId",
    "RatedItemId",
    "Rating",
    "TestDate",
    "Likelihood",
    "CompletedBy",
    "SequentialId",
    "CustomAttributeData",
    "OrgKey",
    "CreatedAtTimestamp",
    NOW(),
    "CreatedByUser",
    'SYSTEM'
FROM temp_internal_audit_impact_rating;

-- Hard coding date to 2025-06-25 for the migration to allow linked items audit to work
INSERT INTO risksmart.internal_audit_result_parent (
    "Id",
    "ParentId",
    "ParentType",
    "ResultType",
    "OrgKey",
    "CreatedByUser",
    "ModifiedByUser",
    "CreatedAtTimestamp",
    "ModifiedAtTimestamp"
) SELECT
    "Id",
    "ParentId",
    "ParentType",
    "ResultType",
    "OrgKey",
    "CreatedByUser",
    'SYSTEM',
    "CreatedAtTimestamp",
    '2025-06-25 00:00:00.000000 +00:00'
FROM temp_internal_audit_parents;
DROP TABLE IF EXISTS temp_internal_audit_parents;
-- Clean up the redundant parent types

DELETE FROM risksmart.form_configuration
WHERE "ParentType" in (
        'internal_audit_report_uncontrolled_risk_assessment_result',
        'internal_audit_report_controlled_risk_assessment_result',
        'internal_audit_report_document_assessment_result',
        'internal_audit_report_obligation_assessment_result',
        'internal_audit_report_test_result');

DELETE FROM risksmart.parent_type WHERE "Value" IN (
        'internal_audit_report_uncontrolled_risk_assessment_result',
        'internal_audit_report_controlled_risk_assessment_result',
        'internal_audit_report_document_assessment_result',
        'internal_audit_report_obligation_assessment_result',
        'internal_audit_report_test_result');

-- Clean up linked item triggers
DROP TRIGGER IF EXISTS linked_item_insert_trigger ON risksmart.internal_audit_result_parent;
DROP FUNCTION IF EXISTS risksmart.linked_item_insert_with_parentid_temp();

CREATE TRIGGER linked_item_insert_trigger
    AFTER INSERT
    ON risksmart.internal_audit_result_parent
    REFERENCING new TABLE inserted
EXECUTE PROCEDURE risksmart.linked_item_insert_with_parentid();