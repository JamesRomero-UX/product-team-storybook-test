

CREATE TABLE risksmart.questionnaire_invite (
  "Id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "ThirdPartyId" uuid NOT NULL REFERENCES risksmart.third_party("Id"),
  "UserEmail" text NOT NULL,
  "QuestionnaireTemplateVersionId" uuid NOT NULL REFERENCES risksmart.questionnaire_template_version("Id"),
  "StartDate" timestamp with time zone,
  "ExpiresAt" timestamp with time zone,
  "OrgKey" text NOT NULL REFERENCES auth.organisation("OrgKey"),
  "CreatedByUser" text NOT NULL REFERENCES auth."user"("Id"),
  "ModifiedByUser" text NOT NULL REFERENCES auth."user"("Id"),
  "ModifiedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp(),
  "CreatedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp()
);

CREATE TABLE risksmart.questionnaire_invite_audit (LIKE risksmart.questionnaire_invite);
ALTER TABLE risksmart.questionnaire_invite_audit ADD PRIMARY KEY ("Id", "ModifiedAtTimestamp");
ALTER TABLE risksmart.questionnaire_invite_audit ADD COLUMN "Action" risksmart.db_action;

CREATE OR REPLACE FUNCTION risksmart.questionnaire_invite_modified()
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

insert into risksmart.questionnaire_invite_audit(
    "Id",
    "ThirdPartyId",
    "UserEmail",
    "QuestionnaireTemplateVersionId",
    "StartDate",
    "ExpiresAt",
    "OrgKey",
    "CreatedByUser",
    "CreatedAtTimestamp",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "Action"
) values (
        nr."Id",
        nr."ThirdPartyId",
        nr."UserEmail",
        nr."QuestionnaireTemplateVersionId",
        nr."StartDate",
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


CREATE TRIGGER questionnaire_invite_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.questionnaire_invite FOR EACH ROW EXECUTE FUNCTION risksmart.questionnaire_invite_modified();
