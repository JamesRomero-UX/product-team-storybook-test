ALTER TABLE risksmart.aggregation_org
ADD COLUMN "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    ADD COLUMN "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    ADD COLUMN "CreatedByUser" text NULL REFERENCES auth.user("Id"),
    ADD COLUMN "ModifiedByUser" text NULL REFERENCES auth.user("Id");

CREATE TABLE IF NOT EXISTS risksmart.aggregation_org_audit (
    "OrgKey" text,
    "RiskScoringModel" text,
    "Appetite" text,
    "Config" jsonb,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedByUser" text,
    "ModifiedByUser" text,
    "Action" risksmart.db_action,
    PRIMARY KEY ("OrgKey", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.aggregation_org_modified() RETURNS trigger AS $body$
DECLARE nr RECORD;

DECLARE updated_user TEXT;

DECLARE update_timestamp timestamp with time zone;

BEGIN IF (
    TG_OP = 'INSERT'
    OR TG_OP = 'UPDATE'
) THEN nr := NEW;

updated_user := NEW."ModifiedByUser";

update_timestamp := NEW."ModifiedAtTimestamp";

ELSIF (TG_OP = 'DELETE') THEN nr := OLD;

updated_user := risksmart.get_hasura_user_id();

update_timestamp := statement_timestamp();

END IF;

INSERT INTO risksmart.aggregation_org_audit (
        "OrgKey",
        "RiskScoringModel",
        "Appetite",
        "Config",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "CreatedByUser",
        "ModifiedByUser",
        "Action"
    )
VALUES (
        nr."OrgKey",
        nr."RiskScoringModel",
        nr."Appetite",
        nr."Config",
        update_timestamp,
        nr."CreatedAtTimestamp",
        nr."CreatedByUser",
        updated_user,
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER aggregation_org_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.aggregation_org FOR EACH ROW EXECUTE FUNCTION risksmart.aggregation_org_modified();

ALTER TABLE risksmart.linked_item
ADD COLUMN "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    ADD COLUMN "ModifiedByUser" text NULL REFERENCES auth.user("Id");

CREATE OR REPLACE FUNCTION risksmart.linked_item_modified() RETURNS trigger AS $body$
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

insert into risksmart.linked_item_audit(
        "Source",
        "Target",
        "RelationshipType",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "Action",
        "Id"
    )
values (
        nr."Source",
        nr."Target",
        nr."RelationshipType",
        nr."OrgKey",
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        updated_user,
        update_timestamp,
        TG_OP,
        nr."Id"
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

ALTER TABLE auth.organisation
    RENAME COLUMN "CreatedOn" TO "CreatedAtTimestamp";

ALTER TABLE auth.organisation_audit
    RENAME COLUMN "CreatedOn" TO "CreatedAtTimestamp";

CREATE OR REPLACE FUNCTION auth.organisation_modified() RETURNS trigger AS $body$
DECLARE nr RECORD;

DECLARE updated_user TEXT;

DECLARE update_timestamp timestamp with time zone;

BEGIN IF (
    TG_OP = 'INSERT'
    OR TG_OP = 'UPDATE'
) THEN nr := NEW;

updated_user := NEW."ModifiedByUser";

update_timestamp := NEW."ModifiedAtTimestamp";

ELSIF (TG_OP = 'DELETE') THEN nr := OLD;

updated_user := risksmart.get_hasura_user_id();

update_timestamp := statement_timestamp();

END IF;

INSERT INTO auth.organisation_audit (
        "OrgKey",
        "Name",
        "AuthTenant",
        "Meta",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "Action"
    )
VALUES (
        nr."OrgKey",
        nr."Name",
        nr."AuthTenant",
        nr."Meta",
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        updated_user,
        update_timestamp,
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

ALTER TABLE risksmart.risk_score
ADD COLUMN "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
    ADD COLUMN "CreatedByUser" text NULL REFERENCES auth.user("Id"),
    ADD COLUMN "ModifiedByUser" text NULL REFERENCES auth.user("Id");

-- We don't know when the score was created, so just setting to latest update for now
UPDATE risksmart.risk_score
SET "CreatedAtTimestamp" = "ModifiedAtTimestamp";

CREATE TABLE IF NOT EXISTS risksmart.risk_score_audit (
    "RiskId" uuid NOT NULL,
    "ResidualScore" double precision,
    "InherentScore" double precision,
    "OrgKey" text NOT NULL,
    "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedAtTimestamp" timestamp with time zone NOT NULL,
    "CreatedByUser" text,
    "ModifiedByUser" text,
    "Action" risksmart.db_action,
    PRIMARY KEY ("RiskId", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.risk_score_modified() RETURNS trigger AS $body$
DECLARE nr RECORD;

DECLARE updated_user TEXT;

DECLARE update_timestamp timestamp with time zone;

BEGIN IF (
    TG_OP = 'INSERT'
    OR TG_OP = 'UPDATE'
) THEN nr := NEW;

updated_user := NEW."ModifiedByUser";

update_timestamp := NEW."ModifiedAtTimestamp";

ELSIF (TG_OP = 'DELETE') THEN nr := OLD;

updated_user := risksmart.get_hasura_user_id();

update_timestamp := statement_timestamp();

END IF;

INSERT INTO risksmart.risk_score_audit (
        "RiskId",
        "ResidualScore",
        "InherentScore",
        "OrgKey",
        "ModifiedAtTimestamp",
        "CreatedAtTimestamp",
        "CreatedByUser",
        "ModifiedByUser",
        "Action"
    )
VALUES (
        nr."RiskId",
        nr."ResidualScore",
        nr."InherentScore",
        nr."OrgKey",
        update_timestamp,
        nr."CreatedAtTimestamp",
        nr."CreatedByUser",
        updated_user,
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER risk_score_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.risk_score FOR EACH ROW EXECUTE FUNCTION risksmart.risk_score_modified();

ALTER TABLE risksmart.change_request_contributor
ADD COLUMN "CreatedByUser" text NULL REFERENCES auth.user("Id"),
    ADD COLUMN "ModifiedByUser" text NULL REFERENCES auth.user("Id");

ALTER TABLE risksmart.change_request_contributor_audit
ADD COLUMN "CreatedByUser" text NULL,
    ADD COLUMN "ModifiedByUser" text NULL;

CREATE OR REPLACE FUNCTION risksmart.change_request_contributor_modified() RETURNS trigger AS $body$
DECLARE nr RECORD;

DECLARE updated_user TEXT;

DECLARE update_timestamp timestamp with time zone;

BEGIN IF (
    TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
) then nr := NEW;

update_timestamp := NEW."ModifiedAtTimestamp";

ELSEIF (TG_OP = 'DELETE') THEN nr := OLD;

update_timestamp := statement_timestamp();

END IF;

insert into risksmart.change_request_contributor_audit(
        "Id",
        "OrgKey",
        "ChangeRequestId",
        "UserId",
        "CreatedAtTimestamp",
        "ModifiedAtTimestamp",
        "Action",
        "CreatedByUser"
    )
values (
        nr."Id",
        nr."OrgKey",
        nr."ChangeRequestId",
        nr."UserId",
        nr."CreatedAtTimestamp",
        update_timestamp,
        TG_OP,
        nr."CreatedByUser"
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;