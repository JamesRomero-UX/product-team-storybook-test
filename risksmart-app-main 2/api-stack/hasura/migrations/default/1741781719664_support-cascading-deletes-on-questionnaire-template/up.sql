ALTER TABLE risksmart.questionnaire_invite
  DROP CONSTRAINT "questionnaire_invite_QuestionnaireTemplateVersionId_fkey",
  ADD CONSTRAINT "questionnaire_invite_QuestionnaireTemplateVersionId_fkey"
    FOREIGN KEY ("QuestionnaireTemplateVersionId")
      REFERENCES risksmart.questionnaire_template_version("Id") ON DELETE CASCADE;

ALTER TABLE risksmart.third_party_response
  ADD CONSTRAINT "third_party_response_QuestionnaireTemplateVersionId_fkey"
    FOREIGN KEY ("QuestionnaireTemplateVersionId")
      REFERENCES risksmart.questionnaire_template_version("Id") ON DELETE CASCADE;
