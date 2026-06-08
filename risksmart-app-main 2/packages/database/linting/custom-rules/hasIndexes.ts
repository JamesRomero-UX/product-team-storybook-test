import type { TableDetails } from 'extract-pg-schema';
import { Rule } from 'schemalint';

export const hasIndexes: Rule = {
  name: 'has-indexes',
  docs: {
    description: 'Ensure table has indexes on relevant columns',
    url: '...',
  },
  process({ schemaObject, report }) {
    const validator = (table: TableDetails) => {
      if (table.name.endsWith('_audit')) {
        return;
      }
      if (!table.columns.find((col) => col.name === 'OrgKey')) {
        return;
      }
      let hasOrgKeyIndex = false;
      table.indices.forEach((index) => {
        if (index.columns[0].name === 'OrgKey') {
          hasOrgKeyIndex = true;
        }
      });

      if (!hasOrgKeyIndex) {
        report({
          rule: this.name,
          identifier: `${table.schemaName}.${table.name}`,
          message: `The table column ${table.name} has a missing org key index. This is important for performance`,
          suggestedMigration: `CREATE INDEX "idx_${table.name}_orgkey" on ${table.schemaName}.${table.name}("OrgKey")`,
        });
      }
    };
    schemaObject.tables.forEach(validator);
  },
};
