import { Config } from 'schemalint';

// Will be good to use generated values for these tables in the future
const sharedTables = [
  'risksmart.appetite_status',
  'risksmart.dashboard_sharing_type',
  'risksmart.taxonomy',
  'risksmart.taxonomy_audit',
  'risksmart.version_status',
  'risksmart.obligation_type',
  'risksmart.indicator_type',
  'risksmart.data_import_status',
  'risksmart.action_status',
  'risksmart.node_type',
  'risksmart.third_party_type',
  'risksmart.cost_type',
  'risksmart.control_type',
  'risksmart.unit_of_time',
  'risksmart.assessment_status',
  'risksmart.access_type',
  'risksmart.test_frequency',
  'risksmart.document_assessment_status',
  'risksmart.assessment_activity_status',
  'risksmart.third_party_response_status',
  'risksmart.document_file_type',
  'risksmart.consequence_type',
  'risksmart.risk_status_type',
  'risksmart.contributor_type',
  'risksmart.appetite_type',
  'risksmart.obligation_assessment_status',
  'risksmart.approval_status',
  'risksmart.acceptance_status',
  'risksmart.third_party_status',
  'risksmart.risk_treatment_type',
  'auth.user_audit',
  'auth.user',
  'auth.role_resource_type',
  'auth.role_type_resource_type',
  'auth.role_type',
  'auth.user_status',
  'risksmart.issue_assessment_status',
  'risksmart.attestation_record_status',
  'risksmart.role_access',
  'risksmart.appetite_model',
  'risksmart.risk_scoring_model',
  'risksmart.risk_assessment_result_control_type',
  'risksmart.assessment_activity_type',
  'risksmart.questionnaire_template_version_status',
  'risksmart.approval_rule_type',
  'risksmart.approval_in_flight_edit_rule',
  'risksmart.wizard_status',
  'risksmart.tab',
  'risksmart.data_export_schedule_frequency',
  'risksmart.data_export_schedule_storage_type',
  'risksmart.data_export_schedule_status',
  'risksmart.change_request_file_operation',
  'risksmart.data_export_schedule_execution_status',
  'risksmart.risk_assessment_result_config',
  'risksmart.risk_assessment_result',
  'risksmart.risk_assessment_result_impact',
];

const generatedTables = [
  'risksmart.node_ancestor',
  'risksmart.node',
  'risksmart.counter',
];

export = {
  connection: {
    host: 'localhost',
    user: 'postgres',
    password: 'postgrespassword',
    database: 'postgres',
    connectionTimeoutMillis: 5000,
    query_timeout: 30000,
    statement_timeout: 30000,
  },

  // Schemas to be linted.
  schemas: [{ name: 'risksmart' }, { name: 'auth' }],

  // Rules to be checked. The key is the rule name and the value is an array
  // whose first value is the severity ("error" to enable the rule, "off" to
  // disable it) and the rest are rule-specific parameters.
  rules: {
    // 'name-casing': ['error', 'snake'],
    // 'name-inflection': ['error', 'singular'],
    // 'prefer-jsonb-to-json': ['error'],
    'has-indexes': ['error'],
    'has-view-security-invoker-on': ['error'],
    'prefer-timestamptz-to-timestamp': ['error'],
    'prefer-text-to-varchar': ['error'],
    'require-primary-key': ['error'],
    'has-audit-table': ['error'],
    'has-foreign-keys-standard-columns': ['error'],
    'has-foreign-keys-id-columns': ['error'],
    'has-row-level-security': ['error'],
    'has-all-tables-in-audit-view': ['error'],
    'mandatory-columns': [
      'error',
      {
        OrgKey: {
          expandedType: 'pg_catalog.text',
        },
        ModifiedAtTimestamp: {
          expandedType: 'pg_catalog.timestamptz',
        },
        CreatedByUser: {
          expandedType: 'pg_catalog.text',
        },
        ModifiedByUser: {
          expandedType: 'pg_catalog.text',
        },
        CreatedAtTimestamp: {
          expandedType: 'pg_catalog.timestamptz',
        },
      },
    ],
  },

  ignores: [
    {
      identifierPattern: sharedTables.map((table) => `^${table}$`).join('|'),
      rulePattern:
        'mandatory-columns|has-audit-table|has-foreign-keys-standard-columns|has-foreign-keys-id-columns|has-row-level-security',
    },
    {
      identifierPattern: generatedTables.map((table) => `^${table}$`).join('|'),
      rulePattern:
        'mandatory-columns|has-audit-table|has-foreign-keys-standard-columns|has-foreign-keys-id-columns',
    },
  ],

  plugins: [
    './linting/custom-rules/hasAuditTable',
    './linting/custom-rules/hasForeignKeysStandardColumns',
    './linting/custom-rules/hasForeignKeysIdColumns',
    './linting/custom-rules/hasRowLevelSecurity',
    './linting/custom-rules/hasViewSecurityInvokerOn',
    './linting/custom-rules/hasAllTablesInAuditView',
    './linting/custom-rules/hasIndexes',
  ],
} satisfies Config;
