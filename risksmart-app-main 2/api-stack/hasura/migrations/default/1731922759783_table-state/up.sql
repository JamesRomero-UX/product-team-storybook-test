CREATE TABLE IF NOT EXISTS risksmart.user_table_preferences (
    "TableId" text NOT NULL,
    "OrgKey" text NOT NULL REFERENCES auth.organisation("OrgKey"),
    "Preferences" JSONB NOT NULL,
    "CreatedByUser" text NOT NULL REFERENCES auth.user("Id"),
    "ModifiedByUser" text NOT NULL REFERENCES auth.user("Id"),
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    primary key ("OrgKey", "CreatedByUser", "TableId")
);

CREATE TABLE IF NOT EXISTS risksmart.user_table_preferences_audit (
    "TableId" text NOT NULL,
    "OrgKey" text,
    "Preferences" JSONB,
    "CreatedByUser" text,
    "ModifiedByUser" text,
    "ModifiedAtTimestamp" timestamp with time zone,
    "CreatedAtTimestamp" timestamp with time zone,
    "Action" risksmart.db_action,
    primary key (
        "OrgKey",
        "CreatedByUser",
        "TableId",
        "ModifiedAtTimestamp"
    )
);

CREATE OR REPLACE FUNCTION risksmart.user_table_preferences_modified() RETURNS trigger AS $body$
DECLARE anr RECORD;

DECLARE a_updated_user TEXT;

DECLARE a_update_timestamp timestamp with time zone;

BEGIN if (
    TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
) then anr := NEW;

a_updated_user := NEW."ModifiedByUser";

a_update_timestamp := NEW."ModifiedAtTimestamp";

elsif (TG_OP = 'DELETE') then anr := OLD;

a_updated_user := risksmart.get_hasura_user_id();

a_update_timestamp := statement_timestamp();

END IF;

insert into risksmart.user_table_preferences_audit(
        "TableId",
        "OrgKey",
        "Preferences",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        anr."TableId",
        anr."OrgKey",
        anr."Preferences",
        a_updated_user,
        a_update_timestamp,
        anr."CreatedByUser",
        anr."CreatedAtTimestamp",
        TG_OP
    );

RETURN anr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER user_table_preferences_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.user_table_preferences FOR EACH ROW EXECUTE PROCEDURE risksmart.user_table_preferences_modified();