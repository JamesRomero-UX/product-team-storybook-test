CREATE OR REPLACE VIEW risksmart.issue_update_summary_view AS
select distinct on (iu."ParentIssueId") iu."ParentIssueId" AS "IssueId",
  iu."Description" AS "LatestDescription",
  iu."Title" AS "LatestTitle",
  iu."CreatedAtTimestamp" AS "LatestCreatedAtTimestamp",
  iu."OrgKey",
  COUNT(*) OVER (PARTITION BY iu."ParentIssueId") AS "Count"
from risksmart.issue_update iu
order by iu."ParentIssueId",
  iu."CreatedAtTimestamp" desc;