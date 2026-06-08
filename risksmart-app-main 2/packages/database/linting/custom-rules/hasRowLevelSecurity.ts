import type { TableDetails } from 'extract-pg-schema';
import { Rule } from 'schemalint';

const RLS_POLICIES = [
  {
    name: 'own_org',
    role: 'reporting',
    isReadOnly: true,
  },
  {
    name: 'own_org_rw',
    role: 'trpc',
    isReadOnly: false,
  },
  {
    name: 'own_org_data_layer',
    role: 'data_layer',
    isReadOnly: false,
  },
] as const;

const generatePolicyMigration = (
  schemaName: string,
  tableName: string,
  policy: (typeof RLS_POLICIES)[number]
) => {
  if (policy.isReadOnly) {
    return `CREATE POLICY ${policy.name} ON ${schemaName}.${tableName} TO ${policy.role} USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);`;
  }
  return `CREATE POLICY ${policy.name} ON ${schemaName}.${tableName} FOR ALL TO ${policy.role} USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);`;
};

export const hasRowLevelSecurity: Rule = {
  name: 'has-row-level-security',
  docs: {
    description:
      'Ensure row level security is enabled on org key for reporting, trpc, and data_layer roles',
    url: '...',
  },
  process({ schemaObject, report }) {
    const validator = (table: TableDetails) => {
      if (!table.isRowLevelSecurityEnabled) {
        report({
          rule: this.name,
          identifier: `${table.schemaName}.${table.name}`,
          message: `The table ${table.name} is missing row level security. This is required for the reporting, trpc, and data_layer roles to ensure only their org data is returned`,
          suggestedMigration: `ALTER TABLE ${table.schemaName}.${table.name} ENABLE ROW LEVEL SECURITY;`,
        });
      } else {
        for (const policy of RLS_POLICIES) {
          if (!table.securityPolicies.find((sp) => sp.name === policy.name)) {
            report({
              rule: this.name,
              identifier: `${table.schemaName}.${table.name}`,
              message: `The table ${table.name} is missing the ${policy.name} security policy for the ${policy.role} role.`,
              suggestedMigration: generatePolicyMigration(
                table.schemaName,
                table.name,
                policy
              ),
            });
          }
        }
      }
    };
    schemaObject.tables.forEach(validator);
  },
};
