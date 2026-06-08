# Reassigning user items

## Introduction

Occasionally we can end up with two user records in the system that represent the same person.
In this scenario, we generally want to resign all the database records from the duplicate user to the user we wish to keep.

## Steps

### Reassign contributors

Use the function below to replace the duplicate user with the current user as the contributor on all contributed items

```sql
select risksmart.replace_contributor(org_key, original_contributor_id, new_contributor_id);
```

### Reassign owners

Use the function below to replace the duplicate user with the current user as the owner on all owned items

```sql
select risksmart.replace_owner(org_key, original_owner_id, new_owner_id);
```

### Reassign user group users

Use the function below to replace the user group usrs

```sql
select risksmart.replace_user_group_user(org_key, original_user_id, new_user_id);
```

### Reassign everything else

A tool is currently being build to help do this within the data-import package.
3 env variables must be set:
ORG_KEY, OLD_USER_ID and NEW_USER_ID

Then run the command:

```
pnpm run reassignUser
```

You can can then run the script below to see if the tool has missed anything:

```sql
select \* from risksmart.count_references('auth.user', userId) where count>0
```

If it has, you can update reassignUser.graphql in the data-import tool and run again.

### Remove user from org

```sql
delete from auth.organisationuser
where "OrgKey" = orgkey
AND "User_Id" = userId
```

### Archive user

```sql
update auth.user
set "Status" = 'archived',
"ModifiedByUser" = 'SYSTEM',
"ModifiedAtTimestamp" = now()
where "Id" = userId
```
