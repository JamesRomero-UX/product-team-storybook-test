CREATE TABLE risksmart.data_import_status ("Value" text PRIMARY KEY, "Comment" text);

INSERT INTO risksmart.data_import_status ("Value", "Comment")
VALUES ('notstarted', 'Not Started'),
    ('validating', 'Validating'),
    ('failed', 'Failed'),
    ('valid', 'Valid'),
    ('importing', 'Importing'),
    ('complete', 'Complete');

CREATE TABLE IF NOT EXISTS risksmart.data_import (
    "Id" uuid default gen_random_uuid() NOT NULL PRIMARY KEY,
    "OrgKey" text NOT NULL,
    "Status" text NOT NULL DEFAULT 'notstarted',
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    CONSTRAINT "data_import_status_fkey" FOREIGN KEY ("Status") REFERENCES risksmart.data_import_status ("Value"),
    CONSTRAINT "data_import_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation ("OrgKey"),
    CONSTRAINT "data_import_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth."user" ("Id"),
    CONSTRAINT "data_import_modifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth."user" ("Id")
);

CREATE TABLE IF NOT EXISTS risksmart.data_import_audit (
    "Id" uuid NOT NULL,
    "OrgKey" text NOT NULL,
    "Status" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    "Action" risksmart.db_action,
    primary key ("Id", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.data_import_modified() RETURNS trigger AS $body$
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

insert into risksmart.data_import_audit(
        "Id",
        "OrgKey",
        "Status",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."OrgKey",
        nr."Status",
        nr."CreatedByUser",
        updated_user,
        update_timestamp,
        nr."CreatedAtTimestamp",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER data_import_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.data_import FOR EACH ROW EXECUTE FUNCTION risksmart.data_import_modified();