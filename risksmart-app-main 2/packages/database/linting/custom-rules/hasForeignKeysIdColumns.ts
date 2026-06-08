import type { TableDetails } from 'extract-pg-schema';
import { Rule } from 'schemalint';

const globalIgnoreColumns = ['SequentialId'];

const tableIgnoreColumns: Record<string, string[]> = {
  organisationuser: ['AuthConnection_Id', 'External_Id'],
  user: [
    'External_Id',
    'AuthUser_Id',
    'AuthConnection_Id',
    'AuthClient_Id',
    'BusinessUnit_Id',
  ],
  // don't believe we have a field table for these.
  form_field_configuration: ['FieldId'],
  form_field_ordering: ['FieldId'],
  // don't believe we have a table table for these.
  user_table_preferences: ['TableId'],

  // In theory we should be able to add a foreign key to the parent table, but will need some changes to triggers etc first
  obligation: ['ParentId', 'ExternalId'],
  // In theory we should be able to add a foreign key to the parent table, but will need some changes to triggers etc first
  risk: ['ParentRiskId'],

  // should be possible to add a foreign key to the node table, but need to ensure "OriginatingItemId" is nullified first?
  internal_audit_report: ['OriginatingItemId'],
  // should be possible to add a foreign key to the node table, but need to ensure "OriginatingItemId" is nullified first?
  assessment: ['OriginatingItemId'],
  // should be possible to add a foreign key to the node table, but need to ensure "OriginatingItemId" is nullified first?
  compliance_monitoring_assessment: ['OriginatingItemId'],
  // cannot add foreign keys to this table due to ordering issues with the way the table is populated
  node_ancestor: ['AncestorId'],

  // not every parent is a node e.g. "data_import", so need to do some work before adding a foreign key to this table
  relation_file: ['ParentId'],

  // TODO: need some futher investigation into where parentid is always a node, and whether this record should live beyond the record deletion
  change_request: ['ParentId'],

  // Requires a fix to the app to ensure Fileid not saved when the content type isn't a file.
  document_file: ['FileId'],

  // Need approval levels to remain as change requests live beyond an approval deletion.
  // Possibly need some work to remodel the life cycle of approval objects.
  approval_level: ['ApprovalId'],
  // Need more investigation on the correct behaviour where a parent is deleted
  approval: ['ParentId'],
  // UserId may not exist in user table for some records (created in Auth0 but not yet logged in so no record in our user table)
  third_party_contact: ['UserId'],
  // ExternalId reference to an ID given by Ascent, it's not an internal reference so can't add a foreign key
  obligation_change: ['ExternalId'],
  // ExternalRegulatorId reference to an ID given by Ascent, it's not an internal reference so can't add a foreign key
  regulatory_source: ['ExternalRegulatorId'],
  // ClientId and ConnectionId are external Auth0 identifiers, not references to internal tables
  sso_configuration: ['ClientId', 'ConnectionId'],
};

export const hasForeignKeysIdColumns: Rule = {
  name: 'has-foreign-keys-id-columns',
  docs: {
    description: 'Ensure table has foreign keys on ID columns',
    url: '...',
  },
  process({ schemaObject, report }) {
    const validator = (table: TableDetails) => {
      // TODO: Need to decide what to do about the "old_" risk assessment tables!
      if (table.name.endsWith('_audit') || table.name.startsWith('old_')) {
        return;
      }

      table.columns.forEach((column) => {
        if (
          column.name.endsWith('Id') &&
          column.name.length > 2 &&
          !globalIgnoreColumns.includes(column.name) &&
          !tableIgnoreColumns[table.name]?.includes(column.name)
        ) {
          const reference = column.references[0];
          if (!reference) {
            report({
              rule: this.name,
              identifier: `${table.schemaName}.${table.name}."${column.name}"`,
              message: `The table column ${table.name}."${column.name}" has a missing foreign key. This is important to ensure referential integrity`,
              suggestedMigration: `ALTER TABLE ${table.schemaName}.${table.name} ADD FOREIGN KEY ("${column.name}") REFERENCES x.y("z");`,
            });
          }
        }
      });
    };
    schemaObject.tables.forEach(validator);
  },
};
