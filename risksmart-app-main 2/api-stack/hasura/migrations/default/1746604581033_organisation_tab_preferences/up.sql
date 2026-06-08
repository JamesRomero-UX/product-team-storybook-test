CREATE TABLE IF NOT EXISTS risksmart.organisation_tab_preference (
    "ObjectType" TEXT NOT NULL REFERENCES risksmart.parent_type ("Value") ON DELETE CASCADE,
    "OrgKey" TEXT NOT NULL REFERENCES auth.organisation ("OrgKey") ON DELETE CASCADE,
    "Preferences" JSONB NOT NULL,
    "CreatedByUser" TEXT NOT NULL REFERENCES auth.user ("Id"),
    "CreatedAtTimestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "ModifiedAtTimestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "ModifiedByUser" TEXT NOT NULL REFERENCES auth.user ("Id"),
    CONSTRAINT organisation_tab_preference_pkey PRIMARY KEY ("ObjectType", "OrgKey")
);

CREATE TABLE IF NOT EXISTS risksmart.organisation_tab_preference_audit (
    "ObjectType" TEXT NOT NULL,
    "OrgKey" TEXT NOT NULL,
    "Preferences" JSONB NOT NULL,
    "CreatedByUser" TEXT NOT NULL,
    "CreatedAtTimestamp" TIMESTAMPTZ NOT NULL,
    "ModifiedAtTimestamp" TIMESTAMPTZ NOT NULL,
    "ModifiedByUser" TEXT NOT NULL,
    "Action" risksmart.db_action NOT NULL,
    CONSTRAINT organisation_tab_preference_audit_pkey PRIMARY KEY ("ObjectType", "OrgKey", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.organisation_tab_preference_modified() RETURNS trigger AS $body$
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

insert into risksmart.organisation_tab_preference_audit(
        "ObjectType",
        "OrgKey",
        "Preferences",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."ObjectType",
        nr."OrgKey",
        nr."Preferences",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER organisation_tab_preference_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.organisation_tab_preference FOR EACH ROW EXECUTE FUNCTION risksmart.organisation_tab_preference_modified();

ALTER TABLE risksmart.organisation_tab_preference_audit ENABLE ROW LEVEL SECURITY;

ALTER TABLE risksmart.organisation_tab_preference ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_org ON risksmart.organisation_tab_preference_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.organisation_tab_preference TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.organisation_tab_preference_audit TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.organisation_tab_preference TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

INSERT INTO risksmart.parent_type ("Value", "Comment")
VALUES (
        'organisation_tab_preference',
        'Organisation Tab Preference'
    );

INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES (
        'RiskManager',
        'organisation_tab_preference',
        'any',
        'insert'
    ),
    (
        'RiskManager',
        'organisation_tab_preference',
        'any',
        'read'
    ),
    (
        'RiskManager',
        'organisation_tab_preference',
        'any',
        'update'
    ),
    (
        'RiskManager',
        'organisation_tab_preference',
        'any',
        'delete'
    ),
    (
        'CustomerSupport',
        'organisation_tab_preference',
        'any',
        'insert'
    ),
    (
        'CustomerSupport',
        'organisation_tab_preference',
        'any',
        'read'
    ),
    (
        'CustomerSupport',
        'organisation_tab_preference',
        'any',
        'update'
    ),
    (
        'CustomerSupport',
        'organisation_tab_preference',
        'any',
        'delete'
    );