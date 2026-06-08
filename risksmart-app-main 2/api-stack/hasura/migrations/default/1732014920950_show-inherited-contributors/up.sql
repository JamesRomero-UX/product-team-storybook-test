ALTER TABLE risksmart.user_search_preferences
ADD COLUMN "ShowInheritedContributors" boolean not null default(false);

ALTER TABLE risksmart.user_search_preferences_audit
ADD COLUMN "ShowInheritedContributors" boolean not null default(false);

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
        "ShowInheritedContributors",
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
        nr."ShowInheritedContributors",
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