CREATE TRIGGER linked_item_audit_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.linked_item FOR EACH ROW EXECUTE FUNCTION risksmart.linked_item_modified();


    CREATE OR REPLACE FUNCTION risksmart.linked_item_modified() RETURNS trigger AS $body$
DECLARE nr RECORD;

DECLARE updated_user TEXT;

DECLARE update_timestamp timestamp with time zone;

BEGIN if (
    TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
) then nr := NEW;

-- linked_item table doesn't have ModifiedAtTimestamp or ModifiedByUser, so asume only support insert
updated_user := NEW."CreatedByUser";

update_timestamp := NEW."CreatedAtTimestamp";

elsif (TG_OP = 'DELETE') then nr := OLD;

updated_user := risksmart.get_hasura_user_id();

update_timestamp := statement_timestamp();

END IF;

insert into risksmart.linked_item_audit(
        "Source",
        "Target",
        "RelationshipType",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "Action"
    )
values (
        nr."Source",
        nr."Target",
        nr."RelationshipType",
        nr."OrgKey",
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        updated_user,
        update_timestamp,
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;