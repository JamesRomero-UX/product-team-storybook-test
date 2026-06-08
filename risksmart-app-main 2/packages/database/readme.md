# Database

## Linting

```sh
pnpm db:lint
```

Run to lint database.

Note:

You may see the following errors:

Error parsing view definition for "xyz". Falling back to raw data

These can be ignored for now as don't appear to break linting on tables.

## Row level security

The new reporting API has direct access to the database via SQL scripting.
The hasura security model is therefore bypassed.

To work around this, reporting will initially only be offered to users in the role "RiskManager", who have access to a whole organisations data.

To ensure they do not have access to other organisations data, Row level security should be enabled for all tables, and rows filtered on the "OrgKey".

Rows are filtered based on the 'risksmart.org_key' setting.

For testing, this can be set using the following command

```sql
select set_config('risksmart.org_key','org_aQshp7tYsxxAWwhVa',false);
```

where the 2nd argument to set_config is the org key.
