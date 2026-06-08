ALTER TABLE risksmart.risk_assessment_result ADD COLUMN "ConfigId" UUID;
ALTER TABLE risksmart.risk_assessment_result ADD CONSTRAINT fk_risk_assessment_result_config_id
    FOREIGN KEY ("ConfigId")
    REFERENCES risksmart.risk_assessment_result_config("Id");

ALTER TABLE risksmart.risk_assessment_result_audit ADD COLUMN "ConfigId" UUID;
