-- Revert to original third_party tabs (without contacts)
UPDATE risksmart.tab
SET "Tabs" = '{"default":[{"id":"details"},{"id":"questionnaires"},{"id":"controls"},{"id":"issues"},{"id":"issuesBreachLog"},{"id":"issuesConsumerDuty"},{"id":"issuesCustomerTrust"},{"id":"issuesGDPRBreachLog"},{"id":"issuesPCIBreachLog"},{"id":"issuesRiskEvents"},{"id":"issuesSARLog"},{"id":"actions"},{"id":"linkedItems"}]}'::jsonb
WHERE "ParentType" = 'third_party';