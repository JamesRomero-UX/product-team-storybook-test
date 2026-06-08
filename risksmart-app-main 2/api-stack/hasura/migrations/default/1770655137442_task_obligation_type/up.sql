/****************************
 * Add task obligation type
 ****************************/
INSERT INTO risksmart.obligation_type ("Value", "Comment")
VALUES ('task', 'Task');

/****************************
 * Add regulatory_source
 ****************************/
CREATE TABLE IF NOT EXISTS risksmart.regulatory_source (
    "Id" UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    "ExternalRegulatorId" text NOT NULL,
    "RegulatorName" text NOT NULL,
    "ProviderName" text NOT NULL,
    "OrgKey" text NOT NULL REFERENCES auth.organisation("OrgKey"),
    "CreatedByUser" text NOT NULL REFERENCES auth."user"("Id"),
    "ModifiedByUser" text NOT NULL REFERENCES auth."user"("Id"),
    "CreatedAtTimestamp" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "ModifiedAtTimestamp" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "externalRegulatorId_regulatorName_providerName_orgKey_unique" UNIQUE (
        "ExternalRegulatorId",
        "ProviderName",
        "OrgKey"
    )
);

-- Add OrgKey index for performance
CREATE INDEX IF NOT EXISTS "idx_regulatory_source_orgkey" ON risksmart.regulatory_source("OrgKey");

-- Enable Row Level Security
ALTER TABLE risksmart.regulatory_source ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for trpc role
CREATE POLICY own_org_rw ON risksmart.regulatory_source FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

-- Create RLS policies for reporting role
CREATE POLICY own_org ON risksmart.regulatory_source TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

-- Create RLS policies for data_layer role
CREATE POLICY own_org_data_layer ON risksmart.regulatory_source FOR ALL TO data_layer USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

/****************************
 * Add regulatory_source_audit
 ****************************/
CREATE TABLE IF NOT EXISTS risksmart.regulatory_source_audit (
    "Id" UUID NOT NULL,
    "ExternalRegulatorId" text NOT NULL,
    "RegulatorName" text NOT NULL,
    "ProviderName" text NOT NULL,
    "OrgKey" text NOT NULL,
    "CreatedByUser" text NOT NULL,
    "ModifiedByUser" text NOT NULL,
    "CreatedAtTimestamp" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "ModifiedAtTimestamp" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "Action" text NOT NULL,
    PRIMARY KEY ("Id", "OrgKey", "ModifiedAtTimestamp")
);

ALTER TABLE risksmart.regulatory_source_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_org ON risksmart.regulatory_source_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.regulatory_source_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_data_layer ON risksmart.regulatory_source_audit FOR ALL TO data_layer USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE OR REPLACE FUNCTION risksmart.regulatory_source_modified() RETURNS trigger AS $body$
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

insert into risksmart.regulatory_source_audit(
        "Id",
        "ExternalRegulatorId",
        "RegulatorName",
        "ProviderName",
        "CreatedByUser",
        "ModifiedByUser",
        "CreatedAtTimestamp",
        "ModifiedAtTimestamp",
        "OrgKey",
        "Action"
    )
values (
        nr."Id",
        nr."ExternalRegulatorId",
        nr."RegulatorName",
        nr."ProviderName",
        nr."CreatedByUser",
        updated_user,
        nr."CreatedAtTimestamp",
        update_timestamp,
        nr."OrgKey",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER regulatory_source_audit_trigger
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON risksmart.regulatory_source FOR EACH ROW EXECUTE FUNCTION risksmart.regulatory_source_modified();

/****************************
 * Update obligation table to reference regulatory_source instead of external provider
 ****************************/
-- Drop the old unique constraint that references ExternalProvider
ALTER TABLE risksmart.obligation DROP CONSTRAINT "uq_obligation_external";

-- Add new columns and drop ExternalProvider
ALTER TABLE risksmart.obligation
ADD COLUMN "RegulatorySourceId" uuid REFERENCES risksmart.regulatory_source("Id"),
    ADD COLUMN "Reference" text,
    ADD COLUMN "SourceUrl" text,
    DROP COLUMN "ExternalProvider";

-- Add new unique constraint using RegulatorySourceId
ALTER TABLE risksmart.obligation
ADD CONSTRAINT "uq_obligation_external" UNIQUE ("OrgKey", "RegulatorySourceId", "ExternalId");

-- Update audit table to match obligation table changes
ALTER TABLE risksmart.obligation_audit
ADD COLUMN "RegulatorySourceId" uuid,
    ADD COLUMN "Reference" text,
    ADD COLUMN "SourceUrl" text;

-- Update the audit trigger to use new columns
CREATE OR REPLACE FUNCTION risksmart.obligation_modified() RETURNS trigger AS $body$
DECLARE nr RECORD;

DECLARE updated_user TEXT;

DECLARE update_timestamp timestamp with time zone;

BEGIN IF (
    TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
) THEN nr := NEW;

updated_user := NEW."ModifiedByUser";

update_timestamp := NEW."ModifiedAtTimestamp";

ELSIF (TG_OP = 'DELETE') THEN nr := OLD;

updated_user := risksmart.get_hasura_user_id();

update_timestamp := statement_timestamp();

END IF;

INSERT INTO risksmart.obligation_audit(
        "Id",
        "CustomAttributeData",
        "ParentId",
        "Title",
        "Description",
        "Interpretation",
        "Adherence",
        "Type",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action",
        "SequentialId",
        "ExternalId",
        "RegulatorySourceId",
        "Reference",
        "ExternalSyncedAt",
        "SourceUrl",
        "ContentHash"
    )
VALUES (
        nr."Id",
        nr."CustomAttributeData",
        nr."ParentId",
        nr."Title",
        nr."Description",
        nr."Interpretation",
        nr."Adherence",
        nr."Type",
        nr."OrgKey",
        updated_user,
        update_timestamp,
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        TG_OP,
        nr."SequentialId",
        nr."ExternalId",
        nr."RegulatorySourceId",
        nr."Reference",
        nr."ExternalSyncedAt",
        nr."SourceUrl",
        nr."ContentHash"
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

/***************************************
 * Update obligation_change table and audit *
 ****************************************/
ALTER TABLE risksmart.obligation_change
ADD COLUMN "SourceUrl" text;

ALTER TABLE risksmart.obligation_change_audit
ADD COLUMN "SourceUrl" text;

CREATE OR REPLACE FUNCTION risksmart.obligation_change_modified() RETURNS trigger AS $body$
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

insert into risksmart.obligation_change_audit(
        "Id",
        "SequentialId",
        "ObligationId",
        "ExternalId",
        "EffectiveDate",
        "Title",
        "Description",
        "Regulator",
        "Reference",
        "OrgKey",
        "CreatedAtTimestamp",
        "ModifiedAtTimestamp",
        "ModifiedByUser",
        "CreatedByUser",
        "SourceUrl",
        "Action"
    )
values (
        nr."Id",
        nr."SequentialId",
        nr."ObligationId",
        nr."ExternalId",
        nr."EffectiveDate",
        nr."Title",
        nr."Description",
        nr."Regulator",
        nr."Reference",
        nr."OrgKey",
        nr."CreatedAtTimestamp",
        update_timestamp,
        updated_user,
        nr."CreatedByUser",
        nr."SourceUrl",
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;