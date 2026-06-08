# Data Import

Tool to bulk import risk data from third party systems into risk smart.

This will eventually be replaced by the import tool within the web application which shares the same logic.

## Limitations

No validation on whether a custom field is "Required"
No validation on values customized using taxonomy (same issue applies to the websites apis)

## Adding new entities to import

1. Update all.graphql with the table to be updated.
2. Run `pnpm run generate-graphql` to update the graphql types
3. Create a new sheet within the sheets directory
4. Update the schema, graphql type, mapping columns etc
5. Update sheets/index.ts to reference new csv processing function and csvFile

## Creating a generated dataset

If you wish to create a dataset for performance testing:

1. Run `pnpm run generate` to created a set of csv files
1. Run `pnpm run import:generated` to import the generated set of csv files

## Settings

In a .env file, the following variables need to be set

HASURA_ENDPOINT
HASURA_TENANT_ENDPOINT
HASURA_ADMIN_SECRET
INSERT_MODE (PER_TABLE | ALL)
VALIDATE_ONLY true | false - when set to true, only validates the csv file and checks ids exist. Does NOT run import of data.

## Sample CSV

Example csv files can be found in the sample-csv directory.

These can generated using the command

`bash
npm run generate:sample-csv
`

## Custom attributes

If a table supports custom attributes, and the customer has added custom attributes to a form, then these columns must be added to the appropriate csv file (see validation errors).

Note, these additional columns are currently labelled by the id stored in the database, and not the label shown in the UI.

```
select "UiSchema"
from risksmart.custom_attribute_schema
where "OrgKey" = 'xyz'
```

## Support for existing ids

Can now use existing node or user ids in csv files, as well as ids referenced in other csv files.

https://www.notion.so/risksmart/Data-Import-05a1ec2daf8046079bebba24203eda50

## Issues

If the data importer is reporting that a column is missing, check that the csv encoding is set to UTF-8
