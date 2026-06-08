ALTER TABLE risksmart."third_party_response"
ADD COLUMN "RecallReason" TEXT NULL;

ALTER TABLE risksmart."third_party_response_audit"
ADD COLUMN "RecallReason" TEXT NULL;

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
        "ParentId",
        "QuestionnaireTemplateVersionId",
        "Status",
        "ResponseData",
        "StartDate",
        "ExpiresAt",
        "RecallReason"
    )
VALUES (
        anr."Id",
        anr."OrgKey",
        a_updated_user,
        a_update_timestamp,
        anr."CreatedByUser",
        anr."CreatedAtTimestamp",
        TG_OP,
        anr."ParentId",
        anr."QuestionnaireTemplateVersionId",
        anr."Status",
        anr."ResponseData",
        anr."StartDate",
        anr."ExpiresAt",
        anr."RecallReason"
    );

RETURN anr;

END;

$body$ LANGUAGE plpgsql;

INSERT INTO risksmart."third_party_response_status" ("Value", "Comment")
VALUES (
        'recalled',
        'The response has been recalled by a user'
    );