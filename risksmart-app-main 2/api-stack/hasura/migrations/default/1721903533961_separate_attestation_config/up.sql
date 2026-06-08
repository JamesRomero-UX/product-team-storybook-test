-- drop old attestation config on documents
ALTER TABLE risksmart.document DROP COLUMN "RequireGlobalAttestation";
ALTER TABLE risksmart.document DROP COLUMN "AttestationTimeLimit";
ALTER TABLE risksmart.document_audit DROP COLUMN "RequireGlobalAttestation";
ALTER TABLE risksmart.document_audit DROP COLUMN "AttestationTimeLimit";

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
        "TestFrequency"
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
        nr."TestFrequency"
    );

RETURN nr;

END;

$function$
;


-- create generic attestation config items
CREATE TABLE risksmart.attestation_config (
  "ParentId" uuid PRIMARY KEY NOT NULL REFERENCES risksmart.node("Id") ON DELETE CASCADE,
  "RequireGlobalAttestation" BOOLEAN NOT NULL DEFAULT FALSE,
  "AttestationTimeLimit" INTERVAL,
  "OrgKey" text NOT NULL REFERENCES auth.organisation("OrgKey"),
  "CreatedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp(),
  "CreatedByUser" text NOT NULL REFERENCES auth."user"("Id"),
  "ModifiedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp(),
  "ModifiedByUser" text NOT NULL REFERENCES auth."user"("Id")
);

CREATE TABLE risksmart.attestation_config_audit (LIKE risksmart.attestation_config);
ALTER TABLE risksmart.attestation_config_audit ADD PRIMARY KEY ("ParentId", "ModifiedAtTimestamp");
ALTER TABLE risksmart.attestation_config_audit ADD COLUMN "Action" risksmart.db_action;

CREATE OR REPLACE FUNCTION risksmart.attestation_config_modified() RETURNS trigger AS $body$
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

CREATE TRIGGER attestation_config_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.attestation_config FOR EACH ROW EXECUTE FUNCTION risksmart.attestation_config_modified();


-- make attestation groups link to config rather than documents
DROP TRIGGER document_attestation_group_audit_trigger ON risksmart.document_attestation_group;

ALTER TABLE risksmart.document_attestation_group RENAME TO attestation_group;
ALTER TABLE risksmart.document_attestation_group_audit RENAME TO attestation_group_audit;
ALTER TABLE risksmart.attestation_group ADD COLUMN "ConfigId" uuid REFERENCES risksmart.attestation_config("ParentId");
ALTER TABLE risksmart.attestation_group_audit ADD COLUMN "ConfigId" uuid REFERENCES risksmart.attestation_config("ParentId");
DELETE FROM risksmart.attestation_group_audit;
DELETE FROM risksmart.attestation_group;
ALTER TABLE risksmart.attestation_group DROP COLUMN "DocumentId";
ALTER TABLE risksmart.attestation_group_audit DROP COLUMN "DocumentId";
ALTER TABLE risksmart.attestation_group ALTER COLUMN "ConfigId" SET NOT NULL;


-- audit trigger update
DROP FUNCTION risksmart.document_attestation_group_modified;

CREATE OR REPLACE FUNCTION risksmart.attestation_group_modified() RETURNS trigger AS $body$
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

insert into risksmart.attestation_group_audit(
        "ConfigId",
        "GroupId",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."ConfigId",
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

CREATE TRIGGER attestation_group_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.attestation_group FOR EACH ROW EXECUTE FUNCTION risksmart.attestation_group_modified();
