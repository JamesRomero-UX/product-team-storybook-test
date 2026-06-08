ALTER TABLE risksmart.document_audit ADD COLUMN "RequireGlobalAttestation" BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE risksmart.document_audit ADD COLUMN "AttestationTimeLimit" INTERVAL NOT NULL DEFAULT '1 year';

CREATE OR REPLACE FUNCTION risksmart.document_modified()
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

insert into risksmart.document_audit(
        "Id",
        "CustomAttributeData",
        "Title",
        "DocumentType",
        "Purpose",
        "ParentDocument",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Meta",
        "Action",
        "SequentialId",
        "LatestRatingDate",
        "NextTestDate",
        "TestFrequency",
        "RequireGlobalAttestation",
        "AttestationTimeLimit"
    )
values (
        nr."Id",
        nr."CustomAttributeData",
        nr."Title",
        nr."DocumentType",
        nr."Purpose",
        nr."ParentDocument",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        nr."Meta",
        TG_OP,
        nr."SequentialId",
        nr."LatestRatingDate",
        nr."NextTestDate",
        nr."TestFrequency",
        nr."RequireGlobalAttestation",
        nr."AttestationTimeLimit"
    );

RETURN nr;

END;

$function$
;
