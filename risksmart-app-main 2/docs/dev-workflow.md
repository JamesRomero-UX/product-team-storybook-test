# Dev Workflow

## Description

Example dev workflow for creating a new page backed by a new database table

## Steps

1. Create a migration to create new table
   - See [Creating a migration](/api-stack/readme.md)
   - See [Table design](/api-stack/readme.md)
2. Track the table in Hasura
   - See http://localhost:9695/console/data/default/schema/risksmart and https://hasura.io/docs/latest/schema/postgres/tables/#tracking-tables
3. Set permissions on insert, update, delete and select to ensure a user can only view/modify records in there own schema
   - Example permissions can be see here api-stack/hasura/metadata/databases/default/tables/risksmart_risk.yaml
4. Create a new .graphql script to query the api to retrieve the data. See packages/web/src/data/graphql
5. Create a new page (component) in packages/web/src/pages
6. Update the router to reference the new page - see packages/web/src/routes/routes.config.tsx
7. Generate react hooks for the .graphql (`pnpm run generate-graphql`)
8. Use the generate react hook to retrieve data
