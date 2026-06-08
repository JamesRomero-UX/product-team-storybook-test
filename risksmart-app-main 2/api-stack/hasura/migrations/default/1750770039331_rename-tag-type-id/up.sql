ALTER TABLE risksmart.tag_type
    RENAME COLUMN "TagTypeId" TO "Id";

ALTER TABLE risksmart.tag_type_audit
    RENAME COLUMN "TagTypeId" TO "Id";

CREATE OR REPLACE FUNCTION risksmart.tag_type_modified() RETURNS trigger AS $body$
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

insert into risksmart.tag_type_audit(
        "Id",
        "Name",
        "Description",
        "OrgKey",
        "TagTypeGroupId",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."Name",
        nr."Description",
        nr."OrgKey",
        nr."TagTypeGroupId",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;