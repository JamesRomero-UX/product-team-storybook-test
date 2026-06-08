CREATE INDEX IF NOT EXISTS "idx_action_update_parentActionId" on risksmart.action_update using btree ("ParentActionId");

CREATE INDEX IF NOT EXISTS "idx_issue_update_parentActionId" on risksmart.issue_update using btree ("ParentIssueId");

CREATE INDEX IF NOT EXISTS "idx_consequence_parentIssueId" on risksmart.consequence using btree ("ParentIssueId");