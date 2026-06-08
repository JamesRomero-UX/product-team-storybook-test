CREATE TABLE IF NOT EXISTS auth.organisation_audit (
    "OrgKey" text NOT NULL,
    "Name" text,
    "AuthTenant" text,
    "Meta" text,
    "CreatedByUser" text,
    "CreatedOn" timestamp with time zone default statement_timestamp() NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "Action" risksmart.db_action,
    primary key ("OrgKey", "ModifiedAtTimestamp")
);

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
        "CreatedByUser",
        "CreatedOn",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "Action"
    )
VALUES (
        nr."OrgKey",
        nr."Name",
        nr."AuthTenant",
        nr."Meta",
        nr."CreatedByUser",
        nr."CreatedOn",
        updated_user,
        update_timestamp,
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER organisation_audit_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON auth.organisation FOR EACH ROW EXECUTE FUNCTION auth.organisation_modified();