// Stub for @risksmart-app/trpc/types — production types referenced by useNavItems etc.
//
// Previously NAVIGATION_PARENT_TYPES was an empty `{}`. useNavItems calls
// `Object.keys(NAVIGATION_PARENT_TYPES)` and feeds the result to
// useCheckNavigationVisibility — so an empty object meant useNavItems
// asked for visibility on zero parent types and `canViewNavType()`
// returned false for every section, leaving only the always-visible
// items (Home / Public Policies / Report An Issue / Requests /
// Automations / Settings) in the rail.
//
// Re-export the real production constant so the storybook nav stays
// 1:1 with the live app.
//
// `@risksmart-app/domain` is aliased to the dev-repo source, so this
// import goes straight to production code; nothing is copied.
// eslint-disable-next-line import/no-unresolved
import { ParentTypes } from '@risksmart-app/domain/src/types/consts/parent-type';

export type ParentType = (typeof ParentTypes)[keyof typeof ParentTypes];

// Mirror of packages/trpc/src/types/permission.types.ts.
// Hand-mirrored rather than imported because @risksmart-app/trpc itself
// is aliased to *this* stub (see vite.config.ts), so we'd cause a cycle
// trying to re-import from there. The shape of the source-of-truth file
// is small and stable; if the production list grows, mirror new entries
// here.
export const NAVIGATION_PARENT_TYPES: Partial<Record<ParentType, ParentType>> = {
  [ParentTypes.InternalAuditEntity]: ParentTypes.InternalAuditEntity,
  [ParentTypes.InternalAuditReport]: ParentTypes.InternalAuditReport,
  [ParentTypes.Risk]: ParentTypes.Risk,
  [ParentTypes.Appetite]: ParentTypes.Risk,
  [ParentTypes.Acceptance]: ParentTypes.Risk,
  [ParentTypes.Document]: ParentTypes.Document,
  [ParentTypes.Obligation]: ParentTypes.Obligation,
  [ParentTypes.ComplianceMonitoringAssessment]: ParentTypes.ComplianceMonitoringAssessment,
  [ParentTypes.ThirdParty]: ParentTypes.ThirdParty,
  [ParentTypes.Issue]: ParentTypes.Issue,
  [ParentTypes.Indicator]: ParentTypes.Indicator,
  [ParentTypes.Assessment]: ParentTypes.Assessment,
  [ParentTypes.EnterpriseRisk]: ParentTypes.Risk,
  [ParentTypes.Control]: ParentTypes.Control,
  [ParentTypes.Action]: ParentTypes.Action,
  [ParentTypes.ControlGroup]: ParentTypes.ControlGroup,
  [ParentTypes.AttestationRecord]: ParentTypes.Document,
  [ParentTypes.RiskControlledInternalAuditResult]: ParentTypes.InternalAuditEntity,
  [ParentTypes.RiskUncontrolledInternalAuditResult]: ParentTypes.InternalAuditEntity,
  [ParentTypes.DocumentInternalAuditResult]: ParentTypes.InternalAuditEntity,
  [ParentTypes.ObligationInternalAuditResult]: ParentTypes.InternalAuditEntity,
  [ParentTypes.QuestionnaireTemplate]: ParentTypes.ThirdParty,
  [ParentTypes.ThirdPartyResponse]: ParentTypes.ThirdParty,
  [ParentTypes.TestResult]: ParentTypes.Control,
  [ParentTypes.Cause]: ParentTypes.Issue,
  [ParentTypes.Consequence]: ParentTypes.Issue,
  [ParentTypes.AssessmentActivity]: ParentTypes.Assessment,
  [ParentTypes.RiskAssessmentResult]: ParentTypes.Assessment,
  [ParentTypes.DocumentAssessmentResult]: ParentTypes.Assessment,
  [ParentTypes.ObligationAssessmentResult]: ParentTypes.Assessment,
  [ParentTypes.CustomDatasource]: ParentTypes.CustomDatasource,
  [ParentTypes.Impact]: ParentTypes.Impact,
  [ParentTypes.ImpactRating]: ParentTypes.Impact,
  [ParentTypes.ObligationChange]: ParentTypes.ObligationChange,
};

export type AppRouter = any;
export const trpc: any = new Proxy({}, { get: () => () => ({}) });
export default trpc;
