ALTER TABLE risksmart.document_file ADD COLUMN "PublishedDate" timestamp with time zone;
ALTER TABLE risksmart.document_file_audit ADD COLUMN "PublishedDate" timestamp with time zone;

CREATE OR REPLACE FUNCTION risksmart.document_file_modified()
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

insert into risksmart.document_file_audit(
        "Id",
        "Version",
        "FileId",
        "Summary",
        "Status",
        "PublishedDate",
        "ReasonForReview",
        "ReviewedBy",
        "ReviewDate",
        "NextReviewDate",
        "ParentDocumentId",
        "Content",
        "Type",
        "Link",
        "CustomAttributeData",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Meta",
        "Action"
    )
values (
        nr."Id",
        nr."Version",
        nr."FileId",
        nr."Summary",
        nr."Status",
        nr."PublishedDate",
        nr."ReasonForReview",
        nr."ReviewedBy",
        nr."ReviewDate",
        nr."NextReviewDate",
        nr."ParentDocumentId",
        nr."Content",
        nr."Type",
        nr."Link",
        nr."CustomAttributeData",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        nr."Meta",
        TG_OP
    );

RETURN nr;

END;

$function$
;
