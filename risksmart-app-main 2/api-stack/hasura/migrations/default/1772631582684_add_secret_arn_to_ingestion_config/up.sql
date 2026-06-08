ALTER TABLE risksmart.ingestion_config ADD COLUMN "SecretArn" text;
ALTER TABLE risksmart.ingestion_config_audit ADD COLUMN "SecretArn" text;

CREATE OR REPLACE FUNCTION risksmart.ingestion_config_modified() RETURNS trigger AS $body$
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

insert into risksmart.ingestion_config_audit(
    "Id",
    "OrgKey",
    "IngestionConfig",
    "SecretArn",
    "CreatedByUser",
    "ModifiedByUser",
    "ModifiedAtTimestamp",
    "CreatedAtTimestamp",
    "Action"
  )
values (
    nr."Id",
    nr."OrgKey",
    nr."IngestionConfig",
    nr."SecretArn",
    nr."CreatedByUser",
    updated_user,
    update_timestamp,
    nr."CreatedAtTimestamp",
    TG_OP
  );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;
