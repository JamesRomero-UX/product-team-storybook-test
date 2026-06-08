CREATE TABLE IF NOT EXISTS auth.organisationuser_audit (
    "OrgKey" text NOT NULL,
    "User_Id" text NOT NULL,
    "RoleKey" text,
    "LastSeen" timestamp with time zone,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedByUser" text,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "Action" risksmart.db_action,
    primary key ("User_Id", "OrgKey", "ModifiedAtTimestamp")
);

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
        updated_user,
        update_timestamp,
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER organisationuser_audit_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON auth.organisationuser FOR EACH ROW EXECUTE FUNCTION auth.organisationuser_modified();