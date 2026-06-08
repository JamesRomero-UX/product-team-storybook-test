CREATE TABLE IF NOT EXISTS risksmart.wizard (
  "RiskId" uuid NOT NULL PRIMARY KEY,
  "CurrentStep" INT NOT NULL,
  "OrgKey" text NOT NULL REFERENCES auth.organisation("OrgKey"),
  "CreatedByUser" text NOT NULL REFERENCES auth.user("Id"),
  "ModifiedByUser" text NOT NULL REFERENCES auth.user("Id"),
  "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
  "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL
);

CREATE TABLE IF NOT EXISTS risksmart.wizard_audit (
  "RiskId" uuid NOT NULL,
  "CurrentStep" INT NOT NULL,
  "OrgKey" text NOT NULL,
  "CreatedByUser" text NOT NULL,
  "ModifiedByUser" text NULL,
  "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
  "CreatedAtTimestamp" timestamp with time zone NOT NULL,
  "Action" risksmart.db_action,
  PRIMARY KEY ("RiskId", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.wizard_modified() RETURNS trigger AS $body$
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

insert into risksmart.wizard_audit(
        "RiskId",
        "CurrentStep",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."RiskId",
        nr."CurrentStep",
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

CREATE TRIGGER wizard_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.wizard FOR EACH ROW EXECUTE FUNCTION risksmart.wizard_modified();

ALTER TABLE risksmart.wizard_audit ENABLE ROW LEVEL SECURITY;

ALTER TABLE risksmart.wizard ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_org ON risksmart.wizard_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.wizard TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);
