
CREATE TABLE risksmart.attestation_record_status (
    "Value" text PRIMARY KEY,
    "Comment" text NOT NULL
);

INSERT INTO risksmart.attestation_record_status ("Value", "Comment") VALUES ('pending', 'Waiting for attestation');
INSERT INTO risksmart.attestation_record_status ("Value", "Comment") VALUES ('attested', 'User has attested');
INSERT INTO risksmart.attestation_record_status ("Value", "Comment") VALUES ('expired', 'The due date has expired');
INSERT INTO risksmart.attestation_record_status ("Value", "Comment") VALUES ('not_required', 'Attestation is cancelled');

CREATE TABLE risksmart.attestation_record (
  "Id" uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "DocumentFileId" uuid NOT NULL REFERENCES risksmart.document_file("Id"),
  "UserId" text NOT NULL REFERENCES auth."user"("Id") ON DELETE CASCADE,
  "Active" boolean NOT NULL DEFAULT true,
  "AttestationStatus" text NOT NULL REFERENCES risksmart.attestation_record_status("Value") ON DELETE RESTRICT,
  "AttestedAt" timestamp with time zone,
  "ExpiresAt" timestamp with time zone NOT NULL,
  "OrgKey" text NOT NULL REFERENCES auth.organisation("OrgKey"),
  "CreatedByUser" text NOT NULL REFERENCES auth."user"("Id"),
  "ModifiedByUser" text NOT NULL REFERENCES auth."user"("Id"),
  "ModifiedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp(),
  "CreatedAtTimestamp" timestamp with time zone NOT NULL DEFAULT statement_timestamp()
);

CREATE TABLE risksmart.attestation_record_audit (LIKE risksmart.attestation_record);
ALTER TABLE risksmart.attestation_record_audit ADD PRIMARY KEY ("Id", "ModifiedAtTimestamp");
ALTER TABLE risksmart.attestation_record_audit ADD COLUMN "Action" risksmart.db_action;

CREATE OR REPLACE FUNCTION risksmart.attestation_record_modified()
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

insert into risksmart.attestation_record_modified(
    "Id",
    "DocumentFileId",
    "UserId",
    "Active",
    "AttestationStatus",
    "AttestedAt",
    "ExpiresAt",
    "OrgKey",
    "CreatedByUser",
    "CreatedAtTimestamp",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "Action"
) values (
        nr."Id",
        nr."DocumentFileId",
        nr."UserId",
        nr."Active",
        nr."AttestationStatus",
        nr."AttestedAt",
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


CREATE TRIGGER attestation_record_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.attestation_record FOR EACH ROW EXECUTE FUNCTION risksmart.attestation_record_modified();
