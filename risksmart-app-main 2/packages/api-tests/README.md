# API Tests

## Introduction

Test CRUD and business logic associated with Hasura configuration and Postgres

## Running the tests

To run the whole test suite, run the command

```bash
pnpm run test
```

To run a particular test suite, run

```bash
pnpm run test [testFileName]
```

## Writing tests

Tests currently interface directly with the hasura APIs for both testing and test setup.
This could be improved in the future by performing test setup directly with a postgres driver.

Data can be inserted into postgres by using the Hasura graphql with an admin role, which will give you the appropriate permissions to insert directly into each table without the additional security checks.

Apis can be called in the context of a particular user in order to test role permissions

e.g.

```typescript
const obligations = await getObligations({
  user: riskManager,
});
```

### Adding new tables / objects

1. Create new GraphQL queries in the `graphql` folder.
2. Create client in the `clients` folder.
3. Create default test data in `data` for the new object.
4. Update `graphql/deleteAllForOrgs.graphql` with the new object. This query is run after every test to clean up the tables.
   **_NOTE:_** Delete mutations need to be in correct order. Objects that reference another table using a
   foreign key constraint need to be deleted before the table they reference
5. Add your tests to `tests`.
