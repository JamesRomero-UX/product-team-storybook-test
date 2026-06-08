INSERT INTO
  risksmart."parent_type" ("Value", "Comment")
VALUES
  ('business_area', 'Business Area');

ALTER TABLE risksmart.business_area ADD COLUMN "SequentialId" integer;
ALTER TABLE risksmart.business_area_audit ADD COLUMN "SequentialId" integer;

CREATE TRIGGER set_sequential_id_trigger BEFORE
  INSERT ON risksmart.business_area for each ROW EXECUTE PROCEDURE risksmart.set_sequential_id();

CREATE TEMP TABLE new_Ids ("Id" uuid, "SequentialId" integer);

INSERT INTO new_Ids ("Id", "SequentialId")
SELECT "Id",
       risksmart.getNextCounterValue("OrgKey", 'business_area') AS "SequentialId"
FROM risksmart.business_area
ORDER BY "CreatedAtTimestamp";

UPDATE risksmart.business_area i
SET "SequentialId" = ni."SequentialId",
    "ModifiedAtTimestamp" = statement_timestamp(),
    "ModifiedByUser" = 'SYSTEM'
FROM new_Ids ni
WHERE i."Id" = ni."Id";

DROP TABLE new_Ids;

ALTER TABLE risksmart.business_area ALTER COLUMN "SequentialId" SET NOT NULL;

CREATE UNIQUE INDEX idx_business_area_orgkey_sequentialid
  ON risksmart.business_area ("OrgKey", "SequentialId");

CREATE OR REPLACE FUNCTION risksmart.business_area_modified() RETURNS trigger AS $body$
DECLARE anr RECORD;

  DECLARE a_updated_user TEXT;

  DECLARE a_update_timestamp timestamp with time zone;

BEGIN if (
  TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
  ) then anr := NEW;

a_updated_user := NEW."ModifiedByUser";

a_update_timestamp := NEW."ModifiedAtTimestamp";

elsif (TG_OP = 'DELETE') then anr := OLD;

a_updated_user := risksmart.get_hasura_user_id();

a_update_timestamp := statement_timestamp();

END IF;

insert into risksmart.business_area_audit(
  "Id",
  "Title",
  "SequentialId",
  "OrgKey",
  "ModifiedByUser",
  "ModifiedAtTimestamp",
  "CreatedByUser",
  "CreatedAtTimestamp",
  "Action"
)
values (
         anr."Id",
         anr."Title",
         anr."SequentialId",
         anr."OrgKey",
         a_updated_user,
         a_update_timestamp,
         anr."CreatedByUser",
         anr."CreatedAtTimestamp",
         TG_OP
       );

RETURN anr;

END;

$body$ LANGUAGE plpgsql;

