DO $$
DECLARE environment text;

BEGIN
SELECT "ValueString" INTO environment
FROM config.env
WHERE "Name" = 'stage';

IF environment = 'dev' THEN
INSERT INTO risksmart.aggregation_org ("OrgKey", "RiskScoringModel", "Appetite")
VALUES (
        'org_Qshp7tYsxxAWwhVa',
        'control_effectiveness_averages',
        'top_down_cascade'
    ) ON CONFLICT DO NOTHING;

END IF;

IF environment = 'dev-cloud' THEN
INSERT INTO risksmart.aggregation_org ("OrgKey", "RiskScoringModel", "Appetite")
VALUES (
        'org_vi3NiqZteCsnNik9',
        'control_effectiveness_averages',
        'top_down_cascade'
    ) ON CONFLICT DO NOTHING;

END IF;

END $$;