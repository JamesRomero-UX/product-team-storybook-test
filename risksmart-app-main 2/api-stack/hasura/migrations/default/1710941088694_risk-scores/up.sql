CREATE TABLE IF NOT EXISTS risksmart."risk_score" (
    "RiskId" uuid NOT NULL PRIMARY KEY,
    "ResidualScore" FLOAT,
    "InherentScore" FLOAT,
    "OrgKey" TEXT NOT NULL,
    "ModifiedAtTimestamp" TIMESTAMP WITH TIME ZONE default statement_timestamp() NOT NULL
);

ALTER TABLE risksmart."risk_score"
ADD CONSTRAINT "risk_score_organisationKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.Organisation ("OrgKey");

ALTER TABLE risksmart."risk_score"
ADD CONSTRAINT "risk_score_risk_id_fkey" FOREIGN KEY ("RiskId") REFERENCES risksmart.risk("Id") ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS risksmart."aggregation_org" (
    "OrgKey" TEXT NOT NULL PRIMARY KEY,
    "RiskScoringModel" TEXT NOT NULL
);

ALTER TABLE risksmart."aggregation_org"
ADD CONSTRAINT "aggregation_org_organisationKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.Organisation ("OrgKey");

ALTER TABLE risksmart."aggregation_org"
ADD CONSTRAINT "aggregation_org_risk_scoring_model_fkey" CHECK (
        "RiskScoringModel" IN ('control_effectiveness_averages')
    );