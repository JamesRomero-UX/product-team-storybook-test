delete from risksmart.approver
where "UserId" not in (
        Select "Id"
        from auth.user
    );

ALTER TABLE risksmart.risk_assessment_result
ALTER COLUMN "ModifiedByUser" drop default;

ALTER TABLE risksmart.obligation_assessment_result
ALTER COLUMN "ModifiedByUser" drop default;

ALTER TABLE risksmart.document_assessment_result
ALTER COLUMN "ModifiedByUser" drop default;

INSERT INTO auth.user ("Id", "UserName", "CreatedByUser")
VALUES ('SYSTEM', 'RiskSmart', 'SYSTEM') ON CONFLICT ("Id") DO NOTHING;

update risksmart.taxonomy_org
set "CreatedByUser" = 'SYSTEM',
    "ModifiedByUser" = 'SYSTEM',
    "ModifiedAtTimestamp" = now()
where "CreatedByUser" = '-';

update risksmart.taxonomy_org
set "ModifiedByUser" = 'SYSTEM',
    "ModifiedAtTimestamp" = now()
where "ModifiedByUser" = '-';

update risksmart.taxonomy
set "CreatedByUser" = 'SYSTEM',
    "ModifiedByUser" = 'SYSTEM',
    "ModifiedAtTimestamp" = now()
where "CreatedByUser" = '-';

update risksmart.taxonomy
set "ModifiedByUser" = 'SYSTEM',
    "ModifiedAtTimestamp" = now()
where "ModifiedByUser" = '-';

update risksmart.risk_assessment_result
set "ModifiedByUser" = 'SYSTEM',
    "ModifiedAtTimestamp" = now()
where "ModifiedByUser" = '';

update risksmart.obligation_assessment_result
set "ModifiedByUser" = 'SYSTEM',
    "ModifiedAtTimestamp" = now()
where "ModifiedByUser" = '';

update risksmart.document_assessment_result
set "ModifiedByUser" = 'SYSTEM',
    "ModifiedAtTimestamp" = now()
where "ModifiedByUser" = '';

ALTER TABLE risksmart.taxonomy_org
ADD CONSTRAINT "taxonomy_org_createdbyuser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user ("Id");

ALTER TABLE risksmart.taxonomy_org
ADD CONSTRAINT "taxonomy_org_modifiedbyuser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user ("Id");

ALTER TABLE risksmart.taxonomy
ADD CONSTRAINT "taxonomy_createdbyuser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user ("Id");

ALTER TABLE risksmart.taxonomy
ADD CONSTRAINT "taxonomy_modifiedbyuser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user ("Id");

ALTER TABLE risksmart.risk_assessment_result
ADD CONSTRAINT "risk_assessment_result_modifiedbyuser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user ("Id");

ALTER TABLE risksmart.obligation_assessment_result
ADD CONSTRAINT "obligation_assessment_result_modifiedbyuser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user ("Id");

ALTER TABLE risksmart.issue_parent
ADD CONSTRAINT "issue_parent_createdbyuser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user ("Id");

ALTER TABLE risksmart.issue_parent
ADD CONSTRAINT "issue_parent_modifiedbyuser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user ("Id");

ALTER TABLE risksmart.form_field_ordering
ADD CONSTRAINT "form_field_ordering_createdbyuser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user ("Id");

ALTER TABLE risksmart.form_field_ordering
ADD CONSTRAINT "form_field_ordering_modifiedbyuser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user ("Id");

ALTER TABLE risksmart.form_field_ordering
ADD CONSTRAINT "form_field_ordering_orgkey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation ("OrgKey");

ALTER TABLE risksmart.form_field_configuration
ADD CONSTRAINT "form_field_configuration_createdbyuser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user ("Id");

ALTER TABLE risksmart.form_field_configuration
ADD CONSTRAINT "form_field_configuration_modifiedbyuser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user ("Id");

ALTER TABLE risksmart.form_field_configuration
ADD CONSTRAINT "form_field_configuration_orgkey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation ("OrgKey");

ALTER TABLE risksmart.form_configuration
ADD CONSTRAINT "form_configuration_createdbyuser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user ("Id");

ALTER TABLE risksmart.form_configuration
ADD CONSTRAINT "form_configuration_modifiedbyuser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user ("Id");

ALTER TABLE risksmart.form_configuration
ADD CONSTRAINT "form_configuration_orgkey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation ("OrgKey");

ALTER TABLE risksmart.document_assessment_result
ADD CONSTRAINT "document_assessment_result_modifiedbyuser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user ("Id");

ALTER TABLE risksmart.custom_attribute_schema
ADD CONSTRAINT "custom_attribute_schema_createdbyuser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user ("Id");

ALTER TABLE risksmart.custom_attribute_schema
ADD CONSTRAINT "custom_attribute_schema_modifiedbyuser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user ("Id");

ALTER TABLE risksmart.custom_attribute_schema
ADD CONSTRAINT "custom_attribute_schema_orgkey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation ("OrgKey");

ALTER TABLE risksmart.change_request_contributor
ADD CONSTRAINT "change_request_contributor_orgkey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation ("OrgKey");

ALTER TABLE risksmart.approver_response
ADD CONSTRAINT "approver_response_createdbyuser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user ("Id");

ALTER TABLE risksmart.approver_response
ADD CONSTRAINT "approver_response_modifiedbyuser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user ("Id");

ALTER TABLE risksmart.approver
ADD CONSTRAINT "approver_createdbyuser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user ("Id");

ALTER TABLE risksmart.approver
ADD CONSTRAINT "approver_modifiedbyuser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user ("Id");

ALTER TABLE risksmart.approver
ADD CONSTRAINT "approver_orgkey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation ("OrgKey");

ALTER TABLE risksmart.approval_level
ADD CONSTRAINT "approval_level_createdbyuser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user ("Id");

ALTER TABLE risksmart.approval_level
ADD CONSTRAINT "approval_level_modifiedbyuser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user ("Id");

ALTER TABLE risksmart.approval_level
ADD CONSTRAINT "approval_level_orgkey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation ("OrgKey");

ALTER TABLE risksmart.approval
ADD CONSTRAINT "approval_createdbyuser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user ("Id");

ALTER TABLE risksmart.approval
ADD CONSTRAINT "approval_modifiedbyuser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user ("Id");

ALTER TABLE risksmart.approval
ADD CONSTRAINT "approval_orgkey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation ("OrgKey");