# Query deleted data

## Control

The following graphql can be used to query deleted control data. Not this is work in progress

```
packages/data-import/graphql/exportDeletedControl.graphql
```

## Risk

The following graphql can be used to query deleted risk data. Not this is work in progress

```
packages/data-import/graphql/exportDeletedRisk.graphql
```

Get risk

```sql
select *
from risksmart.risk_audit r
where r."Id" = riskId
and r."Action" = 'DELETE'
order by r."ModifiedAtTimestamp" desc
```

Get risk owners

```sql
select *
from risksmart.owner_audit r
where r."ParentId" = riskId
and r."Action" = 'DELETE'
order by r."ModifiedAtTimestamp" desc
```

Get risk owner groups

```sql
select *
from risksmart.owner_group_audit r
where r."ParentId" = riskId
and r."Action" = 'DELETE'
order by r."ModifiedAtTimestamp" desc
```

Get risk contributor

```sql
select *
from risksmart.contributor_audit r
where r."ParentId" = riskId
and r."Action" = 'DELETE'
order by r."ModifiedAtTimestamp" desc
```

Get risk contributor groups

```sql
select *
from risksmart.contributor_group_audit r
where r."ParentId" = riskId
and r."Action" = 'DELETE'
order by r."ModifiedAtTimestamp" desc
```

Get risk tags

```sql
select *
from risksmart.tag_audit r
where r."ParentId" = riskId
and r."Action" = 'DELETE'
order by r."ModifiedAtTimestamp" desc
```

Get risk departments

```sql
select *
from risksmart.department_audit r
where r."ParentId" = '5153d7d6-732d-4f4c-8329-a4f36eb5928f'
and r."Action" = 'DELETE'
order by r."ModifiedAtTimestamp" desc
```

Get risk controls

```sql
select *
from risksmart.control_parent_audit r
where r."ParentId" = riskId
and r."Action" = 'DELETE'
order by r."ModifiedAtTimestamp" desc
```

Get risk assessment results

```sql
select *
from risksmart.assessment_result_parent_audit r
where r."ParentId" = riskId
and r."Action" = 'DELETE'
order by r."ModifiedAtTimestamp" desc
```

Get risk appetites

```sql
select *
from risksmart.appetite_parent_audit r
where r."ParentId" = riskId
and r."Action" = 'DELETE'
order by r."ModifiedAtTimestamp" desc
```

Get risk actions

```sql
select *
from risksmart.action_parent_audit r
where r."ParentId" = riskId
and r."Action" = 'DELETE'
order by r."ModifiedAtTimestamp" desc
```

Get impacts

```sql
select *
from risksmart.impact_parent_audit r
where r."ParentId" = riskId
and r."Action" = 'DELETE'
order by r."ModifiedAtTimestamp" desc
```
