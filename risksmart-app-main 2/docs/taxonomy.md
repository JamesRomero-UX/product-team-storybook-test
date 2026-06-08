# Taxonomy

## Description

Gives customers the ability to change text in key areas of the application.

## How to Create an organization taxonomy

1. Create a new row in the `risksmart.taxonomy` table and give it a description.

2. Create a new row in the `risksmart.taxonomy_org` table and give it a locale (`en` for example) and an orgName (`kraken` for example).
3. Create a new `taxonomy`, `common`, `library`, and `rating` json document, and override the fields that are required to change from the default values file `packages/web/src/taxonomy/locales/default/en/taxonomy.json`

Note you will also need a json doc containing `{}` for any overrides that do not override the defaults.

Add your override documents into the `risksmart.taxonomy` table row you created in step 1.

1. Within auth0, navigate to the organization that needs the taxonomy applied.

2. Set the metadata field `taxonomy` to the OrgName created in step 2.

3. Log out and back in again to see the changes.
