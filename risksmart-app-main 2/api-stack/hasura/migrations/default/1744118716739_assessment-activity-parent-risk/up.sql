ALTER TABLE IF EXISTS risksmart.assessment_activity
ADD COLUMN IF NOT EXISTS "RiskId" uuid NULL;
