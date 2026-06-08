import type { TableDetails } from 'extract-pg-schema';
import { Rule } from 'schemalint';

export const hasAuditTable: Rule = {
  name: 'has-audit-table',
  docs: {
    description: 'Ensure table has associated audit table with no foreign keys',
    url: '...',
  },
  process({ schemaObject, report }) {
    const validator = ({ name: tableName, triggers }: TableDetails) => {
      if (tableName.endsWith('_audit')) {
        return;
      }
      const auditTableName = tableName + '_audit';
      const auditTable = schemaObject.tables.find(
        (t) => t.name === auditTableName
      );

      if (!auditTable) {
        report({
          rule: this.name,
          identifier: `${schemaObject.name}.${tableName}`,
          message: `The table ${tableName} is missing an associated audit table`,
          suggestedMigration: `CREATE TABLE "${tableName}_audit" ...;`,
        });
      } else {
        const triggerName = `${auditTableName}_trigger`;
        const auditTrigger = triggers.find(
          (trigger) => trigger.name === triggerName
        );
        if (!auditTrigger) {
          report({
            rule: this.name,
            identifier: `${auditTable.schemaName}.${auditTable.name}`,
            message: `The table ${tableName} is missing an audit trigger`,
            suggestedMigration: `CREATE TRIGGER ${triggerName}
AFTER
INSERT
    OR DELETE
    OR
UPDATE ON ${schemaObject.name}.${tableName} FOR EACH ROW EXECUTE FUNCTION ${schemaObject.name}.${tableName}_modified();`,
          });
        }
        auditTable.columns.forEach((column) => {
          column.references.forEach((reference) => {
            report({
              rule: this.name,
              identifier: `${auditTable.schemaName}.${auditTable.name}."${column.name}"."${reference.name}"`,
              message: `The table column ${tableName}."${column.name}" has foreign keys. This can cause issues with deletions`,
              suggestedMigration: `ALTER TABLE ${auditTable.schemaName}.${auditTable.name} DROP CONSTRAINT "${reference.name}";`,
            });
          });
        });
      }
    };
    schemaObject.tables.forEach(validator);
  },
};
