CREATE TABLE IF NOT EXISTS risksmart.data_import_error (
    "Id" uuid default gen_random_uuid() NOT NULL PRIMARY KEY,
    "DataImportId" uuid,
    "ImportObject" text NOT NULL,
    "OrgKey" text NOT NULL,
    "RowNumber" integer NOT NULL,
    "Message" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    CONSTRAINT "data_import_error_dataImportId_fkey" FOREIGN KEY ("DataImportId") REFERENCES risksmart.data_import ("Id") ON DELETE CASCADE,
    CONSTRAINT "data_import_error_orgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation ("OrgKey"),
    CONSTRAINT "data_import_error_createdByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth."user" ("Id"),
    CONSTRAINT "data_import_error_modifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth."user" ("Id")
);

CREATE TABLE IF NOT EXISTS risksmart.data_import_error_audit (
    "Id" uuid,
    "DataImportId" uuid,
    "ImportObject" text NOT NULL,
    "OrgKey" text NOT NULL,
    "RowNumber" integer NOT NULL,
    "Message" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    "Action" risksmart.db_action,
    primary key ("Id", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.data_import_error_modified() RETURNS trigger AS $body$
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

insert into risksmart.data_import_error_audit(
        "Id",
        "DataImportId",
        "ImportObject",
        "Message",
        "OrgKey",
        "RowNumber",
        "CreatedByUser",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."DataImportId",
        nr."ImportObject",
        nr."Message",
        nr."OrgKey",
        nr."RowNumber",
        nr."CreatedByUser",
        updated_user,
        update_timestamp,
        nr."CreatedAtTimestamp",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER data_import_error_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.data_import_error FOR EACH ROW EXECUTE FUNCTION risksmart.data_import_error_modified();