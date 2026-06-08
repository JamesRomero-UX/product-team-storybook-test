ALTER TABLE risksmart."questionnaire_invite" -- Parent is the third party response
ADD COLUMN "ParentId" uuid NOT NULL REFERENCES risksmart."third_party_response"("Id"),
    DROP COLUMN "StartDate",
    DROP COLUMN "ExpiresAt";

ALTER TABLE risksmart."questionnaire_invite_audit"
ADD COLUMN "ParentId" uuid,
    DROP COLUMN "StartDate",
    DROP COLUMN "ExpiresAt";

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

-- Update third-party reponse
ALTER TABLE risksmart."third_party_response" DROP COLUMN "UserId",
    ADD COLUMN "StartDate" timestamp with time zone,
    ADD COLUMN "ExpiresAt" timestamp with time zone;

ALTER TABLE risksmart."third_party_response_audit" DROP COLUMN "UserId",
    ADD COLUMN "StartDate" timestamp with time zone,
    ADD COLUMN "ExpiresAt" timestamp with time zone;

CREATE OR REPLACE FUNCTION risksmart.third_party_response_modified() RETURNS TRIGGER AS $body$
DECLARE anr RECORD;

DECLARE a_updated_user TEXT;

DECLARE a_update_timestamp TIMESTAMP WITH TIME ZONE;

BEGIN IF (
    TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
) THEN anr := NEW;

a_updated_user := NEW."ModifiedByUser";

a_update_timestamp := NEW."ModifiedAtTimestamp";

ELSIF (TG_OP = 'DELETE') THEN anr := OLD;

a_updated_user := risksmart.get_hasura_user_id();

a_update_timestamp := STATEMENT_TIMESTAMP();

END IF;

INSERT INTO risksmart.third_party_response_audit(
        "Id",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action",
        "ThirdPartyId",
        "QuestionnaireTemplateVersionId",
        "Status",
        "ResponseData",
        "StartDate",
        "ExpiresAt"
    )
VALUES (
        anr."Id",
        anr."OrgKey",
        a_updated_user,
        a_update_timestamp,
        anr."CreatedByUser",
        anr."CreatedAtTimestamp",
        TG_OP,
        anr."ThirdPartyId",
        anr."QuestionnaireTemplateVersionId",
        anr."Status",
        anr."ResponseData",
        anr."StartDate",
        anr."ExpiresAt"
    );

RETURN anr;

END;

$body$ LANGUAGE plpgsql;