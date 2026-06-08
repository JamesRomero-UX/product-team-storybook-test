/* Questionnaires */
CREATE OR REPLACE VIEW risksmart.questionnaires_view WITH (security_invoker = true) AS
SELECT 
  qtv."Id",
  qtv."OrgKey",
  qtv."Version",
  qtv."Status",
  qtv."Schema",
  qtv."UISchema",
  qtv."ParentId",
  qtv."CreatedByUser",
  qtv."ModifiedByUser",
  qtv."CreatedAtTimestamp",
  qtv."ModifiedAtTimestamp",
  qtv."CustomAttributeData" AS "VersionCustomAttributeData",
  
  -- Parent (questionnaire_template) columns - flattened
  qt."Id" AS "TemplateId",
  qt."Title",
  qt."Description",
  qt."CustomAttributeData"
FROM risksmart.questionnaire_template_version qtv
LEFT JOIN risksmart.questionnaire_template qt ON qtv."ParentId" = qt."Id";

/* Responses */
CREATE OR REPLACE VIEW risksmart.responses_view WITH (security_invoker = true) AS
SELECT
  tpr."Id",
  tpr."OrgKey",
  tpr."ParentId" AS "ThirdPartyId",
  tpr."QuestionnaireTemplateVersionId",
  tpr."Status",
  tpr."ResponseData",
  tpr."StartDate",
  tpr."ExpiresAt",
  tpr."RecallReason",
  tpr."CreatedByUser",
  tpr."ModifiedByUser",
  tpr."CreatedAtTimestamp",
  tpr."ModifiedAtTimestamp",
  
  -- Invite columns - flattened
  qi."UserEmail",
  qi."UserId"
FROM risksmart.third_party_response tpr
LEFT JOIN risksmart.questionnaire_invite qi ON qi."ParentId" = tpr."Id"