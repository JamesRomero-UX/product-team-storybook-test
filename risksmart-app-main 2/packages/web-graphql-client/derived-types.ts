/**
 * Derived types extracted from operation types in generated/graphql.ts.
 *
 * These replace the standalone table types that were removed when
 * `onlyOperationTypes: true` was enabled in codegen. Each type is
 * derived from an existing query's return shape so it stays in sync
 * with the schema automatically.
 */
import type {
  GetDocumentFilesByDocumentIdQuery,
  GetIndicatorByIdQuery,
  GetIndicatorResultsByIndicatorIdQuery,
  GetLatestDocumentAssessmentResultsQuery,
  GetLatestObligationAssessmentResultsQuery,
  GetNotificationPreferencesQuery,
  GetScimConfigQuery,
  GetTaxonomyAuditQuery,
  GetAuthUsersQuery,
} from './generated/graphql';

/** Derived from GetIndicatorByIdQuery — indicator.departments[] */
export type Department =
  GetIndicatorByIdQuery['indicator'][0]['departments'][0];

/** Derived from GetIndicatorByIdQuery — indicator.departments[].type (non-null) */
export type Department_Type = NonNullable<Department['type']>;

/** Derived from GetIndicatorByIdQuery — indicator.tags[] */
export type Tag = GetIndicatorByIdQuery['indicator'][0]['tags'][0];

/** Derived from GetIndicatorByIdQuery — indicator.tags[].type (non-null) */
export type Tag_Type = NonNullable<Tag['type']>;

/** Derived from GetNotificationPreferencesQuery — notificationPreferences */
export type NotificationPreferencesOutput =
  GetNotificationPreferencesQuery['notificationPreferences'];

/** Derived from GetDocumentFilesByDocumentIdQuery — document_file[] */
export type Document_File =
  GetDocumentFilesByDocumentIdQuery['document_file'][0];

/** Derived from GetAuthUsersQuery — auth_user[] */
export type User = GetAuthUsersQuery['auth_user'][0];

/** Derived from GetLatestObligationAssessmentResultsQuery */
export type Obligation_Assessment_Result =
  GetLatestObligationAssessmentResultsQuery['obligation_assessment_result'][0];

/** Derived from GetLatestDocumentAssessmentResultsQuery */
export type Document_Assessment_Result =
  GetLatestDocumentAssessmentResultsQuery['document_assessment_result'][0];

/** Derived from GetIndicatorByIdQuery — indicator[] */
export type Indicator = GetIndicatorByIdQuery['indicator'][0];

/** Derived from GetIndicatorResultsByIndicatorIdQuery — indicator_result[] */
export type Indicator_Result =
  GetIndicatorResultsByIndicatorIdQuery['indicator_result'][0];

/** Derived from GetScimConfigQuery — getScimConfig.tokens[] */
export type ScimTokenOutput =
  GetScimConfigQuery['getScimConfig']['tokens'][0];

/** Derived from GetTaxonomyAuditQuery — taxonomy_audit[] */
export type Taxonomy = GetTaxonomyAuditQuery['taxonomy_audit'][0];
