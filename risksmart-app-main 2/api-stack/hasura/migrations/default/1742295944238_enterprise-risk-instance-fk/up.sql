ALTER TABLE risksmart."enterprise_risk_instance" DROP CONSTRAINT IF EXISTS "enterprise_risk_instance_RiskId_fkey",
    ADD CONSTRAINT enterprise_risk_instance_RiskId_fkey FOREIGN KEY ("RiskId") REFERENCES risksmart."risk"("Id") ON DELETE CASCADE;

ALTER TABLE risksmart."enterprise_risk_instance" DROP CONSTRAINT IF EXISTS "enterprise_risk_instance_EntityId_fkey",
    ADD CONSTRAINT enterprise_risk_instance_EntityId_fkey FOREIGN KEY ("EntityId") REFERENCES risksmart."entity"("Id") ON DELETE CASCADE;

ALTER TABLE risksmart."enterprise_risk_instance" DROP CONSTRAINT IF EXISTS "enterprise_risk_instance_EnterpriseRiskId_fkey",
    ADD CONSTRAINT enterprise_risk_instance_EnterpriseRiskId_fkey FOREIGN KEY ("EnterpriseRiskId") REFERENCES risksmart."enterprise_risk"("Id") ON DELETE CASCADE;