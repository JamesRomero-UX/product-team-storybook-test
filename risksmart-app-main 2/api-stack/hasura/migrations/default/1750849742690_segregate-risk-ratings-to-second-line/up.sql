-- Create new parent types
INSERT INTO risksmart.parent_type
    ("Value", "Comment") VALUES
    ('risk_controlled_second_line_result', 'Risk controlled second line result'),
    ('risk_uncontrolled_second_line_result', 'Risk uncontrolled second line result'),
    ('document_second_line_result', 'Document second line result'),
    ('obligation_second_line_result', 'Obligation second line result'),
    ('control_test_second_line_result', 'Control test second line result'),
    ('impact_second_line_rating', 'Impact second line rating');

-- Update parent type - Form Configuration
INSERT INTO risksmart.form_configuration
    ("CustomAttributeSchemaId", "ParentType", "OrgKey", "CreatedByUser", "ModifiedByUser", "CreatedAtTimestamp", "ModifiedAtTimestamp")
SELECT
    "CustomAttributeSchemaId", 'risk_controlled_second_line_result', "OrgKey", "CreatedByUser", 'SYSTEM', "CreatedAtTimestamp", NOW()
FROM
    risksmart.form_configuration
WHERE
    "ParentType" = 'second_line_assessment_controlled_risk_assessment_result';

INSERT INTO risksmart.form_configuration
    ("CustomAttributeSchemaId", "ParentType", "OrgKey", "CreatedByUser", "ModifiedByUser", "CreatedAtTimestamp", "ModifiedAtTimestamp")
SELECT
    "CustomAttributeSchemaId", 'risk_uncontrolled_second_line_result', "OrgKey", "CreatedByUser", 'SYSTEM', "CreatedAtTimestamp", NOW()
FROM
    risksmart.form_configuration
WHERE
    "ParentType" = 'second_line_assessment_uncontrolled_risk_assessment_result';

INSERT INTO risksmart.form_configuration
    ("CustomAttributeSchemaId", "ParentType", "OrgKey", "CreatedByUser", "ModifiedByUser", "CreatedAtTimestamp", "ModifiedAtTimestamp")
SELECT
    "CustomAttributeSchemaId", 'document_second_line_result', "OrgKey", "CreatedByUser", 'SYSTEM', "CreatedAtTimestamp", NOW()
FROM
    risksmart.form_configuration
WHERE
    "ParentType" = 'second_line_assessment_document_assessment_result';

INSERT INTO risksmart.form_configuration
    ("CustomAttributeSchemaId", "ParentType", "OrgKey", "CreatedByUser", "ModifiedByUser", "CreatedAtTimestamp", "ModifiedAtTimestamp")
SELECT
    "CustomAttributeSchemaId", 'obligation_second_line_result', "OrgKey", "CreatedByUser", 'SYSTEM', "CreatedAtTimestamp", NOW()
FROM
    risksmart.form_configuration
WHERE
    "ParentType" = 'second_line_assessment_obligation_assessment_result';

INSERT INTO risksmart.form_configuration
    ("CustomAttributeSchemaId", "ParentType", "OrgKey", "CreatedByUser", "ModifiedByUser", "CreatedAtTimestamp", "ModifiedAtTimestamp")
SELECT
    "CustomAttributeSchemaId", 'control_test_second_line_result', "OrgKey", "CreatedByUser", 'SYSTEM', "CreatedAtTimestamp", NOW()
FROM
    risksmart.form_configuration
WHERE
    "ParentType" = 'second_line_assessment_test_result';

-- Update parent type - Form field Configuration
UPDATE risksmart.form_field_configuration
    SET "FormConfigurationParentType" = 'risk_controlled_second_line_result',
        "ModifiedAtTimestamp" = now(),
        "ModifiedByUser"  = 'SYSTEM'
     WHERE "FormConfigurationParentType" = 'second_line_assessment_controlled_risk_assessment_result';
UPDATE risksmart.form_field_configuration
    SET "FormConfigurationParentType" = 'risk_uncontrolled_second_line_result',
        "ModifiedAtTimestamp" = now(),
        "ModifiedByUser"  = 'SYSTEM'
     WHERE "FormConfigurationParentType" = 'second_line_assessment_uncontrolled_risk_assessment_result';
UPDATE risksmart.form_field_configuration
    SET "FormConfigurationParentType" = 'document_second_line_result',
        "ModifiedAtTimestamp" = now(),
        "ModifiedByUser"  = 'SYSTEM'
     WHERE "FormConfigurationParentType" = 'second_line_assessment_document_assessment_result';
UPDATE risksmart.form_field_configuration
    SET "FormConfigurationParentType" = 'obligation_second_line_result',
        "ModifiedAtTimestamp" = now(),
        "ModifiedByUser"  = 'SYSTEM'
     WHERE "FormConfigurationParentType" = 'second_line_assessment_obligation_assessment_result';
UPDATE risksmart.form_field_configuration
    SET "FormConfigurationParentType" = 'control_test_second_line_result',
        "ModifiedAtTimestamp" = now(),
        "ModifiedByUser"  = 'SYSTEM'
     WHERE "FormConfigurationParentType" = 'second_line_assessment_test_result';

-- Update parent type - Form field ordering
UPDATE risksmart.form_field_ordering
    SET "FormConfigurationParentType" = 'risk_controlled_second_line_result',
        "ModifiedAtTimestamp" = now(),
        "ModifiedByUser"  = 'SYSTEM'
     WHERE "FormConfigurationParentType" = 'second_line_assessment_controlled_risk_assessment_result';
UPDATE risksmart.form_field_ordering
    SET "FormConfigurationParentType" = 'risk_uncontrolled_second_line_result',
        "ModifiedAtTimestamp" = now(),
        "ModifiedByUser"  = 'SYSTEM'
     WHERE "FormConfigurationParentType" = 'second_line_assessment_uncontrolled_risk_assessment_result';
UPDATE risksmart.form_field_ordering
    SET "FormConfigurationParentType" = 'document_second_line_result',
        "ModifiedAtTimestamp" = now(),
        "ModifiedByUser"  = 'SYSTEM'
     WHERE "FormConfigurationParentType" = 'second_line_assessment_document_assessment_result';
UPDATE risksmart.form_field_ordering
    SET "FormConfigurationParentType" = 'obligation_second_line_result',
        "ModifiedAtTimestamp" = now(),
        "ModifiedByUser"  = 'SYSTEM'
     WHERE "FormConfigurationParentType" = 'second_line_assessment_obligation_assessment_result';
UPDATE risksmart.form_field_ordering
    SET "FormConfigurationParentType" = 'control_test_second_line_result',
        "ModifiedAtTimestamp" = now(),
        "ModifiedByUser"  = 'SYSTEM'
     WHERE "FormConfigurationParentType" = 'second_line_assessment_test_result';

-- second line result parent
CREATE TABLE IF NOT EXISTS risksmart.second_line_result_parent (
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

CREATE TABLE IF NOT EXISTS risksmart.second_line_result_parent_audit (
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

CREATE OR REPLACE FUNCTION risksmart.second_line_result_parent_modified() RETURNS TRIGGER AS $body$
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
INSERT INTO risksmart.second_line_result_parent_audit(
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

CREATE TRIGGER second_line_result_parent_audit_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.second_line_result_parent FOR EACH ROW EXECUTE PROCEDURE risksmart.second_line_result_parent_modified();
ALTER TABLE risksmart.second_line_result_parent_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE risksmart.second_line_result_parent ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_org ON risksmart.second_line_result_parent TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);
CREATE POLICY own_org ON risksmart.second_line_result_parent_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);
CREATE POLICY own_org_rw ON risksmart.second_line_result_parent TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);
CREATE POLICY own_org_rw ON risksmart.second_line_result_parent_audit TO trpc USING (
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
    ON risksmart.second_line_result_parent
    REFERENCING new TABLE inserted
EXECUTE PROCEDURE risksmart.linked_item_insert_with_parentid_temp();

CREATE TRIGGER linked_item_delete_trigger
    AFTER DELETE
    ON risksmart.second_line_result_parent
    REFERENCING old TABLE deleted
EXECUTE PROCEDURE risksmart.linked_item_delete_with_parentid();

CREATE TRIGGER linked_item_update_trigger
    AFTER UPDATE
    ON risksmart.second_line_result_parent
    FOR EACH ROW
EXECUTE PROCEDURE risksmart.linked_item_update_with_parentid();


-- Risk --
-- Create the risk controlled second line result table and its audit table
CREATE TABLE IF NOT EXISTS risksmart.risk_controlled_second_line_result (
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

CREATE TABLE IF NOT EXISTS risksmart.risk_controlled_second_line_result_audit (
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

CREATE OR REPLACE FUNCTION risksmart.risk_controlled_second_line_result_modified() RETURNS TRIGGER AS $body$
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

INSERT INTO risksmart.risk_controlled_second_line_result_audit(
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

CREATE TRIGGER risk_controlled_second_line_result_audit_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.risk_controlled_second_line_result FOR EACH ROW EXECUTE PROCEDURE risksmart.risk_controlled_second_line_result_modified();

ALTER TABLE risksmart.risk_controlled_second_line_result_audit ENABLE ROW LEVEL SECURITY;

ALTER TABLE risksmart.risk_controlled_second_line_result ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_org ON risksmart.risk_controlled_second_line_result TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.risk_controlled_second_line_result_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.risk_controlled_second_line_result TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.risk_controlled_second_line_result_audit TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE TRIGGER node_insert_trigger before
insert ON risksmart.risk_controlled_second_line_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.risk_controlled_second_line_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

-- Create the risk uncontrolled second line result table and its audit table
CREATE TABLE IF NOT EXISTS risksmart.risk_uncontrolled_second_line_result (
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

CREATE TABLE IF NOT EXISTS risksmart.risk_uncontrolled_second_line_result_audit (
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

CREATE OR REPLACE FUNCTION risksmart.risk_uncontrolled_second_line_result_modified() RETURNS TRIGGER AS $body$
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

INSERT INTO risksmart.risk_uncontrolled_second_line_result_audit(
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

CREATE TRIGGER risk_uncontrolled_second_line_result_audit_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.risk_uncontrolled_second_line_result FOR EACH ROW EXECUTE PROCEDURE risksmart.risk_uncontrolled_second_line_result_modified();

ALTER TABLE risksmart.risk_uncontrolled_second_line_result_audit ENABLE ROW LEVEL SECURITY;

ALTER TABLE risksmart.risk_uncontrolled_second_line_result ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_org ON risksmart.risk_uncontrolled_second_line_result TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.risk_uncontrolled_second_line_result_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.risk_uncontrolled_second_line_result TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.risk_uncontrolled_second_line_result_audit TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE TRIGGER node_insert_trigger before
insert ON risksmart.risk_uncontrolled_second_line_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.risk_uncontrolled_second_line_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();


-- Document --
-- Create the document second line result table and its audit table
CREATE TABLE IF NOT EXISTS risksmart.document_second_line_result (
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

CREATE TABLE IF NOT EXISTS risksmart.document_second_line_result_audit (
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

CREATE OR REPLACE FUNCTION risksmart.document_second_line_result_modified() RETURNS TRIGGER AS $body$
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

INSERT INTO risksmart.document_second_line_result_audit(
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

CREATE TRIGGER document_second_line_result_audit_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.document_second_line_result FOR EACH ROW EXECUTE PROCEDURE risksmart.document_second_line_result_modified();

ALTER TABLE risksmart.document_second_line_result_audit ENABLE ROW LEVEL SECURITY;

ALTER TABLE risksmart.document_second_line_result ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_org ON risksmart.document_second_line_result TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.document_second_line_result_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.document_second_line_result TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.document_second_line_result_audit TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE TRIGGER node_insert_trigger before
insert ON risksmart.document_second_line_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.document_second_line_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();


-- Obligation
-- Create the obligation second line result table and its audit table
CREATE TABLE IF NOT EXISTS risksmart.obligation_second_line_result (
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

CREATE TABLE IF NOT EXISTS risksmart.obligation_second_line_result_audit (
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

CREATE OR REPLACE FUNCTION risksmart.obligation_second_line_result_modified() RETURNS TRIGGER AS $body$
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

INSERT INTO risksmart.obligation_second_line_result_audit(
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

CREATE TRIGGER obligation_second_line_result_audit_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.obligation_second_line_result FOR EACH ROW EXECUTE PROCEDURE risksmart.obligation_second_line_result_modified();

ALTER TABLE risksmart.obligation_second_line_result_audit ENABLE ROW LEVEL SECURITY;

ALTER TABLE risksmart.obligation_second_line_result ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_org ON risksmart.obligation_second_line_result TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.obligation_second_line_result_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.obligation_second_line_result TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.obligation_second_line_result_audit TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE TRIGGER node_insert_trigger before
insert ON risksmart.obligation_second_line_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.obligation_second_line_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

-- Test Result --
-- Create the control test compliance monitoring result table and its audit table
CREATE TABLE IF NOT EXISTS risksmart.control_test_second_line_result (
    "Id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "ParentControlId"         UUID NOT NULL REFERENCES risksmart.control("Id"),
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

CREATE TABLE IF NOT EXISTS risksmart.control_test_second_line_result_audit (
    "Id" UUID NOT NULL,
    "ParentControlId"         UUID NOT NULL,
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

CREATE OR REPLACE FUNCTION risksmart.control_test_second_line_result_modified() RETURNS TRIGGER AS $body$
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

INSERT INTO risksmart.control_test_second_line_result_audit(
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

CREATE TRIGGER control_test_second_line_result_audit_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.control_test_second_line_result FOR EACH ROW EXECUTE PROCEDURE risksmart.control_test_second_line_result_modified();

ALTER TABLE risksmart.control_test_second_line_result_audit ENABLE ROW LEVEL SECURITY;

ALTER TABLE risksmart.control_test_second_line_result ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_org ON risksmart.control_test_second_line_result TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.control_test_second_line_result_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.control_test_second_line_result TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.control_test_second_line_result_audit TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE TRIGGER node_insert_trigger before
insert ON risksmart.control_test_second_line_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.control_test_second_line_result FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

CREATE TRIGGER a_set_sequential_id_trigger
    BEFORE INSERT
    ON risksmart.control_test_second_line_result
    FOR EACH ROW
EXECUTE PROCEDURE risksmart.set_sequential_id();


-- Impact Rating --
-- Create the impact second line rating table and its audit table
CREATE TABLE IF NOT EXISTS risksmart.impact_second_line_rating (
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

CREATE TABLE IF NOT EXISTS risksmart.impact_second_line_rating_audit (
    "Id"                        UUID NOT NULL,
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

CREATE OR REPLACE FUNCTION risksmart.impact_second_line_rating_modified() RETURNS TRIGGER AS $body$
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

INSERT INTO risksmart.impact_second_line_rating_audit(
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

CREATE TRIGGER impact_second_line_rating_audit_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.impact_second_line_rating FOR EACH ROW EXECUTE PROCEDURE risksmart.impact_second_line_rating_modified();

ALTER TABLE risksmart.impact_second_line_rating_audit ENABLE ROW LEVEL SECURITY;

ALTER TABLE risksmart.impact_second_line_rating ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_org ON risksmart.impact_second_line_rating TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.impact_second_line_rating_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.impact_second_line_rating TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.impact_second_line_rating_audit TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE TRIGGER node_insert_trigger before
insert ON risksmart.impact_second_line_rating FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.impact_second_line_rating FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

CREATE TRIGGER a_set_sequential_id_trigger
    BEFORE INSERT
    ON risksmart.impact_second_line_rating
    FOR EACH ROW
EXECUTE PROCEDURE risksmart.set_sequential_id();

-- Load temp assessment result tables
CREATE TEMP TABLE temp_second_line_parents_just_result AS
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
     WHERE "ParentType" = 'compliance_monitoring_assessment';

CREATE TEMP TABLE temp_second_line_parents AS
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
               IN (SELECT ("Id") FROM temp_second_line_parents_just_result);
DROP TABLE IF EXISTS temp_second_line_parents_just_result;

-- Migrate the existing risk assessment results to the new result tables
-- Second Line Assessment Results --

CREATE TEMP TABLE temp_second_line_controlled_risk_assessment_result AS
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
WHERE arp."ParentType" = 'compliance_monitoring_assessment'
  AND arp."ResultType" = 'risk_assessment_result'
  AND rar."ControlType" = 'Controlled';

CREATE TEMP TABLE temp_second_line_uncontrolled_risk_assessment_result AS
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
WHERE arp."ParentType" = 'compliance_monitoring_assessment'
  AND arp."ResultType" = 'risk_assessment_result'
  AND rar."ControlType" = 'Uncontrolled';

CREATE TEMP TABLE temp_second_line_document_assessment_result AS
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
WHERE arp."ParentType" = 'compliance_monitoring_assessment'
  AND arp."ResultType" = 'document_assessment_result';

CREATE TEMP TABLE temp_second_line_obligation_assessment_result AS
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
WHERE arp."ParentType" = 'compliance_monitoring_assessment'
  AND arp."ResultType" = 'obligation_assessment_result';

CREATE TEMP TABLE temp_second_line_test_result AS
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
WHERE arp."ParentType" = 'compliance_monitoring_assessment'
  AND arp."ResultType" = 'test_result';

CREATE TEMP TABLE temp_second_line_impact_rating AS
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
WHERE arp."ParentType" = 'compliance_monitoring_assessment'
  AND arp."ResultType" = 'impact_rating';

DELETE FROM risksmart.assessment_result_parent WHERE "ParentType" = 'compliance_monitoring_assessment';
DELETE FROM risksmart.risk_assessment_result WHERE "Id" IN (SELECT "Id" FROM temp_second_line_controlled_risk_assessment_result);
DELETE FROM risksmart.risk_assessment_result WHERE "Id" IN (SELECT "Id" FROM temp_second_line_uncontrolled_risk_assessment_result);
DELETE FROM risksmart.document_assessment_result WHERE "Id" IN (SELECT "Id" FROM temp_second_line_document_assessment_result);
DELETE FROM risksmart.obligation_assessment_result WHERE "Id" IN (SELECT "Id" FROM temp_second_line_obligation_assessment_result);
DELETE FROM risksmart.test_result WHERE "Id" IN (SELECT "Id" FROM temp_second_line_test_result);
DELETE FROM risksmart.impact_rating WHERE "Id" IN (SELECT "Id" FROM temp_second_line_impact_rating);

-- Insert the assessment results into the new second line result table from the temp table
INSERT INTO risksmart.risk_uncontrolled_second_line_result (
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
FROM temp_second_line_uncontrolled_risk_assessment_result;

INSERT INTO risksmart.risk_controlled_second_line_result (
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
FROM temp_second_line_controlled_risk_assessment_result;

INSERT INTO risksmart.document_second_line_result (
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
FROM temp_second_line_document_assessment_result;

INSERT INTO risksmart.obligation_second_line_result (
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
FROM temp_second_line_obligation_assessment_result;

INSERT INTO risksmart.control_test_second_line_result (
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
FROM temp_second_line_test_result;

INSERT INTO risksmart.impact_second_line_rating (
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
FROM temp_second_line_impact_rating;

INSERT INTO risksmart.second_line_result_parent (
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
FROM temp_second_line_parents;
DROP TABLE IF EXISTS temp_second_line_parents;
-- Clean up the redundant parent types

DELETE FROM risksmart.form_configuration
WHERE "ParentType" in (
        'second_line_assessment_uncontrolled_risk_assessment_result',
        'second_line_assessment_controlled_risk_assessment_result',
        'second_line_assessment_document_assessment_result',
        'second_line_assessment_obligation_assessment_result',
        'second_line_assessment_test_result');

DELETE FROM risksmart.parent_type WHERE "Value" IN (
        'second_line_assessment_uncontrolled_risk_assessment_result',
        'second_line_assessment_controlled_risk_assessment_result',
        'second_line_assessment_document_assessment_result',
        'second_line_assessment_obligation_assessment_result',
        'second_line_assessment_test_result');

-- Clean up linked item triggers
DROP TRIGGER IF EXISTS linked_item_insert_trigger ON risksmart.second_line_result_parent;
DROP FUNCTION IF EXISTS risksmart.linked_item_insert_with_parentid_temp();

CREATE TRIGGER linked_item_insert_trigger
    AFTER INSERT
    ON risksmart.second_line_result_parent
    REFERENCING new TABLE inserted
EXECUTE PROCEDURE risksmart.linked_item_insert_with_parentid();

-- Update audit log view to include second line results
CREATE OR REPLACE VIEW risksmart.audit_log_view AS
select null as "Item",
    'tag' as "ObjectType",
    "TagTypeId"::text as "Id",
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.tag_audit
union all
select null,
    'department',
    "DepartmentTypeId"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.department_audit
union all
select "FileName",
    'file',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.file_audit
union all
select null,
    'relation_file',
    "ParentId"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.relation_file_audit
union all
select null,
    'control_action',
    "ControlId"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.control_action_audit
union all
select null,
    'risk_action',
    "RiskId"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.risk_action_audit
union all
select null,
    'issue_action',
    "IssueId"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.issue_action_audit
union all
select null,
    'obligation_action',
    "ObligationId"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.obligation_action_audit
union all
select null,
    'obligation_issue',
    "ObligationId"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.obligation_issue_audit
union all
select null,
    'document_linked_document',
    "DocumentId"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.document_linked_document_audit
union all
select null,
    'document_action',
    "DocumentId"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.document_action_audit
union all
select null,
    'document_issue',
    "DocumentId"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.document_issue_audit
union all
select null,
    'custom_attribute_schema',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.custom_attribute_schema_audit
union all
select "Title",
    'acceptance',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.acceptance_audit
union all
select null,
    'comment',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.comment_audit
union all
select null,
    'obligation_impact',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.obligation_impact_audit
union all
select null,
    'appetite',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.appetite_audit
union all
select "Title",
    'issue',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.issue_audit
WHERE "Type" = 'issue'
union all
select "Title",
    'issue_breach_log',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.issue_audit
WHERE "Type" = 'issue_breach_log'
union all
select "Title",
    'issue_sar_log',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.issue_audit
WHERE "Type" = 'issue_sar_log'
union all
select "Title",
    'issue_gdpr_breach_log',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.issue_audit
WHERE "Type" = 'issue_gdpr_breach_log'
union all
select "Title",
    'issue_pci_breach_log',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.issue_audit
WHERE "Type" = 'issue_pci_breach_log'
union all
select "Title",
    'issue_consumer_duty',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.issue_audit
WHERE "Type" = 'issue_consumer_duty'
union all
select "Title",
    'issue_customer_trust',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.issue_audit
WHERE "Type" = 'issue_customer_trust'
union all
select "Title",
    'issue_risk_event',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.issue_audit
WHERE "Type" = 'issue_risk_event'
union all
select "Title",
    'action_update',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.action_update_audit
union all
select null,
    'control_group',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.control_group_audit
union all
select null,
    'indicator_result',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.indicator_result_audit
union all
select "Title",
    'issue_update',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.issue_update_audit
union all
select null,
    'issue_assessment',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.issue_assessment_audit
WHERE "Type" = 'issue_assessment'
union all
select null,
    'issue_assessment_breach_log',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.issue_assessment_audit
WHERE "Type" = 'issue_assessment_breach_log'
union all
select null,
    'issue_assessment_sar_log',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.issue_assessment_audit
WHERE "Type" = 'issue_assessment_sar_log'
union all
select null,
    'issue_assessment_gdpr_breach_log',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.issue_assessment_audit
WHERE "Type" = 'issue_assessment_gdpr_breach_log'
union all
select null,
    'issue_assessment_pci_breach_log',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.issue_assessment_audit
WHERE "Type" = 'issue_assessment_pci_breach_log'
union all
select null,
    'issue_assessment_consumer_duty',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.issue_assessment_audit
WHERE "Type" = 'issue_assessment_consumer_duty'
union all
select null,
    'issue_assessment_customer_trust',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.issue_assessment_audit
WHERE "Type" = 'issue_assessment_customer_trust'
union all
select null,
    'issue_assessment_risk_event',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.issue_assessment_audit
WHERE "Type" = 'issue_assessment_risk_event'
union all
select "Title",
    'cause',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.cause_audit
union all
select "Title",
    'test_result',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.test_result_audit
union all
select null,
    'taxonomy',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    null as "OrgKey"
    /* TODO: investigate why OrgKey is missing on this table */
from risksmart.taxonomy_audit
union all
select null,
    'taxonomy_org',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.taxonomy_org_audit
union all
select null,
    'contributor',
    "ParentId"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.contributor_audit
union all
select null,
    'owner',
    "ParentId"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.owner_audit
union all
select null,
    'approval',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.approval_audit
union all
select null,
    'approval_level',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.approval_level_audit
union all
select null,
    'approver',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.approver_audit
union all
select null,
    'action_parent',
    "ActionId"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.action_parent_audit
union all
select null,
    'control_parent',
    "ControlId"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.control_parent_audit
union all
select "ParentType",
    'form_configuration',
    null::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.form_configuration_audit
union all
select null,
    'indicator_parent',
    "ParentId"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.indicator_parent_audit
union all
select "Title",
    'action',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.action_audit
union all
select "Title",
    'risk',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.risk_audit
union all
select "Title",
    'control',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.control_audit
union all
select "Title",
    'document',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.document_audit
union all
select null,
    'form_field_configuration',
    null::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.form_field_configuration_audit
union all
select "Title",
    'obligation',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.obligation_audit
union all
select null,
    'issue_parent',
    "ParentId"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.issue_parent_audit
union all
select null,
    'owner_group',
    "ParentId"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.owner_group_audit
union all
select null,
    'contributor_group',
    "ParentId"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.contributor_group_audit
union all
select null,
    'user_group_users',
    "UserGroupId"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.user_group_user_audit
union all
select null,
    'conversation',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.conversation_audit
union all
select "Title",
    'consequence',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.consequence_audit
union all
select "Title",
    'assessment',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.assessment_audit
union all
select "Name",
    'impact',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.impact_audit
union all
select null,
    'obligation_assessment_result',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.obligation_assessment_result_audit
union all
select "Name",
    'tag_type_group',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.tag_type_group_audit
union all
select "Name",
    'tag_type',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.tag_type_audit
union all
select null,
    'impact_rating',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.impact_rating_audit
union all
select "Title",
    'indicator_audit',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.indicator_audit
union all
select "Name",
    'department_type_group',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.department_type_group_audit
union all
select null,
    'risk_assessment_result',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.risk_assessment_result_audit
union all
select null,
    'document_assessment_result',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.document_assessment_result_audit
union all
select "Name",
    'department_type',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.department_type_audit
union all
select null,
    'risk_assessment',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.old_risk_assessment_audit
union all
select null,
    'document_assessment',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.old_document_assessment_audit
union all
select null,
    'obligation_assessment',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.old_obligation_assessment_audit
union all
select "Name",
    'user_group',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.user_group_audit
union all
select "Version",
    'document_file',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.document_file_audit
union all
select null,
    'linked_item',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.linked_item_audit
union all
select null,
    'acceptance_parent',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.acceptance_parent_audit
union all
select null,
    'assessment_result_parent',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.assessment_result_parent_audit
union all
select null,
    'change_request_contributor',
    "Id"::text,
    "Action",
    null as "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
    /* TODO: Investigate why this table doesn't have a"ModifiedByUser */
from risksmart.change_request_contributor_audit
union all
select null,
    'appetite_parent',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.appetite_parent_audit
union all
select null,
    'impact_parent',
    "ParentId"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.impact_parent_audit
union all
select "Title",
    'assessment_activity',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.assessment_activity_audit
union all
select null,
    'change_request',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.change_request_audit
union all
select "Title",
    'internal_audit_report',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.internal_audit_report_audit
union all
select null,
    'user_search_preferences',
    null::text,
    /* TODO: do we want user actions in audit log? */
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.user_search_preferences_audit
union all
select null,
    'custom_ribbon',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.custom_ribbon_audit
union all
select "Title",
    'compliance_monitoring_assessment',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.compliance_monitoring_assessment_audit
union all
select "Title",
    'business_area',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.business_area_audit
union all
select "Title",
    'internal_audit_entity',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.internal_audit_entity_audit
union all
select "Name",
    'dashboard',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.dashboard_audit
union all
select null,
    'approver_response',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    null as "OrgKey"
    /* TODO: Investigate why this table doesn't have a OrgKey */
from risksmart.approver_response_audit
union all
select null,
    'attestation_group',
    "GroupId"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.attestation_group_audit
union all
select null,
    'attestation_record',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.attestation_record_audit
union all
select null,
    'attestation_config',
    "ParentId"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.attestation_config_audit
union all
select "Title",
    'third_party',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.third_party_audit
union all
select 'Authentication',
    'user_activity',
    "ModifiedByUser",
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from auth.user_activity_audit
union all
select "Title",
    'enterprise_risk',
    "ModifiedByUser",
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.enterprise_risk_audit
union ALL
select null,
    'enterprise_risk_instance',
    "ModifiedByUser",
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.enterprise_risk_instance_audit
union ALL
select null,
    'schedule',
    "ModifiedByUser",
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.schedule_audit
union ALL
select "Title",
    'questionnaire_template',
    "ModifiedByUser",
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.questionnaire_template_audit
union ALL
select null,
    'questionnaire_invite',
    "ModifiedByUser",
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.questionnaire_invite_audit
union all
select null,
    'questionnaire_template_version',
    "ModifiedByUser",
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.questionnaire_template_version_audit
union all
select null,
    'third_party_response',
    "ModifiedByUser",
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.third_party_response_audit
union all
select null,
    'entity',
    "ModifiedByUser",
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.entity_audit
union all
select null,
    'wizard',
    "ModifiedByUser",
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.wizard_audit
union all
select null,
    'custom_datasource',
    "ModifiedByUser",
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.custom_datasource_audit
union all
select null,
    'impact_second_line_rating_audit',
    "ModifiedByUser",
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.impact_second_line_rating_audit
union all
select null,
    'risk_uncontrolled_internal_audit_result_audit',
    "ModifiedByUser",
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.risk_uncontrolled_internal_audit_result_audit
union all
select null,
    'impact_internal_audit_rating_audit',
    "ModifiedByUser",
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.impact_internal_audit_rating_audit
union all
select null,
    'risk_controlled_second_line_result_audit',
    "ModifiedByUser",
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.risk_controlled_second_line_result_audit
union all
select null,
    'obligation_second_line_result_audit',
    "ModifiedByUser",
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.obligation_second_line_result_audit
union all
select null,
    'obligation_internal_audit_result_audit',
    "ModifiedByUser",
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.obligation_internal_audit_result_audit
union all
select null,
    'control_test_second_line_result_audit',
    "ModifiedByUser",
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.control_test_second_line_result_audit
union all
select null,
    'document_internal_audit_result_audit',
    "ModifiedByUser",
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.document_internal_audit_result_audit
union all
select null,
    'document_second_line_result_audit',
    "ModifiedByUser",
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.document_second_line_result_audit
union all
select null,
    'risk_uncontrolled_second_line_result_audit',
    "ModifiedByUser",
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.risk_uncontrolled_second_line_result_audit
union all
select null,
    'risk_controlled_internal_audit_result_audit',
    "ModifiedByUser",
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.risk_controlled_internal_audit_result_audit
union all
select null,
    'second_line_result_parent_audit',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.second_line_result_parent_audit
union all
select null,
    'control_test_internal_audit_result_audit',
    "ModifiedByUser",
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.control_test_internal_audit_result_audit
union all
select null,
    'internal_audit_result_parent_audit',
    "Id"::text,
    "Action",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "OrgKey"
from risksmart.internal_audit_result_parent_audit;

ALTER VIEW risksmart.audit_log_view
SET (security_invoker = true);