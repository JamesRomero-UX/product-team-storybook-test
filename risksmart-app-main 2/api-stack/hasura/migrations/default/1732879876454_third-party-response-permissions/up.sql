ALTER TABLE risksmart.third_party_response
    RENAME COLUMN "ThirdPartyId" TO "ParentId";

ALTER TABLE risksmart.third_party_response_audit
    RENAME COLUMN "ThirdPartyId" TO "ParentId";

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
        anr."ParentId",
        anr."QuestionnaireTemplateVersionId",
        anr."Status",
        anr."ResponseData",
        anr."StartDate",
        anr."ExpiresAt"
    );

RETURN anr;

END;

$body$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER linked_item_insert_trigger
AFTER
INSERT ON risksmart.third_party_response REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_insert_with_parentid();

CREATE OR REPLACE TRIGGER linked_item_delete_trigger
AFTER DELETE ON risksmart.third_party_response REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE PROCEDURE risksmart.linked_item_delete_with_parentid();

CREATE OR REPLACE TRIGGER linked_item_update_trigger
AFTER
UPDATE ON risksmart.third_party_response FOR EACH ROW EXECUTE PROCEDURE risksmart.linked_item_update_with_parentid();

INSERT INTO risksmart.role_access (
        "RoleKey",
        "ObjectType",
        "ContributorType",
        "AccessType"
    )
VALUES -- Read
    (
        'Standard',
        'third_party_response',
        'owner',
        'read'
    ),
    (
        'Standard',
        'third_party_response',
        'contributor',
        'read'
    ),
    (
        'StandardEnhanced',
        'third_party_response',
        'owner',
        'read'
    ),
    (
        'StandardEnhanced',
        'third_party_response',
        'contributor',
        'read'
    ),
    -- Insert
    (
        'Standard',
        'third_party_response',
        'owner',
        'insert'
    ),
    (
        'Standard',
        'third_party_response',
        'contributor',
        'insert'
    ),
    (
        'StandardEnhanced',
        'third_party_response',
        'owner',
        'insert'
    ),
    (
        'StandardEnhanced',
        'third_party_response',
        'contributor',
        'insert'
    ),
    (
        'InternalAudit',
        'third_party_response',
        'owner',
        'insert'
    ),
    (
        'InternalAudit',
        'third_party_response',
        'contributor',
        'insert'
    ),
    (
        'ReadOnly',
        'third_party_response',
        'owner',
        'insert'
    ),
    (
        'ReadOnly',
        'third_party_response',
        'contributor',
        'insert'
    ),
    -- Update
    (
        'Standard',
        'third_party_response',
        'owner',
        'update'
    ),
    (
        'Standard',
        'third_party_response',
        'contributor',
        'update'
    ),
    (
        'StandardEnhanced',
        'third_party_response',
        'owner',
        'update'
    ),
    (
        'StandardEnhanced',
        'third_party_response',
        'contributor',
        'update'
    ),
    (
        'InternalAudit',
        'third_party_response',
        'owner',
        'update'
    ),
    (
        'InternalAudit',
        'third_party_response',
        'contributor',
        'update'
    ),
    (
        'ReadOnly',
        'third_party_response',
        'contributor',
        'update'
    ),
    (
        'ReadOnly',
        'third_party_response',
        'owner',
        'update'
    ),
    -- Delete
    (
        'Standard',
        'third_party_response',
        'owner',
        'delete'
    ),
    (
        'StandardEnhanced',
        'third_party_response',
        'owner',
        'delete'
    ),
    (
        'ReadOnly',
        'third_party_response',
        'owner',
        'delete'
    ),
    (
        'InternalAudit',
        'third_party_response',
        'owner',
        'delete'
    );