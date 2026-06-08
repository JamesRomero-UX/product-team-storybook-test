# Attestation cycles

## Table of Contents

- [Process overview](#process-overview)
- [Attestation Record State Transitions](#attestation-record-state-transitions)
- [Create a new attestation cycle](#create-a-new-attestation-cycle)
- [Create attestation records](#create-attestation-records)
- [Conclude attestation cycles](#conclude-attestation-cycles)
  - [On creation of a new attestation cycle](#on-creation-of-a-new-attestation-cycle)
  - [On completion of attestation records](#on-completion-of-attestation-records)
- [Archive attestation cycle records](#archive-attestation-cycle-records)
- [Changes to user groups and org users](#changes-to-user-groups-and-org-users)
  - [Exit attestation cycle](#exit-attestation-cycle)
  - [Enter attestation cycle](#enter-attestation-cycle)

## Process overview

```mermaid
flowchart TD

USER_DISTRIBUTE(User distribute a new attestation cycle)-->CREATE_CYCLE
CREATE_CYCLE[Create a new attestation cycle]-->CREATE_RECORDS
CREATE_RECORDS[Create attestation records for new cycle]
CREATE_CYCLE-->CONCLUDE_RUNNING[Conclude running cycle]
CONCLUDE_RUNNING-->ARCHIVE_CONCLUDED_CYCLE[Archive attestation records for cycle]
USER_ATTESTS(User attests to a document)-->|If all records are attested to|CONCLUDE_RUNNING
USER_REMOVED(User is removed from org or group)
USER_REMOVED-->EXIT_ATTESTATION_CYCLE[Remove user from attestation cycle]
USER_ADDED(User is removed from org or group)
USER_ADDED-->ENTER_ATTESTATION_CYCLE[Add user to attestation cycle]

%% Styling
  classDef entry_point fill:#a5d8ff,stroke:#1e1e1e,color:#000;
  class USER_DISTRIBUTE,USER_ATTESTS,USER_REMOVED,USER_ADDED entry_point


click CREATE_CYCLE '#create-a-new-attestation-cycle'
click CREATE_RECORDS '#create-attestation-records'
click CONCLUDE_RUNNING '#on-creation-of-a-new-attestation-cycle'
click ARCHIVE_CONCLUDED_CYCLE '#archive-attestation-cycle-records'
click USER_ATTESTS '#on-completion-of-attestation-records'
click EXIT_ATTESTATION_CYCLE '#exit-attestation-cycle'
click ENTER_ATTESTATION_CYCLE '#enter-attestation-cycle'

```

## Attestation Record State Transitions

```mermaid
stateDiagram-v2
    [*] --> pending: Record created
    pending --> attested: User attests
    pending --> not_attested: Cycle concluded
    pending --> not_required: User removed from audience
    not_required --> pending: User rejoined audience
    attested --> attested: User removed (active=false)
    not_attested --> [*]
```

## Create a new attestation cycle

**Trigger:** User clicks the **Distribute** button in the front end.

**Action:** A new attestation cycle is created.

```mermaid
flowchart TD
START(Start)-->TRIGGER
TRIGGER([Distribute attestation from F/E]) --> HANDLER

subgraph HANDLER["Create attestation cycle"]
 direction TB
    GLD[Get latest published version of document_file]-->CREATE_CYCLE[Create valid attestation cycle]
    CREATE_CYCLE-->TERM[[Terminate]]
 end

%% Side-effect / persistence operations
  CREATE_CYCLE --> MUTATION[insert_attestation_cycle]
  MUTATION-->DB_AC[(risksmart.attestation_cycle)]
  DB_DF[(risksmart.document_file)]-->QUERY[get_document_files]
  QUERY-->GLD

%% Styling
  classDef trigger fill:#a5d8ff,stroke:#1e1e1e,color:#000;
  classDef op fill:#fff,stroke:#1e1e1e,color:#000;
  classDef term fill:#c6f6d5,stroke:#000,font-weight:bold,color:#000;
  classDef graphql fill:#eef,stroke:#000,stroke-dasharray:3 3,color:#000;
  classDef db fill:#fefcbf,stroke:#b7791f,color:#000;

  class TRIGGER trigger
  class GLD,CREATE_CYCLE op
  class MUTATION,QUERY graphql
  class DB_DF,DB_AC db
  class START,TERM term
```

## Create attestation records

**Trigger:** A record is **INSERTED** into the **attestation_cycle** table.

**Action:** Individual attestation records are created for the cycle using the attestation_config. These records are created with an attestation state of **pending** and an active state of **true**

```mermaid
flowchart TD
START(Start)-->TRIGGER
TRIGGER[(risksmart.attestation_cycle)]-->|data inserted event|HANDLER

subgraph HANDLER["Create attestation records"]
  direction TB
    GET_CFG[Get the attestation config for the document associated with the cycle]-->GET_AUD
    GET_AUD[Calculate the audience the attestation is required for based on the configuration]-->CARRY_FORWARD
    CARRY_FORWARD{Carry forward attestations?}-->|No|CREATE_PENDING
    CARRY_FORWARD-->|Yes|GET_PCR
    GET_PCR[Get previous cycle records]-->CREATE_ATTESTED
    CREATE_ATTESTED[Create active, attested records for each person who attested to the previous cycle]-->CREATE_PENDING
    CREATE_PENDING[Create active records for each person in the audience for this cycle]
  end

CREATE_PENDING-->TERM[[Terminate]]


%% Side-effect / persistence operations
  DB_CFG[(risksmart.attestation_config)]-->CONFIG_QUERY
  CONFIG_QUERY[get_attestation_configs]-->GET_CFG
  CREATE_PENDING-->MUTATION[insert_attestation_record]
  MUTATION-->DB_AR[(risksmart.attestation_record)]
  DB_CY[(risksmart.attestation_cycle)]-->CYCLE_QUERY
  CYCLE_QUERY[get_attestation_cycles]-->GET_PCR


%% Styling
  classDef op fill:#fff,stroke:#1e1e1e,color:#000;
  classDef term fill:#c6f6d5,stroke:#000,font-weight:bold,color:#000;
  classDef graphql fill:#eef,stroke:#000,stroke-dasharray:3 3,color:#000;
  classDef db fill:#fefcbf,stroke:#b7791f,color:#000;

  class GET_CFG,GET_AUD,CREATE_ATTESTED,CREATE_PENDING,GET_PCR,CARRY_FORWARD op
  class MUTATION,CONFIG_QUERY,CYCLE_QUERY graphql
  class TRIGGER,DB_CFG,DB_AR,DB_CY db
  class START,TERM term
```

## Conclude attestation cycles

### On creation of a new attestation cycle

**Trigger:** A record is **INSERTED** into the **attestation_cycle** table.

**Action:** When a new attestation cycle is created. Any existing attestation cycles for the policy will be marked as concluded. Ensuring there is only ever one active cycle per policy.

```mermaid
flowchart TD
START(Start)-->TRIGGER
TRIGGER[(risksmart.attestation_cycle)]-->|data inserted event|HANDLER

subgraph HANDLER["Ensure single active attestation cycle"]
direction TB
  GET_ALL[Get all active cycles]-->FILTER
  FILTER[Get cycles for the same policy as the newly created cycle]-->CONCLUDE
  CONCLUDE[Set status and concluded at timestamp for all cycles that arent the latest cycle]-->PERSIST
  PERSIST[Update status and attested at timestamp]-->TERM

  TERM[[Terminate]]
end

DB_CY_IN[(risksmart.attestation_cycle)]-->QUERY[get_attestation_cycles]
QUERY-->GET_ALL
PERSIST-->PERSIST_CY[update_attestation_cycle]
PERSIST_CY-->DB_CY_OUT[(risksmart.attestation_cycle)]

%% Styling
 classDef start fill:#a5d8ff,stroke:#1e1e1e,color:#000;
 classDef op fill:#fff,stroke:#1e1e1e,color:#000;
 classDef term fill:#c6f6d5,stroke:#000,font-weight:bold,color:#000;
 classDef graphql fill:#eef,stroke:#000,stroke-dasharray:3 3,color:#000;
 classDef db fill:#fefcbf,stroke:#b7791f,color:#000;

 class START start
 class GET_ALL,FILTER,CONCLUDE,PERSIST op
 class PERSIST_CY,QUERY graphql
 class TRIGGER,DB_DF,DB_CY_IN,DB_CY_OUT db
 class TERM term
```

### On completion of attestation records

**Trigger:** A record is **UPDATED** into the **attestation_record** table.

**Action:** When all the attestation_records associated with an attestation_cycle are attested, then the state of the attestation cycle will be changed to concluded

```mermaid
flowchart TD
START(Start)-->TRIGGER
TRIGGER[(risksmart.attestation_record)]-->|data updated event|HANDLER

subgraph HANDLER["Refresh attestation cycle status"]
direction TB
  GET[Get attestation cycle and associated records]-->ERROR
  ERROR[Error if attestation cycle is not found as this should never happen]-->CHECK
  CHECK[Check cycle is not already concluded]-->VALIDATE
  VALIDATE[Ensure all records associated with the attestation are a status of 'attested' and update the cycle state to 'concluded']-->TERM
  TERM[[Terminate]]
end

DB_CYREAD[(risksmart.attestation_cycle)]-->QUERY[get_attestation_cycles]
QUERY-->GET
VALIDATE-->PERSIST_CY[update_attestation_cycle_status]
PERSIST_CY-->DB_CYWRITE[(risksmart.attestation_cycle)]

%% Styling
 classDef start fill:#a5d8ff,stroke:#1e1e1e,color:#000;
 classDef op fill:#fff,stroke:#1e1e1e,color:#000;
 classDef term fill:#c6f6d5,stroke:#000,font-weight:bold,color:#000;
 classDef graphql fill:#eef,stroke:#000,stroke-dasharray:3 3,color:#000;
 classDef db fill:#fefcbf,stroke:#b7791f,color:#000;

 class START start
 class GET,ERROR,CHECK,VALIDATE op
 class PERSIST_CY,QUERY graphql
 class TRIGGER,DB_CYREAD,DB_CYWRITE db
 class TERM term
```

## Archive attestation cycle records

**Trigger:** A record is `UPDATED` into the `attestation_cycle` table.

**Action:** Once an attestation cycle is concluded it's records should be updated accordingly. Pending active records should have their attestation state and active state updated.

```mermaid
flowchart TD
START(Start)-->TRIGGER
TRIGGER[(risksmart.attestation_cycle)]-->|data updated event|HANDLER

subgraph HANDLER["Conclude attestation cycles"]
direction TB
  CHECK_STATUS[Ensure attestation status is 'concluded']-->UPDATE_NOT_ATTESTED
  UPDATE_NOT_ATTESTED[Set attestation records for this cycle to not_attested where status is not already attested]-->UPDATE_ATTESTED
  UPDATE_ATTESTED[Set attestation Active flag to false]-->TERM[[Terminate]]
end

UPDATE_NOT_ATTESTED-->PERSIST_R[update_attestations]
UPDATE_ATTESTED-->PERSIST_R[update_attestations]
PERSIST_R-->DB_R[(risksmart.attestation_record)]

%% Styling
 classDef start fill:#a5d8ff,stroke:#1e1e1e,color:#000;
 classDef op fill:#fff,stroke:#1e1e1e,color:#000;
 classDef term fill:#c6f6d5,stroke:#000,font-weight:bold,color:#000;
 classDef graphql fill:#eef,stroke:#000,stroke-dasharray:3 3,color:#000;
 classDef db fill:#fefcbf,stroke:#b7791f,color:#000;

 class START start
 class CHECK_STATUS,UPDATE_NOT_ATTESTED,UPDATE_ATTESTED op
 class PERSIST_CY,PERSIST_R,QUERY graphql
 class TRIGGER,DB_CFG,DB_AR,DB_DF,DB_CY,DB_R db
 class TERM term

```

## Changes to user groups and org users

### Exit attestation cycle

**Trigger:** A record is `DELETED` from the `risksmart.user_group_user` table or the `auth.organisationuser` table.

**Action:** [RSP-1443](https://linear.app/risksmart/issue/RSP-1443/allow-inactive-users-to-be-excluded-from-an-attestation). If a user has been removed from a user group which has been assigned to an Active attestation then the status on any Active Attestations, that have not been attested to, should be set to Not required.

```mermaid
flowchart TD
TRIGGER_USERGROUPUSER[(risksmart.user_group_user)]-->|data deleted event|GET_CYCLES
TRIGGER_ORGUSER[(auth.organisationuser)]-->|data deleted event|GET_CYCLES

subgraph HANDLER["Exit attestation cycles"]
direction TB
  GET_CYCLES[If user group is provided get active cycles for user groups, else get all active cycles]
  GET_CYCLES-->FILTER_CYCLES
  FILTER_CYCLES[Filter out attestation cycles which are still required for the user]-->UPDATE_RECORDS
  UPDATE_RECORDS[For users records in the filtered cycles, set active = false and status = not_required]-->
  TERM[[Terminate]]

end

QUERY[get_attestation_cycles]-->GET_CYCLES
UPDATE_RECORDS-->PERSIST_CY[update_attestations]
PERSIST_CY-->DB_AR[(risksmart.attestation_records)]

DB_CY[(risksmart.attestation_cycles)]-->QUERY


%% Styling
 classDef op fill:#fff,stroke:#1e1e1e,color:#000;
 classDef term fill:#c6f6d5,stroke:#000,font-weight:bold,color:#000;
 classDef graphql fill:#eef,stroke:#000,stroke-dasharray:3 3,color:#000;
 classDef db fill:#fefcbf,stroke:#b7791f,color:#000;

 class START start
 class GET_CYCLES,FILTER_CYCLES,UPDATE_RECORDS op
 class PERSIST_CY,QUERY graphql
 class TRIGGER_USERGROUPUSER,TRIGGER_ORGUSER,DB_CY,DB_AR db
 class TERM term
```

## Enter attestation cycle

**Trigger:** A record is `INSERTED` into the `risksmart.user_group_user` table or the `auth.organisationuser` table.

**Requirement** [RSP-1443](https://linear.app/risksmart/issue/RSP-1443/allow-inactive-users-to-be-excluded-from-an-attestation). If a user is changed from Inactive or Archived to Active, and they are part of a group that has been assigned to an Active attestation, then on the change of their user status, they should be sent the Attestation to complete.

**Action:**

```mermaid
flowchart TD
TRIGGER_USERGROUPUSER[(risksmart.user_group_user)]-->|data inserted event|GET_CYCLES
TRIGGER_ORGUSER[(auth.organisationuser)]-->|data inserted event|GET_CYCLES

subgraph HANDLER["Exit attestation cycles"]
direction TB
  GET_CYCLES[If user group is provided get active cycles for user groups, else get all **active, global** cycles]
  GET_CYCLES-->IF_RECORD_EXISTS
  IF_RECORD_EXISTS{Does a record exist in this cycle for this user?}
  IF_RECORD_EXISTS-->|No|CREATE_RECORD
  IF_RECORD_EXISTS-->|Yes|CAN_ACTIVATE

  CREATE_RECORD[Create a record for the user in each of the attestation cycles]-->TERM

  CAN_ACTIVATE{Can record be activated?}
  CAN_ACTIVATE -->|Other states|ERROR[Throw: Unexpected attestation record status]
  CAN_ACTIVATE -->|not_required|UPDATE_TO_PENDING[Set active = true, status = pending]
  CAN_ACTIVATE -->|attested, inactive|UPDATE_TO_ACTIVE[Set active = true, keep status = attested]


  UPDATE_TO_PENDING-->TERM
  UPDATE_TO_ACTIVE-->TERM

  TERM[[Terminate]]
end

QUERY[get_attestation_cycles]-->GET_CYCLES
CREATE_RECORD-->PERSIST_CREATE[insert_attestation_record]
UPDATE_TO_PENDING-->PERSIST_UPDATE[update_attestation_record]
UPDATE_TO_ACTIVE-->PERSIST_UPDATE

PERSIST_CREATE-->DB_AR[(risksmart.attestation_records)]
PERSIST_UPDATE-->DB_AR[(risksmart.attestation_records)]

DB_CY[(risksmart.attestation_cycles)]-->QUERY


%% Styling
 classDef op fill:#fff,stroke:#1e1e1e,color:#000;
 classDef term fill:#c6f6d5,stroke:#000,font-weight:bold,color:#000;
 classDef graphql fill:#eef,stroke:#000,stroke-dasharray:3 3,color:#000;
 classDef db fill:#fefcbf,stroke:#b7791f,color:#000;
 classDef error fill:#ff5555,stroke:#b7791f,color:#000;

 class START start
 class GET_CYCLES,FILTER_CYCLES,CREATE_RECORD,CAN_ACTIVATE,IF_RECORD_EXISTS,UPDATE_TO_PENDING,UPDATE_TO_ACTIVE op
 class ERROR error
 class PERSIST_CREATE,PERSIST_UPDATE,QUERY graphql
 class TRIGGER_USERGROUPUSER,TRIGGER_ORGUSER,DB_CY,DB_AR db
 class TERM term
```
