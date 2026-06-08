# Custom Datasources

- [Custom Datasources](#custom-datasources)
  - [RDS Proxy](#rds-proxy)
    - [Enable RDS Proxy](#enable-rds-proxy)
    - [Database password](#database-password)
  - [Types](#types)
    - [Display Types](#display-types)
    - [Custom attributes field types](#custom-attributes-field-types)
    - [Creating new data sources](#creating-new-data-sources)
  - [Multiple Parents](#multiple-parents)
    - [Problem Solved](#problem-solved)
    - [Solution](#solution)
    - [Example](#example)
    - [How It Works](#how-it-works)
    - [Backward Compatibility](#backward-compatibility)
    - [Implementation Files](#implementation-files)

## RDS Proxy

Tenants require an RDS proxy to be enabled to access the custom data sources feature.
This is because the feature makes direct requests to the database via a lambda function, so could potentially use up all postgres connections.

### Enable RDS Proxy

For the required tenant, update `cdk-stack/lib/envSettings/prod.ts` with `databaseEnableProxy = true`

### Database password

When a new tenant is created, a new aws secret is created to allow the custom datasource feature to connect to the database with RLS (row level security). However, the setting of the user password in postgres has not yet been automated.

The database password can be found in the secret

`app-risksmartApp-[tenant name]-reporting-credentials`

Run the command

```sql
ALTER USER reporting WITH PASSWORD '[password]';
```

## Types

### Display Types

These provide details on how fields should be presented in tables and charts.

See packages/web/src/pages/custom-datasources/update/displayTypes

### Custom attributes field types

These provide details on how custom attributes should be presented throughout the application, including in custom datasources

packages/web/src/components/Form/custom-attributes/field-types

### Creating new data sources

2 files need to be added to create a new data source.

The first lives in packages/shared/src/reporting/datasets, and contains the definition of the data source as needed by the web application.

The second lives in packages/rest-api/src/services/reporting/datasets, and contains the information on how to query the database to get the data.

## Multiple Parents

This feature allows datasets to define multiple parent join configurations for cases where a table has foreign keys to different parent types.

### Problem Solved

Previously, datasets could only specify a single `parentJoin` configuration. This was problematic for tables like `third_party_response` which has foreign keys to `third_party` (via `ParentId`) and `questionnaire_template_version` (via `QuestionnaireTemplateVersionId`)

### Solution

The `Dataset` interface now supports a `parentJoinPaths` configuration that allows multiple named join paths, each with an `applicableForObjectTypes` property that specifies which parent object types it applies to.

### Example

```typescript
export const getResponses = (_latest: boolean) => {
  return createDataset(sharedDataset(), {
    pgTable: 'risksmart.third_party_response',
    pk: 'Id',
    parentJoinPaths: {
      thirdParty: {
        pgTable: null,
        idCol: null,
        parentKeyCol: 'ParentId',
        applicableForObjectTypes: [ParentTypeEnum.ThirdParty],
      },
      questionnaireTemplateVersion: {
        pgTable: null,
        idCol: null,
        parentKeyCol: 'QuestionnaireTemplateVersionId',
        applicableForObjectTypes: [ParentTypeEnum.QuestionnaireTemplateVersion],
      },
    },
    relations: {
      /* ... */
    },
    fields: {
      /* ... */
    },
  });
};
```

### How It Works

1. When building a SQL query, the `getApplicableParentJoin` function in `sqlQueryBuilder.ts` checks if the dataset has `parentJoinPaths` defined
2. It iterates through each path and checks if the `applicableForObjectTypes` array includes the left dataset's `objectType`
3. If a match is found, that join path is used
4. If no match is found (or `parentJoinPaths` is not defined), it falls back to the single `parentJoin`

### Backward Compatibility

- Existing datasets without `parentJoinPaths` continue to work exactly as before
- The `parentJoin` property is still supported and used as a fallback

### Implementation Files

- **Type Definition**: `packages/rest-api/src/services/reporting/datasets/types.ts`
  - Added `applicableForObjectTypes` to `ParentJoinInfo` type
  - Added `parentJoinPaths` to `Dataset` interface

- **SQL Query Builder**: `packages/rest-api/src/services/reporting/sqlQueryBuilder.ts`
  - Added `getApplicableParentJoin` function
  - Modified join selection logic to use the new function
