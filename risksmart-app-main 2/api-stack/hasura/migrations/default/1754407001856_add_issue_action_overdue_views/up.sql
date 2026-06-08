CREATE VIEW risksmart.action_status_view  WITH (security_invoker = true) AS
SELECT "Id", "OrgKey",
       CASE
           WHEN "Status" IN ('open', 'pending') AND "DateDue" < (NOW() - interval '1 day') THEN 'overdue'
           ELSE "Status"
       END AS "Status"
FROM risksmart.action;

CREATE VIEW risksmart.issue_status_view  WITH (security_invoker = true) AS
SELECT I."Id", I."OrgKey",
       CASE
           WHEN "Status" IN ('open', 'pending') AND "TargetCloseDate" < (NOW() - interval '1 day') THEN 'overdue'
           WHEN "Status" IS NULL THEN 'pending'
           ELSE "Status"
       END AS "Status"
FROM risksmart.issue AS I
LEFT JOIN risksmart.issue_assessment AS IA ON I."Id" = IA."ParentIssueId";