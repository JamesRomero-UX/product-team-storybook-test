import type { TableDetails, ViewDetails } from 'extract-pg-schema';
import { Rule } from 'schemalint';

const ignoreTables: string[] = [
  'user_table_preferences_audit', // Too granular to be useful? (a user changing there table preferences)
  'aggregation_org_audit', // cs task
  'schedule_state_audit', // system calculated data
  'risk_score_audit', // system calculated data
  'form_field_ordering_audit', // entry for form_configuration changes is enough
  'data_import_audit', // cs task. Inserted objects will be seen after import anyway
  'data_import_error_audit', // cs task. Inserted objects will be seen after import anyway
  'enterprise_risk_score_audit', // system calculated data
  'risk_rating_definition_audit', // currently just a copy of translation data
  'user_tab_preference_audit',
  'organisation_tab_preference_audit',
  'organisation_module_audit', // not yet
  'data_export_schedule_execution_audit',
  'obligation_change_audit',
  'obligation_change_attestation_audit',
  'regulatory_source',
  'regulatory_source_audit',
];

export const hasAllTablesInAuditTable: Rule = {
  name: 'has-all-tables-in-audit-view',
  docs: {
    description: 'Ensure all tables are in the audit view',
    url: '...',
  },
  process({ schemaObject, report }) {
    const validator = (
      auditLogView: ViewDetails,
      { name: tableName, schemaName: tableSchema }: TableDetails
    ) => {
      // Only include audit tables
      if (!tableName.endsWith('_audit') || ignoreTables.includes(tableName)) {
        return;
      }
      if (!auditLogView.definition.includes(`${tableSchema}.${tableName}`)) {
        report({
          rule: this.name,
          identifier: `${schemaObject.name}.${tableName}`,
          message: `The view audit_log_view is missing an entry for the table ${tableName} is missing an associated audit table`,
          suggestedMigration: `CREATE OR REPLACE VIEW risksmart.audit_log_view AS...;`,
        });
      }
    };
    if (schemaObject.views.length > 0) {
      const auditLogView = schemaObject.views.find(
        (v) => v.name === 'audit_log_view'
      );
      if (!auditLogView) {
        throw new Error('audit_log_view not found');
      }
      schemaObject.tables.forEach((table) => validator(auditLogView, table));
    }
  },
};
