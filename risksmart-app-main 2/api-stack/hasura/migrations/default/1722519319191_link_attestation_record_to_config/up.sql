ALTER TABLE risksmart.attestation_record ADD COLUMN "ConfigId" uuid REFERENCES risksmart.attestation_config ("ParentId") ON DELETE SET NULL;
ALTER TABLE risksmart.attestation_record_audit ADD COLUMN "ConfigId" uuid;

CREATE OR REPLACE FUNCTION risksmart.attestation_record_modified()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE nr RECORD;

DECLARE updated_user TEXT;

DECLARE update_timestamp timestamp with time zone;

BEGIN IF (
    TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
) then nr := NEW;

updated_user := NEW."ModifiedByUser";

update_timestamp := NEW."ModifiedAtTimestamp";

ELSEIF (TG_OP = 'DELETE') THEN nr := OLD;

updated_user := risksmart.get_hasura_user_id();

update_timestamp := statement_timestamp();

END IF;

insert into risksmart.attestation_record_audit(
    "Id",
    "NodeId",
    "ConfigId",
    "UserId",
    "Active",
    "AttestationStatus",
    "AttestedAt",
    "ExpiresAt",
    "OrgKey",
    "CreatedByUser",
    "CreatedAtTimestamp",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "Action"
) values (
        nr."Id",
        nr."NodeId",
        nr."ConfigId",
        nr."UserId",
        nr."Active",
        nr."AttestationStatus",
        nr."AttestedAt",
        nr."ExpiresAt",
        nr."OrgKey",
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        updated_user,
        update_timestamp,
        TG_OP
    );

RETURN nr;

END;

$function$
;
