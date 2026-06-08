ALTER TABLE auth.organisation
ADD COLUMN "ScimEnabled" BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE auth.organisation_audit
ADD COLUMN "ScimEnabled" BOOLEAN;

-- Audit trigger
CREATE OR REPLACE FUNCTION auth.organisation_modified() RETURNS trigger AS $body$
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

INSERT INTO auth.organisation_audit (
        "OrgKey",
        "Name",
        "AuthTenant",
        "Meta",
        "ScimEnabled",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "Action"
    )
VALUES (
        nr."OrgKey",
        nr."Name",
        nr."AuthTenant",
        nr."Meta",
        nr."ScimEnabled",
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        updated_user,
        update_timestamp,
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;