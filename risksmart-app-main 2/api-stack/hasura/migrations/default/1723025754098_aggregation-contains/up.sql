CREATE TABLE risksmart.risk_scoring_model ("Value" text PRIMARY KEY, "Comment" text);

insert into risksmart.risk_scoring_model ("Value", "Comment")
values (
        'control_effectiveness_averages',
        'Control effectiveness averages'
    ),
    ('default', 'Default model');

ALTER TABLE risksmart.aggregation_org DROP CONSTRAINT "aggregation_org_risk_scoring_model_fkey";

ALTER TABLE risksmart.aggregation_org
ADD CONSTRAINT "aggregation_org_riskScoringModel_fkey" FOREIGN KEY ("RiskScoringModel") REFERENCES risksmart.risk_scoring_model("Value");

CREATE TABLE risksmart.appetite_model ("Value" text PRIMARY KEY, "Comment" text);

insert into risksmart.appetite_model ("Value", "Comment")
values (
        'top_down_cascade',
        'Top down cascade'
    ),
    ('default', 'Default model');

ALTER TABLE risksmart.aggregation_org
ADD CONSTRAINT "aggregation_org_appetite_fkey" FOREIGN KEY ("Appetite") REFERENCES risksmart.appetite_model("Value");