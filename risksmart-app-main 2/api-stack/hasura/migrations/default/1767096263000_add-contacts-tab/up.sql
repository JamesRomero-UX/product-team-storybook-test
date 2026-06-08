-- Add contacts tab to third_party default tabs (after questionnaires)
UPDATE risksmart.tab
SET "Tabs" = '{"default":[{"id":"details"},{"id":"contacts"},{"id":"questionnaires"},{"id":"controls"},{"id":"issues"},{"id":"issuesBreachLog"},{"id":"issuesConsumerDuty"},{"id":"issuesCustomerTrust"},{"id":"issuesGDPRBreachLog"},{"id":"issuesPCIBreachLog"},{"id":"issuesRiskEvents"},{"id":"issuesSARLog"},{"id":"actions"},{"id":"linkedItems"}]}'::jsonb
WHERE "ParentType" = 'third_party';