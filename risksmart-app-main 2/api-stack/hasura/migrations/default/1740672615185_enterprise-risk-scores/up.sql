CREATE TABLE IF NOT EXISTS risksmart."enterprise_risk_score" (
    "EnterpriseRiskId" UUID PRIMARY KEY REFERENCES risksmart."enterprise_risk"("Id") ON DELETE CASCADE,
    "InherentScoreMean" FLOAT NULL,
    "InherentScoreMedian" FLOAT [2] NULL,
    "InherentScoreWorstCase" FLOAT NULL,
    "ResidualScoreMean" FLOAT NULL,
    "ResidualScoreMedian" FLOAT [2] NULL,
    "ResidualScoreWorstCase" FLOAT NULL,
    "InherentRatingMean" FLOAT NULL,
    "InherentRatingMedian" FLOAT [2] NULL,
    "InherentRatingWorstCase" FLOAT NULL,
    "ResidualRatingMean" FLOAT NULL,
    "ResidualRatingMedian" FLOAT [2] NULL,
    "ResidualRatingWorstCase" FLOAT NULL,
    "OrgKey" TEXT NOT NULL REFERENCES auth."organisation"("OrgKey"),
    "CreatedAtTimestamp" TIMESTAMP WITH TIME ZONE DEFAULT statement_timestamp() NOT NULL,
    "ModifiedAtTimestamp" TIMESTAMP WITH TIME ZONE DEFAULT statement_timestamp() NOT NULL,
    "CreatedByUser" TEXT NOT NULL REFERENCES auth."user"("Id"),
    "ModifiedByUser" TEXT NOT NULL REFERENCES auth."user"("Id")
);

CREATE TABLE IF NOT EXISTS risksmart."enterprise_risk_score_audit" (
    "EnterpriseRiskId" UUID NOT NULL,
    "InherentScoreMean" FLOAT NULL,
    "InherentScoreMedian" FLOAT [2] NULL,
    "InherentScoreWorstCase" FLOAT NULL,
    "ResidualScoreMean" FLOAT NULL,
    "ResidualScoreMedian" FLOAT [2] NULL,
    "ResidualScoreWorstCase" FLOAT NULL,
    "InherentRatingMean" FLOAT NULL,
    "InherentRatingMedian" FLOAT [2] NULL,
    "InherentRatingWorstCase" FLOAT NULL,
    "ResidualRatingMean" FLOAT NULL,
    "ResidualRatingMedian" FLOAT [2] NULL,
    "ResidualRatingWorstCase" FLOAT NULL,
    "OrgKey" TEXT NOT NULL,
    "CreatedAtTimestamp" TIMESTAMP WITH TIME ZONE NOT NULL,
    "ModifiedAtTimestamp" TIMESTAMP WITH TIME ZONE NOT NULL,
    "CreatedByUser" TEXT NOT NULL,
    "ModifiedByUser" TEXT NOT NULL,
    "Action" risksmart.db_action NOT NULL,
    PRIMARY KEY ("EnterpriseRiskId", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.enterprise_risk_score_modified() RETURNS trigger AS $body$
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

insert into risksmart.enterprise_risk_score_audit(
        "EnterpriseRiskId",
        "InherentScoreMean",
        "InherentScoreMedian",
        "InherentScoreWorstCase",
        "ResidualScoreMean",
        "ResidualScoreMedian",
        "ResidualScoreWorstCase",
        "InherentRatingMean",
        "InherentRatingMedian",
        "InherentRatingWorstCase",
        "ResidualRatingMean",
        "ResidualRatingMedian",
        "ResidualRatingWorstCase",
        "OrgKey",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "Action"
    )
values (
        nr."EnterpriseRiskId",
        nr."InherentScoreMean",
        nr."InherentScoreMedian",
        nr."InherentScoreWorstCase",
        nr."ResidualScoreMean",
        nr."ResidualScoreMedian",
        nr."ResidualScoreWorstCase",
        nr."InherentRatingMean",
        nr."InherentRatingMedian",
        nr."InherentRatingWorstCase",
        nr."ResidualRatingMean",
        nr."ResidualRatingMedian",
        nr."ResidualRatingWorstCase",
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

ALTER TABLE risksmart.enterprise_risk_score ENABLE ROW LEVEL SECURITY;

ALTER TABLE risksmart.enterprise_risk_score_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_org ON risksmart.enterprise_risk_score TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.enterprise_risk_score_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

alter table "risksmart"."enterprise_risk_instance" drop constraint "enterprise_risk_instance_EntityId_fkey",
    add constraint "enterprise_risk_instance_EntityId_fkey" foreign key ("EntityId") references "risksmart"."entity" ("Id") on delete cascade;

alter table "risksmart"."enterprise_risk_instance" drop constraint "enterprise_risk_instance_EnterpriseRiskId_fkey",
    add constraint "enterprise_risk_instance_EnterpriseRiskId_fkey" foreign key ("EnterpriseRiskId") references "risksmart"."enterprise_risk" ("Id") on delete cascade;

alter table "risksmart"."enterprise_risk_instance" drop constraint "enterprise_risk_instance_RiskId_fkey",
    add constraint "enterprise_risk_instance_RiskId_fkey" foreign key ("RiskId") references "risksmart"."risk" ("Id") on delete cascade;