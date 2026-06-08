
ALTER TABLE risksmart.attestation_config ADD COLUMN "PromptText" TEXT;
ALTER TABLE risksmart.attestation_config_audit ADD COLUMN "PromptText" TEXT;

CREATE OR REPLACE FUNCTION risksmart.attestation_config_modified()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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

insert into risksmart.attestation_config_audit(
        "ParentId",
        "RequireGlobalAttestation",
        "AttestationTimeLimit",
        "PromptText",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."ParentId",
        nr."RequireGlobalAttestation",
        nr."AttestationTimeLimit",
        nr."PromptText",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        TG_OP
    );

RETURN nr;

END;

$function$
;
