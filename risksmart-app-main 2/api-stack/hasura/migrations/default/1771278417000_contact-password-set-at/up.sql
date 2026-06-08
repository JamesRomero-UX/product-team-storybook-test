ALTER TABLE risksmart."third_party_contact"
ADD COLUMN "PasswordSetAtTimestamp" TIMESTAMPTZ;

ALTER TABLE risksmart."third_party_contact_audit"
ADD COLUMN "PasswordSetAtTimestamp" TIMESTAMPTZ;

-- Update audit trigger function to include PasswordSetAtTimestamp
CREATE OR REPLACE FUNCTION risksmart.third_party_contact_modified() RETURNS trigger LANGUAGE plpgsql AS $function$
DECLARE nr RECORD;

DECLARE updated_user TEXT;

DECLARE update_timestamp timestamp with time zone;

BEGIN IF (
  TG_OP = 'UPDATE'
  OR TG_OP = 'INSERT'
) THEN nr := NEW;

updated_user := NEW."ModifiedByUser";

update_timestamp := NEW."ModifiedAtTimestamp";

ELSIF (TG_OP = 'DELETE') THEN nr := OLD;

updated_user := risksmart.get_hasura_user_id();

update_timestamp := statement_timestamp();

END IF;

INSERT INTO risksmart.third_party_contact_audit(
    "Id",
    "ThirdPartyId",
    "Email",
    "Name",
    "JobTitle",
    "IsRevoked",
    "PasswordSetAtTimestamp",
    "UserId",
    "OrgKey",
    "CreatedByUser",
    "CreatedAtTimestamp",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "Action"
  )
VALUES (
    nr."Id",
    nr."ThirdPartyId",
    nr."Email",
    nr."Name",
    nr."JobTitle",
    nr."IsRevoked",
    nr."PasswordSetAtTimestamp",
    nr."UserId",
    nr."OrgKey",
    nr."CreatedByUser",
    nr."CreatedAtTimestamp",
    updated_user,
    update_timestamp,
    TG_OP
  );

RETURN nr;

END;

$function$;