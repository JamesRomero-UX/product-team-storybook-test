ALTER TABLE risksmart.department_type
    RENAME COLUMN "DepartmentTypeId" TO "Id";

ALTER TABLE risksmart.department_type_audit
    RENAME COLUMN "DepartmentTypeId" TO "Id";

CREATE OR REPLACE FUNCTION risksmart.department_type_modified() RETURNS trigger LANGUAGE 'plpgsql' AS $BODY$
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

insert into risksmart.department_type_audit(
        "Id",
        "Name",
        "Description",
        "OrgKey",
        "DepartmentTypeGroupId",
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
        nr."DepartmentTypeGroupId",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        TG_OP
    );

RETURN nr;

END;

$BODY$;