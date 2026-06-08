import type { JsonSchema7, VerticalLayout } from '@jsonforms/core';
import type { DataExportExecutionStatus } from '@risksmart-app/domain/src/types/consts/data-export-execution-status';
import type {
  AcceptanceStatus,
  ActionStatus,
  AppetiteModel,
  AppetiteStatus,
  ApprovalRuleType,
  ApprovalStatus,
  AssessmentActivityStatus,
  AssessmentActivityType,
  AttestationRecordStatus,
  ChangeRequestFileOperation,
  ConsequenceType,
  ContributorType,
  ControlType,
  CostType,
  DashboardSharingType,
  DataExportFrequency,
  DataExportStatus,
  DataExportStorageType,
  IndicatorType,
  IssueAssessmentStatus,
  ObligationType,
  ParentType,
  QuestionnaireTemplateVersionStatus,
  RiskAssessmentResultControlType,
  RiskScoringModel,
  RiskStatusType,
  RiskTreatmentType,
  TestFrequency,
  TestType,
  ThirdPartyResponseStatus,
  ThirdPartyStatus,
  ThirdPartyType,
  UnitOfTime,
  VersionStatus,
  WizardStatus,
} from '@risksmart-app/domain/src/types/consts/index';
import {
  AppetiteType,
  ApprovalInFlightEditRule,
  AssessmentStatus,
  DataImportStatus,
  DocumentFileType,
  InternalAuditStatus,
  ParentTypes,
  UserStatus,
} from '@risksmart-app/domain/src/types/consts/index';
import type { JSONB } from '@risksmart-app/domain/src/types/index';
import type { Conditions } from '@risksmart-app/form-configuration/src/field-types/types';
import { eq, sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  check,
  customType,
  doublePrecision,
  foreignKey,
  index,
  integer,
  interval,
  json,
  jsonb,
  numeric,
  pgEnum,
  pgPolicy,
  pgSchema,
  primaryKey,
  smallint,
  text,
  unique,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

interface NumericConfig {
  precision?: number;
  scale?: number;
}

const numericCasted = customType<{
  data: number;
  driverData: string;
  config: NumericConfig;
}>({
  dataType: (config) => {
    if (config?.precision && config?.scale) {
      return `numeric(${config.precision}, ${config.scale})`;
    }

    return 'numeric';
  },
  fromDriver: (value: string) => Number.parseFloat(value), // note: precision loss for very large/small digits so area to refactor if needed
  toDriver: (value: number) => value.toString(),
});

const timestamp = customType<{
  data: string;
  driverData: string;
  config: { withTimezone: boolean; precision?: number; mode: 'iso' };
}>({
  dataType(config) {
    const precision = config?.precision ? ` (${config.precision})` : '';

    return `timestamp${precision}${config?.withTimezone ? ' with time zone' : ''}`;
  },
  fromDriver(value: string): string {
    // postgres format: 2025-06-22 16:13:37.489301+00
    // what we want:    2025-06-22T16:13:37Z
    return `${value.substring(0, 10)}T${value.substring(11, value.indexOf('+00'))}Z`;
  },
});

const auth = pgSchema('auth');
const risksmart = pgSchema('risksmart');
const dbActionEnum = pgEnum('db_action', [
  'INSERT',
  'UPDATE',
  'DELETE',
  'TRUNCATE',
]);

export const audit_log_view = risksmart.table('audit_log_view', {
  Id: uuid(),
  OrgKey: text(),
  Item: text(),
  ObjectType: text(),
  Action: text(),
  ModifiedByUser: text(),
  ModifiedAtTimestamp: timestamp(),
});

export const user_role_access = risksmart.table('user_role_access', {
  UserId: text(),
  ObjectType: text(),
  AccessType: text(),
});

export const issue_update_summary = risksmart.table(
  'issue_update_summary_view',
  {
    IssueId: uuid(),
    LatestDescription: text(),
    LatestTitle: text(),
    LatestCreatedAtTimestamp: timestamp(),
    OrgKey: text(),
    Count: bigint({ mode: 'bigint' }),
  }
);

export const permission_view = risksmart.table('permission_view', {
  Id: uuid(),
  OrgKey: text(),
  UserId: text(),
  ObjectType: text(),
  AccessType: text(),
  RoleKey: text(),
});

export const insert_permission_view = risksmart.table(
  'insert_permission_view',
  {
    Id: uuid(),
    OrgKey: text(),
    UserId: text(),
    ObjectType: text(),
  }
);
export const action_update_summary_view = risksmart.table(
  'action_update_summary_view',
  {
    ActionId: uuid(),
    LatestDescription: text(),
    LatestTitle: text(),
    LatestCreatedAtTimestamp: timestamp(),
    OrgKey: text(),
    Count: numericCasted(),
  }
);

// This is a view, but hacking it as a table to support the drizzle relation API.
export const ancestor_contributor_view = risksmart.table(
  'ancestor_contributor_view',
  {
    Id: uuid(),
    OrgKey: text(),
    UserId: text(),
    ObjectType: text(),
    ContributorType: text(),
    AncestorId: uuid(),
    UserGroupId: uuid(),
  }
);

// This is a view, but hacking it as a table to support the drizzle relation API.
export const user_view_active = risksmart.table('user_view_active', {
  Id: uuid(),
  FirstName: text(),
  LastName: text(),
  Email: text(),
  BusinessUnit_Id: text(),
  RoleKey: text(),
  OrgKey: text(),
  Status: text(),
  JobTitle: text(),
  Department: text(),
  OfficeLocation: text(),
  LastSeen: timestamp(),
  FriendlyName: text(),
  AuthConnection: text(),
  IsCustomerSupport: boolean(),
});

export const organisation = auth.table(
  'organisation',
  {
    OrgKey: text().primaryKey().notNull(),
    Name: text().notNull(),
    AuthTenant: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    Meta: json().$type<JSONB>(),
    CreatedByUser: text(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().default(sql`statement_timestamp()`),
    ScimEnabled: boolean().default(false).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'organisation_CreatedByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'organisation_ModifiedByUser_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const user = auth.table(
  'user',
  {
    Id: text().primaryKey().notNull(),
    FirstName: text(),
    LastName: text(),
    Email: text(),
    UserName: text(),
    BusinessUnit_Id: uuid(),
    AuthClient_Id: text(),
    AuthClientName: text(),
    AuthTenant: text(),
    AuthConnection_Id: text(),
    AuthConnection: text(),
    RoleKey: text(),
    Status: text().$type<UserStatus>().default(UserStatus.Active).notNull(),
    CreatedOn: timestamp().default(sql`statement_timestamp()`),
    LastSeen: timestamp(),
    Meta: json().$type<JSONB>(),
    AuthUser_Id: text(),
    External_Id: text(),
    DisplayName: text(),
    JobTitle: text(),
    Department: text(),
    OfficeLocation: text(),
    CreatedByUser: text(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().default(sql`statement_timestamp()`),
    FriendlyName: text().generatedAlwaysAs(sql`COALESCE("DisplayName",
CASE
    WHEN (("FirstName" IS NULL) AND ("LastName" IS NULL)) THEN NULL::text
    WHEN ("FirstName" IS NULL) THEN "LastName"
    WHEN ("LastName" IS NULL) THEN "FirstName"
    ELSE (("FirstName" || ' '::text) || "LastName")
END, "UserName", "Email")`),
    IsCustomerSupport: boolean().generatedAlwaysAs(sql`
CASE
    WHEN ("AuthConnection" ~~* 'AzureAD-RiskSmart-%'::text) THEN true
    ELSE false
END`),
  },
  (table) => [
    uniqueIndex('idx_user_email')
      .using('btree', table.Email.asc().nullsLast().op('text_ops'))
      .where(sql`("Email" IS NOT NULL)`),
    foreignKey({
      columns: [table.Status],
      foreignColumns: [user_status.Value],
      name: 'User_status_fkey',
    }),
  ]
);

export const linked_item = risksmart.table('linked_item', {
  Id: uuid().defaultRandom().primaryKey().notNull(),
  Source: uuid().notNull(),
  Target: uuid().notNull(),
  RelationshipType: text(),
  ModifiedAtTimestamp: timestamp()
    .default(sql`statement_timestamp()`)
    .notNull(),
  ModifiedByUser: text(),
  OrgKey: text().notNull(),
  CreatedByUser: text(),
  CreatedAtTimestamp: timestamp()
    .default(sql`statement_timestamp()`)
    .notNull(),
});

export const obligation_type = risksmart.table('obligation_type', {
  Value: text().primaryKey().notNull(),
  Comment: text(),
});

export const obligation_assessment_status = risksmart.table(
  'obligation_assessment_status',
  {
    Value: text().primaryKey().notNull(),
    Comment: text(),
  }
);

export const file = risksmart.table(
  'file',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    FileName: text().notNull(),
    FileSize: integer().notNull(),
    ContentType: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedByUser: text().notNull(),
    OrgKey: text().notNull(),
    Meta: json().$type<JSONB>(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'file_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'file_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'file_orgKey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const acceptance_status = risksmart.table('acceptance_status', {
  Value: text().primaryKey().notNull(),
  Comment: text(),
});

export const issue_assessment_status = risksmart.table(
  'issue_assessment_status',
  {
    Value: text().primaryKey().notNull(),
    Comment: text(),
  }
);

export const action_status = risksmart.table('action_status', {
  Value: text().primaryKey().notNull(),
  Comment: text(),
});

export const cost_type = risksmart.table('cost_type', {
  Value: text().primaryKey().notNull(),
  Comment: text(),
});

export const indicator_type = risksmart.table('indicator_type', {
  Value: text().primaryKey().notNull(),
  Comment: text(),
});

export const test_frequency = risksmart.table('test_frequency', {
  Value: text().primaryKey().notNull(),
  Comment: text(),
});

export const document_assessment_status = risksmart.table(
  'document_assessment_status',
  {
    Value: text().primaryKey().notNull(),
    Comment: text(),
  }
);

export const parent_type = risksmart.table('node_type', {
  Value: text().primaryKey().notNull(),
  Comment: text(),
});

export const custom_attribute_schema = risksmart.table(
  'custom_attribute_schema',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    Schema: jsonb().notNull().$type<JsonSchema7>(),
    UiSchema: jsonb().notNull().$type<VerticalLayout>(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'custom_attribute_schema_createdbyuser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'custom_attribute_schema_modifiedbyuser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'custom_attribute_schema_orgkey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const user_status = auth.table('user_status', {
  Value: text().primaryKey().notNull(),
  Comment: text(),
});

export const user_role = auth.table('user_role', {
  Id: text().primaryKey().notNull(),
  UserId: text().notNull(),
  RoleKey: text().notNull(),
  OrgKey: text().notNull(),
  CreatedByUser: text(),
  CreatedAtTimestamp: timestamp()
    .default(sql`statement_timestamp()`)
    .notNull(),
  ModifiedAtTimestamp: timestamp()
    .default(sql`statement_timestamp()`)
    .notNull(),
  ModifiedByUser: text().notNull(),
});

export const role_resource_type = auth.table('role_resource_type', {
  ResourceType: text().primaryKey().notNull(),
  IsTopLevel: boolean().notNull(),
});

export const role_type = auth.table('role_type', {
  RoleKey: text().primaryKey().notNull(),
  Name: text().notNull(),
  RiskSmartInternal: boolean().notNull(),
  TopLevelRoleKey: text().notNull(),
  InstanceRoleKey: text(),
  Description: text(),
});

export const role_type_resource_type = auth.table(
  'role_type_resource_type',
  {
    RoleKey: text().notNull(),
    ResourceType: text().notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.RoleKey, table.ResourceType],
      name: 'role_type_resource_type_pkey',
    }),
  ]
);

export const document_file_type = risksmart.table('document_file_type', {
  Value: text().primaryKey().notNull(),
  Comment: text(),
});

export const appetite = risksmart.table(
  'appetite',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedByUser: text().notNull(),
    LowerAppetite: integer(),
    UpperAppetite: integer(),
    Statement: text(),
    OrgKey: text().notNull(),
    Meta: json().$type<JSONB>(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    EffectiveDate: timestamp(),
    AppetiteType: text()
      .$type<AppetiteType>()
      .default(AppetiteType.Risk)
      .notNull(),
    ImpactAppetite: integer(),
    SequentialId: integer().notNull(),
    LikelihoodAppetite: integer(),
    ImpactId: uuid(),
  },
  (table) => [
    uniqueIndex('idx_appetite_orgkey_sequentialid').using(
      'btree',
      table.OrgKey.asc().nullsLast().op('int4_ops'),
      table.SequentialId.asc().nullsLast().op('int4_ops')
    ),
    foreignKey({
      columns: [table.AppetiteType],
      foreignColumns: [appetite_type.Value],
      name: 'appetite_AppetiteType_fkey',
    }),
    foreignKey({
      columns: [table.ImpactId],
      foreignColumns: [impact.Id],
      name: 'appetite_ImpactId_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'appetite_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'appetite_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'appetite_id_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'appetite_orgKey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
    check(
      'lowerappetite_check',
      sql`("LowerAppetite" = ANY (ARRAY[1, 2, 3, 4, 5])) OR ("LowerAppetite" IS NULL)`
    ),
    check(
      'upperappetite_check',
      sql`("UpperAppetite" = ANY (ARRAY[1, 2, 3, 4, 5])) OR ("UpperAppetite" IS NULL)`
    ),
  ]
);

export const obligation_impact = risksmart.table(
  'obligation_impact',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    ParentObligationId: uuid().notNull(),
    Description: text().notNull(),
    ImpactRating: smallint().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
  },
  (table) => [
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'obligation_impact_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'obligation_impact_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'obligation_impact_id_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'obligation_impact_orgKey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const acceptance = risksmart.table(
  'acceptance',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    Title: text().notNull(),
    DateAcceptedFrom: timestamp().notNull(),
    DateAcceptedTo: timestamp().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedByUser: text().notNull(),
    Details: text().notNull(),
    Status: text().$type<AcceptanceStatus>().notNull(),
    OrgKey: text().notNull(),
    Meta: json().$type<JSONB>(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ApprovedByUser: text(),
    ApprovedByUserGroup: uuid(),
    RequestedByUser: text(),
    RequestedByUserGroup: uuid(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    SequentialId: integer(),
  },
  (table) => [
    uniqueIndex('idx_acceptance_orgkey_sequentialid').using(
      'btree',
      table.OrgKey.asc().nullsLast().op('int4_ops'),
      table.SequentialId.asc().nullsLast().op('int4_ops')
    ),
    foreignKey({
      columns: [table.ApprovedByUser],
      foreignColumns: [user.Id],
      name: 'acceptance_ApprovedByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'acceptance_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.RequestedByUser],
      foreignColumns: [user.Id],
      name: 'acceptance_RequestedByUser_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'acceptance_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'acceptance_id_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'acceptance_orgKey_fkey',
    }),
    foreignKey({
      columns: [table.Status],
      foreignColumns: [acceptance_status.Value],
      name: 'acceptance_status_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
    check(
      'chk_acceptance_approver',
      sql`("ApprovedByUser" IS NULL) OR ("ApprovedByUserGroup" IS NULL)`
    ),
    check(
      'chk_acceptance_requester',
      sql`("RequestedByUser" IS NULL) OR ("RequestedByUserGroup" IS NULL)`
    ),
  ]
);

export const test_result = risksmart.table(
  'test_result',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedByUser: text().notNull(),
    Title: text(),
    Submitter: text().notNull(),
    Description: text().notNull(),
    ParentControlId: uuid().notNull(),
    TestType: text().$type<TestType>(),
    DesignEffectiveness: integer(),
    PerformanceEffectiveness: integer(),
    OverallEffectiveness: integer(),
    TestDate: timestamp().notNull(),
    NextTestDate: timestamp(),
    OrgKey: text().notNull(),
    Meta: json().$type<JSONB>(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    RatingType: text().default('rating').notNull(),
    SequentialId: integer().notNull(),
  },
  (table) => [
    index('idx_testResult_parentControlId').using(
      'btree',
      table.ParentControlId.asc().nullsLast().op('uuid_ops')
    ),
    uniqueIndex('idx_test_result_orgkey_sequentialid').using(
      'btree',
      table.OrgKey.asc().nullsLast().op('int4_ops'),
      table.SequentialId.asc().nullsLast().op('int4_ops')
    ),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'test_result_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.Submitter],
      foreignColumns: [user.Id],
      name: 'test_result_Submitter_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'test_result_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'test_result_id_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'test_result_orgKey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
    check(
      'designeffectiveness_check',
      sql`("DesignEffectiveness" >= 0) AND ("DesignEffectiveness" <= 4)`
    ),
    check(
      'overalleffectiveness_check',
      sql`("OverallEffectiveness" >= 0) AND ("OverallEffectiveness" <= 4)`
    ),
    check(
      'performanceeffectiveness_check',
      sql`("PerformanceEffectiveness" >= 0) AND ("PerformanceEffectiveness" <= 4)`
    ),
    check(
      'testtype_check',
      sql`"TestType" = ANY (ARRAY['businessLine'::text, '1stLine'::text, '2ndLine'::text, '3rdLine'::text])`
    ),
  ]
);

export const control_test_internal_audit_result = risksmart.table(
  'control_test_internal_audit_result',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedByUser: text().notNull(),
    Title: text(),
    Submitter: text().notNull(),
    Description: text().notNull(),
    ParentControlId: uuid().notNull(),
    TestType: text().$type<TestType>(),
    DesignEffectiveness: integer(),
    PerformanceEffectiveness: integer(),
    OverallEffectiveness: integer(),
    TestDate: timestamp().notNull(),
    NextTestDate: timestamp(),
    OrgKey: text().notNull(),
    Meta: json().$type<JSONB>(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    SequentialId: integer().notNull(),
  },
  (table) => [
    index('idx_testResult_parentControlId').using(
      'btree',
      table.ParentControlId.asc().nullsLast().op('uuid_ops')
    ),
    uniqueIndex(
      'idx_control_test_internal_audit_result_orgkey_sequentialid'
    ).using(
      'btree',
      table.OrgKey.asc().nullsLast().op('int4_ops'),
      table.SequentialId.asc().nullsLast().op('int4_ops')
    ),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'control_test_internal_audit_result_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.Submitter],
      foreignColumns: [user.Id],
      name: 'control_test_internal_audit_result_Submitter_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'control_test_internal_audit_result_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'control_test_internal_audit_result_id_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'control_test_internal_audit_result_orgKey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
    check(
      'designeffectiveness_check',
      sql`("DesignEffectiveness" >= 0) AND ("DesignEffectiveness" <= 4)`
    ),
    check(
      'overalleffectiveness_check',
      sql`("OverallEffectiveness" >= 0) AND ("OverallEffectiveness" <= 4)`
    ),
    check(
      'performanceeffectiveness_check',
      sql`("PerformanceEffectiveness" >= 0) AND ("PerformanceEffectiveness" <= 4)`
    ),
    check(
      'testtype_check',
      sql`"TestType" = ANY (ARRAY['businessLine'::text, '1stLine'::text, '2ndLine'::text, '3rdLine'::text])`
    ),
  ]
);

export const control_test_second_line_result = risksmart.table(
  'control_test_second_line_result',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedByUser: text().notNull(),
    Title: text(),
    Submitter: text().notNull(),
    Description: text().notNull(),
    ParentControlId: uuid().notNull(),
    TestType: text().$type<TestType>(),
    DesignEffectiveness: integer(),
    PerformanceEffectiveness: integer(),
    OverallEffectiveness: integer(),
    TestDate: timestamp().notNull(),
    NextTestDate: timestamp(),
    OrgKey: text().notNull(),
    Meta: json().$type<JSONB>(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    SequentialId: integer().notNull(),
  },
  (table) => [
    index('idx_control_test_second_line_result_parentControlId').using(
      'btree',
      table.ParentControlId.asc().nullsLast().op('uuid_ops')
    ),
    uniqueIndex(
      'idx_control_test_second_line_result_orgkey_sequentialid'
    ).using(
      'btree',
      table.OrgKey.asc().nullsLast().op('int4_ops'),
      table.SequentialId.asc().nullsLast().op('int4_ops')
    ),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'control_test_second_line_result_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.Submitter],
      foreignColumns: [user.Id],
      name: 'control_test_second_line_result_Submitter_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'control_test_second_line_result_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'control_test_second_line_result_id_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'control_test_second_line_result_orgKey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
    check(
      'designeffectiveness_check',
      sql`("DesignEffectiveness" >= 0) AND ("DesignEffectiveness" <= 4)`
    ),
    check(
      'overalleffectiveness_check',
      sql`("OverallEffectiveness" >= 0) AND ("OverallEffectiveness" <= 4)`
    ),
    check(
      'performanceeffectiveness_check',
      sql`("PerformanceEffectiveness" >= 0) AND ("PerformanceEffectiveness" <= 4)`
    ),
    check(
      'testtype_check',
      sql`"TestType" = ANY (ARRAY['businessLine'::text, '1stLine'::text, '2ndLine'::text, '3rdLine'::text])`
    ),
  ]
);

export const action_update = risksmart.table(
  'action_update',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    Title: text().notNull(),
    Description: text().notNull(),
    ParentActionId: uuid().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedByUser: text().notNull(),
    OrgKey: text().notNull(),
    Meta: json().$type<JSONB>(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
  },
  (table) => [
    index('idx_action_update_parentActionId').using(
      'btree',
      table.ParentActionId.asc().nullsLast().op('uuid_ops')
    ),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'action_update_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'action_update_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'action_update_id_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'action_update_orgKey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const issue = risksmart.table(
  'issue',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    Title: text().notNull(),
    Details: text().notNull(),
    ImpactsCustomer: boolean(),
    IsExternalIssue: boolean(),
    DateOccurred: timestamp().notNull(),
    DateIdentified: timestamp().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    OrgKey: text().notNull(),
    Meta: json().$type<JSONB>(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    SequentialId: integer(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    RaisedAtTimestamp: timestamp().notNull(),
    Type: text().default(ParentTypes.Issue).notNull().$type<ParentType>(),
  },
  (table) => [
    uniqueIndex('idx_issue_orgkey_sequentialid').using(
      'btree',
      table.OrgKey.asc().nullsLast().op('text_ops'),
      table.SequentialId.asc().nullsLast().op('int4_ops'),
      table.Type.asc().nullsLast().op('text_ops')
    ),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'issue_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'issue_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'issue_id_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'issue_orgKey_fkey',
    }),
    foreignKey({
      columns: [table.Type],
      foreignColumns: [parent_type.Value],
      name: 'issue_type_parent_type_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
    check(
      'issue_Type_check',
      sql`"Type" = ANY (ARRAY['issue'::text, 'issue_breach_log'::text, 'issue_sar_log'::text, 'issue_gdpr_breach_log'::text, 'issue_pci_breach_log'::text, 'issue_consumer_duty'::text, 'issue_customer_trust'::text, 'issue_risk_event'::text])`
    ),
  ]
);

export const control_group = risksmart.table(
  'control_group',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    Title: text().notNull(),
    Owner: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedByUser: text().notNull(),
    OrgKey: text().notNull(),
    Meta: json().$type<JSONB>(),
    Description: text().default('').notNull(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
  },
  (table) => [
    uniqueIndex('ix_control_group_orgkey_title').using(
      'btree',
      table.OrgKey.asc().nullsLast().op('text_ops'),
      table.Title.asc().nullsLast().op('text_ops')
    ),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'control_group_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'control_group_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'control_group_id_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'control_group_orgKey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const indicator_result = risksmart.table(
  'indicator_result',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    IndicatorId: uuid().notNull(),
    Description: text(),
    ResultDate: timestamp().notNull(),
    TargetValueTxt: text(),
    TargetValueNum: numericCasted(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
  },
  (table) => [
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'indicator_result_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'indicator_result_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'indicator_result_id_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'indicator_result_orgKey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
    check(
      'Indicator_result_target_value',
      sql`(("TargetValueTxt" IS NOT NULL) AND ("TargetValueNum" IS NULL)) OR (("TargetValueTxt" IS NULL) AND ("TargetValueNum" IS NOT NULL))`
    ),
  ]
);

export const comment = risksmart.table(
  'comment',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    ConversationId: uuid().notNull(),
    Content: text().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.ConversationId],
      foreignColumns: [conversation.Id],
      name: 'comment_ConversationId_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'comment_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'comment_OrgKey_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'comment_createdByUser_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const cause = risksmart.table(
  'cause',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    Title: text().notNull(),
    Description: text().notNull(),
    Significance: integer(),
    ParentIssueId: uuid().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedByUser: text().notNull(),
    OrgKey: text().notNull(),
    Meta: json().$type<JSONB>(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
  },
  (table) => [
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'cause_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'cause_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'cause_id_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'cause_orgKey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
    check(
      'significance_check',
      sql`("Significance" = ANY (ARRAY[1, 2, 3, 4, 5])) OR ("Significance" IS NULL)`
    ),
  ]
);

export const taxonomy = risksmart.table(
  'taxonomy',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    Description: text().notNull(),
    Common: jsonb().notNull(),
    Library: jsonb().notNull(),
    Rating: jsonb().notNull(),
    Taxonomy: jsonb().notNull(),
    InternalAuditRating: jsonb().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'taxonomy_createdbyuser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'taxonomy_modifiedbyuser_fkey',
    }),
  ]
);

export const issue_update = risksmart.table(
  'issue_update',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    Title: text().notNull(),
    Description: text().notNull(),
    ParentIssueId: uuid().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedByUser: text().notNull(),
    OrgKey: text().notNull(),
    Meta: json().$type<JSONB>(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
  },
  (table) => [
    index('idx_issue_update_parentActionId').using(
      'btree',
      table.ParentIssueId.asc().nullsLast().op('uuid_ops')
    ),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'issue_update_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'issue_update_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'issue_update_id_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'issue_update_orgKey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const taxonomy_org = risksmart.table(
  'taxonomy_org',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    TaxonomyId: uuid().notNull(),
    Locale: text().notNull(),
    OrgName: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    OrgKey: text().notNull(),
  },
  (table) => [
    index('idx_taxonomy_org_orgkey_locale').using(
      'btree',
      table.OrgKey.asc().nullsLast().op('text_ops'),
      table.Locale.asc().nullsLast().op('text_ops')
    ),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'taxonomy_org_createdbyuser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'taxonomy_org_modifiedbyuser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'taxonomy_org_orgkey_fkey',
    }),
    foreignKey({
      columns: [table.TaxonomyId],
      foreignColumns: [taxonomy.Id],
      name: 'taxonomy_org_taxonomyid_fkey',
    }),
  ]
);

export const risk_treatment_type = risksmart.table('risk_treatment_type', {
  Value: text().primaryKey().notNull(),
  Comment: text().notNull(),
});

export const approval_rule_type = risksmart.table('approval_rule_type', {
  Value: text().primaryKey().notNull(),
  Comment: text().notNull(),
});

export const approval_status = risksmart.table('approval_status', {
  Value: text().primaryKey().notNull(),
  Comment: text().notNull(),
});

export const risk_status_type = risksmart.table('risk_status_type', {
  Value: text().primaryKey().notNull(),
  Comment: text().notNull(),
});

export const approval_level = risksmart.table(
  'approval_level',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    Description: text().notNull(),
    SequenceOrder: integer().notNull(),
    ApprovalId: uuid().notNull(),
    ApprovalRuleType: text().$type<ApprovalRuleType>().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    uniqueIndex('idx_approval_level_seq_approval_id').using(
      'btree',
      table.ApprovalId.asc().nullsLast().op('int4_ops'),
      table.SequenceOrder.asc().nullsLast().op('int4_ops')
    ),
    foreignKey({
      columns: [table.ApprovalRuleType],
      foreignColumns: [approval_rule_type.Value],
      name: 'ApprovalLevel_ApprovalRuleType_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'approval_level_createdbyuser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'approval_level_modifiedbyuser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'approval_level_orgkey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const approval = risksmart.table(
  'approval',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    ParentId: uuid(),
    Workflow: text().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    InFlightEditRule: text()
      .$type<ApprovalInFlightEditRule>()
      .default(ApprovalInFlightEditRule.Approvers)
      .notNull(),
  },
  (table) => [
    uniqueIndex('idx_approval_parent_parent_type').using(
      'btree',
      table.ParentId.asc().nullsLast().op('text_ops'),
      table.Workflow.asc().nullsLast().op('text_ops')
    ),
    foreignKey({
      columns: [table.InFlightEditRule],
      foreignColumns: [approval_in_flight_edit_rule.Value],
      name: 'approval_InFlightEditRule_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'approval_createdbyuser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'approval_modifiedbyuser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'approval_orgkey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const approver = risksmart.table(
  'approver',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    UserId: text(),
    LevelId: uuid().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    OwnerApprover: boolean(),
    UserGroupId: uuid(),
  },
  (table) => [
    uniqueIndex('idx_approver_user_level').using(
      'btree',
      table.UserId.asc().nullsLast().op('text_ops'),
      table.LevelId.asc().nullsLast().op('text_ops')
    ),
    foreignKey({
      columns: [table.UserGroupId],
      foreignColumns: [user_group.Id],
      name: 'approver_UserGroupId_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'approver_createdbyuser_fkey',
    }),
    foreignKey({
      columns: [table.LevelId],
      foreignColumns: [approval_level.Id],
      name: 'approver_level_fk',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'approver_modifiedbyuser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'approver_orgkey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
    check(
      'user_id_xor_group_xor_owner_approver',
      sql`(("UserId" IS NOT NULL) AND ("UserGroupId" IS NULL) AND ("OwnerApprover" IS NOT TRUE)) OR (("UserGroupId" IS NOT NULL) AND ("UserId" IS NULL) AND ("OwnerApprover" IS NOT TRUE)) OR (("OwnerApprover" IS TRUE) AND ("UserId" IS NULL) AND ("UserGroupId" IS NULL))`
    ),
  ]
);

export const access_type = risksmart.table('access_type', {
  Value: text().primaryKey().notNull(),
  Comment: text(),
});

export const contributor_type = risksmart.table('contributor_type', {
  Value: text().primaryKey().notNull(),
  Comment: text(),
});

export const dashboard = risksmart.table(
  'dashboard',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    Name: text().notNull(),
    Description: text(),
    Sharing: text().$type<DashboardSharingType>().notNull(),
    Content: jsonb().$type<JSONB>(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    OrgKey: text().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.Sharing],
      foreignColumns: [dashboard_sharing_type.Value],
      name: 'Dashboard_Sharing_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'dashboard_CreatedByUser_fkey',
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'dashboard_ModifiedByUser_fkey',
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'dashboard_OrgKey_fkey',
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'dashboard_id_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const version_status = risksmart.table('version_status', {
  Value: text().primaryKey().notNull(),
  Comment: text(),
});

export const action = risksmart.table(
  'action',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    Title: text().notNull(),
    DateRaised: timestamp().notNull(),
    DateDue: timestamp().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedByUser: text().notNull(),
    Status: text().$type<ActionStatus>().notNull(),
    OrgKey: text().notNull(),
    Meta: json().$type<JSONB>(),
    Priority: integer().default(1),
    Description: text(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ClosedDate: timestamp(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    SequentialId: integer(),
  },
  (table) => [
    uniqueIndex('idx_action_orgkey_sequentialid').using(
      'btree',
      table.OrgKey.asc().nullsLast().op('int4_ops'),
      table.SequentialId.asc().nullsLast().op('int4_ops')
    ),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'action_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'action_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'action_id_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'action_orgKey_fkey',
    }),
    foreignKey({
      columns: [table.Status],
      foreignColumns: [action_status.Value],
      name: 'action_status_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
    check('priority_check', sql`"Priority" = ANY (ARRAY[1, 2, 3])`),
  ]
);

export const risk = risksmart.table(
  'risk',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedByUser: text().notNull(),
    Title: text().notNull(),
    Description: text(),
    Tier: integer().notNull(),
    ParentRiskId: uuid(),
    OrgKey: text().notNull(),
    Meta: json().$type<JSONB>(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    Treatment: text().$type<RiskTreatmentType>(),
    Status: text().$type<RiskStatusType>(),
    SequentialId: integer(),
  },
  (table) => [
    uniqueIndex('idx_risk_orgkey_sequentialid').using(
      'btree',
      table.OrgKey.asc().nullsLast().op('int4_ops'),
      table.SequentialId.asc().nullsLast().op('int4_ops')
    ),
    index('idx_risk_parentRiskId').using(
      'btree',
      table.ParentRiskId.asc().nullsLast().op('uuid_ops')
    ),
    foreignKey({
      columns: [table.Status],
      foreignColumns: [risk_status_type.Value],
      name: 'Risk_Status_fkey',
    }),
    foreignKey({
      columns: [table.Treatment],
      foreignColumns: [risk_treatment_type.Value],
      name: 'Risk_Treatment_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'risk_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'risk_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'risk_id_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'risk_orgKey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
    check('tier_check', sql`"Tier" = ANY (ARRAY[1, 2, 3])`),
  ]
);

export const obligation = risksmart.table(
  'obligation',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    ParentId: uuid(),
    Title: text().notNull(),
    Description: text().notNull(),
    Interpretation: text(),
    Adherence: text().notNull(),
    Type: text().$type<ObligationType>().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    SequentialId: integer(),
    ExternalId: text(),
    RegulatorySourceId: uuid(),
    ExternalSyncedAt: timestamp(),
    Reference: text(),
    SourceUrl: text(),
    ContentHash: text(),
  },
  (table) => [
    uniqueIndex('idx_obligation_orgkey_sequentialid').using(
      'btree',
      table.OrgKey.asc().nullsLast().op('int4_ops'),
      table.SequentialId.asc().nullsLast().op('int4_ops')
    ),
    foreignKey({
      columns: [table.Type],
      foreignColumns: [obligation_type.Value],
      name: 'Obligation_type_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'obligation_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'obligation_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'obligation_id_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'obligation_orgKey_fkey',
    }),
    foreignKey({
      columns: [table.RegulatorySourceId],
      foreignColumns: [regulatory_source.Id],
      name: 'obligation_regulatorySourceId_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const obligation_change = risksmart.table(
  'obligation_change',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    SequentialId: integer().notNull().default(0), // trigger-managed; default is a placeholder
    ObligationId: uuid(),
    ExternalId: text().notNull(),
    EffectiveDate: timestamp(),
    DescriptionBefore: text(),
    DescriptionAfter: text(),
    Rationale: text(),
    ContentHash: text(),
    SourceUrl: text(),
    OrgKey: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`now()`)
      .notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`now()`)
      .notNull(),
    ModifiedByUser: text().notNull(),
    CreatedByUser: text().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'obligation_change_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'obligation_change_CreatedByUser_fkey',
    }),
    foreignKey({
      columns: [table.ObligationId],
      foreignColumns: [obligation.Id],
      name: 'obligation_change_ObligationId_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'obligation_change_id_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'obligation_change_orgKey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
    unique('obligation_change_OrgKey_ExternalId_ObligationId_unique').on(
      table.OrgKey,
      table.ExternalId,
      table.ObligationId
    ),
  ]
);

export const obligation_change_attestation = risksmart.table(
  'obligation_change_attestation',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    ObligationChangeId: uuid(),
    UserId: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`now()`)
      .notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`now()`)
      .notNull(),
    OrgKey: text().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.ObligationChangeId],
      foreignColumns: [obligation_change.Id],
      name: 'obligation_change_attestation_ObligationChangeId_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.UserId],
      foreignColumns: [user.Id],
      name: 'obligation_change_attestation_UserId_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'obligation_change_attestation_CreatedByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'obligation_change_attestation_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'obligation_change_attestation_orgKey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const document = risksmart.table(
  'document',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    Title: text().notNull(),
    DocumentType: text().notNull(),
    Purpose: text(),
    ParentDocument: uuid(),
    OrgKey: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    Meta: json().$type<JSONB>(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    SequentialId: integer(),
  },
  (table) => [
    index('idx_document_ParentDocument').using(
      'btree',
      table.ParentDocument.asc().nullsLast().op('uuid_ops')
    ),
    uniqueIndex('idx_document_orgkey_sequentialid').using(
      'btree',
      table.OrgKey.asc().nullsLast().op('int4_ops'),
      table.SequentialId.asc().nullsLast().op('int4_ops')
    ),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'document_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'document_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'document_id_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'document_orgKey_fkey',
    }),
    foreignKey({
      columns: [table.ParentDocument],
      foreignColumns: [table.Id],
      name: 'document_parentDocument_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const risk_assessment_result_control_type = risksmart.table(
  'risk_assessment_result_control_type',
  {
    Value: text().primaryKey().notNull(),
    Comment: text().notNull(),
  }
);

export const node = risksmart.table(
  'node',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    ObjectType: text().$type<ParentType>().notNull(),
    OrgKey: text().notNull(),
    SequentialId: integer(),
  },
  (table) => [
    index('ix_node_orgkey_id').using(
      'btree',
      table.OrgKey.asc().nullsLast().op('text_ops'),
      table.Id.asc().nullsLast().op('text_ops')
    ),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'node_OrgKey',
    }),
    foreignKey({
      columns: [table.ObjectType],
      foreignColumns: [parent_type.Value],
      name: 'node_Type_fkey',
    }),
  ]
);

export const conversation = risksmart.table(
  'conversation',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    IsResolved: boolean().default(false),
    ParentId: uuid(),
  },
  (table) => [
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'conversation_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'conversation_OrgKey_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'conversation_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'conversation_id_fkey',
    }),
    foreignKey({
      columns: [table.ParentId],
      foreignColumns: [node.Id],
      name: 'conversation_parentId_fkey',
    }).onDelete('cascade'),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const consequence_type = risksmart.table('consequence_type', {
  Value: text().primaryKey().notNull(),
  Comment: text(),
});

export const dashboard_sharing_type = risksmart.table(
  'dashboard_sharing_type',
  {
    Value: text().primaryKey().notNull(),
    Comment: text(),
  }
);

export const control_type = risksmart.table('control_type', {
  Value: text().primaryKey().notNull(),
  Comment: text(),
});

export const impact = risksmart.table(
  'impact',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    SequentialId: integer().notNull(),
    Name: text().notNull(),
    Rationale: text(),
    ImpactAppetite: smallint(),
    LikelihoodAppetite: smallint(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    OrgKey: text().notNull(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    RatingGuidance: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'impact_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'impact_id_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'impact_modifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'impact_orgKey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const consequence = risksmart.table(
  'consequence',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    Title: text().notNull(),
    Description: text().notNull(),
    Criticality: integer(),
    CostType: text().$type<CostType>().notNull(),
    CostValue: numericCasted().notNull(),
    ParentIssueId: uuid().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedByUser: text().notNull(),
    OrgKey: text().notNull(),
    Meta: json().$type<JSONB>(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    Type: text().$type<ConsequenceType>(),
  },
  (table) => [
    index('idx_consequence_parentIssueId').using(
      'btree',
      table.ParentIssueId.asc().nullsLast().op('uuid_ops')
    ),
    foreignKey({
      columns: [table.CostType],
      foreignColumns: [cost_type.Value],
      name: 'Consequence_CostType_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'consequence_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'consequence_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'consequence_id_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'consequence_orgKey_fkey',
    }),
    foreignKey({
      columns: [table.Type],
      foreignColumns: [consequence_type.Value],
      name: 'consequence_type_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
    check(
      'criticality_check',
      sql`("Criticality" = ANY (ARRAY[1, 2, 3, 4, 5])) OR ("Criticality" IS NULL)`
    ),
  ]
);

export const assessment = risksmart.table(
  'assessment',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    SequentialId: integer(),
    Title: text().notNull(),
    Summary: text().notNull(),
    TargetCompletionDate: timestamp(),
    ActualCompletionDate: timestamp(),
    StartDate: timestamp(),
    NextTestDate: timestamp(),
    OrgKey: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CompletedByUser: text(),
    OriginatingItemId: uuid(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    Status: text()
      .$type<AssessmentStatus>()
      .default(AssessmentStatus.NotStarted)
      .notNull(),
    Outcome: integer(),
  },
  (table) => [
    uniqueIndex('idx_assessment_orgkey_sequentialid').using(
      'btree',
      table.OrgKey.asc().nullsLast().op('int4_ops'),
      table.SequentialId.asc().nullsLast().op('int4_ops')
    ),
    foreignKey({
      columns: [table.CompletedByUser],
      foreignColumns: [user.Id],
      name: 'assessment_completedByUser_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'assessment_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'assessment_modifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'assessment_orgKey_fkey',
    }),
    foreignKey({
      columns: [table.Status],
      foreignColumns: [assessment_status.Value],
      name: 'assessment_status_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'node_assessment_id_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const enterprise_risk_score = risksmart.table(
  'enterprise_risk_score',
  {
    EnterpriseRiskId: uuid().primaryKey().notNull(),
    InherentScoreMean: doublePrecision(),
    InherentScoreMedian: doublePrecision(),
    InherentScoreWorstCase: doublePrecision(),
    ResidualScoreMean: doublePrecision(),
    ResidualScoreMedian: doublePrecision(),
    ResidualScoreWorstCase: doublePrecision(),
    ResidualRatingMean: doublePrecision(),
    ResidualRatingMedian: doublePrecision(),
    ResidualRatingWorstCase: doublePrecision(),
    InherentRatingMean: doublePrecision(),
    InherentRatingMedian: doublePrecision(),
    InherentRatingWorstCase: doublePrecision(),
    OrgKey: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedByUser: text(),
    ModifiedByUser: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'enterprise_risk_score_CreatedByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'enterprise_risk_score_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'enterprise_risk_score_organisationKey_fkey',
    }),
    foreignKey({
      columns: [table.EnterpriseRiskId],
      foreignColumns: [enterprise_risk.Id],
      name: 'enterprise_risk_score_risk_id_fkey',
    }).onDelete('cascade'),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const custom_datasource = risksmart.table(
  'custom_datasource',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedByUser: text().notNull(),
    Title: text().notNull(),
    Datasources: jsonb().notNull(),
    Fields: jsonb().notNull(),
    Filters: jsonb().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'control_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'control_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'control_orgKey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const control = risksmart.table(
  'control',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedByUser: text().notNull(),
    Title: text().notNull(),
    Description: text().notNull(),
    Type: text().$type<ControlType>(),
    OrgKey: text().notNull(),
    Meta: json().$type<JSONB>(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    SequentialId: integer(),
  },
  (table) => [
    uniqueIndex('idx_control_orgkey_sequentialid').using(
      'btree',
      table.OrgKey.asc().nullsLast().op('int4_ops'),
      table.SequentialId.asc().nullsLast().op('int4_ops')
    ),
    foreignKey({
      columns: [table.Type],
      foreignColumns: [control_type.Value],
      name: 'Control_type_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'control_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'control_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'control_id_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'control_orgKey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const issue_assessment = risksmart.table(
  'issue_assessment',
  {
    ParentIssueId: uuid().notNull(),
    IssueType: text(),
    Severity: integer(),
    TargetCloseDate: timestamp(),
    ActualCloseDate: timestamp(),
    Status: text().$type<IssueAssessmentStatus>(),
    CertifiedIndividual: text(),
    RegulatoryBreach: boolean(),
    RegulationsBreached: text(),
    Reportable: boolean(),
    Rationale: text(),
    IssueCausedByThirdParty: boolean(),
    ThirdPartyResponsible: text(),
    IssueCausedBySystemIssue: boolean(),
    SystemResponsible: text(),
    PolicyBreach: boolean(),
    PoliciesBreached: text(),
    PolicyOwner: text(),
    PolicyOwnerCommentary: text(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    OrgKey: text().notNull(),
    Meta: json().$type<JSONB>(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    Id: uuid().defaultRandom().primaryKey().notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    Type: text()
      .$type<ParentType>()
      .default(ParentTypes.IssueAssessment)
      .notNull(),
  },
  (table) => [
    uniqueIndex('idx_issueAssessment_parentIssueId').using(
      'btree',
      table.ParentIssueId.asc().nullsLast().op('uuid_ops')
    ),
    foreignKey({
      columns: [table.CertifiedIndividual],
      foreignColumns: [user.Id],
      name: 'issue_assessment_CertifiedIndividual_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'issue_assessment_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.PolicyOwner],
      foreignColumns: [user.Id],
      name: 'issue_assessment_PolicyOwner_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'issue_assessment_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'issue_assessment_id_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'issue_assessment_orgKey_fkey',
    }),
    foreignKey({
      columns: [table.Status],
      foreignColumns: [issue_assessment_status.Value],
      name: 'issue_assessment_status_fkey',
    }),
    foreignKey({
      columns: [table.Type],
      foreignColumns: [parent_type.Value],
      name: 'issue_assessment_type_parent_type_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
    check(
      'issue_assessment_Type_check',
      sql`"Type" = ANY (ARRAY['issue_assessment_breach_log'::text, 'issue_assessment_sar_log'::text, 'issue_assessment_gdpr_breach_log'::text, 'issue_assessment_pci_breach_log'::text, 'issue_assessment_consumer_duty'::text, 'issue_assessment_customer_trust'::text, 'issue_assessment_risk_event'::text, 'issue_assessment'::text])`
    ),
  ]
);

export const impact_rating = risksmart.table(
  'impact_rating',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    ImpactId: uuid().notNull(),
    RatedItemId: uuid().notNull(),
    SequentialId: integer().notNull(),
    Rating: smallint().notNull(),
    TestDate: timestamp().notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CompletedBy: text(),
    RatingType: text().default('rating').notNull(),
    Likelihood: integer(),
  },
  (table) => [
    index('idx_impact_rating_impactId').using(
      'btree',
      table.ImpactId.asc().nullsLast().op('uuid_ops')
    ),
    index('idx_impact_rating_orgKey').using(
      'btree',
      table.OrgKey.asc().nullsLast().op('text_ops')
    ),
    index('idx_impact_rating_ratedItemId').using(
      'btree',
      table.RatedItemId.asc().nullsLast().op('uuid_ops')
    ),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'impact_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'impact_modifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.CompletedBy],
      foreignColumns: [user.Id],
      name: 'impact_rating_CompletedBy_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'impact_rating_id_fkey',
    }),
    foreignKey({
      columns: [table.ImpactId],
      foreignColumns: [impact.Id],
      name: 'impact_rating_impactid_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'impact_rating_orgKey_fkey',
    }),
    foreignKey({
      columns: [table.RatedItemId],
      foreignColumns: [node.Id],
      name: 'impact_rating_rateditemid_fkey',
    }).onDelete('cascade'),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const impact_internal_audit_rating = risksmart.table(
  'impact_internal_audit_rating',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    ImpactId: uuid().notNull(),
    RatedItemId: uuid().notNull(),
    SequentialId: integer().notNull(),
    Rating: smallint().notNull(),
    TestDate: timestamp().notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CompletedBy: text(),
    Likelihood: integer(),
  },
  (table) => [
    index('idx_impact_internal_audit_rating_impactId').using(
      'btree',
      table.ImpactId.asc().nullsLast().op('uuid_ops')
    ),
    index('idx_impact_internal_audit_rating_orgKey').using(
      'btree',
      table.OrgKey.asc().nullsLast().op('text_ops')
    ),
    index('idx_impact_internal_audit_rating_ratedItemId').using(
      'btree',
      table.RatedItemId.asc().nullsLast().op('uuid_ops')
    ),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'impact_internal_audit_rating_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'impact_internal_audit_rating_modifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.CompletedBy],
      foreignColumns: [user.Id],
      name: 'impact_internal_audit_rating_CompletedBy_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'impact_internal_audit_rating_id_fkey',
    }),
    foreignKey({
      columns: [table.ImpactId],
      foreignColumns: [impact.Id],
      name: 'impact_internal_audit_rating_impactid_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'impact_internal_audit_rating_orgKey_fkey',
    }),
    foreignKey({
      columns: [table.RatedItemId],
      foreignColumns: [node.Id],
      name: 'impact_internal_audit_rating_rateditemid_fkey',
    }).onDelete('cascade'),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const impact_second_line_rating = risksmart.table(
  'impact_second_line_rating',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    ImpactId: uuid().notNull(),
    RatedItemId: uuid().notNull(),
    SequentialId: integer().notNull(),
    Rating: smallint().notNull(),
    TestDate: timestamp().notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CompletedBy: text(),
    Likelihood: integer(),
  },
  (table) => [
    index('idx_impact_second_line_rating_impactId').using(
      'btree',
      table.ImpactId.asc().nullsLast().op('uuid_ops')
    ),
    index('idx_impact_second_line_rating_orgKey').using(
      'btree',
      table.OrgKey.asc().nullsLast().op('text_ops')
    ),
    index('idx_impact_second_line_rating_ratedItemId').using(
      'btree',
      table.RatedItemId.asc().nullsLast().op('uuid_ops')
    ),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'impact_second_line_rating_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'impact_second_line_rating_modifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.CompletedBy],
      foreignColumns: [user.Id],
      name: 'impact_second_line_rating_CompletedBy_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'impact_second_line_rating_id_fkey',
    }),
    foreignKey({
      columns: [table.ImpactId],
      foreignColumns: [impact.Id],
      name: 'impact_second_line_rating_impactid_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'impact_second_line_rating_orgKey_fkey',
    }),
    foreignKey({
      columns: [table.RatedItemId],
      foreignColumns: [node.Id],
      name: 'impact_second_line_rating_rateditemid_fkey',
    }).onDelete('cascade'),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const tag_type = risksmart.table(
  'tag_type',
  {
    TagTypeId: uuid('Id').defaultRandom().primaryKey().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    Name: text().notNull(),
    Description: text(),
    ModifiedByUser: text().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    TagTypeGroupId: uuid(),
  },
  (table) => [
    uniqueIndex('ix_tag_type_orgkey_title').using(
      'btree',
      table.OrgKey.asc().nullsLast().op('text_ops'),
      table.Name.asc().nullsLast().op('text_ops')
    ),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'tag_type_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'tag_type_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'tag_type_orgKey_fkey',
    }),
    foreignKey({
      columns: [table.TagTypeGroupId],
      foreignColumns: [tag_type_group.Id],
      name: 'tag_type_tagtypegroupid_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const indicator = risksmart.table(
  'indicator',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    Title: text().notNull(),
    Description: text(),
    Type: text().$type<IndicatorType>().notNull(),
    Unit: text(),
    UpperToleranceNum: numericCasted(),
    LowerToleranceNum: numericCasted(),
    TargetValueTxt: text(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    SequentialId: integer(),
    UpperAppetiteNum: numericCasted(),
    LowerAppetiteNum: numericCasted(),
  },
  (table) => [
    uniqueIndex('idx_indicator_orgkey_sequentialid').using(
      'btree',
      table.OrgKey.asc().nullsLast().op('int4_ops'),
      table.SequentialId.asc().nullsLast().op('int4_ops')
    ),
    foreignKey({
      columns: [table.Type],
      foreignColumns: [indicator_type.Value],
      name: 'Indicator_type_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'indicator_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'indicator_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'indicator_id_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'indicator_orgKey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const department_type = risksmart.table(
  'department_type',
  {
    DepartmentTypeId: uuid('Id').defaultRandom().primaryKey().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    Name: text().notNull(),
    Description: text(),
    ModifiedByUser: text().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    DepartmentTypeGroupId: uuid(),
  },
  (table) => [
    uniqueIndex('ix_department_type_orgkey_title').using(
      'btree',
      table.OrgKey.asc().nullsLast().op('text_ops'),
      table.Name.asc().nullsLast().op('text_ops')
    ),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'department_type_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'department_type_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.DepartmentTypeGroupId],
      foreignColumns: [department_type_group.Id],
      name: 'department_type_departmenttypegroupid_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'department_type_orgKey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const obligation_assessment_result = risksmart.table(
  'obligation_assessment_result',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    Rating: integer(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    Rationale: text(),
    TestDate: timestamp(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp(),
    RatingType: text().default('rating').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'node_obligation_assessment_result_id_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'obligation_assessment_result_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'obligation_assessment_result_modifiedbyuser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'obligation_assessment_result_orgKey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
    check('rating_check', sql`"Rating" = ANY (ARRAY[1, 2, 3, 4, 5])`),
  ]
);

export const obligation_internal_audit_result = risksmart.table(
  'obligation_internal_audit_result',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    Rating: integer(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    Rationale: text(),
    TestDate: timestamp(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp(),
  },
  (table) => [
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'node_obligation_internal_audit_result_id_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'obligation_internal_audit_result_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'obligation_internal_audit_result_modifiedbyuser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'obligation_internal_audit_result_orgKey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
    check('rating_check', sql`"Rating" = ANY (ARRAY[1, 2, 3, 4, 5])`),
  ]
);

export const obligation_second_line_result = risksmart.table(
  'obligation_second_line_result',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    Rating: integer(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    Rationale: text(),
    TestDate: timestamp(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp(),
  },
  (table) => [
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'node_obligation_second_line_result_id_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'obligation_second_line_result_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'obligation_second_line_result_modifiedbyuser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'obligation_second_line_result_orgKey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
    check('rating_check', sql`"Rating" = ANY (ARRAY[1, 2, 3, 4, 5])`),
  ]
);

export const risk_assessment_result = risksmart.table(
  'risk_assessment_result',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    ControlType: text().$type<RiskAssessmentResultControlType>().notNull(),
    Likelihood: integer(),
    Impact: integer(),
    Rating: integer(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    Rationale: text(),
    TestDate: timestamp(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp(),
    RatingType: text().default('rating').notNull(),
    ConfigId: uuid(),
  },
  (table) => [
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'node_risk_assessment_result_id_fkey',
    }),
    foreignKey({
      columns: [table.ControlType],
      foreignColumns: [risk_assessment_result_control_type.Value],
      name: 'risk_assessment_result_control_type_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'risk_assessment_result_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'risk_assessment_result_modifiedbyuser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'risk_assessment_result_orgKey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const risk_assessment_result_impact = risksmart.table(
  'risk_assessment_result_impact',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    RiskAssessmentResultId: uuid().notNull(),
    OrgKey: text().notNull(),
    Label: text().notNull(),
    Value: integer().notNull(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.RiskAssessmentResultId],
      foreignColumns: [risk_assessment_result.Id],
      name: 'risk_assessment_result_impact_riskAssessmentResultId_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'risk_assessment_result_impact_OrgKey_fkey',
    }),
    index('idx_risk_assessment_result_impact_orgkey').on(table.OrgKey),
    unique('risk_assessment_result_impact_parent_label_unique').on(
      table.RiskAssessmentResultId,
      table.Label
    ),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'risk_assessment_result_impact_CreatedByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'risk_assessment_result_impact_ModifiedByUser_fkey',
    }),

    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: 'reporting',
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const risk_assessment_result_config = risksmart.table(
  'risk_assessment_result_config',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    OrgKey: text().notNull(),
    Version: integer().default(1).notNull(),
    Config: jsonb().$type<JSONB>(),
    IsLatest: boolean().default(true).notNull(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'risk_assessment_result_config_OrgKey_fkey',
    }),
    index('idx_risk_assessment_result_config_orgkey').on(table.OrgKey),
    unique('risk_assessment_result_config_orgkey_version_unique').on(
      table.OrgKey,
      table.Version
    ),
    uniqueIndex('idx_risk_assessment_result_config_orgkey_islatest')
      .on(table.OrgKey)
      .where(eq(table.IsLatest, true)),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'risk_assessment_result_config_CreatedByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'risk_assessment_result_config_ModifiedByUser_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: 'reporting',
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const risk_assessment_result_config_audit = risksmart.table(
  'risk_assessment_result_config_audit',
  {
    Id: uuid().notNull(),
    OrgKey: text().notNull(),
    Version: integer().notNull(),
    Config: jsonb().$type<JSONB>(),
    IsLatest: boolean().notNull(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp().notNull(),
    Action: dbActionEnum('Action').notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.OrgKey, table.ModifiedAtTimestamp],
      name: 'risk_assessment_result_config_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: 'reporting',
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const risk_assessment_result_impact_audit = risksmart.table(
  'risk_assessment_result_impact_audit',
  {
    Id: uuid().notNull(),
    RiskAssessmentResultId: uuid().notNull(),
    OrgKey: text().notNull(),
    Label: text().notNull(),
    Value: integer().notNull(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp().notNull(),
    Action: dbActionEnum('Action').notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.OrgKey, table.ModifiedAtTimestamp],
      name: 'risk_assessment_result_impact_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: 'reporting',
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const risk_controlled_internal_audit_result = risksmart.table(
  'risk_controlled_internal_audit_result',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    Likelihood: integer(),
    Impact: integer(),
    Rating: integer(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    Rationale: text(),
    TestDate: timestamp(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp(),
  },
  (table) => [
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'node_risk_controlled_internal_audit_resultt_id_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'risk_controlled_internal_audit_result_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'risk_controlled_internal_audit_result_modifiedbyuser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'risk_controlled_internal_audit_result_orgKey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const risk_uncontrolled_internal_audit_result = risksmart.table(
  'risk_uncontrolled_internal_audit_result',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    Likelihood: integer(),
    Impact: integer(),
    Rating: integer(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    Rationale: text(),
    TestDate: timestamp(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp(),
  },
  (table) => [
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'node_risk_uncontrolled_internal_audit_result_id_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'risk_uncontrolled_internal_audit_result_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'risk_uncontrolled_internal_audit_result_modifiedbyuser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'risk_uncontrolled_internal_audit_result_orgKey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const risk_controlled_second_line_result = risksmart.table(
  'risk_controlled_second_line_result',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    Likelihood: integer(),
    Impact: integer(),
    Rating: integer(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    Rationale: text(),
    TestDate: timestamp(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp(),
  },
  (table) => [
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'node_risk_controlled_second_line_result_id_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'risk_controlled_second_line_result_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'risk_controlled_second_line_result_modifiedbyuser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'risk_controlled_second_line_result_orgKey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const risk_uncontrolled_second_line_result = risksmart.table(
  'risk_uncontrolled_second_line_result',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    Likelihood: integer(),
    Impact: integer(),
    Rating: integer(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    Rationale: text(),
    TestDate: timestamp(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp(),
  },
  (table) => [
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'node_risk_uncontrolled_second_line_result_id_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'risk_uncontrolled_second_line_result_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'risk_uncontrolled_second_line_result_modifiedbyuser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'risk_uncontrolled_second_line_result_orgKey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const old_risk_assessment = risksmart.table(
  'old_risk_assessment',
  {
    ParentId: uuid().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ControlType: text().notNull(),
    Likelihood: integer(),
    Impact: integer(),
    Rating: integer(),
    Description: text().notNull(),
    ModifiedByUser: text().notNull(),
    OrgKey: text().notNull(),
    NextTestDate: timestamp(),
    Meta: json().$type<JSONB>(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    Id: uuid().defaultRandom().primaryKey().notNull(),
  },
  (table) => [
    uniqueIndex('idx_riskAssessment_parentId').using(
      'btree',
      table.ParentId.asc().nullsLast().op('text_ops'),
      table.ControlType.asc().nullsLast().op('text_ops')
    ),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
    check(
      'controltype_check',
      sql`"ControlType" = ANY (ARRAY['Controlled'::text, 'Uncontrolled'::text])`
    ),
    check(
      'impact_check',
      sql`("Impact" = ANY (ARRAY[1, 2, 3, 4, 5])) OR ("Impact" IS NULL)`
    ),
    check(
      'likelihood_check',
      sql`("Likelihood" = ANY (ARRAY[1, 2, 3, 4, 5])) OR ("Likelihood" IS NULL)`
    ),
    check('rating_check', sql`"Rating" = ANY (ARRAY[1, 2, 3, 4, 5])`),
  ]
);

export const document_assessment_result = risksmart.table(
  'document_assessment_result',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    Rating: integer(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    Rationale: text(),
    TestDate: timestamp(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp(),
    RatingType: text().default('rating').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'document_assessment_result_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'document_assessment_result_modifiedbyuser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'document_assessment_result_orgKey_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'node_document_assessment_result_id_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
    check('rating_check', sql`"Rating" = ANY (ARRAY[1, 2, 3, 4, 5])`),
  ]
);

export const document_internal_audit_result = risksmart.table(
  'document_internal_audit_result',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    Rating: integer(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    Rationale: text(),
    TestDate: timestamp(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp(),
  },
  (table) => [
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'document_internal_audit_result_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'document_internal_audit_result_modifiedbyuser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'document_internal_audit_result_orgKey_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'node_document_internal_audit_result_id_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
    check('rating_check', sql`"Rating" = ANY (ARRAY[1, 2, 3, 4, 5])`),
  ]
);

export const document_second_line_result = risksmart.table(
  'document_second_line_result',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    Rating: integer(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    Rationale: text(),
    TestDate: timestamp(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp(),
  },
  (table) => [
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'document_second_line_result_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'document_second_line_result_modifiedbyuser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'document_second_line_result_orgKey_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'node_document_second_line_result_id_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
    check('rating_check', sql`"Rating" = ANY (ARRAY[1, 2, 3, 4, 5])`),
  ]
);

export const document_file = risksmart.table(
  'document_file',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    Version: text().notNull(),
    FileId: uuid(),
    Summary: text(),
    Status: text().$type<VersionStatus>().notNull(),
    ReasonForReview: text(),
    ReviewedBy: text(),
    ReviewDate: timestamp(),
    NextReviewDate: timestamp(),
    ParentDocumentId: uuid().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    Meta: json().$type<JSONB>(),
    Content: text(),
    Type: text()
      .$type<DocumentFileType>()
      .default(DocumentFileType.File)
      .notNull(),
    Link: text(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    PublishedDate: timestamp(),
  },
  (table) => [
    uniqueIndex('document_file_fileId').using(
      'btree',
      table.FileId.asc().nullsLast().op('uuid_ops')
    ),
    index('document_file_parentDocumentId').using(
      'btree',
      table.ParentDocumentId.asc().nullsLast().op('uuid_ops')
    ),
    foreignKey({
      columns: [table.Status],
      foreignColumns: [version_status.Value],
      name: 'DocumentFile_Status_fkey',
    }),
    foreignKey({
      columns: [table.Type],
      foreignColumns: [document_file_type.Value],
      name: 'DocumentFile_type_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'document_file_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.ReviewedBy],
      foreignColumns: [user.Id],
      name: 'document_file_ReviewedBy_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'document_file_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'document_file_id_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'document_file_orgKey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const old_document_assessment = risksmart.table(
  'old_document_assessment',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    Title: text().notNull(),
    Summary: text().notNull(),
    TargetCompletionDate: timestamp(),
    ActualCompletionDate: timestamp(),
    StartDate: timestamp(),
    Status: text().notNull(),
    Owner: text().notNull(),
    Result: smallint(),
    CompletedBy: text(),
    ParentDocumentId: uuid().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
  },
  () => [
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const user_group = risksmart.table(
  'user_group',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    Name: text().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    Email: text(),
    Description: text(),
    OwnerContributor: boolean().default(true).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'user_group_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'user_group_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'user_group_orgKey_fkey',
    }),
    unique('unique_orgkey_name_constraint').on(table.Name, table.OrgKey),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const old_obligation_assessment = risksmart.table(
  'old_obligation_assessment',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    ParentObligationId: uuid().notNull(),
    Title: text(),
    Summary: text(),
    TargetCompletionDate: timestamp(),
    ActualCompletionDate: timestamp(),
    StartDate: timestamp(),
    Status: text(),
    Owner: text(),
    Result: smallint(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CompletedBy: text(),
    CustomAttributeData: jsonb().$type<JSONB>(),
  },
  () => [
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const change_request = risksmart.table(
  'change_request',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    OrgKey: text().notNull(),
    ParentId: uuid().notNull(),
    ChangeRequestStatus: text().$type<ApprovalStatus>().notNull(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp().notNull(),
    Comment: text().notNull(),
    RequesterComment: text(),
    SequentialId: integer(),
    RequestedChanges: jsonb().$type<JSONB>(),
    Type: text().notNull(),
    OverriddenByUser: text(),
    OverriddenAtTimestamp: timestamp(),
    ActionUserId: text().notNull(),
    Workflow: text(),
  },
  (table) => [
    index('idx_change_request_parentId').using(
      'btree',
      table.ParentId.asc().nullsLast().op('uuid_ops')
    ),
    uniqueIndex('idx_changerequest_orgkey_sequentialid').using(
      'btree',
      table.OrgKey.asc().nullsLast().op('int4_ops'),
      table.SequentialId.asc().nullsLast().op('int4_ops')
    ),
    foreignKey({
      columns: [table.ChangeRequestStatus],
      foreignColumns: [approval_status.Value],
      name: 'change_request_ChangeRequestStatus_fkey',
    }),
    foreignKey({
      columns: [table.OverriddenByUser],
      foreignColumns: [user.Id],
      name: 'change_request_OverriddenByUser_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'change_request_createdbyuser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'change_request_modifiedbyuser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'change_request_orgkey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
    check(
      'change_request_Type_check',
      sql`"Type" = ANY (ARRAY['create'::text, 'update'::text, 'delete'::text])`
    ),
  ]
);

export const approver_response = risksmart.table(
  'approver_response',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    ApproverId: uuid().notNull(),
    ModifiedAtTimestamp: timestamp().notNull(),
    ModifiedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),
    CreatedByUser: text().notNull(),
    Comment: text(),
    ChangeRequestId: uuid().notNull(),
    Approved: boolean(),
    ApprovedByUser: text(),
    ApprovedAtTimestamp: timestamp(),
    OrgKey: text().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.ApprovedByUser],
      foreignColumns: [user.Id],
      name: 'approver_response_ApprovedByUser_fkey',
    }),
    foreignKey({
      columns: [table.ApproverId],
      foreignColumns: [approver.Id],
      name: 'approver_response_ApproverId_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'approver_response_OrgKey_fkey',
    }),
    foreignKey({
      columns: [table.ChangeRequestId],
      foreignColumns: [change_request.Id],
      name: 'approver_response_change_request_id_fk',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'approver_response_createdbyuser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'approver_response_modifiedbyuser_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const approval_in_flight_edit_rule = risksmart.table(
  'approval_in_flight_edit_rule',
  {
    Value: text().primaryKey().notNull(),
    Comment: text().notNull(),
  }
);

export const aggregation_org = risksmart.table(
  'aggregation_org',
  {
    OrgKey: text().primaryKey().notNull(),
    RiskScoringModel: text().$type<RiskScoringModel>(),
    Appetite: text().$type<AppetiteModel>(),
    Config: jsonb().$type<JSONB>(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedByUser: text(),
    ModifiedByUser: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'aggregation_org_CreatedByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'aggregation_org_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.Appetite],
      foreignColumns: [appetite_model.Value],
      name: 'aggregation_org_appetite_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'aggregation_org_organisationKey_fkey',
    }),
    foreignKey({
      columns: [table.RiskScoringModel],
      foreignColumns: [risk_scoring_model.Value],
      name: 'aggregation_org_riskScoringModel_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const assessment_activity_status = risksmart.table(
  'assessment_activity_status',
  {
    Value: text().primaryKey().notNull(),
    Comment: text(),
  }
);

export const assessment_activity_type = risksmart.table(
  'assessment_activity_type',
  {
    Value: text().primaryKey().notNull(),
    Comment: text(),
  }
);

export const assessment_activity = risksmart.table(
  'assessment_activity',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    ActivityType: text().notNull().$type<AssessmentActivityType>(),
    ParentId: uuid().notNull(),
    OrgKey: text().notNull(),
    Title: text(),
    Summary: text(),
    Status: text().$type<AssessmentActivityStatus>(),
    AssignedUser: text(),
    IsRCSA: boolean().notNull(),
    RiskId: text(),
    CompletionDate: timestamp(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
  },
  (table) => [
    foreignKey({
      columns: [table.AssignedUser],
      foreignColumns: [user.Id],
      name: 'assessment_activity_AssignedUser_fkey',
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'assessment_activity_CreatedByUser_fkey',
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'assessment_activity_ModifiedByUser_fkey',
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'assessment_activity_OrgKey_fkey',
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'assessment_activity_id_fkey',
    }),
    foreignKey({
      columns: [table.Status],
      foreignColumns: [assessment_activity_status.Value],
      name: 'assessment_activity_status_fkey',
    }),
    foreignKey({
      columns: [table.ActivityType],
      foreignColumns: [assessment_activity_type.Value],
      name: 'assessment_activity_type_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const change_request_contributor = risksmart.table(
  'change_request_contributor',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    OrgKey: text().notNull(),
    ChangeRequestId: uuid().notNull(),
    UserId: text().notNull(),
    CreatedAtTimestamp: timestamp().default(sql`CURRENT_TIMESTAMP`),
    ModifiedAtTimestamp: timestamp().default(sql`CURRENT_TIMESTAMP`),
    CreatedByUser: text(),
    ModifiedByUser: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.ChangeRequestId],
      foreignColumns: [change_request.Id],
      name: 'change_request_contributor_ChangeRequestId_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'change_request_contributor_CreatedByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'change_request_contributor_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.UserId],
      foreignColumns: [user.Id],
      name: 'change_request_contributor_UserId_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'change_request_contributor_orgkey_fkey',
    }),
    unique('change_request_contributor_ChangeRequestId_UserId_key').on(
      table.ChangeRequestId,
      table.UserId
    ),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const assessment_status = risksmart.table('assessment_status', {
  Value: text().primaryKey().notNull(),
  Comment: text(),
});

export const internal_audit_report = risksmart.table(
  'internal_audit_report',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    SequentialId: integer(),
    Title: text().notNull(),
    Summary: text().notNull(),
    TargetCompletionDate: timestamp(),
    ActualCompletionDate: timestamp(),
    StartDate: timestamp(),
    NextTestDate: timestamp(),
    OrgKey: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CompletedByUser: text(),
    OriginatingItemId: uuid(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    Status: text()
      .$type<InternalAuditStatus>()
      .default(InternalAuditStatus.NotStarted)
      .notNull(),
    Outcome: integer(),
  },
  (table) => [
    uniqueIndex('idx_internal_audit_report_orgkey_sequentialid').using(
      'btree',
      table.OrgKey.asc().nullsLast().op('int4_ops'),
      table.SequentialId.asc().nullsLast().op('int4_ops')
    ),
    foreignKey({
      columns: [table.CompletedByUser],
      foreignColumns: [user.Id],
      name: 'internal_audit_report_completedByUser_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'internal_audit_report_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'internal_audit_report_modifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'internal_audit_report_orgKey_fkey',
    }),
    foreignKey({
      columns: [table.Status],
      foreignColumns: [assessment_status.Value],
      name: 'internal_audit_report_status_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'node_internal_audit_report_id_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const custom_ribbon = risksmart.table(
  'custom_ribbon',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    ParentType: text().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    Filters: jsonb().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'Organisation_Id_fkey',
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'custom_ribbon_CreatedByUser_fkey',
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'custom_ribbon_ModifiedByUser_fkey',
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    foreignKey({
      columns: [table.ParentType],
      foreignColumns: [parent_type.Value],
      name: 'custom_ribbon_ParentType_fkey',
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    unique('idx_customribbon_orgkey_parenttype').on(
      table.ParentType,
      table.OrgKey
    ),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const third_party_type = risksmart.table('third_party_type', {
  Value: text().primaryKey().notNull(),
  Comment: text(),
});

export const third_party_status = risksmart.table('third_party_status', {
  Value: text().primaryKey().notNull(),
  Comment: text(),
});

export const third_party = risksmart.table(
  'third_party',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    OrgKey: text().notNull(),
    SequentialId: integer(),
    Title: text().notNull(),
    Description: text(),
    CompanyName: text().notNull(),
    CompaniesHouseNumber: text(),
    Address: text(),
    CityTown: text(),
    Postcode: text(),
    Country: text(),
    PrimaryContactName: text(),
    ContactName: text(),
    ContactEmail: text(),
    CompanyDomain: text(),
    Type: text().$type<ThirdPartyType>().notNull(),
    Status: text().$type<ThirdPartyStatus>().notNull(),
    Criticality: integer().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
  },
  (table) => [
    uniqueIndex('idx_third_party_orgkey_sequentialid').using(
      'btree',
      table.OrgKey.asc().nullsLast().op('int4_ops'),
      table.SequentialId.asc().nullsLast().op('int4_ops')
    ),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'third_party_CreatedByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'third_party_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'third_party_orgKey_fkey',
    }),
    foreignKey({
      columns: [table.Status],
      foreignColumns: [third_party_status.Value],
      name: 'third_party_status_fkey',
    }),
    foreignKey({
      columns: [table.Type],
      foreignColumns: [third_party_type.Value],
      name: 'third_party_type_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
    check('Tier_check', sql`"Criticality" = ANY (ARRAY[1, 2, 3, 4])`),
  ]
);

// Third party contact - separate from questionnaire invites
export const third_party_contact = risksmart.table(
  'third_party_contact',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    ThirdPartyId: uuid().notNull(),
    Email: text().notNull(),
    Name: text(),
    JobTitle: text(),
    IsRevoked: boolean().default(false).notNull(),
    PasswordSetAtTimestamp: timestamp(),
    // Only linked to a User after successful login
    // so omitting foreign key constraint
    UserId: text(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    index('idx_third_party_contact_third_party_id').using(
      'btree',
      table.ThirdPartyId.asc().nullsLast()
    ),
    index('idx_third_party_contact_orgkey').using(
      'btree',
      table.OrgKey.asc().nullsLast()
    ),
    uniqueIndex('third_party_contact_email_unique').using(
      'btree',
      table.ThirdPartyId.asc().nullsLast(),
      table.Email.asc().nullsLast()
    ),
    foreignKey({
      columns: [table.ThirdPartyId],
      foreignColumns: [third_party.Id],
      name: 'third_party_contact_ThirdPartyId_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'third_party_contact_OrgKey_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'third_party_contact_CreatedByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'third_party_contact_ModifiedByUser_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const internal_audit_entity = risksmart.table(
  'internal_audit_entity',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    SequentialId: integer(),
    Title: text().notNull(),
    Description: text(),
    BusinessAreaId: uuid().notNull(),
    OrgKey: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
  },
  (table) => [
    uniqueIndex('idx_internal_audit_entity_orgkey_sequentialid').using(
      'btree',
      table.OrgKey.asc().nullsLast().op('int4_ops'),
      table.SequentialId.asc().nullsLast().op('int4_ops')
    ),
    foreignKey({
      columns: [table.BusinessAreaId],
      foreignColumns: [business_area.Id],
      name: 'internal_audit_entity_businessarea_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'internal_audit_entity_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'internal_audit_entity_modifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'internal_audit_entity_orgKey_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'node_internal_audit_entity_id_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const attestation_record_status = risksmart.table(
  'attestation_record_status',
  {
    Value: text().primaryKey().notNull(),
    Comment: text().notNull(),
  }
);

export const appetite_model = risksmart.table('appetite_model', {
  Value: text().primaryKey().notNull(),
  Comment: text(),
});

export const risk_scoring_model = risksmart.table('risk_scoring_model', {
  Value: text().primaryKey().notNull(),
  Comment: text(),
});

export const appetite_type = risksmart.table('appetite_type', {
  Value: text().primaryKey().notNull(),
  Comment: text(),
});

export const attestation_record = risksmart.table(
  'attestation_record',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    UserId: text().notNull(),
    Active: boolean().default(true).notNull(),
    AttestationStatus: text().$type<AttestationRecordStatus>().notNull(),
    AttestedAt: timestamp(),
    ExpiresAt: timestamp(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    NodeId: uuid().notNull(),
    ConfigId: uuid(),
    CycleId: uuid(),
    CarriedForwardFromRecordId: uuid(),
  },
  (table) => [
    uniqueIndex('idx_attestation_record_nodeid_userid_active')
      .using(
        'btree',
        table.NodeId.asc().nullsLast().op('text_ops'),
        table.UserId.asc().nullsLast().op('text_ops'),
        table.Active.asc().nullsLast().op('text_ops')
      )
      .where(sql`"Active"`),
    index('idx_attestation_record_userid').using(
      'btree',
      table.UserId.asc().nullsLast().op('text_ops')
    ),
    foreignKey({
      columns: [table.AttestationStatus],
      foreignColumns: [attestation_record_status.Value],
      name: 'attestation_record_AttestationStatus_fkey',
    }).onDelete('restrict'),
    foreignKey({
      columns: [table.ConfigId],
      foreignColumns: [attestation_config.ParentId],
      name: 'attestation_record_ConfigId_fkey',
    }).onDelete('set null'),
    foreignKey({
      columns: [table.CycleId],
      foreignColumns: [attestation_cycle.Id],
      name: 'attestation_record_CycleId_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'attestation_record_CreatedByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'attestation_record_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.NodeId],
      foreignColumns: [node.Id],
      name: 'attestation_record_NodeId_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'attestation_record_OrgKey_fkey',
    }),
    foreignKey({
      columns: [table.CarriedForwardFromRecordId],
      foreignColumns: [table.Id],
      name: 'attestation_record_CarriedForwardFromRecordId_fkey',
    }),
    foreignKey({
      columns: [table.UserId],
      foreignColumns: [user.Id],
      name: 'attestation_record_UserId_fkey',
    }).onDelete('cascade'),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const attestation_config = risksmart.table(
  'attestation_config',
  {
    ParentId: uuid().primaryKey().notNull(),
    RequireGlobalAttestation: boolean().default(false).notNull(),
    AttestationTimeLimit: interval(),
    OrgKey: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedByUser: text().notNull(),
    PromptText: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'attestation_config_CreatedByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'attestation_config_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'attestation_config_OrgKey_fkey',
    }),
    foreignKey({
      columns: [table.ParentId],
      foreignColumns: [node.Id],
      name: 'attestation_config_ParentId_fkey',
    }).onDelete('cascade'),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const attestation_cycle = risksmart.table(
  'attestation_cycle',
  {
    Id: uuid().primaryKey().notNull(),
    ParentId: uuid().notNull(),
    OrgKey: text().notNull(),
    Status: text().notNull(),
    AllowCarryForward: boolean().default(false).notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedByUser: text().notNull(),
    ConcludedAtTimestamp: timestamp(),
  },
  (table) => [
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'attestation_cycle_CreatedByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'attestation_cycle_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'attestation_cycle_OrgKey_fkey',
    }),
    foreignKey({
      columns: [table.ParentId],
      foreignColumns: [document_file.Id],
      name: 'attestation_cycle_ParentId_fkey',
    }).onDelete('cascade'),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const attestation_cycle_audit = risksmart.table(
  'attestation_cycle_audit',
  {
    Id: uuid().notNull(),
    ParentId: uuid().notNull(),
    OrgKey: text().notNull(),
    Status: text().notNull(),
    AllowCarryForward: boolean().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedByUser: text().notNull(),
    Action: dbActionEnum('Action').notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.OrgKey, table.ModifiedAtTimestamp],
      name: 'colour_palette_audit_pkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'attestation_cycle_OrgKey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const questionnaire_invite = risksmart.table(
  'questionnaire_invite',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    ThirdPartyId: uuid().notNull(),
    UserEmail: text().notNull(),
    QuestionnaireTemplateVersionId: uuid().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    UserId: text(),
    ParentId: uuid().notNull(),
    Message: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'questionnaire_invite_CreatedByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'questionnaire_invite_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'questionnaire_invite_OrgKey_fkey',
    }),
    foreignKey({
      columns: [table.ParentId],
      foreignColumns: [third_party_response.Id],
      name: 'questionnaire_invite_ParentId_fkey',
    }),
    foreignKey({
      columns: [table.QuestionnaireTemplateVersionId],
      foreignColumns: [questionnaire_template_version.Id],
      name: 'questionnaire_invite_QuestionnaireTemplateVersionId_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.ThirdPartyId],
      foreignColumns: [third_party.Id],
      name: 'questionnaire_invite_ThirdPartyId_fkey',
    }),
    foreignKey({
      columns: [table.UserId],
      foreignColumns: [user.Id],
      name: 'questionnaire_invite_UserId_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const questionnaire_template_version_status = risksmart.table(
  'questionnaire_template_version_status',
  {
    Value: text().primaryKey().notNull(),
    Comment: text(),
  }
);

export const questionnaire_template = risksmart.table(
  'questionnaire_template',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    Title: text().notNull(),
    Description: text(),
    CustomAttributeData: jsonb().$type<JSONB>(),
  },
  (table) => [
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'Organisation_Id_fkey',
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'questionnaire_template_CreatedByUser_fkey',
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'questionnaire_template_ModifiedByUser_fkey',
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const questionnaire_template_version = risksmart.table(
  'questionnaire_template_version',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    Version: text().notNull(),
    Status: text().$type<QuestionnaireTemplateVersionStatus>().notNull(),
    Schema: jsonb().$type<JSONB>().notNull(),
    UISchema: jsonb().$type<JSONB>().notNull(),
    ParentId: uuid().notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
  },
  (table) => [
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'Organisation_Id_fkey',
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'questionnaire_template_version_CreatedByUser_fkey',
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'questionnaire_template_version_ModifiedByUser_fkey',
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    foreignKey({
      columns: [table.ParentId],
      foreignColumns: [questionnaire_template.Id],
      name: 'questionnaire_template_version_parentId_fkey',
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    foreignKey({
      columns: [table.Status],
      foreignColumns: [questionnaire_template_version_status.Value],
      name: 'questionnaire_template_version_status_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const data_import_status = risksmart.table('data_import_status', {
  Value: text().primaryKey().notNull(),
  Comment: text(),
});

export const third_party_response_status = risksmart.table(
  'third_party_response_status',
  {
    Value: text().primaryKey().notNull(),
    Comment: text().notNull(),
  }
);

export const data_import_error = risksmart.table(
  'data_import_error',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    DataImportId: uuid(),
    ImportObject: text().notNull(),
    OrgKey: text().notNull(),
    RowNumber: integer().notNull(),
    Message: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'data_import_error_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.DataImportId],
      foreignColumns: [data_import.Id],
      name: 'data_import_error_dataImportId_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'data_import_error_modifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'data_import_error_orgKey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const unit_of_time = risksmart.table('unit_of_time', {
  Value: text().primaryKey().notNull(),
  Comment: text(),
});

export const risk_score = risksmart.table(
  'risk_score',
  {
    RiskId: uuid().primaryKey().notNull(),
    ResidualScore: doublePrecision(),
    InherentScore: doublePrecision(),
    OrgKey: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedByUser: text(),
    ModifiedByUser: text(),
    ResidualRating: integer(),
    InherentRating: integer(),
    ResidualImpact: doublePrecision(),
    ResidualLikelihood: doublePrecision(),
    InherentImpact: doublePrecision(),
    InherentLikelihood: doublePrecision(),
  },
  (table) => [
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'risk_score_CreatedByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'risk_score_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'risk_score_organisationKey_fkey',
    }),
    foreignKey({
      columns: [table.RiskId],
      foreignColumns: [risk.Id],
      name: 'risk_score_risk_id_fkey',
    }).onDelete('cascade'),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const schedule_state = risksmart.table(
  'schedule_state',
  {
    Id: uuid().primaryKey().notNull(),
    LatestDate: timestamp(),
    DueDate: timestamp(),
    OverdueDate: timestamp(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    index('idx_schedule_state_duedate').using(
      'btree',
      table.DueDate.asc().nullsLast().op('timestamptz_ops')
    ),
    index('idx_schedule_state_overdue').using(
      'btree',
      table.OverdueDate.asc().nullsLast().op('timestamptz_ops')
    ),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'schedule_state_CreatedByUser_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'schedule_state_Id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'schedule_state_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'schedule_state_OrgKey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const compliance_monitoring_assessment = risksmart.table(
  'compliance_monitoring_assessment',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    SequentialId: integer(),
    Title: text().notNull(),
    Summary: text().notNull(),
    TargetCompletionDate: timestamp(),
    ActualCompletionDate: timestamp(),
    StartDate: timestamp(),
    NextTestDate: timestamp(),
    OrgKey: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CompletedByUser: text(),
    OriginatingItemId: uuid(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    Status: text()
      .$type<AssessmentStatus>()
      .default(AssessmentStatus.NotStarted)
      .notNull(),
    Outcome: integer(),
  },
  (table) => [
    uniqueIndex(
      'idx_compliance_monitoring_assessment_orgkey_sequentialid'
    ).using(
      'btree',
      table.OrgKey.asc().nullsLast().op('int4_ops'),
      table.SequentialId.asc().nullsLast().op('int4_ops')
    ),
    foreignKey({
      columns: [table.CompletedByUser],
      foreignColumns: [user.Id],
      name: 'compliance_monitoring_assessment_completedByUser_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'compliance_monitoring_assessment_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'compliance_monitoring_assessment_modifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'compliance_monitoring_assessment_orgKey_fkey',
    }),
    foreignKey({
      columns: [table.Status],
      foreignColumns: [assessment_status.Value],
      name: 'compliance_monitoring_assessment_status_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'node_compliance_monitoring_assessment_id_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const schedule = risksmart.table(
  'schedule',
  {
    Id: uuid().primaryKey().notNull(),
    Frequency: text().$type<TestFrequency>(),
    TimeToCompleteValue: integer(),
    TimeToCompleteUnit: text().$type<UnitOfTime>(),
    StartDate: timestamp(),
    ManualDueDate: timestamp(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'schedule_CreatedByUser_fkey',
    }),
    foreignKey({
      columns: [table.Frequency],
      foreignColumns: [test_frequency.Value],
      name: 'schedule_Frequency_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'schedule_Id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'schedule_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'schedule_OrgKey_fkey',
    }),
    foreignKey({
      columns: [table.TimeToCompleteUnit],
      foreignColumns: [unit_of_time.Value],
      name: 'schedule_TimeToCompleteUnit_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const business_area = risksmart.table(
  'business_area',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    Title: text().notNull(),
    OrgKey: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    SequentialId: integer().notNull(),
  },
  (table) => [
    uniqueIndex('idx_business_area_orgkey_sequentialid').using(
      'btree',
      table.OrgKey.asc().nullsLast().op('int4_ops'),
      table.SequentialId.asc().nullsLast().op('int4_ops')
    ),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'business_area_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'business_area_modifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'business_area_orgKey_fkey',
    }),
    unique('business_area_orgkey_title').on(table.Title, table.OrgKey),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const third_party_response = risksmart.table(
  'third_party_response',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ParentId: uuid().notNull(),
    QuestionnaireTemplateVersionId: uuid().notNull(),
    Status: text().$type<ThirdPartyResponseStatus>().notNull(),
    ResponseData: jsonb().notNull(),
    StartDate: timestamp(),
    ExpiresAt: timestamp(),
    RecallReason: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'Organisation_Id_fkey',
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'third_party_response_CreatedByUser_fkey',
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'third_party_response_ModifiedByUser_fkey',
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    foreignKey({
      columns: [table.QuestionnaireTemplateVersionId],
      foreignColumns: [questionnaire_template_version.Id],
      name: 'third_party_response_QuestionnaireTemplateVersionId_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.Status],
      foreignColumns: [third_party_response_status.Value],
      name: 'third_party_response_Status_fkey',
    }).onDelete('restrict'),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const data_import = risksmart.table(
  'data_import',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    OrgKey: text().notNull(),
    Status: text()
      .$type<DataImportStatus>()
      .default(DataImportStatus.NotStarted)
      .notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'data_import_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'data_import_modifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'data_import_orgKey_fkey',
    }),
    foreignKey({
      columns: [table.Status],
      foreignColumns: [data_import_status.Value],
      name: 'data_import_status_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const ingestion_config = risksmart.table(
  'ingestion_config',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    OrgKey: text().notNull(),
    IngestionConfig: jsonb(),
    SecretArn: text(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'ingestion_config_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'ingestion_config_modifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'ingestion_config_orgKey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const enterprise_risk = risksmart.table(
  'enterprise_risk',
  {
    Id: uuid().primaryKey().notNull(),
    Title: text().notNull(),
    Description: text().notNull(),
    Tier: integer().notNull(),
    ParentId: uuid(),
    Meta: jsonb().$type<JSONB>(),
    Treatment: text().$type<RiskTreatmentType>(),
    SequentialId: integer().notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    uniqueIndex('idx_enterprise_risk_orgkey_sequentialid').using(
      'btree',
      table.OrgKey.asc().nullsLast().op('int4_ops'),
      table.SequentialId.asc().nullsLast().op('int4_ops')
    ),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'enterprise_risk_CreatedByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'enterprise_risk_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'enterprise_risk_OrgKey_fkey',
    }),
    foreignKey({
      columns: [table.ParentId],
      foreignColumns: [table.Id],
      name: 'enterprise_risk_ParentId_fkey',
    }),
    foreignKey({
      columns: [table.Treatment],
      foreignColumns: [risk_treatment_type.Value],
      name: 'enterprise_risk_Treatment_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const appetite_status = risksmart.table('appetite_status', {
  Value: text().primaryKey().notNull(),
  Comment: text(),
});

export const entity = risksmart.table(
  'entity',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    Name: text().notNull(),
    Description: text(),
    ParentId: uuid(),
    OrgKey: text().notNull(),
    Weight: numericCasted({ precision: 5, scale: 2 })
      .default(sql`1.0`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'entity_CreatedByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'entity_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'entity_OrgKey_fkey',
    }),
    foreignKey({
      columns: [table.ParentId],
      foreignColumns: [table.Id],
      name: 'entity_ParentId_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const counter = risksmart.table(
  'counter',
  {
    OrgKey: text().notNull(),
    Name: text().notNull(),
    LastValue: integer().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.Name],
      foreignColumns: [parent_type.Value],
      name: 'Counter_Name_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'Counter_OrgKey_fkey',
    }),
    primaryKey({ columns: [table.OrgKey, table.Name], name: 'counter_pkey' }),
  ]
);

export const user_activity_audit = auth.table(
  'user_activity_audit',
  {
    Action: text().notNull(),
    OrgKey: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp().notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.OrgKey, table.ModifiedByUser, table.ModifiedAtTimestamp],
      name: 'user_activity_audit_pkey',
    }),
  ]
);

export const role_access = risksmart.table(
  'role_access',
  {
    RoleKey: text().notNull(),
    ObjectType: text().notNull(),
    ContributorType: text().$type<ContributorType>().notNull(),
    AccessType: text().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.AccessType],
      foreignColumns: [access_type.Value],
      name: 'role_access_AccessType_fkey',
    }),
    foreignKey({
      columns: [table.ContributorType],
      foreignColumns: [contributor_type.Value],
      name: 'role_access_ContributorType_fkey',
    }),
    foreignKey({
      columns: [table.ObjectType],
      foreignColumns: [parent_type.Value],
      name: 'role_access_ObjectType_fkey',
    }),
    primaryKey({
      columns: [
        table.RoleKey,
        table.ObjectType,
        table.ContributorType,
        table.AccessType,
      ],
      name: 'role_access_pkey',
    }),
  ]
);

export const node_ancestor = risksmart.table(
  'node_ancestor',
  {
    Id: uuid().notNull(),
    AncestorId: uuid().notNull(),
    ObjectType: text().notNull(),
    OrgKey: text().notNull(),
    AncestorObjectType: text(),
  },
  (table) => [
    index('ix_node_ancestor_ancestorid_id').using(
      'btree',
      table.AncestorId.asc().nullsLast().op('uuid_ops'),
      table.Id.asc().nullsLast().op('uuid_ops')
    ),
    index('ix_node_ancestor_ancestorid_objecttype').using(
      'btree',
      table.AncestorId.asc().nullsLast().op('uuid_ops'),
      table.ObjectType.asc().nullsLast().op('text_ops'),
      table.Id.asc().nullsLast().op('uuid_ops'),
      table.OrgKey.asc().nullsLast().op('uuid_ops')
    ),
    index('ix_node_ancestor_org_key').using(
      'btree',
      table.OrgKey.asc().nullsLast().op('text_ops')
    ),
    primaryKey({
      columns: [table.Id, table.AncestorId],
      name: 'node_ancestor_pkey',
    }),
  ]
);

export const tag = risksmart.table(
  'tag',
  {
    ParentId: uuid().notNull(),
    TagTypeId: uuid().defaultRandom().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    OrgKey: text().notNull(),
    ModifiedByUser: text().notNull(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'tag_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.ParentId],
      foreignColumns: [node.Id],
      name: 'tag_ParentId_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.TagTypeId],
      foreignColumns: [tag_type.TagTypeId],
      name: 'tag_TagTypeId_fkey',
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'tag_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'tag_orgKey_fkey',
    }),
    primaryKey({
      columns: [table.ParentId, table.TagTypeId],
      name: 'tag_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const department = risksmart.table(
  'department',
  {
    ParentId: uuid().notNull(),
    DepartmentTypeId: uuid().defaultRandom().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    OrgKey: text().notNull(),
    ModifiedByUser: text().notNull(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.DepartmentTypeId],
      foreignColumns: [department_type.DepartmentTypeId],
      name: 'department_DepartmentTypeId_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'department_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.ParentId],
      foreignColumns: [node.Id],
      name: 'department_ParentId_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'department_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'department_orgKey_fkey',
    }),
    primaryKey({
      columns: [table.ParentId, table.DepartmentTypeId],
      name: 'department_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const contributor = risksmart.table(
  'contributor',
  {
    ParentId: uuid().notNull(),
    UserId: text().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    index('ix_contributor_userid_parentid').using(
      'btree',
      table.UserId.asc().nullsLast().op('text_ops'),
      table.ParentId.asc().nullsLast().op('text_ops'),
      table.OrgKey.asc().nullsLast().op('text_ops')
    ),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'contributor_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'contributor_OrgKey_fkey',
    }),
    foreignKey({
      columns: [table.ParentId],
      foreignColumns: [node.Id],
      name: 'contributor_ParentId_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'contributor_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.UserId],
      foreignColumns: [user.Id],
      name: 'contributor_userId_fkey',
    }),
    primaryKey({
      columns: [table.ParentId, table.UserId],
      name: 'contributor_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const owner = risksmart.table(
  'owner',
  {
    ParentId: uuid().notNull(),
    UserId: text().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    index('ix_owner_userid_parentid').using(
      'btree',
      table.UserId.asc().nullsLast().op('text_ops'),
      table.ParentId.asc().nullsLast().op('uuid_ops'),
      table.OrgKey.asc().nullsLast().op('uuid_ops')
    ),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'owner_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'owner_OrgKey_fkey',
    }),
    foreignKey({
      columns: [table.ParentId],
      foreignColumns: [node.Id],
      name: 'owner_ParentId_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'owner_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.UserId],
      foreignColumns: [user.Id],
      name: 'owner_userId_fkey',
    }),
    primaryKey({ columns: [table.ParentId, table.UserId], name: 'owner_pkey' }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const control_parent = risksmart.table(
  'control_parent',
  {
    ControlId: uuid().notNull(),
    ParentId: uuid().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    index('idx_control_parent_controlId_parentId').using(
      'btree',
      table.ControlId.asc().nullsLast().op('uuid_ops'),
      table.ParentId.asc().nullsLast().op('uuid_ops')
    ),
    foreignKey({
      columns: [table.ControlId],
      foreignColumns: [control.Id],
      name: 'control_parent_controlId_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'control_parent_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'control_parent_modifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'control_parent_organisationKey_fkey',
    }),
    foreignKey({
      columns: [table.ParentId],
      foreignColumns: [node.Id],
      name: 'control_parent_parentId_fkey',
    }).onDelete('cascade'),
    primaryKey({
      columns: [table.ControlId, table.ParentId],
      name: 'control_parent_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const form_configuration = risksmart.table(
  'form_configuration',
  {
    CustomAttributeSchemaId: uuid(),
    ParentType: text().notNull().$type<ParentType>(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.ParentType],
      foreignColumns: [parent_type.Value],
      name: 'CustomAttributeSchemaParent_ParentType_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'form_configuration_createdbyuser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'form_configuration_modifiedbyuser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'form_configuration_orgkey_fkey',
    }),
    primaryKey({
      columns: [table.ParentType, table.OrgKey],
      name: 'form_configuration_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const indicator_parent = risksmart.table(
  'indicator_parent',
  {
    IndicatorId: uuid().notNull(),
    ParentId: uuid().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    index('idx_indicator_parent_actionId_parentId').using(
      'btree',
      table.IndicatorId.asc().nullsLast().op('uuid_ops'),
      table.ParentId.asc().nullsLast().op('uuid_ops')
    ),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'indicator_parent_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.IndicatorId],
      foreignColumns: [indicator.Id],
      name: 'indicator_parent_indicatorId_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'indicator_parent_modifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'indicator_parent_organisationKey_fkey',
    }),
    foreignKey({
      columns: [table.ParentId],
      foreignColumns: [node.Id],
      name: 'indicator_parent_parentId_fkey',
    }).onDelete('cascade'),
    primaryKey({
      columns: [table.IndicatorId, table.ParentId],
      name: 'indicator_parent_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const contributor_group = risksmart.table(
  'contributor_group',
  {
    ParentId: uuid().notNull(),
    UserGroupId: uuid().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    index('contributor_group_userGroupId_parentId').using(
      'btree',
      table.UserGroupId.asc().nullsLast().op('uuid_ops'),
      table.ParentId.asc().nullsLast().op('uuid_ops')
    ),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'contributor_group_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'contributor_group_OrgKey_fkey',
    }),
    foreignKey({
      columns: [table.UserGroupId],
      foreignColumns: [user_group.Id],
      name: 'contributor_group_UserGroupId_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'contributor_group_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.ParentId],
      foreignColumns: [node.Id],
      name: 'contributor_group_parentId_fkey',
    }).onDelete('cascade'),
    primaryKey({
      columns: [table.ParentId, table.UserGroupId],
      name: 'contributor_group_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const user_group_user = risksmart.table(
  'user_group_user',
  {
    UserGroupId: uuid().notNull(),
    UserId: text().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    index('user_group_user_userId_userGroupId').using(
      'btree',
      table.UserId.asc().nullsLast().op('text_ops'),
      table.UserGroupId.asc().nullsLast().op('text_ops')
    ),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'user_group_user_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'user_group_user_OrgKey_fkey',
    }),
    foreignKey({
      columns: [table.UserGroupId],
      foreignColumns: [user_group.Id],
      name: 'user_group_user_UserGroupId_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.UserId],
      foreignColumns: [user.Id],
      name: 'user_group_user_UserId_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'user_group_user_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'user_group_user_userId_fkey',
    }),
    primaryKey({
      columns: [table.UserGroupId, table.UserId],
      name: 'user_group_user_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const owner_group = risksmart.table(
  'owner_group',
  {
    ParentId: uuid().notNull(),
    UserGroupId: uuid().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    index('owner_group_userGroupId_parentId').using(
      'btree',
      table.UserGroupId.asc().nullsLast().op('uuid_ops'),
      table.ParentId.asc().nullsLast().op('uuid_ops')
    ),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'owner_group_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'owner_group_OrgKey_fkey',
    }),
    foreignKey({
      columns: [table.UserGroupId],
      foreignColumns: [user_group.Id],
      name: 'owner_group_UserGroupId_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'owner_group_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.ParentId],
      foreignColumns: [node.Id],
      name: 'owner_group_parentId_fkey',
    }).onDelete('cascade'),
    primaryKey({
      columns: [table.ParentId, table.UserGroupId],
      name: 'owner_group_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const tag_type_group = risksmart.table(
  'tag_type_group',
  {
    Id: uuid().defaultRandom().notNull(),
    Name: text().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'tag_type_group_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'tag_type_group_modifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'tag_type_group_orgKey_fkey',
    }),
    primaryKey({
      columns: [table.Name, table.OrgKey],
      name: 'TagTypeGroup_pkey',
    }),
    unique('tag_type_group_Id_key').on(table.Id),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const department_type_group = risksmart.table(
  'department_type_group',
  {
    Id: uuid().defaultRandom().notNull(),
    Name: text().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'department_type_group_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'department_type_group_modifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'department_type_group_orgKey_fkey',
    }),
    primaryKey({
      columns: [table.Name, table.OrgKey],
      name: 'DepartmentTypeGroup_pkey',
    }),
    unique('department_type_group_Id_key').on(table.Id),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const acceptance_parent = risksmart.table(
  'acceptance_parent',
  {
    Id: uuid().notNull(),
    ParentId: uuid().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    index('idx_acceptance_parent_acceptanceId_parentId').using(
      'btree',
      table.Id.asc().nullsLast().op('uuid_ops'),
      table.ParentId.asc().nullsLast().op('uuid_ops')
    ),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [acceptance.Id],
      name: 'acceptance_parent_acceptanceId_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'acceptance_parent_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'acceptance_parent_modifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'acceptance_parent_organisationKey_fkey',
    }),
    foreignKey({
      columns: [table.ParentId],
      foreignColumns: [node.Id],
      name: 'acceptance_parent_parentId_fkey',
    }).onDelete('cascade'),
    primaryKey({
      columns: [table.Id, table.ParentId],
      name: 'acceptance_parent_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const impact_parent = risksmart.table(
  'impact_parent',
  {
    ImpactId: uuid().notNull(),
    ParentId: uuid().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    index('idx_impact_parent_impactId_parentId').using(
      'btree',
      table.ImpactId.asc().nullsLast().op('uuid_ops'),
      table.ParentId.asc().nullsLast().op('uuid_ops')
    ),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'impact_parent_CreatedByUser_fkey',
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    foreignKey({
      columns: [table.ImpactId],
      foreignColumns: [impact.Id],
      name: 'impact_parent_ImpactId_fkey',
    })
      .onUpdate('restrict')
      .onDelete('cascade'),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'impact_parent_ModifiedByUser_fkey',
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'impact_parent_OrgKey_fkey',
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    primaryKey({
      columns: [table.ImpactId, table.ParentId],
      name: 'impact_parent_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const attestation_group = risksmart.table(
  'attestation_group',
  {
    GroupId: uuid().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ConfigId: uuid().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.ConfigId],
      foreignColumns: [attestation_config.ParentId],
      name: 'attestation_group_ConfigId_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'document_attestation_group_CreatedByUser_fkey',
    }),
    foreignKey({
      columns: [table.GroupId],
      foreignColumns: [user_group.Id],
      name: 'document_attestation_group_GroupId_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'document_attestation_group_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'document_attestation_group_OrgKey_fkey',
    }),
    primaryKey({
      columns: [table.GroupId, table.ConfigId],
      name: 'attestation_group_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const user_table_preferences = risksmart.table(
  'user_table_preferences',
  {
    TableId: text().notNull(),
    OrgKey: text().notNull(),
    Preferences: jsonb().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'user_table_preferences_CreatedByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'user_table_preferences_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'user_table_preferences_OrgKey_fkey',
    }),
    primaryKey({
      columns: [table.TableId, table.OrgKey, table.CreatedByUser],
      name: 'user_table_preferences_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const tag_audit = risksmart.table(
  'tag_audit',
  {
    ParentId: uuid().notNull(),
    TagTypeId: uuid().notNull(),
    OrgKey: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.ParentId, table.TagTypeId, table.ModifiedAtTimestamp],
      name: 'tag_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const department_audit = risksmart.table(
  'department_audit',
  {
    ParentId: uuid().notNull(),
    DepartmentTypeId: uuid().notNull(),
    OrgKey: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [
        table.ParentId,
        table.DepartmentTypeId,
        table.ModifiedAtTimestamp,
      ],
      name: 'department_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const control_action_audit = risksmart.table(
  'control_action_audit',
  {
    ControlId: uuid().notNull(),
    ActionId: uuid().notNull(),
    OrgKey: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.ControlId, table.ActionId, table.ModifiedAtTimestamp],
      name: 'control_action_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const risk_action_audit = risksmart.table(
  'risk_action_audit',
  {
    RiskId: uuid().notNull(),
    ActionId: uuid().notNull(),
    OrgKey: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.RiskId, table.ActionId, table.ModifiedAtTimestamp],
      name: 'risk_action_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const issue_action_audit = risksmart.table(
  'issue_action_audit',
  {
    IssueId: uuid().notNull(),
    ActionId: uuid().notNull(),
    OrgKey: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.IssueId, table.ActionId, table.ModifiedAtTimestamp],
      name: 'issue_action_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const obligation_action_audit = risksmart.table(
  'obligation_action_audit',
  {
    ObligationId: uuid().notNull(),
    ActionId: uuid().notNull(),
    ModifiedAtTimestamp: timestamp().notNull(),
    ModifiedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),
    CreatedByUser: text().notNull(),
    OrgKey: text().notNull(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.ObligationId, table.ActionId, table.ModifiedAtTimestamp],
      name: 'obligation_action_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const obligation_issue_audit = risksmart.table(
  'obligation_issue_audit',
  {
    ObligationId: uuid().notNull(),
    IssueId: uuid().notNull(),
    ModifiedAtTimestamp: timestamp().notNull(),
    ModifiedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),
    CreatedByUser: text().notNull(),
    OrgKey: text().notNull(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.ObligationId, table.IssueId, table.ModifiedAtTimestamp],
      name: 'obligation_issue_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const document_issue_audit = risksmart.table(
  'document_issue_audit',
  {
    DocumentId: uuid().notNull(),
    IssueId: uuid().notNull(),
    OrgKey: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.DocumentId, table.IssueId, table.ModifiedAtTimestamp],
      name: 'document_issue_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const document_action_audit = risksmart.table(
  'document_action_audit',
  {
    DocumentId: uuid().notNull(),
    ActionId: uuid().notNull(),
    OrgKey: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.DocumentId, table.ActionId, table.ModifiedAtTimestamp],
      name: 'document_action_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const document_linked_document = risksmart.table(
  'document_linked_document',
  {
    DocumentId: uuid().notNull(),
    LinkedDocumentId: uuid().notNull(),
    OrgKey: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    Meta: json().$type<JSONB>(),
  },
  (table) => [
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'document_linked_document_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'document_linked_document_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'document_linked_document_orgKey_fkey',
    }),
    primaryKey({
      columns: [table.DocumentId, table.LinkedDocumentId],
      name: 'document_linked_document_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const owner_audit = risksmart.table(
  'owner_audit',
  {
    ParentId: uuid().notNull(),
    UserId: text().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.ParentId, table.UserId, table.ModifiedAtTimestamp],
      name: 'owner_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const contributor_audit = risksmart.table(
  'contributor_audit',
  {
    ParentId: uuid().notNull(),
    UserId: text().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.ParentId, table.UserId, table.ModifiedAtTimestamp],
      name: 'contributor_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const action_parent = risksmart.table(
  'action_parent',
  {
    ActionId: uuid().notNull(),
    ParentId: uuid().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ParentType: text().notNull(),
  },
  (table) => [
    index('idx_action_parent_actionId_parentId').using(
      'btree',
      table.ActionId.asc().nullsLast().op('uuid_ops'),
      table.ParentId.asc().nullsLast().op('uuid_ops')
    ),
    foreignKey({
      columns: [table.ParentType],
      foreignColumns: [parent_type.Value],
      name: 'ActionParent_ParentType_fkey',
    }),
    foreignKey({
      columns: [table.ActionId],
      foreignColumns: [action.Id],
      name: 'action_parent_actionId_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'action_parent_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'action_parent_modifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'action_parent_organisationKey_fkey',
    }),
    foreignKey({
      columns: [table.ParentId],
      foreignColumns: [node.Id],
      name: 'action_parent_parentId_fkey',
    }).onDelete('cascade'),
    primaryKey({
      columns: [table.ActionId, table.ParentId],
      name: 'action_parent_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const control_parent_audit = risksmart.table(
  'control_parent_audit',
  {
    ControlId: uuid().notNull(),
    ParentId: uuid().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.ControlId, table.ParentId, table.ModifiedAtTimestamp],
      name: 'control_parent_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const form_configuration_audit = risksmart.table(
  'form_configuration_audit',
  {
    CustomAttributeSchemaId: uuid(),
    ParentType: text().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.ParentType, table.ModifiedAtTimestamp],
      name: 'form_configuration_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const form_field_ordering = risksmart.table(
  'form_field_ordering',
  {
    FormConfigurationParentType: text().notNull(),
    FieldId: text().notNull(),
    OrgKey: text().notNull(),
    Position: integer().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.FormConfigurationParentType, table.OrgKey],
      foreignColumns: [
        form_configuration.ParentType,
        form_configuration.OrgKey,
      ],
      name: 'form_field_configuration_FormConfigurationParentType_OrgKe_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'form_field_ordering_createdbyuser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'form_field_ordering_modifiedbyuser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'form_field_ordering_orgkey_fkey',
    }),
    foreignKey({
      columns: [table.FormConfigurationParentType],
      foreignColumns: [parent_type.Value],
      name: 'form_field_parent_type_fk',
    }).onDelete('cascade'),
    primaryKey({
      columns: [table.FormConfigurationParentType, table.FieldId, table.OrgKey],
      name: 'form_field_configuration_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const indicator_parent_audit = risksmart.table(
  'indicator_parent_audit',
  {
    IndicatorId: uuid().notNull(),
    ParentId: uuid().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.IndicatorId, table.ParentId, table.ModifiedAtTimestamp],
      name: 'indicator_parent_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const issue_parent = risksmart.table(
  'issue_parent',
  {
    IssueId: uuid().notNull(),
    ParentId: uuid().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ParentType: text().notNull().$type<ParentType>(),
  },
  (table) => [
    index('idx_issue_parent_controlId_parentId').using(
      'btree',
      table.IssueId.asc().nullsLast().op('uuid_ops'),
      table.ParentId.asc().nullsLast().op('uuid_ops')
    ),
    foreignKey({
      columns: [table.ParentType],
      foreignColumns: [parent_type.Value],
      name: 'IssueParent_ParentType_fkey',
    }),
    foreignKey({
      columns: [table.IssueId],
      foreignColumns: [issue.Id],
      name: 'issue_parent_IssueId_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'issue_parent_createdbyuser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'issue_parent_modifiedbyuser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'issue_parent_organisationKey_fkey',
    }),
    foreignKey({
      columns: [table.ParentId],
      foreignColumns: [node.Id],
      name: 'issue_parent_parentId_fkey',
    }).onDelete('cascade'),
    primaryKey({
      columns: [table.IssueId, table.ParentId],
      name: 'issue_parent_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const user_group_user_audit = risksmart.table(
  'user_group_user_audit',
  {
    UserGroupId: uuid().notNull(),
    UserId: text().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.UserGroupId, table.UserId, table.ModifiedAtTimestamp],
      name: 'user_group_user_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const owner_group_audit = risksmart.table(
  'owner_group_audit',
  {
    ParentId: uuid().notNull(),
    UserGroupId: uuid().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.ParentId, table.UserGroupId, table.ModifiedAtTimestamp],
      name: 'owner_group_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const contributor_group_audit = risksmart.table(
  'contributor_group_audit',
  {
    ParentId: uuid().notNull(),
    UserGroupId: uuid().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.ParentId, table.UserGroupId, table.ModifiedAtTimestamp],
      name: 'contributor_group_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const tag_type_group_audit = risksmart.table(
  'tag_type_group_audit',
  {
    Id: uuid().notNull(),
    Name: text().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'tag_type_group_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const department_type_group_audit = risksmart.table(
  'department_type_group_audit',
  {
    Id: uuid().notNull(),
    Name: text().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'department_type_group_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const acceptance_parent_audit = risksmart.table(
  'acceptance_parent_audit',
  {
    Id: uuid().notNull(),
    ParentId: uuid().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ParentId, table.ModifiedAtTimestamp],
      name: 'acceptance_parent_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const appetite_parent = risksmart.table(
  'appetite_parent',
  {
    Id: uuid().notNull(),
    ParentId: uuid().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    Status: text().$type<AppetiteStatus>(),
  },
  (table) => [
    index('idx_appetite_parent_appetiteId_parentId').using(
      'btree',
      table.Id.asc().nullsLast().op('uuid_ops'),
      table.ParentId.asc().nullsLast().op('uuid_ops')
    ),
    foreignKey({
      columns: [table.Status],
      foreignColumns: [appetite_status.Value],
      name: 'appetite_parent_Status_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [appetite.Id],
      name: 'appetite_parent_appetiteId_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'appetite_parent_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'appetite_parent_modifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'appetite_parent_organisationKey_fkey',
    }),
    foreignKey({
      columns: [table.ParentId],
      foreignColumns: [node.Id],
      name: 'appetite_parent_parentId_fkey',
    }).onDelete('cascade'),
    primaryKey({
      columns: [table.Id, table.ParentId],
      name: 'appetite_parent_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const impact_parent_audit = risksmart.table(
  'impact_parent_audit',
  {
    ImpactId: uuid().notNull(),
    ParentId: uuid().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.ImpactId, table.ParentId, table.ModifiedAtTimestamp],
      name: 'impact_parent_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const attestation_group_audit = risksmart.table(
  'attestation_group_audit',
  {
    GroupId: uuid().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
    ConfigId: uuid().notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.GroupId, table.ModifiedAtTimestamp, table.ConfigId],
      name: 'attestation_group_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const data_import_audit = risksmart.table(
  'data_import_audit',
  {
    Id: uuid().notNull(),
    OrgKey: text().notNull(),
    Status: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'data_import_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const ingestion_config_audit = risksmart.table(
  'ingestion_config_audit',
  {
    Id: uuid().notNull(),
    OrgKey: text().notNull(),
    IngestionConfig: jsonb(),
    SecretArn: text(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'ingestion_config_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const user_table_preferences_audit = risksmart.table(
  'user_table_preferences_audit',
  {
    TableId: text().notNull(),
    OrgKey: text().notNull(),
    Preferences: jsonb().$type<JSONB>(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedAtTimestamp: timestamp(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [
        table.TableId,
        table.OrgKey,
        table.CreatedByUser,
        table.ModifiedAtTimestamp,
      ],
      name: 'user_table_preferences_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const enterprise_risk_instance = risksmart.table(
  'enterprise_risk_instance',
  {
    EnterpriseRiskId: uuid(),
    RiskId: uuid().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),
    EntityId: uuid().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'enterprise_risk_instance_CreatedByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'enterprise_risk_instance_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'enterprise_risk_instance_OrgKey_fkey',
    }),
    foreignKey({
      columns: [table.EnterpriseRiskId],
      foreignColumns: [enterprise_risk.Id],
      name: 'enterprise_risk_instance_enterpriseriskid_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.EntityId],
      foreignColumns: [entity.Id],
      name: 'enterprise_risk_instance_entityid_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.RiskId],
      foreignColumns: [risk.Id],
      name: 'enterprise_risk_instance_riskid_fkey',
    }).onDelete('cascade'),
    primaryKey({
      columns: [table.RiskId],
      name: 'enterprise_risk_instance_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const document_linked_document_audit = risksmart.table(
  'document_linked_document_audit',
  {
    DocumentId: uuid().notNull(),
    LinkedDocumentId: uuid().notNull(),
    OrgKey: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),
    Meta: json().$type<JSONB>(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [
        table.DocumentId,
        table.LinkedDocumentId,
        table.ModifiedAtTimestamp,
      ],
      name: 'document_linked_document_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const relation_file = risksmart.table(
  'relation_file',
  {
    ParentId: uuid().notNull(),
    ParentType: text().notNull(),
    FileId: uuid().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedByUser: text().notNull(),
    OrgKey: text().notNull(),
    Meta: json().$type<JSONB>(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ChangeRequestFileOperation: text().$type<ChangeRequestFileOperation>(),
  },
  (table) => [
    foreignKey({
      columns: [table.ParentType],
      foreignColumns: [parent_type.Value],
      name: 'RelationFile_ParentType_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'relation_file_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'relation_file_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'relation_file_orgKey_fkey',
    }),
    foreignKey({
      columns: [table.ChangeRequestFileOperation],
      foreignColumns: [change_request_relation_file_operation.Value],
      name: 'relation_file_ChangeRequestFileOperation_fkey',
    }),
    primaryKey({
      columns: [table.ParentId, table.FileId],
      name: 'relation_file_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

const change_request_relation_file_operation = risksmart.table(
  'change_request_relation_file_operation',
  {
    Value: text().primaryKey().notNull(),
    Comment: text(),
  }
);

export const comment_audit = risksmart.table(
  'comment_audit',
  {
    Id: uuid().notNull(),
    ConversationId: uuid().notNull(),
    Content: text().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'comment_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const action_parent_audit = risksmart.table(
  'action_parent_audit',
  {
    ActionId: uuid().notNull(),
    ParentId: uuid().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),

    Action: dbActionEnum('Action'),
    ParentType: text(),
  },
  (table) => [
    primaryKey({
      columns: [table.ActionId, table.ParentId, table.ModifiedAtTimestamp],
      name: 'action_parent_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const form_field_ordering_audit = risksmart.table(
  'form_field_ordering_audit',
  {
    FormConfigurationParentType: text().notNull(),
    FieldId: text().notNull(),
    OrgKey: text().notNull(),
    Position: integer().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [
        table.FormConfigurationParentType,
        table.FieldId,
        table.ModifiedAtTimestamp,
        table.OrgKey,
      ],
      name: 'form_field_ordering_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const issue_parent_audit = risksmart.table(
  'issue_parent_audit',
  {
    IssueId: uuid().notNull(),
    ParentId: uuid().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),

    Action: dbActionEnum('Action'),
    ParentType: text(),
  },
  (table) => [
    primaryKey({
      columns: [table.IssueId, table.ParentId, table.ModifiedAtTimestamp],
      name: 'issue_parent_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const conversation_audit = risksmart.table(
  'conversation_audit',
  {
    Id: uuid().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),

    Action: dbActionEnum('Action'),
    IsResolved: boolean().default(false),
    ParentId: uuid(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'conversation_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const assessment_result_parent = risksmart.table(
  'assessment_result_parent',
  {
    Id: uuid().notNull(),
    ResultType: text().$type<ParentType>().notNull(),
    ParentId: uuid().notNull(),
    ParentType: text().$type<ParentType>().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    index('idx_assessment_result_parent_resultId_parentId').using(
      'btree',
      table.Id.asc().nullsLast().op('uuid_ops'),
      table.ParentId.asc().nullsLast().op('uuid_ops')
    ),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'assessment_result_parent_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'assessment_result_parent_modifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'assessment_result_parent_organisationKey_fkey',
    }),
    foreignKey({
      columns: [table.ParentId],
      foreignColumns: [node.Id],
      name: 'assessment_result_parent_parentId_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.ParentType],
      foreignColumns: [parent_type.Value],
      name: 'assessment_result_parent_parent_type_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'assessment_result_parent_resultId_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.ResultType],
      foreignColumns: [parent_type.Value],
      name: 'assessment_result_parent_result_type_fkey',
    }),
    primaryKey({
      columns: [table.Id, table.ParentId],
      name: 'assessment_result_parent_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const internal_audit_result_parent = risksmart.table(
  'internal_audit_result_parent',
  {
    Id: uuid().notNull(),
    ResultType: text().$type<ParentType>().notNull(),
    ParentId: uuid().notNull(),
    ParentType: text().$type<ParentType>().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'internal_audit_result_parent_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'internal_audit_result_parent_modifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'internal_audit_result_parent_organisationKey_fkey',
    }),
    foreignKey({
      columns: [table.ParentId],
      foreignColumns: [node.Id],
      name: 'internal_audit_result_parent_parentId_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.ParentType],
      foreignColumns: [parent_type.Value],
      name: 'internal_audit_result_parent_parent_type_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'internal_audit_result_parent_resultId_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.ResultType],
      foreignColumns: [parent_type.Value],
      name: 'internal_audit_result_parent_result_type_fkey',
    }),
    primaryKey({
      columns: [table.Id, table.ParentId],
      name: 'internal_audit_result_parent_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const second_line_result_parent = risksmart.table(
  'second_line_result_parent',
  {
    Id: uuid().notNull(),
    ResultType: text().$type<ParentType>().notNull(),
    ParentId: uuid().notNull(),
    ParentType: text().$type<ParentType>().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'second_line_result_parent_createdByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'second_line_result_parent_modifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'second_line_result_parent_organisationKey_fkey',
    }),
    foreignKey({
      columns: [table.ParentId],
      foreignColumns: [node.Id],
      name: 'second_line_result_parent_parentId_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.ParentType],
      foreignColumns: [parent_type.Value],
      name: 'second_line_result_parent_parent_type_fkey',
    }),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'second_line_result_parent_resultId_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.ResultType],
      foreignColumns: [parent_type.Value],
      name: 'second_line_result_parent_result_type_fkey',
    }),
    primaryKey({
      columns: [table.Id, table.ParentId],
      name: 'second_line_result_parent_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const change_request_contributor_audit = risksmart.table(
  'change_request_contributor_audit',
  {
    Id: uuid().notNull(),
    OrgKey: text().notNull(),
    ChangeRequestId: uuid().notNull(),
    UserId: text().notNull(),
    CreatedAtTimestamp: timestamp(),
    ModifiedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
    CreatedByUser: text(),
    ModifiedByUser: text(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'change_request_contributor_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const aggregation_org_audit = risksmart.table(
  'aggregation_org_audit',
  {
    OrgKey: text().notNull(),
    RiskScoringModel: text(),
    Appetite: text(),
    Config: jsonb().$type<JSONB>(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),
    CreatedByUser: text(),
    ModifiedByUser: text(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.OrgKey, table.ModifiedAtTimestamp],
      name: 'aggregation_org_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const business_area_audit = risksmart.table(
  'business_area_audit',
  {
    Id: uuid().defaultRandom().notNull(),
    Title: text().notNull(),
    OrgKey: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),

    Action: dbActionEnum('Action'),
    SequentialId: integer(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'business_area_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const custom_ribbon_audit = risksmart.table(
  'custom_ribbon_audit',
  {
    Id: uuid().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),

    Action: dbActionEnum('Action').notNull(),
    ParentType: text().notNull(),
    Filters: jsonb().notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'custom_ribbon_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const enterprise_risk_instance_audit = risksmart.table(
  'enterprise_risk_instance_audit',
  {
    EnterpriseRiskId: uuid(),
    RiskId: uuid().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
    EntityId: uuid(),
  },
  (table) => [
    primaryKey({
      columns: [table.RiskId, table.ModifiedAtTimestamp],
      name: 'enterprise_risk_instance_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const appetite_parent_audit = risksmart.table(
  'appetite_parent_audit',
  {
    Id: uuid().notNull(),
    ParentId: uuid().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),

    Action: dbActionEnum('Action'),
    Status: text(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ParentId, table.ModifiedAtTimestamp],
      name: 'appetite_parent_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const relation_file_audit = risksmart.table(
  'relation_file_audit',
  {
    ParentId: uuid().notNull(),
    ParentType: text().notNull(),
    FileId: uuid().notNull(),
    OrgKey: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp().notNull(),
    Meta: json().$type<JSONB>(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.ParentId, table.FileId, table.ModifiedAtTimestamp],
      name: 'relation_file_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const custom_attribute_schema_audit = risksmart.table(
  'custom_attribute_schema_audit',
  {
    Id: uuid().notNull(),
    Schema: jsonb().notNull(),
    UiSchema: jsonb().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'custom_attribute_schema_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const taxonomy_org_audit = risksmart.table(
  'taxonomy_org_audit',
  {
    Id: uuid().notNull(),
    TaxonomyId: uuid().notNull(),
    Locale: text().notNull(),
    OrgName: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
    OrgKey: text(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'taxonomy_org_audit_pkey',
    }),
  ]
);

export const approval_audit = risksmart.table(
  'approval_audit',
  {
    Id: uuid().notNull(),
    ParentId: uuid(),
    Workflow: text().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
    InFlightEditRule: text().default('approvers').notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'approval_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const tag_type_audit = risksmart.table(
  'tag_type_audit',
  {
    TagTypeId: uuid().defaultRandom().notNull(),
    Name: text().notNull(),
    Description: text(),
    OrgKey: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),

    Action: dbActionEnum('Action'),
    TagTypeGroupId: uuid(),
  },
  (table) => [
    primaryKey({
      columns: [table.TagTypeId, table.ModifiedAtTimestamp],
      name: 'tag_type_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const department_type_audit = risksmart.table(
  'department_type_audit',
  {
    DepartmentTypeId: uuid().notNull(),
    Name: text().notNull(),
    Description: text(),
    OrgKey: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
    DepartmentTypeGroupId: uuid(),
  },
  (table) => [
    primaryKey({
      columns: [table.DepartmentTypeId, table.ModifiedAtTimestamp],
      name: 'department_type_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const assessment_result_parent_audit = risksmart.table(
  'assessment_result_parent_audit',
  {
    Id: uuid().notNull(),
    ResultType: text().notNull(),
    ParentId: uuid().notNull(),
    ParentType: text().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ParentId, table.ModifiedAtTimestamp],
      name: 'assessment_result_parent_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const organisation_audit = auth.table(
  'organisation_audit',
  {
    OrgKey: text().notNull(),
    Name: text(),
    AuthTenant: text(),
    Meta: text(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),

    Action: dbActionEnum('Action'),
    ScimEnabled: boolean(),
  },
  (table) => [
    primaryKey({
      columns: [table.OrgKey, table.ModifiedAtTimestamp],
      name: 'organisation_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const attestation_config_audit = risksmart.table(
  'attestation_config_audit',
  {
    ParentId: uuid().notNull(),
    RequireGlobalAttestation: boolean().notNull(),
    AttestationTimeLimit: interval(),
    OrgKey: text().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp().notNull(),
    ModifiedByUser: text().notNull(),

    Action: dbActionEnum('Action'),
    PromptText: text(),
  },
  (table) => [
    primaryKey({
      columns: [table.ParentId, table.ModifiedAtTimestamp],
      name: 'attestation_config_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const questionnaire_template_audit = risksmart.table(
  'questionnaire_template_audit',
  {
    Id: uuid().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),

    Action: dbActionEnum('Action').notNull(),
    Title: text().notNull(),
    Description: text(),
    CustomAttributeData: jsonb().$type<JSONB>(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'questionnaire_template_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const schedule_state_audit = risksmart.table(
  'schedule_state_audit',
  {
    Id: uuid().notNull(),
    LatestDate: timestamp(),
    DueDate: timestamp(),
    OverdueDate: timestamp(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'schedule_state_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const entity_audit = risksmart.table(
  'entity_audit',
  {
    Id: uuid().notNull(),
    Name: text().notNull(),
    Description: text(),
    ParentId: uuid(),
    OrgKey: text().notNull(),
    Weight: numericCasted({ precision: 5, scale: 2 }),
    CreatedAtTimestamp: timestamp().notNull(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),

    Action: dbActionEnum('Action').notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'entity_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const file_audit = risksmart.table(
  'file_audit',
  {
    Id: uuid().notNull(),
    FileName: text().notNull(),
    FileSize: integer().notNull(),
    ContentType: text().notNull(),
    OrgKey: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp().notNull(),
    Meta: json().$type<JSONB>(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'file_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const obligation_impact_audit = risksmart.table(
  'obligation_impact_audit',
  {
    Id: uuid().notNull(),
    ParentObligationId: uuid().notNull(),
    Description: text().notNull(),
    ImpactRating: smallint().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
    CustomAttributeData: jsonb().$type<JSONB>(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'obligation_impact_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const taxonomy_audit = risksmart.table(
  'taxonomy_audit',
  {
    Id: uuid().notNull(),
    Description: text().notNull(),
    Common: jsonb().notNull(),
    Library: jsonb().notNull(),
    Rating: jsonb().notNull(),
    Taxonomy: jsonb().notNull(),
    InternalAuditRating: jsonb(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'taxonomy_audit_pkey',
    }),
  ]
);

export const approval_level_audit = risksmart.table(
  'approval_level_audit',
  {
    Id: uuid().notNull(),
    Description: text().notNull(),
    SequenceOrder: integer().notNull(),
    ApprovalId: uuid().notNull(),
    ApprovalRuleType: text().$type<ApprovalRuleType>().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'approval_level_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const approver_audit = risksmart.table(
  'approver_audit',
  {
    Id: uuid().notNull(),
    UserId: text(),
    LevelId: uuid().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
    OwnerApprover: boolean(),
    UserGroupId: uuid(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'approver_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
    check(
      'user_id_xor_group_xor_owner_approver',
      sql`(("UserId" IS NOT NULL) AND ("UserGroupId" IS NULL) AND ("OwnerApprover" IS NOT TRUE)) OR (("UserGroupId" IS NOT NULL) AND ("UserId" IS NULL) AND ("OwnerApprover" IS NOT TRUE)) OR (("OwnerApprover" IS TRUE) AND ("UserId" IS NULL) AND ("UserGroupId" IS NULL))`
    ),
  ]
);

export const form_field_configuration = risksmart.table(
  'form_field_configuration',
  {
    FormConfigurationParentType: text().notNull().$type<ParentType>(),
    FieldId: text().notNull(),
    // no-dd-sa:typescript-best-practices/boolean-prop-naming
    Hidden: boolean().notNull(),
    // no-dd-sa:typescript-best-practices/boolean-prop-naming
    Required: boolean().notNull(),
    // no-dd-sa:typescript-best-practices/boolean-prop-naming
    ReadOnly: boolean().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    DefaultValue: text(),
    Label: text(),
    Description: text(),
    Conditions: jsonb().$type<Conditions>(),
  },
  (table) => [
    foreignKey({
      columns: [table.FormConfigurationParentType, table.OrgKey],
      foreignColumns: [
        form_configuration.ParentType,
        form_configuration.OrgKey,
      ],
      name: 'form_field_configuration_FormConfigurationParentType_OrgK_fkey1',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'form_field_configuration_createdbyuser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'form_field_configuration_modifiedbyuser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'form_field_configuration_orgkey_fkey',
    }),
    foreignKey({
      columns: [table.FormConfigurationParentType],
      foreignColumns: [parent_type.Value],
      name: 'form_field_parent_type_fk',
    }).onDelete('cascade'),
    primaryKey({
      columns: [table.FormConfigurationParentType, table.FieldId, table.OrgKey],
      name: 'form_field_configuration_pkey1',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const user_group_audit = risksmart.table(
  'user_group_audit',
  {
    Id: uuid().notNull(),
    Name: text().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),

    Action: dbActionEnum('Action'),
    Email: text(),
    Description: text(),
    OwnerContributor: boolean(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'user_group_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const dashboard_audit = risksmart.table(
  'dashboard_audit',
  {
    Id: uuid().notNull(),
    Name: text(),
    Description: text(),
    Sharing: text(),
    Content: jsonb().$type<JSONB>(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    OrgKey: text().notNull(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'dashboard_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const risk_score_audit = risksmart.table(
  'risk_score_audit',
  {
    RiskId: uuid().notNull(),
    ResidualScore: doublePrecision(),
    InherentScore: doublePrecision(),
    OrgKey: text().notNull(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),
    CreatedByUser: text(),
    ModifiedByUser: text(),
    Action: dbActionEnum('Action'),
    ResidualRating: integer(),
    InherentRating: integer(),
    ResidualLikelihood: doublePrecision(),
    ResidualImpact: doublePrecision(),
    InherentLikelihood: doublePrecision(),
    InherentImpact: doublePrecision(),
  },
  (table) => [
    primaryKey({
      columns: [table.RiskId, table.ModifiedAtTimestamp],
      name: 'risk_score_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const data_import_error_audit = risksmart.table(
  'data_import_error_audit',
  {
    Id: uuid().notNull(),
    DataImportId: uuid(),
    ImportObject: text().notNull(),
    OrgKey: text().notNull(),
    RowNumber: integer().notNull(),
    Message: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'data_import_error_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const organisationuser = auth.table(
  'organisationuser',
  {
    OrgKey: text().notNull(),
    User_Id: text().notNull(),
    RoleKey: text(),
    LastSeen: timestamp(),
    CreatedAtTimestamp: timestamp().default(sql`statement_timestamp()`),
    CreatedByUser: text(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().default(sql`statement_timestamp()`),
    Status: text().$type<UserStatus>().default(UserStatus.Active),
    AuthConnection: text(),
    AuthConnection_Id: text(),
    External_Id: text(),
  },
  (table) => [
    index('idx_organisationUser_parentRiskId').using(
      'btree',
      table.User_Id.asc().nullsLast().op('text_ops'),
      table.OrgKey.asc().nullsLast().op('text_ops')
    ),
    foreignKey({
      columns: [table.Status],
      foreignColumns: [user_status.Value],
      name: 'User_status_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'organisationUser_Organisation_Id_fkey',
    }),
    foreignKey({
      columns: [table.User_Id],
      foreignColumns: [user.Id],
      name: 'organisationUser_User_Id_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'organisationuser_CreatedByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'organisationuser_ModifiedByUser_fkey',
    }),
    primaryKey({
      columns: [table.OrgKey, table.User_Id],
      name: 'organisationUser_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const control_group_audit = risksmart.table(
  'control_group_audit',
  {
    Id: uuid().notNull(),
    Title: text().notNull(),
    Description: text().notNull(),
    Owner: text().notNull(),
    Meta: json().$type<JSONB>(),
    OrgKey: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
    CustomAttributeData: jsonb().$type<JSONB>(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'control_group_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const action_update_audit = risksmart.table(
  'action_update_audit',
  {
    Id: uuid().notNull(),
    Title: text().notNull(),
    Description: text(),
    ParentActionId: uuid().notNull(),
    Meta: json().$type<JSONB>(),
    OrgKey: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
    CustomAttributeData: jsonb().$type<JSONB>(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'action_update_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const issue_update_audit = risksmart.table(
  'issue_update_audit',
  {
    Id: uuid().notNull(),
    Title: text().notNull(),
    Description: text(),
    ParentIssueId: uuid().notNull(),
    Meta: json().$type<JSONB>(),
    OrgKey: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
    CustomAttributeData: jsonb().$type<JSONB>(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'issue_update_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const form_field_configuration_audit = risksmart.table(
  'form_field_configuration_audit',
  {
    FormConfigurationParentType: text().notNull(),
    FieldId: text().notNull(),
    // no-dd-sa:typescript-best-practices/boolean-prop-naming
    Hidden: boolean().notNull(),
    // no-dd-sa:typescript-best-practices/boolean-prop-naming
    Required: boolean().notNull(),
    // no-dd-sa:typescript-best-practices/boolean-prop-naming
    ReadOnly: boolean().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
    DefaultValue: text(),
    Label: text(),
    Description: text(),
    Conditions: jsonb().$type<Conditions>(),
  },
  (table) => [
    primaryKey({
      columns: [
        table.FormConfigurationParentType,
        table.FieldId,
        table.ModifiedAtTimestamp,
        table.OrgKey,
      ],
      name: 'form_field_configuration_audit_pkey1',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const obligation_assessment_result_audit = risksmart.table(
  'obligation_assessment_result_audit',
  {
    Id: uuid().notNull(),
    Rating: integer(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),

    Action: dbActionEnum('Action'),
    CustomAttributeData: jsonb().$type<JSONB>(),
    Rationale: text(),
    TestDate: timestamp(),
    RatingType: text(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'obligation_assessment_result_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const document_assessment_result_audit = risksmart.table(
  'document_assessment_result_audit',
  {
    Id: uuid().notNull(),
    Rating: integer(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),

    Action: dbActionEnum('Action'),
    CustomAttributeData: jsonb().$type<JSONB>(),
    Rationale: text(),
    TestDate: timestamp(),
    RatingType: text(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'document_assessment_result_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const internal_audit_entity_audit = risksmart.table(
  'internal_audit_entity_audit',
  {
    Id: uuid().defaultRandom().notNull(),
    SequentialId: integer(),
    Title: text().notNull(),
    Description: text(),
    BusinessAreaId: uuid().notNull(),
    OrgKey: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'internal_audit_entity_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const schedule_audit = risksmart.table(
  'schedule_audit',
  {
    Id: uuid().notNull(),
    Frequency: text(),
    TimeToCompleteValue: integer(),
    TimeToCompleteUnit: text(),
    StartDate: timestamp(),
    ManualDueDate: timestamp(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'schedule_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const indicator_result_audit = risksmart.table(
  'indicator_result_audit',
  {
    Id: uuid().notNull(),
    IndicatorId: uuid().notNull(),
    Description: text(),
    ResultDate: timestamp().notNull(),
    TargetValueTxt: text(),
    TargetValueNum: numeric(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
    CustomAttributeData: jsonb().$type<JSONB>(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'indicator_result_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const cause_audit = risksmart.table(
  'cause_audit',
  {
    Id: uuid().notNull(),
    Title: text().notNull(),
    Description: text().notNull(),
    Significance: integer(),
    ParentIssueId: uuid().notNull(),
    Meta: json().$type<JSONB>(),
    OrgKey: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
    CustomAttributeData: jsonb().$type<JSONB>(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'cause_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const organisationuser_audit = auth.table(
  'organisationuser_audit',
  {
    OrgKey: text().notNull(),
    User_Id: text().notNull(),
    RoleKey: text(),
    LastSeen: timestamp(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedByUser: text(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),

    Action: dbActionEnum('Action'),
    Status: text(),
    AuthConnection: text(),
    AuthConnection_Id: text(),
    External_Id: text(),
  },
  (table) => [
    primaryKey({
      columns: [table.OrgKey, table.User_Id, table.ModifiedAtTimestamp],
      name: 'organisationuser_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const approver_response_audit = risksmart.table(
  'approver_response_audit',
  {
    Id: uuid().notNull(),
    ApproverId: uuid().notNull(),
    ModifiedAtTimestamp: timestamp().notNull(),
    ModifiedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),
    CreatedByUser: text().notNull(),
    Comment: text(),

    Action: dbActionEnum('Action'),
    ChangeRequestId: uuid().notNull(),
    Approved: boolean(),
    ApprovedByUser: text(),
    ApprovedAtTimestamp: timestamp(),
    OrgKey: text().notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'approver_response_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const questionnaire_template_version_audit = risksmart.table(
  'questionnaire_template_version_audit',
  {
    Id: uuid().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),

    Action: dbActionEnum('Action').notNull(),
    Version: text().notNull(),
    Status: text().$type<QuestionnaireTemplateVersionStatus>().notNull(),
    Schema: jsonb().notNull(),
    UISchema: jsonb().notNull(),
    ParentId: uuid().notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'questionnaire_template_version_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const questionnaire_invite_audit = risksmart.table(
  'questionnaire_invite_audit',
  {
    Id: uuid().notNull(),
    ThirdPartyId: uuid().notNull(),
    UserEmail: text().notNull(),
    QuestionnaireTemplateVersionId: uuid().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
    UserId: text(),
    ParentId: uuid(),
    Message: text(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'questionnaire_invite_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const document_audit = risksmart.table(
  'document_audit',
  {
    Id: uuid().notNull(),
    Title: text().notNull(),
    DocumentType: text().notNull(),
    Purpose: text(),
    ParentDocument: uuid(),
    OrgKey: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),
    Meta: json().$type<JSONB>(),

    Action: dbActionEnum('Action'),
    CustomAttributeData: jsonb().$type<JSONB>(),
    SequentialId: integer(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'document_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const impact_audit = risksmart.table(
  'impact_audit',
  {
    Id: uuid().notNull(),
    SequentialId: integer().notNull(),
    Name: text().notNull(),
    Rationale: text(),
    ImpactAppetite: smallint(),
    LikelihoodAppetite: smallint(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    OrgKey: text().notNull(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
    RatingGuidance: text(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'impact_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const third_party_response_audit = risksmart.table(
  'third_party_response_audit',
  {
    Id: uuid().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),

    Action: dbActionEnum('Action').notNull(),
    ParentId: uuid().notNull(),
    QuestionnaireTemplateVersionId: uuid().notNull(),
    Status: text().notNull(),
    ResponseData: jsonb().notNull(),
    StartDate: timestamp(),
    ExpiresAt: timestamp(),
    RecallReason: text(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'third_party_response_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const attestation_record_audit = risksmart.table(
  'attestation_record_audit',
  {
    Id: uuid().notNull(),
    UserId: text().notNull(),
    Active: boolean().notNull(),
    AttestationStatus: text().notNull(),
    AttestedAt: timestamp(),
    ExpiresAt: timestamp(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
    NodeId: uuid().notNull(),
    ConfigId: uuid(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'attestation_record_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const obligation_audit = risksmart.table(
  'obligation_audit',
  {
    Id: uuid().notNull(),
    ParentId: uuid(),
    Title: text().notNull(),
    Description: text(),
    Interpretation: text(),
    Adherence: text(),
    Type: text().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
    CustomAttributeData: jsonb().$type<JSONB>(),
    SequentialId: integer(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'obligation_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const risk_assessment_result_audit = risksmart.table(
  'risk_assessment_result_audit',
  {
    Id: uuid().notNull(),
    ControlType: text().notNull(),
    Likelihood: integer(),
    Impact: integer(),
    Rating: integer(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),

    Action: dbActionEnum('Action'),
    CustomAttributeData: jsonb().$type<JSONB>(),
    Rationale: text(),
    TestDate: timestamp(),
    RatingType: text(),
    ConfigId: uuid(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'risk_assessment_result_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const assessment_activity_audit = risksmart.table(
  'assessment_activity_audit',
  {
    Id: uuid().defaultRandom().notNull(),
    ActivityType: text().notNull(),
    ParentId: uuid().notNull(),
    OrgKey: text().notNull(),
    Title: text(),
    Summary: text(),
    Status: text(),
    AssignedUser: text(),
    CompletionDate: timestamp(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),

    Action: dbActionEnum('Action'),
    CustomAttributeData: jsonb().$type<JSONB>(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'assessment_activity_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const user_search_preferences = risksmart.table(
  'user_search_preferences',
  {
    OrgKey: text().notNull(),
    RecentUserIds: text().array().default(['']).notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ShowGroups: boolean().default(true).notNull(),
    FilterByActivePlatformUsers: boolean().default(false).notNull(),
    ShowUserPlatformRole: boolean().default(true).notNull(),
    ShowUserJobTitle: boolean().default(false).notNull(),
    ShowDirectoryDepartment: boolean().default(false).notNull(),
    ShowUserLocation: boolean().default(false).notNull(),
    ShowUserEmail: boolean().default(true).notNull(),
    ShowArchivedUsers: boolean().default(false).notNull(),
    ShowInheritedContributors: boolean().default(false).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'recent_user_CreatedByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'recent_user_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'recent_user_OrgKey_fkey',
    }),
    primaryKey({
      columns: [table.OrgKey, table.CreatedByUser],
      name: 'recent_users_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const enterprise_risk_audit = risksmart.table(
  'enterprise_risk_audit',
  {
    Id: uuid().notNull(),
    Title: text().notNull(),
    Description: text().notNull(),
    Tier: integer().notNull(),
    ParentId: uuid(),
    Meta: jsonb().$type<JSONB>(),
    Treatment: text(),
    SequentialId: integer().notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'enterprise_risk_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const control_audit = risksmart.table(
  'control_audit',
  {
    Id: uuid().notNull(),
    Title: text().notNull(),
    Description: text(),
    Type: text(),
    ParentRiskId: uuid(),
    GroupId: uuid(),
    Meta: json().$type<JSONB>(),
    OrgKey: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
    ParentObligationId: uuid(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    SequentialId: integer(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'control_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const risk_audit = risksmart.table(
  'risk_audit',
  {
    Id: uuid().notNull(),
    Title: text().notNull(),
    Tier: integer().notNull(),
    ParentRiskId: uuid(),
    Description: text(),
    Meta: json().$type<JSONB>(),
    OrgKey: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
    CustomAttributeData: jsonb().$type<JSONB>(),
    Treatment: text(),
    Status: text(),
    SequentialId: integer(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'risk_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const consequence_audit = risksmart.table(
  'consequence_audit',
  {
    Id: uuid().notNull(),
    Title: text().notNull(),
    Description: text().notNull(),
    Criticality: integer(),
    CostType: text().notNull(),
    CostValue: numericCasted().notNull(),
    ParentIssueId: uuid().notNull(),
    Meta: json().$type<JSONB>(),
    OrgKey: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
    CustomAttributeData: jsonb().$type<JSONB>(),
    Type: text(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'consequence_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const impact_rating_audit = risksmart.table(
  'impact_rating_audit',
  {
    Id: uuid().notNull(),
    ImpactId: uuid().notNull(),
    RatedItemId: uuid().notNull(),
    SequentialId: integer().notNull(),
    Rating: smallint().notNull(),
    TestDate: timestamp().notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
    CompletedBy: text(),
    RatingType: text(),
    Likelihood: integer(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'impact_rating_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const old_risk_assessment_audit = risksmart.table(
  'old_risk_assessment_audit',
  {
    ParentId: uuid().notNull(),
    ControlType: text().notNull(),
    Likelihood: integer(),
    Impact: integer(),
    Rating: integer(),
    Description: text(),
    NextTestDate: timestamp(),
    Meta: json().$type<JSONB>(),
    OrgKey: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
    CustomAttributeData: jsonb().$type<JSONB>(),
    Id: uuid().notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.ModifiedAtTimestamp, table.Id],
      name: 'risk_assessment_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const change_request_audit = risksmart.table(
  'change_request_audit',
  {
    Id: uuid().notNull(),
    OrgKey: text().notNull(),
    ParentId: uuid(),
    ChangeRequestStatus: text().notNull(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp().notNull(),
    Comment: text().notNull(),

    Action: dbActionEnum('Action'),
    SequentialId: integer(),
    RequestedChanges: jsonb().$type<JSONB>(),
    Type: text().notNull(),
    OverriddenByUser: text(),
    OverriddenAtTimestamp: timestamp(),
    ActionUserId: text(),
    Workflow: text(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'change_request_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
    check(
      'change_request_audit_Type_check',
      sql`"Type" = ANY (ARRAY['create'::text, 'update'::text, 'delete'::text])`
    ),
  ]
);

export const user_search_preferences_audit = risksmart.table(
  'user_search_preferences_audit',
  {
    OrgKey: text().notNull(),
    RecentUserIds: text().array().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
    ShowGroups: boolean().default(true).notNull(),
    FilterByActivePlatformUsers: boolean().default(false).notNull(),
    ShowUserPlatformRole: boolean().default(true).notNull(),
    ShowUserJobTitle: boolean().default(false).notNull(),
    ShowDirectoryDepartment: boolean().default(false).notNull(),
    ShowUserLocation: boolean().default(false).notNull(),
    ShowUserEmail: boolean().default(true).notNull(),
    ShowArchivedUsers: boolean().default(false).notNull(),
    ShowInheritedContributors: boolean().default(false).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.OrgKey, table.CreatedByUser, table.ModifiedAtTimestamp],
      name: 'recent_users_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const action_audit = risksmart.table(
  'action_audit',
  {
    Id: uuid().notNull(),
    Title: text().notNull(),
    DateRaised: timestamp().notNull(),
    DateDue: timestamp().notNull(),
    Status: text().notNull(),
    Priority: integer(),
    Description: text(),
    Meta: json().$type<JSONB>(),
    OrgKey: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
    ClosedDate: timestamp(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    SequentialId: integer(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'action_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const appetite_audit = risksmart.table(
  'appetite_audit',
  {
    Id: uuid().notNull(),
    LowerAppetite: integer(),
    UpperAppetite: integer(),
    Statement: text().notNull(),
    Meta: json().$type<JSONB>(),
    OrgKey: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
    CustomAttributeData: jsonb().$type<JSONB>(),
    EffectiveDate: timestamp(),
    AppetiteType: text(),
    ImpactAppetite: integer(),
    SequentialId: integer(),
    LikelihoodAppetite: integer(),
    ImpactId: uuid(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'appetite_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const issue_audit = risksmart.table(
  'issue_audit',
  {
    Id: uuid().notNull(),
    Title: text().notNull(),
    Details: text().notNull(),
    ImpactsCustomer: boolean(),
    IsExternalIssue: boolean(),
    DateOccurred: timestamp().notNull(),
    DateIdentified: timestamp().notNull(),
    Meta: json().$type<JSONB>(),
    OrgKey: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
    SequentialId: integer(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    RaisedAtTimestamp: timestamp(),
    Type: text(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'issue_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const indicator_audit = risksmart.table(
  'indicator_audit',
  {
    Id: uuid().notNull(),
    Title: text().notNull(),
    Description: text(),
    Type: text().notNull(),
    Unit: text(),
    UpperToleranceNum: numeric(),
    LowerToleranceNum: numeric(),
    TargetValueTxt: text(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
    CustomAttributeData: jsonb().$type<JSONB>(),
    SequentialId: integer(),
    UpperAppetiteNum: numeric(),
    LowerAppetiteNum: numeric(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'indicator_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const old_document_assessment_audit = risksmart.table(
  'old_document_assessment_audit',
  {
    Id: uuid().defaultRandom().notNull(),
    Title: text().notNull(),
    Summary: text().notNull(),
    TargetCompletionDate: timestamp(),
    ActualCompletionDate: timestamp(),
    StartDate: timestamp(),
    Status: text().notNull(),
    Owner: text().notNull(),
    Result: smallint(),
    CompletedBy: text(),
    ParentDocumentId: uuid().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),

    Action: dbActionEnum('Action'),
    CustomAttributeData: jsonb().$type<JSONB>(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'document_assessment_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const old_obligation_assessment_audit = risksmart.table(
  'old_obligation_assessment_audit',
  {
    Id: uuid().notNull(),
    ParentObligationId: uuid().notNull(),
    Title: text(),
    Summary: text(),
    TargetCompletionDate: timestamp(),
    ActualCompletionDate: timestamp(),
    StartDate: timestamp(),
    Status: text(),
    Owner: text(),
    Result: smallint(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),
    CompletedBy: text(),

    Action: dbActionEnum('Action'),
    CustomAttributeData: jsonb().$type<JSONB>(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'obligation_assessment_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const user_audit = auth.table(
  'user_audit',
  {
    Id: text().notNull(),
    FirstName: text(),
    LastName: text(),
    Email: text(),
    UserName: text(),
    Status: text(),
    Meta: text(),
    AuthUser_Id: text(),
    External_Id: text(),
    DisplayName: text(),
    JobTitle: text(),
    Department: text(),
    OfficeLocation: text(),
    CreatedByUser: text(),
    CreatedOn: timestamp().default(sql`statement_timestamp()`),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'user_audit_pkey',
    }),
  ]
);

export const acceptance_audit = risksmart.table(
  'acceptance_audit',
  {
    Id: uuid().notNull(),
    Title: text().notNull(),
    DateAcceptedFrom: timestamp().notNull(),
    DateAcceptedTo: timestamp().notNull(),
    Details: text().notNull(),
    Status: text().notNull(),
    Meta: json().$type<JSONB>(),
    OrgKey: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
    ApprovedByUser: text(),
    ApprovedByUserGroup: uuid(),
    RequestedByUser: text(),
    RequestedByUserGroup: uuid(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    SequentialId: integer(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'acceptance_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const internal_audit_report_audit = risksmart.table(
  'internal_audit_report_audit',
  {
    Id: uuid().defaultRandom().notNull(),
    SequentialId: integer(),
    Title: text().notNull(),
    Summary: text().notNull(),
    TargetCompletionDate: timestamp(),
    ActualCompletionDate: timestamp(),
    StartDate: timestamp(),
    NextTestDate: timestamp(),
    OrgKey: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CompletedByUser: text(),
    OriginatingItemId: uuid(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    Status: text().default('notstarted').notNull(),
    Outcome: integer(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'internal_audit_report_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const compliance_monitoring_assessment_audit = risksmart.table(
  'compliance_monitoring_assessment_audit',
  {
    Id: uuid().defaultRandom().notNull(),
    SequentialId: integer(),
    Title: text().notNull(),
    Summary: text().notNull(),
    TargetCompletionDate: timestamp(),
    ActualCompletionDate: timestamp(),
    StartDate: timestamp(),
    NextTestDate: timestamp(),
    OrgKey: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CompletedByUser: text(),
    OriginatingItemId: uuid(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    Status: text().default('notstarted').notNull(),
    Outcome: integer(),

    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'compliance_monitoring_assessment_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const assessment_audit = risksmart.table(
  'assessment_audit',
  {
    Id: uuid().notNull(),
    SequentialId: integer(),
    Title: text().notNull(),
    Summary: text().notNull(),
    TargetCompletionDate: timestamp(),
    ActualCompletionDate: timestamp(),
    StartDate: timestamp(),
    NextTestDate: timestamp(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),

    Action: dbActionEnum('Action'),
    CompletedBy: text(),
    CompletedByUser: text(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    Status: text(),
    Outcome: integer(),
    OriginatingItemId: uuid(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'assessment_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const test_result_audit = risksmart.table(
  'test_result_audit',
  {
    Id: uuid().notNull(),
    Title: text(),
    Description: text(),
    Submitter: text().notNull(),
    ParentControlId: uuid().notNull(),
    TestType: text().$type<TestType>(),
    DesignEffectiveness: integer(),
    PerformanceEffectiveness: integer(),
    OverallEffectiveness: integer(),
    TestDate: timestamp().notNull(),
    NextTestDate: timestamp(),
    Meta: json().$type<JSONB>(),
    OrgKey: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
    CustomAttributeData: jsonb().$type<JSONB>(),
    RatingType: text(),
    SequentialId: integer(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'test_result_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const document_file_audit = risksmart.table(
  'document_file_audit',
  {
    Id: uuid().notNull(),
    Version: text().notNull(),
    FileId: uuid(),
    Summary: text(),
    Status: text().notNull(),
    ReasonForReview: text(),
    ReviewedBy: text(),
    ReviewDate: timestamp(),
    NextReviewDate: timestamp(),
    ParentDocumentId: uuid().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),
    Meta: json().$type<JSONB>(),

    Action: dbActionEnum('Action'),
    Content: text(),
    Type: text().default('file').notNull(),
    Link: text(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    PublishedDate: timestamp(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'document_file_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const third_party_audit = risksmart.table(
  'third_party_audit',
  {
    Id: uuid().defaultRandom().notNull(),
    OrgKey: text().notNull(),
    SequentialId: integer(),
    Title: text().notNull(),
    Description: text(),
    CompanyName: text().notNull(),
    CompaniesHouseNumber: text(),
    Address: text(),
    CityTown: text(),
    Postcode: text(),
    Country: text(),
    PrimaryContactName: text(),
    ContactName: text(),
    ContactEmail: text(),
    CompanyDomain: text(),
    Type: text().notNull(),
    Status: text().notNull(),
    Criticality: integer().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),

    Action: dbActionEnum('Action'),
    CustomAttributeData: jsonb().$type<JSONB>(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'third_party_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const third_party_contact_audit = risksmart.table(
  'third_party_contact_audit',
  {
    Id: uuid().notNull(),
    ThirdPartyId: uuid().notNull(),
    Email: text().notNull(),
    Name: text(),
    JobTitle: text(),
    IsRevoked: boolean().default(false).notNull(),
    PasswordSetAtTimestamp: timestamp(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    Action: dbActionEnum('Action'),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.OrgKey, table.ModifiedAtTimestamp],
      name: 'third_party_contact_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const wizard = risksmart.table(
  'wizard',
  {
    RiskId: uuid().notNull(),
    AssessmentId: uuid(),
    ActivityId: uuid(),
    CurrentStep: integer(),
    Status: text().$type<WizardStatus>(),
    OrgKey: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp().notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.RiskId],
      name: 'wizard_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const issue_assessment_audit = risksmart.table(
  'issue_assessment_audit',
  {
    ParentIssueId: uuid().notNull(),
    IssueType: text(),
    Severity: integer(),
    TargetCloseDate: timestamp(),
    ActualCloseDate: timestamp(),
    Status: text(),
    CertifiedIndividual: text(),
    RegulatoryBreach: boolean(),
    RegulationsBreached: text(),
    Reportable: boolean(),
    Rationale: text(),
    IssueCausedByThirdParty: boolean(),
    ThirdPartyResponsible: text(),
    IssueCausedBySystemIssue: boolean(),
    SystemResponsible: text(),
    PolicyBreach: boolean(),
    PoliciesBreached: text(),
    PolicyOwner: text(),
    PolicyOwnerCommentary: text(),
    Meta: json().$type<JSONB>(),
    OrgKey: text().notNull(),
    ModifiedByUser: text(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedByUser: text(),
    CreatedAtTimestamp: timestamp().notNull(),

    Action: dbActionEnum('Action'),
    Id: uuid().notNull(),
    CustomAttributeData: jsonb().$type<JSONB>(),
    Type: text().default('issue_assessment').notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.ModifiedAtTimestamp, table.Id],
      name: 'issue_assessment_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const data_export_schedule = risksmart.table(
  'data_export_schedule',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    OrgKey: text().notNull(),
    Frequency: text().$type<DataExportFrequency>().notNull(),
    StorageType: text().$type<DataExportStorageType>().notNull(),
    StartTimestamp: timestamp().notNull(),
    EndTimestamp: timestamp(),
    SecretArn: text().notNull(),
    CronArn: text(),
    Status: text().$type<DataExportStatus>().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'data_export_schedule_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'data_export_schedule_CreatedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'data_export_schedule_OrgKey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const data_export_schedule_audit = risksmart.table(
  'data_export_schedule_audit',
  {
    Id: uuid().notNull(),
    OrgKey: text().notNull(),
    Frequency: text().notNull(),
    StartTimestamp: timestamp().notNull(),
    EndTimestamp: timestamp(),
    StorageType: text().notNull(),
    SecretArn: text().notNull(),
    CronArn: text(),
    Status: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    Action: text().notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.ModifiedAtTimestamp],
      name: 'data_export_schedule_audit_pkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'data_export_schedule_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'data_export_schedule_CreatedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'data_export_schedule_OrgKey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const data_export_schedule_execution = risksmart.table(
  'data_export_schedule_execution',
  {
    OrgKey: text().notNull(),
    ParentId: uuid().notNull(),
    ExecutionTimestamp: timestamp().notNull(),
    Errors: text(),
    Status: text().$type<DataExportExecutionStatus>().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.ParentId, table.ExecutionTimestamp],
      name: 'data_export_schedule_execution_pkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'data_export_schedule_execution_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'data_export_schedule_execution_CreatedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'data_export_schedule_execution_OrgKey_fkey',
    }),
    foreignKey({
      columns: [table.ParentId],
      foreignColumns: [data_export_schedule.Id],
      name: 'data_export_schedule_execution_ParentId_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const data_export_schedule_execution_audit = risksmart.table(
  'data_export_schedule_execution_audit',
  {
    OrgKey: text().notNull(),
    ParentId: uuid().notNull(),
    ExecutionTimestamp: timestamp().notNull(),
    Status: text().notNull(),
    Errors: text(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    Action: text().notNull(),
  }
);

export const colour_palette = risksmart.table(
  'colour_palette',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    OrgKey: text().notNull(),
    Name: text().notNull(),
    Settings: jsonb().$type<JSONB>().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'colour_palette_ModifiedByUser_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'colour_palette_CreatedByUser_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'colour_palette_OrgKey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const colour_palette_audit = risksmart.table(
  'colour_palette_audit',
  {
    Id: uuid().notNull(),
    OrgKey: text().notNull(),
    Name: text().notNull(),
    Settings: jsonb().$type<JSONB>().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    Action: dbActionEnum('Action').notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.OrgKey, table.ModifiedAtTimestamp],
      name: 'colour_palette_audit_pkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'colour_palette_OrgKey_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

// This is a materialised view, but hacking it as a table to support the drizzle relation API.
export const entity_descendants = risksmart.table('entity_descendants', {
  RootId: uuid().notNull(),
  Id: uuid().notNull(),
  Name: text().notNull(),
  Description: text(),
  ParentId: uuid(),
  OrgKey: text().notNull(),
  CreatedAtTimestamp: timestamp().notNull(),
  ModifiedAtTimestamp: timestamp().notNull(),
  CreatedByUser: text().notNull(),
  ModifiedByUser: text().notNull(),
});

export const custom_role = risksmart.table(
  'custom_role',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    OrgKey: text().notNull(),
    RoleName: text().notNull(),
    Description: text(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'custom_role_modified_by_user_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'custom_role_created_by_user_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'custom_role_org_key_fkey',
    }),
  ]
);

export const custom_role_audit = risksmart.table('custom_role_audit', {
  Id: uuid().defaultRandom().primaryKey().notNull(),
  OrgKey: text().notNull(),
  RoleName: text().notNull(),
  Description: text(),
  CreatedByUser: text().notNull(),
  ModifiedByUser: text().notNull(),
  CreatedAtTimestamp: timestamp().notNull(),
  ModifiedAtTimestamp: timestamp().notNull(),
  Action: dbActionEnum('Action').notNull(),
});

export const custom_role_assignment = risksmart.table(
  'custom_role_assignment',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    CustomRoleId: uuid().notNull(),
    OrgKey: text().notNull(),
    RoleTypeKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'custom_role_assignment_modified_by_user_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'custom_role_assignment_created_by_user_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'custom_role_assignment_org_key_fkey',
    }),
    foreignKey({
      columns: [table.RoleTypeKey],
      foreignColumns: [role_type.RoleKey],
    }),
    foreignKey({
      columns: [table.CustomRoleId],
      foreignColumns: [custom_role.Id],
    }),
  ]
);

export const custom_role_assignment_audit = risksmart.table(
  'custom_role_assignment_audit',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    CustomRoleId: uuid().notNull(),
    OrgKey: text().notNull(),
    RoleTypeKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),
    ModifiedAtTimestamp: timestamp().notNull(),
    Action: dbActionEnum('Action').notNull(),
  }
);

export const custom_role_user = risksmart.table(
  'custom_role_user',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    CustomRoleId: uuid().notNull(),
    OrgKey: text().notNull(),
    UserId: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'custom_role_user_modified_by_user_fkey',
    }),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'custom_role_user_created_by_user_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'custom_role_user_org_key_fkey',
    }),
    foreignKey({
      columns: [table.UserId],
      foreignColumns: [user.Id],
    }),
    foreignKey({
      columns: [table.CustomRoleId],
      foreignColumns: [custom_role.Id],
    }),
  ]
);

export const custom_role_user_audit = risksmart.table(
  'custom_role_user_audit',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    CustomRoleId: uuid().notNull(),
    OrgKey: text().notNull(),
    UserId: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),
    ModifiedAtTimestamp: timestamp().notNull(),
    Action: dbActionEnum('Action').notNull(),
  }
);

export const organisation_module = risksmart.table('organisation_module', {
  OrgKey: text().primaryKey().notNull(),
  CreatedByUser: text().notNull(),
  ModifiedByUser: text().notNull(),
  CreatedAtTimestamp: timestamp().notNull(),
  ModifiedAtTimestamp: timestamp().notNull(),
  ModuleSettings: json().$type<JSONB>().notNull(),
});

export const regulatory_source = risksmart.table(
  'regulatory_source',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    ExternalRegulatorId: text().notNull(),
    RegulatorName: text().notNull(),
    ProviderName: text().notNull(),
    OrgKey: text().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    CreatedAtTimestamp: timestamp().notNull(),
    ModifiedAtTimestamp: timestamp().notNull(),
  },
  (table) => ({
    externalRegulatorId_providerName_orgKey_unique: unique(
      'externalRegulatorId_providerName_orgKey_unique'
    ).on(table.ExternalRegulatorId, table.ProviderName, table.OrgKey),
  })
);

export const sso_configuration = risksmart.table(
  'sso_configuration',
  {
    Id: uuid().defaultRandom().primaryKey().notNull(),
    OrgKey: text().notNull(),
    Name: text().notNull(),
    Strategy: text().notNull(),
    ClientId: text().notNull(),
    ConnectionId: text().notNull(),
    Domain: text().notNull(),
    DomainAliases: text().array().default([]),
    IsActive: boolean().default(false),
    IsRestApiEnabled: boolean().default(false),
    IsOrganizationConnected: boolean().default(false),
    CreatedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    ModifiedAtTimestamp: timestamp()
      .default(sql`statement_timestamp()`)
      .notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
  },
  (table) => [
    index('idx_sso_configuration_orgkey').using(
      'btree',
      table.OrgKey.asc().nullsLast()
    ),
    foreignKey({
      columns: [table.Id],
      foreignColumns: [node.Id],
      name: 'sso_configuration_id_fkey',
    }),
    foreignKey({
      columns: [table.OrgKey],
      foreignColumns: [organisation.OrgKey],
      name: 'sso_configuration_OrgKey_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.CreatedByUser],
      foreignColumns: [user.Id],
      name: 'sso_configuration_CreatedByUser_fkey',
    }),
    foreignKey({
      columns: [table.ModifiedByUser],
      foreignColumns: [user.Id],
      name: 'sso_configuration_ModifiedByUser_fkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);

export const sso_configuration_audit = risksmart.table(
  'sso_configuration_audit',
  {
    Id: uuid().notNull(),
    OrgKey: text().notNull(),
    Name: text().notNull(),
    Strategy: text().notNull(),
    ClientId: text().notNull(),
    ConnectionId: text().notNull(),
    Domain: text().notNull(),
    DomainAliases: text().array(),
    IsActive: boolean(),
    IsRestApiEnabled: boolean(),
    IsOrganizationConnected: boolean(),
    CreatedAtTimestamp: timestamp().notNull(),
    ModifiedAtTimestamp: timestamp().notNull(),
    CreatedByUser: text().notNull(),
    ModifiedByUser: text().notNull(),
    Action: dbActionEnum('Action').notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.Id, table.OrgKey, table.ModifiedAtTimestamp],
      name: 'sso_configuration_audit_pkey',
    }),
    pgPolicy('own_org', {
      as: 'permissive',
      for: 'all',
      to: ['reporting'],
      using: sql`("OrgKey" = current_setting('risksmart.org_key'::text, true))`,
    }),
  ]
);
