# Schedules

risksmart.schedule stores configuration related to how frequently a schedule should be performed, and how long after a schedule is due it becomes overdue.

risksmart.schedule_state stores the current state of the schedule, such as the due date, overdue date, and last run date.

If for some reason the risksmart.schedule_state is incorrect, the following graphql query can be run with the CustomerSupport role to refresh the schedule_state for known ids

```graphql
mutation refreshSchedule {
  refreshScheduleState(Ids: ["uuid1", "uuid2"]) {
    unsupportedNodeIds
    missingNodeIds
  }
}
```

Ensure the x-hasura-default-role, and x-hasura-org-id headers are set before running the above mutation.
