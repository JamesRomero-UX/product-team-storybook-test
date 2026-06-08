-- Create auth.role table
CREATE TABLE IF NOT EXISTS auth.role (
    "Id" text NOT NULL PRIMARY KEY,
    "OrgKey" text NOT NULL,
    "Name" text NOT NULL,
    "Description" text,
    "PermitInstanceRoleKey" text,
    "PermitTopLevelRoleKey" text,
    "PermitResourceType" text NOT NULL,
    "PermitEntityType" text,
    "CreatedByUser" text,
    "CreatedAtTimestamp" timestamp with time zone DEFAULT statement_timestamp() NOT NULL,
    "ModifiedByUser" text,
    "ModifiedAtTimestamp" timestamp with time zone DEFAULT statement_timestamp() NOT NULL,
    CONSTRAINT "role_org_key_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey"),
    CONSTRAINT "role_created_by_user_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id"),
    CONSTRAINT "role_modified_by_user_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id")
);

CREATE INDEX "idx_role_orgkey" on auth.role("OrgKey");

-- Create auth.user_role table
CREATE TABLE IF NOT EXISTS auth.user_role (
    "Id" text NOT NULL PRIMARY KEY,
    "UserId" text NOT NULL,
    "RoleId" text NOT NULL,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text,
    "CreatedAtTimestamp" timestamp with time zone DEFAULT statement_timestamp() NOT NULL,
    "ModifiedByUser" text,
    "ModifiedAtTimestamp" timestamp with time zone DEFAULT statement_timestamp() NOT NULL,
    CONSTRAINT "user_role_user_id_fkey" FOREIGN KEY ("UserId") REFERENCES auth.user("Id") ON DELETE CASCADE,
    CONSTRAINT "user_role_role_id_fkey" FOREIGN KEY ("RoleId") REFERENCES auth.role("Id") ON DELETE CASCADE,
    CONSTRAINT "user_role_org_key_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey"),
    CONSTRAINT "user_role_created_by_user_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id"),
    CONSTRAINT "user_role_modified_by_user_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id"),
    CONSTRAINT "user_role_unique_constraint" UNIQUE ("UserId", "RoleId", "OrgKey")
);

-- Create auth.role_audit table
CREATE TABLE IF NOT EXISTS auth.role_audit (
    "Id" text NOT NULL,
    "OrgKey" text,
    "Name" text,
    "Description" text,
    "PermitInstanceRoleKey" text,
    "PermitTopLevelRoleKey" text,
    "PermitResourceType" text,
    "PermitEntityType" text,
    "CreatedByUser" text,
    "CreatedAtTimestamp" timestamp with time zone,
    "ModifiedByUser" text,
    "ModifiedAtTimestamp" timestamp with time zone DEFAULT statement_timestamp() NOT NULL,
    "Action" risksmart.db_action,
    PRIMARY KEY ("Id", "ModifiedAtTimestamp")
);

-- Create auth.user_role_audit table
CREATE TABLE IF NOT EXISTS auth.user_role_audit (
    "Id" text NOT NULL,
    "UserId" text,
    "RoleId" text,
    "OrgKey" text,
    "CreatedByUser" text,
    "CreatedAtTimestamp" timestamp with time zone,
    "ModifiedByUser" text,
    "ModifiedAtTimestamp" timestamp with time zone DEFAULT statement_timestamp() NOT NULL,
    "Action" risksmart.db_action,
    PRIMARY KEY ("Id", "ModifiedAtTimestamp")
);

-- Create audit trigger function for auth.role
CREATE OR REPLACE FUNCTION auth.role_modified() RETURNS trigger AS $body$
DECLARE nr RECORD;

DECLARE updated_user TEXT;

DECLARE update_timestamp timestamp with time zone;

BEGIN IF (
    TG_OP = 'INSERT'
    OR TG_OP = 'UPDATE'
) THEN nr := NEW;

updated_user := NEW."ModifiedByUser";

update_timestamp := NEW."ModifiedAtTimestamp";

ELSIF (TG_OP = 'DELETE') THEN nr := OLD;

updated_user := risksmart.get_hasura_user_id();

update_timestamp := statement_timestamp();

END IF;

INSERT INTO auth.role_audit (
        "Id",
        "OrgKey",
        "Name",
        "Description",
        "PermitInstanceRoleKey",
        "PermitTopLevelRoleKey",
        "PermitResourceType",
        "PermitEntityType",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "Action"
    )
VALUES (
        nr."Id",
        nr."OrgKey",
        nr."Name",
        nr."Description",
        nr."PermitInstanceRoleKey",
        nr."PermitTopLevelRoleKey",
        nr."PermitResourceType",
        nr."PermitEntityType",
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        updated_user,
        update_timestamp,
        TG_OP
    );

RETURN NULL;

END;

$body$ LANGUAGE plpgsql;

-- Create audit trigger function for auth.user_role
CREATE OR REPLACE FUNCTION auth.user_role_modified() RETURNS trigger AS $body$
DECLARE nr RECORD;

DECLARE updated_user TEXT;

DECLARE update_timestamp timestamp with time zone;

BEGIN IF (
    TG_OP = 'INSERT'
    OR TG_OP = 'UPDATE'
) THEN nr := NEW;

updated_user := NEW."ModifiedByUser";

update_timestamp := NEW."ModifiedAtTimestamp";

ELSIF (TG_OP = 'DELETE') THEN nr := OLD;

updated_user := risksmart.get_hasura_user_id();

update_timestamp := statement_timestamp();

END IF;

INSERT INTO auth.user_role_audit (
        "Id",
        "UserId",
        "RoleId",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "Action"
    )
VALUES (
        nr."Id",
        nr."UserId",
        nr."RoleId",
        nr."OrgKey",
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        updated_user,
        update_timestamp,
        TG_OP
    );

RETURN NULL;

END;

$body$ LANGUAGE plpgsql;

-- Create audit triggers
CREATE TRIGGER role_audit_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON auth.role FOR EACH ROW EXECUTE FUNCTION auth.role_modified();

CREATE TRIGGER user_role_audit_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON auth.user_role FOR EACH ROW EXECUTE FUNCTION auth.user_role_modified();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_role_user_id ON auth.user_role("UserId");

CREATE INDEX IF NOT EXISTS idx_user_role_role_id ON auth.user_role("RoleId");

CREATE INDEX IF NOT EXISTS idx_user_role_org_key ON auth.user_role("OrgKey");

CREATE INDEX IF NOT EXISTS idx_role_permit_resource_type ON auth.role("PermitResourceType");

-- Enable row-level security on all tables
ALTER TABLE auth.role ENABLE ROW LEVEL SECURITY;

ALTER TABLE auth.user_role ENABLE ROW LEVEL SECURITY;

ALTER TABLE auth.role_audit ENABLE ROW LEVEL SECURITY;

ALTER TABLE auth.user_role_audit ENABLE ROW LEVEL SECURITY;

-- Create row-level security policies for reporting role
CREATE POLICY own_org ON auth.role TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON auth.user_role TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON auth.role_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON auth.user_role_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

-- Create row-level security policies for trpc role
CREATE POLICY own_org_rw ON auth.role TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON auth.user_role TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON auth.role_audit TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON auth.user_role_audit TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);