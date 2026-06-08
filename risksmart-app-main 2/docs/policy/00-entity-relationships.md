# Entity relationships

## Table of Contents

- [Entity relationships](#entity-relationships)
  - [Without attestation cycles](#without-attestation-cycles)
  - [With attestation cycles](#with-attestation-cycles)

## Without attestation cycles

```mermaid
erDiagram
    document ||--o{ document_file : publishes
    attestation_config |o--|| document: has
    attestation_record }|--|| attestation_config: references
    attestation_record ||--|| document_file: attests

    document {
        string Id
        string Title
    }

    document_file {
        string Id
        string FileId
        string Status
        string ParentId
        string Version
    }

    attestation_config {
        string ParentId
        boolean RequireGlobalAttestation
        iterval AttestationTimeLimit
        string PromptText
    }

    attestation_record {
        string Id
        string UserId
        boolean Active
        string AttestationStatus
        string NodeId
        string ConfigId
    }

```

## With attestation cycles

- concept of attestation cycles has been introduced. One document (or document_file) can have 0 or more attestation cycles associated with it. An attestation_record can only belong to one attestation_cycle.

```mermaid
erDiagram
    document ||--o{ document_file : publishes
    document_file ||--o{ attestation_cycle : contains
    attestation_config |o--|| document: has
    attestation_record }|--|| attestation_config: references
    attestation_record ||--|| document_file: attests
    attestation_record }o--o| attestation_cycle: "belongs to (optional)"

    document {
        uuid Id PK
        string Title
    }

    document_file {
        uuid Id PK
        string FileId
        string Status
        uuid ParentId FK "document.Id"
        string Version
    }

    attestation_cycle {
        uuid Id PK
        uuid ParentId FK "document_file.Id"
        string Status
        boolean AllowCarryForward
    }

    attestation_config {
        uuid ParentId PK "document.Id"
        boolean RequireGlobalAttestation
        interval AttestationTimeLimit
        string PromptText
    }

    attestation_record {
        uuid Id PK
        uuid UserId
        boolean Active
        string AttestationStatus
        uuid NodeId FK "document_file.Id"
        uuid ConfigId FK "attestation_config.ParentId"
        uuid CycleId FK "attestation_cycle.Id (nullable)"
        uuid CarriedForwardFromRecordId
    }

```
