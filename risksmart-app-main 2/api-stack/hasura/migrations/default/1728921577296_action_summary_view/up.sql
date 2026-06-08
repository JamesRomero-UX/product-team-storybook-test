CREATE OR REPLACE VIEW risksmart.action_update_summary_view AS
select distinct on (au."ParentActionId") au."ParentActionId" AS "ActionId",
    au."Description" AS "LatestDescription",
    au."Title" AS "LatestTitle",
    au."CreatedAtTimestamp" AS "LatestCreatedAtTimestamp",
    au."OrgKey",
    COUNT(*) OVER (PARTITION BY au."ParentActionId") AS "Count"
from risksmart.action_update au
order by au."ParentActionId",
    au."CreatedAtTimestamp" desc;