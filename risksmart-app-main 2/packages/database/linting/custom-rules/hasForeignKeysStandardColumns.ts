import type { TableDetails } from 'extract-pg-schema';
import { Rule } from 'schemalint';

export const hasForeignKeysStandardColumns: Rule = {
  name: 'has-foreign-keys-standard-columns',
  docs: {
    description: 'Ensure table has foreign keys on standard columns',
    url: '...',
  },
  process({ schemaObject, report }) {
    const validator = (table: TableDetails) => {
      // TODO: Need to decide what to do about the "old_" risk assessment tables!
      if (table.name.endsWith('_audit') || table.name.startsWith('old_')) {
        return;
      }
      const checks: {
        column: string;
        referenceTableSchema: string;
        referenceTableName: string;
        referenceColumnName: string;
      }[] = [
        {
          column: 'OrgKey',
          referenceTableName: 'organisation',
          referenceTableSchema: 'auth',
          referenceColumnName: 'OrgKey',
        },
        {
          column: 'CreatedByUser',
          referenceTableName: 'user',
          referenceTableSchema: 'auth',
          referenceColumnName: 'Id',
        },
        {
          column: 'ModifiedByUser',
          referenceTableName: 'user',
          referenceTableSchema: 'auth',
          referenceColumnName: 'Id',
        },
      ];

      table.columns.forEach((column) => {
        checks.forEach((check) => {
          if (table.name === check.referenceTableName) {
            // Special case for auth.organisation table because its primary key is "OrgKey" and not ID.
            // Should ensure "Id" is primary key for tables in another linting rule (future PR)
            return;
          }
          if (check.column === column.name) {
            const reference = column.references[0];
            if (
              !reference ||
              (reference.tableName !== check.referenceTableName &&
                reference.schemaName !== check.referenceTableSchema &&
                reference.columnName !== check.referenceColumnName)
            ) {
              report({
                rule: this.name,
                identifier: `${table.schemaName}.${table.name}."${column.name}"`,
                message: `The table column ${table.name}."${column.name}" has a missing foreign key. This is important to ensure referential integrity`,
                suggestedMigration: `ALTER TABLE ${table.schemaName}.${table.name} ADD FOREIGN KEY ("${column.name}") REFERENCES ${check.referenceTableSchema}.${check.referenceTableName}("${check.referenceColumnName}");`,
              });
            }
          }
        });
      });
    };
    schemaObject.tables.forEach(validator);
  },
};
