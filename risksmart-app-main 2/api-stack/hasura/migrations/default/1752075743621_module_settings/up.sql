INSERT INTO risksmart."node_type" ("Value", "Comment")
VALUES ('settings_module', 'Module Settings'),
    ('organisation_module', 'Organisation Modules'),
    ('aggregation_org', 'Aggregation settings'),
    ('user_tab_preference', 'User Tab Preference') ON CONFLICT DO NOTHING;

UPDATE risksmart."tab"
SET "Tabs" = jsonb_set(
        "Tabs"::jsonb,
        '{default}',
        "Tabs"->'default' || '{"id": "modules"}',
        true
    )
WHERE "ParentType" = 'settings';

INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES (
        'CustomerSupport',
        'settings_module',
        'any',
        'insert'
    ),
    (
        'CustomerSupport',
        'settings_module',
        'any',
        'read'
    ),
    (
        'CustomerSupport',
        'settings_module',
        'any',
        'update'
    ),
    (
        'CustomerSupport',
        'settings_module',
        'any',
        'delete'
    ),
    (
        'CustomerSupport',
        'organisation_module',
        'any',
        'insert'
    ),
    (
        'CustomerSupport',
        'organisation_module',
        'any',
        'read'
    ),
    (
        'CustomerSupport',
        'organisation_module',
        'any',
        'update'
    ),
    (
        'CustomerSupport',
        'organisation_module',
        'any',
        'delete'
    ),
    (
        'CustomerSupport',
        'aggregation_org',
        'any',
        'insert'
    ),
    (
        'CustomerSupport',
        'aggregation_org',
        'any',
        'read'
    ),
    (
        'CustomerSupport',
        'aggregation_org',
        'any',
        'update'
    ),
    (
        'CustomerSupport',
        'aggregation_org',
        'any',
        'delete'
    ),
    (
        'CustomerSupport',
        'user_tab_preference',
        'any',
        'delete'
    ),
    (
        'RiskManager',
        'user_tab_preference',
        'any',
        'delete'
    ) ON CONFLICT DO NOTHING;

CREATE TABLE risksmart."organisation_module" (
    "OrgKey" TEXT NOT NULL REFERENCES auth."organisation"("OrgKey") ON DELETE CASCADE,
    "ModuleSettings" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "CreatedAtTimestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "ModifiedAtTimestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "CreatedByUser" TEXT NOT NULL REFERENCES auth."user"("Id"),
    "ModifiedByUser" TEXT NOT NULL REFERENCES auth."user"("Id"),
    CONSTRAINT organisation_module_pkey PRIMARY KEY ("OrgKey")
);

CREATE TABLE risksmart."organisation_module_audit" (
    "OrgKey" TEXT NOT NULL,
    "ModuleSettings" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "CreatedAtTimestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "ModifiedAtTimestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "CreatedByUser" TEXT NOT NULL,
    "ModifiedByUser" TEXT NOT NULL,
    "Action" risksmart.db_action NOT NULL,
    CONSTRAINT organisation_module_audit_pkey PRIMARY KEY ("OrgKey", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.organisation_module_modified() RETURNS trigger AS $body$
DECLARE nr RECORD;

DECLARE updated_user TEXT;

DECLARE update_timestamp timestamp with time zone;

BEGIN IF (
    TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
) THEN nr := NEW;

updated_user := NEW."ModifiedByUser";

update_timestamp := NEW."ModifiedAtTimestamp";

ELSIF (TG_OP = 'DELETE') THEN nr := OLD;

updated_user := risksmart.get_hasura_user_id();

update_timestamp := statement_timestamp();

END IF;

INSERT INTO risksmart."organisation_module_audit" (
        "OrgKey",
        "ModuleSettings",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "Action"
    )
VALUES (
        nr."OrgKey",
        nr."ModuleSettings",
        updated_user,
        update_timestamp,
        updated_user,
        update_timestamp,
        risksmart.get_db_action(TG_OP)
    );

RETURN NULL;

END;

$body$ LANGUAGE plpgsql;

ALTER TABLE risksmart.organisation_module_audit ENABLE ROW LEVEL SECURITY;

ALTER TABLE risksmart.organisation_module ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER organisation_module_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.organisation_module FOR EACH ROW EXECUTE FUNCTION risksmart.organisation_module_modified();

CREATE POLICY own_org ON risksmart.organisation_module_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.organisation_module TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.organisation_module_audit TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.organisation_module TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);