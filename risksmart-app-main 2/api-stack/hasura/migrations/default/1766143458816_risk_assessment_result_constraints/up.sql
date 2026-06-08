-- risk_assessment_result_impact: convert unique index to constraint
DROP INDEX IF EXISTS risksmart.idx_risk_assessment_result_impact_parent_label;
ALTER TABLE risksmart.risk_assessment_result_impact 
ADD CONSTRAINT risk_assessment_result_impact_parent_label_unique 
UNIQUE ("RiskAssessmentResultId", "Label");

-- risk_assessment_result_config: convert unique index to constraint  
DROP INDEX IF EXISTS risksmart.idx_risk_assessment_result_config_orgkey_version;
ALTER TABLE risksmart.risk_assessment_result_config 
ADD CONSTRAINT risk_assessment_result_config_orgkey_version_unique 
UNIQUE ("OrgKey", "Version");