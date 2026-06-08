CREATE TABLE IF NOT EXISTS auth.user_audit (
    "Id" text NOT NULL,
    "FirstName" text,
    "LastName" text,
    "Email" text,
    "UserName" text,
    "Status" text,
    "Meta" text,
    "AuthUser_Id" text,
    "External_Id" text,
    "DisplayName" text,
    "JobTitle" text,
    "Department" text,
    "OfficeLocation" text,
    "CreatedByUser" text,
    "CreatedOn" timestamp with time zone default statement_timestamp() NOT NULL,
    "ModifiedByUser" text NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "Action" risksmart.db_action,
    primary key ("Id", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION auth.user_modified() RETURNS trigger AS $body$
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

INSERT INTO auth.user_audit (
        "Id",
        "FirstName",
        "LastName",
        "Email",
        "UserName",
        "Status",
        "Meta",
        "AuthUser_Id",
        "External_Id",
        "DisplayName",
        "JobTitle",
        "Department",
        "OfficeLocation",
        "CreatedByUser",
        "CreatedOn",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "Action"
    )
VALUES (
        nr."Id",
        nr."FirstName",
        nr."LastName",
        nr."Email",
        nr."UserName",
        nr."Status",
        nr."Meta",
        nr."AuthUser_Id",
        nr."External_Id",
        nr."DisplayName",
        nr."JobTitle",
        nr."Department",
        nr."OfficeLocation",
        nr."CreatedByUser",
        nr."CreatedOn",
        updated_user,
        update_timestamp,
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER user_audit_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON auth.user FOR EACH ROW EXECUTE FUNCTION auth.user_modified();