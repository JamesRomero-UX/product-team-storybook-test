CREATE OR REPLACE FUNCTION risksmart.questionnaire_invite_modified() RETURNS trigger LANGUAGE plpgsql AS $function$
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

insert into risksmart.questionnaire_invite_audit(
        "Id",
        "ThirdPartyId",
        "ParentId",
        "UserEmail",
        "UserId",
        "Message",
        "QuestionnaireTemplateVersionId",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."ThirdPartyId",
        nr."ParentId",
        nr."UserEmail",
        nr."UserId",
        nr."Message",
        nr."QuestionnaireTemplateVersionId",
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