alter table "risksmart"."enterprise_risk_instance" drop constraint "enterprise_risk_instance_pkey";
alter table "risksmart"."enterprise_risk_instance"
    add constraint "enterprise_risk_instance_pkey"
    primary key ("EnterpriseRiskId", "RiskId");
