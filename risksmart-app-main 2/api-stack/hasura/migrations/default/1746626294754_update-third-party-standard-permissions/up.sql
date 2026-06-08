INSERT INTO risksmart."role_access" (
  "RoleKey",
  "ObjectType",
  "ContributorType",
  "AccessType"
)
VALUES ('Standard', 'questionnaire_template', 'any', 'read'),
('StandardEnhanced', 'questionnaire_template', 'any', 'read'),
('Standard', 'questionnaire_template_version', 'any', 'read'),
('StandardEnhanced', 'questionnaire_template_version', 'any', 'read');
