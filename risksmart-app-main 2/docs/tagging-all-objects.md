# Tagging all objects

Scripts to tag every object within the system.

The following items are currently supported:

Assessment
Risk
Action
Control
Indicator
Issue (no need to tag issue assessments as tags are shared between the two)
Document (policy)
Obligation
Third Party
Internal audit report
Compliance monitoring assessment

```sql
select * from risksmart.tag_all_objects([org key here], [tag type id here]::uuid)
```
