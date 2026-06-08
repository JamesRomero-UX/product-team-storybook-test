CREATE TABLE IF NOT EXISTS risksmart."entity" (
    "Id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "Name" TEXT NOT NULL,
    "Description" TEXT,
    "ParentId" UUID NULL REFERENCES risksmart."entity"("Id"),
    "OrgKey" TEXT NOT NULL REFERENCES auth."organisation"("OrgKey"),
    "CreatedAtTimestamp" TIMESTAMP WITH TIME ZONE DEFAULT statement_timestamp() NOT NULL,
    "ModifiedAtTimestamp" TIMESTAMP WITH TIME ZONE DEFAULT statement_timestamp() NOT NULL,
    "CreatedByUser" TEXT NOT NULL REFERENCES auth."user"("Id"),
    "ModifiedByUser" TEXT NOT NULL REFERENCES auth."user"("Id")
);

CREATE TABLE IF NOT EXISTS risksmart."entity_audit" (
    "Id" UUID NOT NULL,
    "Name" TEXT NOT NULL,
    "Description" TEXT,
    "ParentId" UUID,
    "OrgKey" TEXT NOT NULL,
    "CreatedAtTimestamp" TIMESTAMP WITH TIME ZONE NOT NULL,
    "ModifiedAtTimestamp" TIMESTAMP WITH TIME ZONE NOT NULL,
    "CreatedByUser" TEXT NOT NULL,
    "ModifiedByUser" TEXT NOT NULL,
    "Action" risksmart.db_action NOT NULL,
    PRIMARY KEY ("Id", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.entity_modified() RETURNS trigger AS $body$
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

insert into risksmart.entity_audit(
        "Id",
        "Name",
        "Description",
        "ParentId",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."Name",
        nr."Description",
        nr."ParentId",
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

CREATE TRIGGER entity_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.entity FOR EACH ROW EXECUTE FUNCTION risksmart.entity_modified();

CREATE TRIGGER node_insert_trigger before
insert ON risksmart.entity FOR EACH ROW EXECUTE PROCEDURE risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
AFTER DELETE ON risksmart.entity FOR EACH ROW EXECUTE PROCEDURE risksmart.node_delete();

insert into risksmart.parent_type("Value", "Comment")
VALUES ('entity', 'Entity');

INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES (
        'CustomerSupport',
        'entity',
        'any',
        'insert'
    ),
    (
        'CustomerSupport',
        'entity',
        'any',
        'read'
    ),
    (
        'CustomerSupport',
        'entity',
        'any',
        'update'
    ),
    (
        'CustomerSupport',
        'entity',
        'any',
        'delete'
    ),
    (
        'CustomerSupport',
        'enterprise_risk',
        'any',
        'insert'
    ),
    (
        'CustomerSupport',
        'enterprise_risk',
        'any',
        'read'
    ),
    (
        'CustomerSupport',
        'enterprise_risk',
        'any',
        'update'
    ),
    (
        'CustomerSupport',
        'enterprise_risk',
        'any',
        'delete'
    ),
    (
        'RiskManager',
        'entity',
        'any',
        'insert'
    ),
    (
        'RiskManager',
        'entity',
        'any',
        'read'
    ),
    (
        'RiskManager',
        'entity',
        'any',
        'update'
    ),
    (
        'RiskManager',
        'entity',
        'any',
        'delete'
    );

ALTER TABLE risksmart.entity ENABLE ROW LEVEL SECURITY;

ALTER TABLE risksmart.entity_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_org ON risksmart.entity TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.entity_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE OR REPLACE FUNCTION risksmart.entity_descendants(entity_row risksmart."entity") RETURNS SETOF risksmart."entity" AS $$ WITH RECURSIVE descendants (
        "Id",
        "Name",
        "Description",
        "ParentId",
        "OrgKey",
        "CreatedAtTimestamp",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "ModifiedByUser"
    ) AS (
        SELECT "Id",
            "Name",
            "Description",
            "ParentId",
            "OrgKey",
            "CreatedAtTimestamp",
            "ModifiedAtTimestamp",
            "CreatedByUser",
            "ModifiedByUser"
        FROM risksmart."entity"
        WHERE "ParentId" = entity_row."Id"
        UNION ALL
        SELECT e."Id",
            e."Name",
            e."Description",
            e."ParentId",
            e."OrgKey",
            e."CreatedAtTimestamp",
            e."ModifiedAtTimestamp",
            e."CreatedByUser",
            e."ModifiedByUser"
        FROM risksmart."entity" e
            INNER JOIN descendants d ON e."ParentId" = d."Id"
    )
SELECT "Id",
    "Name",
    "Description",
    "ParentId",
    "OrgKey",
    "CreatedAtTimestamp",
    "ModifiedAtTimestamp",
    "CreatedByUser",
    "ModifiedByUser"
FROM descendants;

$$ LANGUAGE sql STABLE;

ALTER TABLE risksmart."enterprise_risk_instance"
ADD COLUMN "EntityId" UUID NOT NULL REFERENCES risksmart."entity"("Id");

ALTER TABLE risksmart."enterprise_risk_instance_audit"
ADD COLUMN "EntityId" UUID;

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
        "Action",
        "EntityId"
    )
values (
        nr."EnterpriseRiskId",
        nr."RiskId",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        TG_OP,
        nr."EntityId"
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;