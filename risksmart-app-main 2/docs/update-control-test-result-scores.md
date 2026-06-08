# Update control test result scores

## Note

This is a temporary hack to update an orgs test results based on there taxonomy.
An api should be created in the future to perform this task.

It current disables the hasura update trigger for the test_result table, which could potentially effect other organisations data if they are updating test results.

Use with caution!

If the triggers are not disabled, notifications will be sent, the riskScore handler will error!

## Get taxonomy

For the org in question, get the "effectiveness" rating from the taxonomy table,
and update the query below with the correct bandings and org key

```sql
ALTER TABLE risksmart.test_result
DISABLE TRIGGER "notify_hasura_test-result_UPDATE";

with results as
(
select
 tr."Id",
 (tr."DesignEffectiveness" * tr."PerformanceEffectiveness") as "OverallEffectiveness"
from risksmart.test_result tr
where tr."DesignEffectiveness" is not null
and tr."PerformanceEffectiveness" is not null
and tr."OrgKey" = 'xyz'
)
update risksmart.test_result tr
set "OverallEffectiveness" =
case
	when r."OverallEffectiveness" >= 0 AND r."OverallEffectiveness" <=1 then 0
	when r."OverallEffectiveness" >= 2 AND r."OverallEffectiveness" <=4 then 1
	when r."OverallEffectiveness" >= 5 AND r."OverallEffectiveness" <=6 then 2
	when r."OverallEffectiveness" >= 7 AND r."OverallEffectiveness" <=9 then 3
	else null
end,
"ModifiedAtTimestamp" = now(),
"ModifiedByUser" = 'SYSTEM'
from results r
where tr."Id" = r."Id"
and tr."OrgKey" = 'xyz';

ALTER TABLE risksmart.test_result
ENABLE TRIGGER "notify_hasura_test-result_UPDATE";
```
