ALTER TABLE risksmart.recent_users
    RENAME TO user_search_preferences;

ALTER TABLE risksmart.recent_users_audit
    RENAME TO user_search_preferences_audit;

ALTER TABLE risksmart.user_search_preferences
    RENAME COLUMN "UserIds" TO "RecentUserIds";

ALTER TABLE risksmart.user_search_preferences_audit
    RENAME COLUMN "UserIds" TO "RecentUserIds";

ALTER TABLE risksmart.user_search_preferences
ADD COLUMN "ShowGroups" boolean not null DEFAULT true,
    ADD COLUMN "FilterByActivePlatformUsers" boolean not null DEFAULT false,
    ADD COLUMN "ShowUserPlatformRole" boolean not null DEFAULT true,
    ADD COLUMN "ShowUserJobTitle" boolean not null DEFAULT false,
    ADD COLUMN "ShowDirectoryDepartment" boolean not null DEFAULT false,
    ADD COLUMN "ShowUserLocation" boolean not null DEFAULT false,
    ADD COLUMN "ShowUserEmail" boolean not null DEFAULT true;

ALTER TABLE risksmart.user_search_preferences_audit
ADD COLUMN "ShowGroups" boolean not null DEFAULT true,
    ADD COLUMN "FilterByActivePlatformUsers" boolean not null DEFAULT false,
    ADD COLUMN "ShowUserPlatformRole" boolean not null DEFAULT true,
    ADD COLUMN "ShowUserJobTitle" boolean not null DEFAULT false,
    ADD COLUMN "ShowDirectoryDepartment" boolean not null DEFAULT false,
    ADD COLUMN "ShowUserLocation" boolean not null DEFAULT false,
    ADD COLUMN "ShowUserEmail" boolean not null DEFAULT true;

CREATE OR REPLACE FUNCTION risksmart.user_search_preferences_modified() RETURNS trigger AS $body$
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

insert into risksmart.user_search_preferences_audit(
        "OrgKey",
        "RecentUserIds",
        "ShowGroups",
        "FilterByActivePlatformUsers",
        "ShowUserPlatformRole",
        "ShowUserJobTitle",
        "ShowDirectoryDepartment",
        "ShowUserLocation",
        "ShowUserEmail",
        "CreatedByUser",
        "ModifiedByUser",
        "CreatedAtTimestamp",
        "ModifiedAtTimestamp",
        "Action"
    )
values (
        nr."OrgKey",
        nr."RecentUserIds",
        nr."ShowGroups",
        nr."FilterByActivePlatformUsers",
        nr."ShowUserPlatformRole",
        nr."ShowUserJobTitle",
        nr."ShowDirectoryDepartment",
        nr."ShowUserLocation",
        nr."ShowUserEmail",
        nr."CreatedByUser",
        updated_user,
        nr."CreatedAtTimestamp",
        update_timestamp,
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER user_search_preferences_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.user_search_preferences FOR EACH ROW EXECUTE FUNCTION risksmart.user_search_preferences_modified();

drop trigger recent_users_audit_trigger ON risksmart.user_search_preferences;

drop function risksmart.recent_users_modified;