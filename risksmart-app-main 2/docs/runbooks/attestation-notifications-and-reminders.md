# Working on Attestation Notifications and Reminders

This is a runbook for showing how to run the Attestation Notifications or Reminders in dev cloud if you have made changes or need to test it.

## Lambdas

There are two Lambdas that are used in the attestation notifications:

| AWS Lambda Name                       | Code File                            |
| ------------------------------------- | ------------------------------------ |
| dev-cloud-MultiTenant-ScheduledPoller | policyAttestationReminderPoller.ts   |
| dev-cloud-MultiTenant-notifier        | policyAttestationReminderNotifier.ts |

## Knock

Notifications are sent via Knock. The two workflows we care about are:

**attestation-record-insert**

**policy-attestation-reminder**

You should be able to login to Knock via SSO and select the required environment. The workflows themselves batch the emails so they dont all go together and spam users.

## Hasura

Once you have created an attestation on a document, assigned it to the user group. (You need to assign a user to a group) you will have to select a time period for it. The smallest for this is a month, so to get it to trigger now you will need to do some work in hasura to update the record.

The poller works on the hour that its expires so you just need to set it to that and then run the lambda.

Hasura Query:

```
query document {
  document(where:{Id: {_eq: --ID of Policy--  }}){
    Id
    attestationConfig{
      ParentId
      records{
        Id
        UserId
        user{
          FriendlyName
        }
       ExpiresAt
      }
    }
  }
}
```

Hasura Mutation:

```
mutation updaterecord {
  update_attestation_record(where:{Id: {_eq:--ID of Attestation Record--}}, _set:{ExpiresAt:--Updated datetime--, ModifiedAtTimestamp:"NOW()" }){
    affected_rows
  }
}
```

The policy has an AttestrationConfig object which itself has a Records object in there you can find the waiting attestations by user for a given attestation. We are simply taking a given users record and updating their expieredAt field to the current hour.

## Run Lambdas

Once you have updated the record so that it expires at the current hour go to the dev-cloud-MultiTenant-ScheduledPoller lambda in your given environment and run it manually using the event payload below:

```
{
  "detail": {
    "tenant": "MultiTenant"
  }
}
```

This will trigger the process, find your updated record and set the notifications process off, you should see it in Knock. The user should then recieve the email with a link to the attestation.
