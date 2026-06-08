CREATE TABLE IF NOT EXISTS risksmart.recent_users (
    "OrgKey" text NOT NULL,
    "UserIds" text [] not null default '{}',
    -- losing referential integrity, but simplifying data access and checks on whether users exist is done on front end
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    primary key ("OrgKey", "CreatedByUser") -- slightly unusual, but require a max of one recent user list for a user per org
);

ALTER TABLE risksmart.recent_users
ADD CONSTRAINT "recent_user_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.recent_users
ADD CONSTRAINT "recent_user_CreatedByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.recent_users
ADD CONSTRAINT "recent_user_OrgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

CREATE TABLE IF NOT EXISTS risksmart.recent_users_audit (
    "OrgKey" text NOT NULL,
    "UserIds" text [] not null,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    "Action" risksmart.db_action,
    primary key ("OrgKey", "CreatedByUser", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.recent_users_modified() RETURNS trigger AS $body$
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

insert into risksmart.recent_users_audit(
        "OrgKey",
        "UserIds",
        "CreatedByUser",
        "ModifiedByUser",
        "CreatedAtTimestamp",
        "ModifiedAtTimestamp",
        "Action"
    )
values (
        nr."OrgKey",
        nr."UserIds",
        nr."CreatedByUser",
        updated_user,
        nr."CreatedAtTimestamp",
        update_timestamp,
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER recent_users_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.recent_users FOR EACH ROW EXECUTE FUNCTION risksmart.recent_users_modified();