BEGIN TRANSACTION;

ALTER TABLE "risksmart"."enterprise_risk_instance" DROP CONSTRAINT "enterprise_risk_instance_pkey";

ALTER TABLE "risksmart"."enterprise_risk_instance"
ADD CONSTRAINT "enterprise_risk_instance_pkey" PRIMARY KEY ("RiskId");

ALTER TABLE "risksmart"."enterprise_risk_instance"
ALTER COLUMN "EnterpriseRiskId" DROP NOT NULL;

ALTER TABLE "risksmart"."enterprise_risk_instance_audit" DROP CONSTRAINT "enterprise_risk_instance_audit_pkey";

ALTER TABLE "risksmart"."enterprise_risk_instance_audit"
ADD CONSTRAINT "enterprise_risk_instance_audit_pkey" PRIMARY KEY ("RiskId", "ModifiedAtTimestamp");

ALTER TABLE "risksmart"."enterprise_risk_instance_audit"
ALTER COLUMN "EnterpriseRiskId" DROP NOT NULL;

COMMIT TRANSACTION;