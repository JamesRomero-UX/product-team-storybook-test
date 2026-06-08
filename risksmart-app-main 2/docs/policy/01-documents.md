# Documents

Flows for various Policy document processes.

## Table of Contents

- [Create a new document](#create-a-new-document)
- [Add a new document version](#add-a-new-document-version)
- [Publish a document version](#publish-a-document-version)

## Create a new document

The process which is triggered when adding a new policy document via the details tab.

```mermaid
flowchart TD
    START([Create a new document]) --> HANDLER

    subgraph HANDLER["Post document handler"]
      direction TB
      C[Insert document with optional attestation fields]
      D[Refresh document<br/>schedule state]
      TERM[[Return 200]]
      C --> D --> E
    end

    %% Side-effect / persistence operations
    C --> H[- insert_document_one<br/>- insert_schedule_one]
    D --> I[- get latest rating document<br/> - refresh schedule state]

    %% Styling
    classDef start fill:#a5d8ff,stroke:#1e1e1e,color:#000;
    classDef op fill:#fff,stroke:#1e1e1e,color:#000;
    classDef graphql fill:#eef,stroke:#000,stroke-dasharray: 3 3,color:#000;
    classDef term fill:#c6f6d5,stroke:#000,font-weight:bold,color:#000;

    class START start
    class C,D,I op
    class H graphql
    class TERM term
```

## Add a new document version

The process which is triggered when uploading a new policy document version

```mermaid
flowchart TD
    START([Add new document version]) -->|insertDocumentVersion| HANDLER

    subgraph HANDLER["Post document version handler"]
      direction TB
      V[Insert new document version in draft state]
      V --> TERM[[Return 200]]
    end

    %% Side-effect / persistence operations
    V -->|insertDocumentFile| F[insert_document_file]

    %% Styling
    classDef start fill:#a5d8ff,stroke:#1e1e1e,color:#000;
    classDef op fill:#fff,stroke:#1e1e1e,color:#000;
    classDef graphql fill:#eef,stroke:#000,stroke-dasharray: 3 3,color:#000;
    classDef term fill:#c6f6d5,stroke:#000,font-weight:bold,color:#000;

    class START start
    class V op
    class F graphql
    class TERM term
```

## Publish a document version

The process which is triggered when promoting a policy document version from `draft` to `published`

```mermaid
flowchart TD
    %% Entry
    START([Publish document version]) -->|updateDocumentVersion| HANDLER

    subgraph HANDLER["Put document version handler"]
      direction TB
      PW[publish document version workflow] --> TERM[[Return 200]]
    end

    %% Detailed publish workflow
    subgraph PublishWF["Publish document version workflow"]
      direction TB
      GC[Get current document] --> Q{Document is now published?}
      Q -- Yes --> SPD[Set published date to current date]
      SPD --> UDV[Update document version]
      Q -- No --> UDV
    end

    subgraph Service["Document version service"]
      direction TB
      FCD[Find current document version] --> UDV2[Update document with new values] --> DEL[delete file associated with existing version] --> ARCH[If new version is published, set old version to archived]
    end

    %% Side-effect / persistence operations
    ARCH -->|updateDocumentFile| GQL[update_document_file]

    PW --> GC
    UDV --> FCD

    classDef start fill:#a5d8ff,stroke:#1e1e1e,color:#000;
    classDef op fill:#fff,stroke:#1e1e1e,color:#000;
    classDef decision fill:#fff,stroke:#1e1e1e,stroke-width:2,color:#000;
    classDef graphql fill:#eef,stroke:#000,stroke-dasharray: 3 3,color:#000;
    classDef term fill:#c6f6d5,stroke:#000,font-weight:bold,color:#000;

    class START start
    class PW,GC,SPD,UDV,FCD,UDV2,DEL,ARCH op
    class Q decision
    class GQL graphql
    class TERM term
```
