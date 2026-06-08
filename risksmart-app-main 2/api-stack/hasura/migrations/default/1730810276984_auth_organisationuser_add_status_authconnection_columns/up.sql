ALTER TABLE auth.organisationuser
ADD COLUMN IF NOT EXISTS "Status" text DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS "AuthConnection" text,
    ADD COLUMN IF NOT EXISTS "AuthConnection_Id" text,
    ADD CONSTRAINT "User_status_fkey" FOREIGN KEY ("Status") REFERENCES auth.user_status("Value");

ALTER TABLE auth.organisationuser_audit
ADD COLUMN IF NOT EXISTS "Status" text,
    ADD COLUMN IF NOT EXISTS "AuthConnection" text,
    ADD COLUMN IF NOT EXISTS "AuthConnection_Id" text;

-- Audit trigger
CREATE OR REPLACE FUNCTION auth.organisationuser_modified() RETURNS trigger AS $body$
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

INSERT INTO auth.organisationuser_audit (
        "OrgKey",
        "User_Id",
        "RoleKey",
        "LastSeen",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Status",
        "AuthConnection",
        "AuthConnection_Id",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "Action"
    )
VALUES (
        nr."OrgKey",
        nr."User_Id",
        nr."RoleKey",
        nr."LastSeen",
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        nr."Status",
        nr."AuthConnection",
        nr."AuthConnection_Id",
        updated_user,
        update_timestamp,
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

UPDATE auth.organisationuser
SET "Status" = auth.user."Status",
    "AuthConnection" = auth.user."AuthConnection",
    "AuthConnection_Id" = auth.user."AuthConnection_Id",
    "ModifiedByUser" = 'SYSTEM',
    "ModifiedAtTimestamp" = now()
FROM auth.user
WHERE auth.organisationuser."User_Id" = auth.user."Id";