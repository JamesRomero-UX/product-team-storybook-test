ALTER TABLE risksmart.document ADD COLUMN "RequireGlobalAttestation" BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE risksmart.document ADD COLUMN "AttestationTimeLimit" INTERVAL NOT NULL DEFAULT '1 year';

CREATE TABLE risksmart.document_attestation_group (
    "DocumentId" UUID NOT NULL REFERENCES risksmart.document ("Id") ON DELETE CASCADE,
    "GroupId" UUID NOT NULL REFERENCES risksmart.user_group ("Id") ON DELETE CASCADE,
    "OrgKey" text NOT NULL REFERENCES auth.organisation("OrgKey"),
    "CreatedByUser" text NOT NULL REFERENCES auth."user"("Id"),
    "ModifiedByUser" text NOT NULL REFERENCES auth."user"("Id"),
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp(),
    "CreatedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp(),
    PRIMARY KEY ("DocumentId", "GroupId")
);

CREATE TABLE risksmart.document_attestation_group_audit (LIKE risksmart.document_attestation_group);
ALTER TABLE risksmart.document_attestation_group_audit ADD PRIMARY KEY ("DocumentId", "GroupId", "ModifiedAtTimestamp");
ALTER TABLE risksmart.document_attestation_group_audit ADD COLUMN "Action" risksmart.db_action;


CREATE OR REPLACE FUNCTION risksmart.document_attestation_group_modified() RETURNS trigger AS $body$
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

insert into risksmart.document_attestation_group_audit(
        "DocumentId",
        "GroupId",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."DocumentId",
        nr."GroupId",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER document_attestation_group_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.document_attestation_group FOR EACH ROW EXECUTE FUNCTION risksmart.document_attestation_group_modified();

