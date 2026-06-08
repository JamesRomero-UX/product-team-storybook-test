CREATE TABLE IF NOT EXISTS risksmart."enterprise_risk" (
    "Id" uuid NOT NULL PRIMARY KEY,
    "Title" text NOT NULL,
    "Description" text NOT NULL,
    "Tier" int NOT NULL,
    "ParentId" uuid NULL REFERENCES risksmart."enterprise_risk"("Id"),
    "Meta" jsonb NULL,
    "Treatment" text NULL REFERENCES risksmart."risk_treatment_type"("Value"),
    "SequentialId" int NOT NULL,
    "CustomAttributeData" jsonb NULL,
    "OrgKey" text NOT NULL REFERENCES auth.organisation("OrgKey"),
    "CreatedByUser" text NOT NULL REFERENCES auth.user("Id"),
    "ModifiedByUser" text NOT NULL REFERENCES auth.user("Id"),
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL
);

CREATE TABLE IF NOT EXISTS risksmart."enterprise_risk_audit" (
    "Id" uuid NOT NULL,
    "Title" text NOT NULL,
    "Description" text NOT NULL,
    "Tier" int NOT NULL,
    "ParentId" uuid NULL,
    "Meta" jsonb NULL,
    "Treatment" text NULL,
    "SequentialId" int NOT NULL,
    "CustomAttributeData" jsonb NULL,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    "Action" risksmart.db_action,
    primary key ("Id", "ModifiedAtTimestamp")
);

CREATE TRIGGER a_set_sequential_id_trigger BEFORE
INSERT ON risksmart.enterprise_risk for each ROW EXECUTE PROCEDURE risksmart.set_sequential_id();

CREATE UNIQUE INDEX idx_enterprise_risk_orgKey_sequentialid ON risksmart.enterprise_risk("OrgKey", "SequentialId");

CREATE OR REPLACE FUNCTION risksmart.enterprise_risk_modified() RETURNS trigger AS $body$
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

insert into risksmart.enterprise_risk_audit(
        "Id",
        "CustomAttributeData",
        "Title",
        "Tier",
        "ParentId",
        "Description",
        "Meta",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action",
        "Treatment",
        "SequentialId"
    )
values (
        nr."Id",
        nr."CustomAttributeData",
        nr."Title",
        nr."Tier",
        nr."ParentId",
        nr."Description",
        nr."Meta",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        TG_OP,
        nr."Treatment",
        nr."SequentialId"
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS risksmart."enterprise_risk_instance" (
    "EnterpriseRiskId" uuid NOT NULL REFERENCES risksmart."enterprise_risk"("Id"),
    "RiskId" uuid NOT NULL REFERENCES risksmart."risk"("Id"),
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    primary key ("EnterpriseRiskId", "RiskId")
);

CREATE TABLE IF NOT EXISTS risksmart."enterprise_risk_instance_audit" (
    "EnterpriseRiskId" uuid NOT NULL,
    "RiskId" uuid NOT NULL,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    "Action" risksmart.db_action,
    primary key (
        "EnterpriseRiskId",
        "RiskId",
        "ModifiedAtTimestamp"
    )
);

CREATE OR REPLACE FUNCTION risksmart.enterprise_risk_instance_modified() RETURNS trigger AS $body$
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

insert into risksmart.enterprise_risk_instance_audit(
        "EnterpriseRiskId",
        "RiskId",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."EnterpriseRiskId",
        nr."RiskId",
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

CREATE TRIGGER enterprise_risk_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.enterprise_risk FOR EACH ROW EXECUTE FUNCTION risksmart.enterprise_risk_modified();

CREATE TRIGGER enterprise_risk_instance_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.enterprise_risk_instance FOR EACH ROW EXECUTE FUNCTION risksmart.enterprise_risk_instance_modified();

CREATE TRIGGER node_insert_trigger before
insert ON risksmart.enterprise_risk FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.enterprise_risk FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

insert into risksmart.parent_type("Value", "Comment")
VALUES ('enterprise_risk', 'Enterprise Risk');

INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES (
        'RiskManager',
        'enterprise_risk',
        'any',
        'insert'
    ),
    (
        'RiskManager',
        'enterprise_risk',
        'any',
        'read'
    ),
    (
        'RiskManager',
        'enterprise_risk',
        'any',
        'update'
    ),
    (
        'RiskManager',
        'enterprise_risk',
        'any',
        'delete'
    );

ALTER TABLE risksmart.enterprise_risk_instance
ADD FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.enterprise_risk_instance
ADD FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.enterprise_risk_instance
ADD FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.enterprise_risk_instance ENABLE ROW LEVEL SECURITY;

ALTER TABLE risksmart.enterprise_risk_instance_audit ENABLE ROW LEVEL SECURITY;

ALTER TABLE risksmart.enterprise_risk_audit ENABLE ROW LEVEL SECURITY;

ALTER TABLE risksmart.enterprise_risk ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_org ON risksmart.enterprise_risk_instance TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.enterprise_risk_instance_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.enterprise_risk_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.enterprise_risk TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);