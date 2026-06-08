# Attestations

Flows for various Policy attestation processes.

## Table of Contents

- [Check attestations](#check-attestations)
- [Add attestation configuration](#add-attestation-configuration)
- [Refresh attestations handler](#refresh-attestations-handler)
- [Refresh attestations](#refresh-attestations)

## Check attestations

The process which is triggered whenever a change to the `document_file` sql table is detected.

```mermaid
flowchart TD
 %% Trigger
 START([document_file updated]) --> NEW{New document status}
 NEW -->|!Published| PREV{Previous document status}

 %% If nothing material changed (e.g. still Published)
 PREV -->|Published| NA[[No action required]]

 %% Processing path (either diamond may route here)
 NEW -->|Published| CFG[Get all current attestation configs]
    CFG --> ARCHIVE_FLOW

    subgraph ARCHIVE_FLOW["Archive current attestations"]
    direction TB
        MARK_NA[Mark existing attestations as 'Not attested'] --> EXP_ARCH[Archive current records that have expired as permanently expired]
        EXP_ARCH --> SET_INACTIVE[Set current records that are attested as inactive but keep the attestation status]
    end

    MARK_NA --> UPDATE_ATT
    EXP_ARCH --> UPDATE_ATT
    SET_INACTIVE --> UPDATE_ATT

    ARCHIVE_FLOW --> REFRESH_FLOW

    subgraph REFRESH_FLOW["Refresh attestation records"]
    direction TB
        REFRESH[Refresh attestation records]
        NOTE_REFRESH
    end

    REFRESH --> INSERT_ATT[insert_attestation_record]
    REFRESH --> TERM[[Terminate]]

 %% Notification (updates all set Active: false so no outbound notifications)
 UPDATE_ATT --> NOTIFY[(Attestation Notifier)]
    INSERT_ATT --> NOTIFY2[(Attestation notifier)]

    %% Side-effect / persistence operations
    UPDATE_ATT[update_attestation_record]
    INSERT_ATT[insert_attestation_record]

 %% Annotations (represented as notes / styled boxes)
 NOTE_TRIGGER[[Whenever a document_file is updated new version uploaded & published]]
 NOTE_ACTIVE[[All updates set Active: false so no notifications will be sent]]
 NOTE_REFRESH[[See refresh attestation records diagram]]

 START -. context .-> NOTE_TRIGGER
 NOTIFY -. context .-> NOTE_ACTIVE

 %% Styling
 classDef start fill:#a5d8ff,stroke:#1e1e1e,color:#000;
 classDef decision fill:#fff,stroke:#1e1e1e,stroke-width:2,color:#000;
 classDef op fill:#fff,stroke:#1e1e1e,color:#000;
 classDef term fill:#c6f6d5,stroke:#000,font-weight:bold,color:#000;
 classDef graphql fill:#eef,stroke:#000,stroke-dasharray:3 3,color:#000;
 classDef note fill:#ffec99,stroke:#1e1e1e,stroke-dasharray:4 4,color:#000;


 class START start
 class NEW,PREV decision
 class CFG,MARK_NA,EXP_ARCH,SET_INACTIVE,REFRESH op
 class UPDATE_ATT,INSERT_ATT graphql
 class NOTE_TRIGGER,NOTE_ACTIVE,NOTE_REFRESH note
    class NA,TERM term
```

## Add attestation configuration

The process which is triggered when adding attestation config via the document details form or the attestation tab in the Policy section

```mermaid
flowchart TD
 %% Trigger
 START([Add attestation config]) -->|insertAttestationConfig| HANDLER

 %% Handler layer
 subgraph HANDLER["Post attestation config handler"]
 direction TB
  CALL --> UPSERT[Upsert config]
  UPSERT --> TERM[[Return 200]]
 end

 %% Service decision
 UPSERT --> DEC{Config exists?}
 subgraph SERVICE["Attestation config service"]
 direction TB
  DEC -->|Yes| UPDATE[Update existing config]
  DEC -->|No| CREATE[Create new attestation config]
 end

 %% Side-effect / persistence operations
 UPDATE -->|updateAttestationConfigs| GQL_UPDATE[insert_attestation_config_one delete_attestation_group]
 CREATE -->|insertAttestationConfigs| GQL_CREATE[insert_attestation_config]

 %% Async / follow-up process
 REFRESH((Refresh attestations))
 GQL_UPDATE --> REFRESH
 GQL_CREATE--> REFRESH

 %% Styling
 classDef start fill:#a5d8ff,stroke:#1e1e1e,color:#000;
 classDef decision fill:#fff,stroke:#1e1e1e,stroke-width:2,color:#000;
 classDef op fill:#fff,stroke:#1e1e1e,color:#000;
 classDef term fill:#c6f6d5,stroke:#000,font-weight:bold,color:#000;
 classDef graphql fill:#eef,stroke:#000,stroke-dasharray:3 3,color:#000;

 class START,REFRESH start
 class DEC decision
 class CALL,UPSERT,UPDATE,CREATE op
 class TERM term
 class GQL_UPDATE,GQL_CREATE graphql
```

## Refresh attestations handler

This is the process which is triggered with any insert, update or delete to the following SQL tables:

- attestation_config
- attestation_group
- organisationuser
- user_group
- user_group_user

```mermaid
flowchart TD
 %% Trigger sources (SQL table changes)
 START([Refresh attestations]) --> HANDLER[Find all configs affected]

    subgraph HANDLER["Refresh attestations handler"]
 direction TB
        FIND[Find all configs affected] --> DEC{If updating and has new time limit}
        DEC -->|True| REFRESH_EXP[Refresh expiry date]
        REFRESH_EXP --> REFRESH((Refresh attestation records))
        DEC -->|False| REFRESH
        NOTE_RECORDS[[See refresh attestation records diagram]]
    end

 %% Record refresh pipeline
 REFRESH -->|insertAttestations| INSERT_GQL[insertAttestations]
 INSERT_GQL --> NOTIFY[(Attestation notifier)]

 %% Note / reference to deeper diagram
 REFRESH -. context .-> NOTE_RECORDS

 %% Styling
 classDef start fill:#a5d8ff,stroke:#1e1e1e,color:#000;
 classDef decision fill:#fff,stroke:#1e1e1e,stroke-width:2,color:#000;
 classDef op fill:#fff,stroke:#1e1e1e,color:#000;
 classDef graphql fill:#eef,stroke:#000,stroke-dasharray:3 3,color:#000;
 classDef note fill:#ffec99,stroke:#1e1e1e,stroke-dasharray:4 4,color:#000;

 class START,REFRESH start
 class DEC decision
 class FIND,REFRESH_EXP op
 class INSERT_GQL graphql
 class NOTE_RECORDS note
```

## Refresh attestations

This process is triggered by the processes above where indicated

```mermaid
flowchart TD
 START([Refresh attestation records]) --> USECASE

    subgraph USECASE["Refresh attestation records"]
 direction TB
        %% Branch: determine required user set
 REQ{Require Global Attestation?} -->|Yes| USERS_ALL[Get all users associated with the config who are not customer support, RiskSmart or archived users or third-party]
        REQ -->|No| USERS_GROUP[Get all users in specified user groups]

        USERS_ALL --> SYNC_USERS
        USERS_GROUP --> SYNC_USERS

        SYNC_USERS[If user is no longer in required list: Update all existing active attestation records<br/>

        AttestationStatus: NotRequired

        Active: false]

        %% Create missing records
        SYNC_USERS --> CREATE_MISSING[Create records for any required user that does not currently have an attestation record]

        %% Refresh expiry on existing records
        CREATE_MISSING --> REFRESH_EXP[Refresh expiry on existing records if required]
    end

    REFRESH_EXP -->|updateAttestations| UPDATE_GQL[update_attestation_record]
    UPDATE_GQL --> NOTIFY_UPDATE[(Attestation notifier)]
 CREATE_MISSING -->|insertAttestations| INSERT_GQL[insert_attestation_record]
 INSERT_GQL --> NOTIFY_CREATE[(Attestation notifier)]


 %% Styling
 classDef start fill:#a5d8ff,stroke:#1e1e1e,color:#000;
 classDef decision fill:#fff,stroke:#1e1e1e,stroke-width:2,color:#000;
 classDef op fill:#fff,stroke:#1e1e1e,color:#000;
 classDef graphql fill:#eef,stroke:#000,stroke-dasharray:3 3,color:#000;
 classDef note fill:#ffec99,stroke:#1e1e1e,stroke-dasharray:4 4,color:#000;

 class START,REFRESH start
 class REQ decision
 class USERS_ALL,USERS_GROUP,CREATE_MISSING,REFRESH_EXP,SYNC_USERS op
 class INSERT_GQL,UPDATE_GQL graphql
 class NOTIFY_CREATE,NOTIFY_UPDATE op
```
