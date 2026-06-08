import type { SideNavigationProps } from '@risk-smart/themed-cloudscape-components/side-navigation';
import type { ParentType } from '@risksmart-app/domain/src/types/consts';
import { ParentTypes } from '@risksmart-app/domain/src/types/consts';
import { NAVIGATION_PARENT_TYPES } from '@risksmart-app/trpc/types';
import {
  Activity,
  AlertTriangle,
  Asterisk02,
  BarChart10,
  BezierCurve02,
  Certificate02,
  CheckCircleBroken,
  CheckVerified03,
  FileCheck01,
  Grid01,
  NotificationMessage,
  Settings01,
  Settings04,
  UsersPlus,
  Zap,
  ZapFast,
} from '@untitled-ui/icons-react';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import type { TCountOptions } from 'src/components/connected-count/ConnectedCount';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useCheckNavigationVisibility } from '@/hooks/queries/permission/useCheckNavigationVisibility';
import { useIsFeatureFlagEnabledLazy } from '@/hooks/useIsFeatureFlagEnabled';
import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';
import { IssueTypeMapping } from '@/utils/issueVariantUtils';
import {
  actionRegisterUrl,
  assessmentActivitiesRegisterPageUrl,
  assessmentRegisterUrl,
  assessmentResultsRegisterUrl,
  attestationRegisterUrl,
  automationsUrl,
  causesRegisterUrl,
  complianceDashboardUrl,
  complianceMonitoringAssessmentRegisterUrl,
  complianceMonitoringAssessmentResultsRegisterUrl,
  consequencesRegisterUrl,
  customDatasourcesUrl,
  dashboardUrl,
  impactRatingsUrl,
  impactsUrl,
  internalAuditDashboardUrl,
  internalAuditRegisterUrl,
  internalAuditReportRegisterUrl,
  internalAuditReportResultsRegisterUrl,
  issueRegisterUrl,
  obligationChangesRegisterUrl,
  policyRegisterUrl,
  publicPoliciesUrl,
  reportAnIssueUrl,
  riskDashboardUrl,
  riskRegisterUrl,
} from '@/utils/urls';

type NavItemWithIcon = SideNavigationProps.Item & {
  icon?: JSX.Element;
  count?: TCountOptions;
};

const canViewNavType = (
  parentType: ParentType,
  navVisibleParentTypes:
    | { parentType: ParentType; visible: boolean }[]
    | undefined
): boolean => {
  if (!navVisibleParentTypes) {
    return false;
  }
  const parentTypesCheck = navVisibleParentTypes.find(
    (d) => d.parentType === parentType
  );

  return parentTypesCheck ? parentTypesCheck.visible : false;
};

export const useNavItems = (): NavItemWithIcon[] => {
  const { t } = useTranslation('common', { keyPrefix: 'navigationMenu' });
  const isFeatureFlagEnabled = useIsFeatureFlagEnabledLazy();
  const approvalsEnabled = useIsModuleEnabled('approval');
  const causesEnabled = useIsModuleEnabled('issue.subModules.cause');
  const consequenceEnabled = useIsModuleEnabled('issue.subModules.consequence');
  const complianceEnabled = useIsModuleEnabled('obligation');
  const impactsEnabled = useIsModuleEnabled('risk.subModules.impact');
  const policyEnabled = useIsModuleEnabled('document');
  const internalAuditEnabled = useIsModuleEnabled('internal_audit_entity');
  const complianceMonitoringEnabled = useIsModuleEnabled(
    'obligation.subModules.compliance_monitoring_assessment'
  );
  const regFeedEnabled = useIsModuleEnabled('obligation.subModules.reg_feed');
  const thirdPartyEnabled = useIsModuleEnabled('third_party');
  const multiReportEnabled = useIsModuleEnabled('custom_datasource');
  const attestationsEnabled = useIsModuleEnabled(
    'document.subModules.attestation'
  );
  const enterpriseRiskEnabled = useIsModuleEnabled('enterprise_risk');
  const integrationsEnabled = useIsModuleEnabled('integrations');
  const controlsEnabled = useIsModuleEnabled('control');
  const actionsEnabled = useIsModuleEnabled('action');
  const issuesEnabled = useIsModuleEnabled('issue');
  const indicatorsEnabled = useIsModuleEnabled('indicator');
  const incidentReportingEnabled = useIsModuleEnabled('incident_reporting');
  const assessmentsEnabled = useIsModuleEnabled('assessment');
  const risksEnabled = useIsModuleEnabled('risk');
  const controlGroupsEnabled = useIsModuleEnabled(
    'control.subModules.control_group'
  );
  const acceptanceEnabled = useIsModuleEnabled('risk.subModules.acceptance');
  const appetiteEnabled = useIsModuleEnabled('risk.subModules.appetite');
  const reportsModuleEnabled = useIsModuleEnabled(
    'internal_audit_entity.subModules.internal_audit_report'
  );
  const publicDocumentEnabled = useIsModuleEnabled(
    'document.subModules.public_document'
  );

  const { hasPermission: canReadRisk, loading: isLoadingCanReadRisk } =
    useHasPermissionQuery('read:risk', undefined, true);
  const canViewRisk = canReadRisk && !isLoadingCanReadRisk && risksEnabled;

  const { hasPermission: canReadDocument, loading: isLoadingCanReadDocument } =
    useHasPermissionQuery('read:document', undefined, true);
  const canViewDocument = canReadDocument && !isLoadingCanReadDocument;

  const { hasPermission: canReadControl, loading: isLoadingCanReadControl } =
    useHasPermissionQuery('read:control', undefined, true);
  const canViewControl =
    canReadControl && !isLoadingCanReadControl && controlsEnabled;

  const {
    hasPermission: canReadControlGroup,
    loading: isLoadingCanReadControlGroup,
  } = useHasPermissionQuery('read:control_group', undefined, true);
  const canViewControlGroup =
    canReadControlGroup &&
    !isLoadingCanReadControlGroup &&
    controlGroupsEnabled;

  const { hasPermission: canReadAction, loading: isLoadingCanReadAction } =
    useHasPermissionQuery('read:action', undefined, true);
  const canViewAction =
    canReadAction && !isLoadingCanReadAction && actionsEnabled;

  const { hasPermission: canReadAppetite, loading: isLoadingCanReadAppetite } =
    useHasPermissionQuery('read:appetite', undefined, true);
  const canViewAppetite =
    canReadAppetite &&
    !isLoadingCanReadAppetite &&
    appetiteEnabled &&
    risksEnabled;

  const {
    hasPermission: canReadAttestations,
    loading: isLoadingCanReadAttestations,
  } = useHasPermissionQuery('read:attestation_record', undefined, true);
  const canViewAttestations =
    canReadAttestations && !isLoadingCanReadAttestations;

  const {
    hasPermission: canReadThirdParty,
    loading: isLoadingCanReadThirdParty,
  } = useHasPermissionQuery('read:third_party', undefined, true);
  const canViewThirdParty = canReadThirdParty && !isLoadingCanReadThirdParty;

  // We don't want standard/standard enhanced/readonly viewing impacts, so using update permission for access
  const { hasPermission: canUpdateImpact, loading: isLoadingCanUpdateImpact } =
    useHasPermissionQuery('update:impact');
  const canUpdateImpacts = canUpdateImpact && !isLoadingCanUpdateImpact;

  const {
    hasPermission: canReadAcceptance,
    loading: isLoadingCanReadAcceptance,
  } = useHasPermissionQuery('read:acceptance', undefined, true);
  const canViewAcceptance =
    canReadAcceptance &&
    !isLoadingCanReadAcceptance &&
    risksEnabled &&
    acceptanceEnabled;

  const { hasPermission: canReadIssue, loading: isLoadingCanReadIssue } =
    useHasPermissionQuery('read:issue', undefined, true);
  const canViewIssue = canReadIssue && !isLoadingCanReadIssue && issuesEnabled;

  const {
    hasPermission: canReadIndicator,
    loading: isLoadingCanReadIndicator,
  } = useHasPermissionQuery('read:indicator', undefined, true);
  const canViewIndicator =
    canReadIndicator && !isLoadingCanReadIndicator && indicatorsEnabled;

  const {
    hasPermission: canReadAssessment,
    loading: isLoadingCanReadAssessment,
  } = useHasPermissionQuery('read:assessment', undefined, true);
  const canViewAssessments =
    canReadAssessment && !isLoadingCanReadAssessment && assessmentsEnabled;

  const {
    hasPermission: canReadInternalAudit,
    loading: isLoadingCanReadInternalAudit,
  } = useHasPermissionQuery('read:internal_audit_entity', undefined, true);
  const canViewInternalAudit =
    canReadInternalAudit &&
    !isLoadingCanReadInternalAudit &&
    internalAuditEnabled;

  const {
    hasPermission: canReadCompliance,
    loading: isLoadingCanReadCompliance,
  } = useHasPermissionQuery(
    'read:compliance_monitoring_assessment',
    undefined,
    true
  );
  const canViewComplianceMonitoring =
    canReadCompliance &&
    !isLoadingCanReadCompliance &&
    complianceMonitoringEnabled;

  const {
    hasPermission: canReadPublicIssueForm,
    loading: isLoadingCanReadPublicIssueForm,
  } = useHasPermissionQuery('read:public_issue_form');
  const canViewPublicIssueForm =
    canReadPublicIssueForm &&
    !isLoadingCanReadPublicIssueForm &&
    incidentReportingEnabled;

  const {
    hasPermission: canReadPublicPolicies,
    loading: isLoadingCanReadPublicPolicies,
  } = useHasPermissionQuery('read:public_policies');
  const canViewPublicPolicies =
    canReadPublicPolicies && !isLoadingCanReadPublicPolicies;

  const {
    hasPermission: canReadDashboard,
    loading: isLoadingCanReadDashboard,
  } = useHasPermissionQuery('read:dashboard', undefined, true);
  const canViewDashboard = canReadDashboard && !isLoadingCanReadDashboard;

  const {
    hasPermission: canReadObligation,
    loading: isLoadingCanReadObligation,
  } = useHasPermissionQuery('read:obligation', undefined, true);
  const canViewObligations = canReadObligation && !isLoadingCanReadObligation;

  const {
    hasPermission: canReadObligationChange,
    loading: isLoadingCanReadObligationChange,
  } = useHasPermissionQuery('read:obligation_change', undefined, true);
  const canViewObligationChanges =
    canReadObligationChange && !isLoadingCanReadObligationChange;

  const {
    hasPermission: canReadChangeRequest,
    loading: isLoadingCanReadChangeRequest,
  } = useHasPermissionQuery('read:change_request', undefined, true);
  const canViewRequests =
    canReadChangeRequest && !isLoadingCanReadChangeRequest;

  const {
    hasPermission: canReadEnterpriseRisk,
    loading: isLoadingCanReadEnterpriseRisk,
  } = useHasPermissionQuery('read:enterprise_risk');
  const canViewEnterpriseRisk =
    canReadEnterpriseRisk && !isLoadingCanReadEnterpriseRisk;

  const { hasPermission: canReadSettings, loading: isLoadingCanReadSettings } =
    useHasPermissionQuery('read:settings');
  const canViewSettings = canReadSettings && !isLoadingCanReadSettings;

  const {
    hasPermission: canReadCustomDatasources,
    loading: isLoadingCanReadCustomDatasources,
  } = useHasPermissionQuery('read:custom_datasource');
  const canViewCustomDatasources =
    canReadCustomDatasources && !isLoadingCanReadCustomDatasources;

  const navItemTypes = Object.keys(NAVIGATION_PARENT_TYPES);
  const {
    data: navVisibleParentTypes,
    loading: isLoadingNavVisibleParentTypes,
  } = useCheckNavigationVisibility(navItemTypes as ParentType[]);

  const navItems: NavItemWithIcon[] = [];

  if (isLoadingNavVisibleParentTypes) {
    return [];
  }

  if (canViewDashboard) {
    navItems.push({
      type: 'link',
      text: t('dashboardTitle'),
      href: dashboardUrl(),
      icon: <Grid01 />,
    });
  }

  if (navItems.length > 0) {
    navItems.push({ type: 'divider' });
  }

  if (internalAuditEnabled && canViewInternalAudit) {
    const internalAuditChildItem: (NavItemWithIcon & {
      count?: TCountOptions;
    })[] = [];

    if (
      canViewNavType(ParentTypes.InternalAuditEntity, navVisibleParentTypes)
    ) {
      internalAuditChildItem.push(
        {
          type: 'link',
          text: t('internalAudit.dashboardTitle'),
          href: internalAuditDashboardUrl(),
        },
        {
          type: 'link',
          text: t('internalAudit.registerTitle'),
          href: internalAuditRegisterUrl(),
          count: 'internalAudit',
        }
      );
    }

    if (
      reportsModuleEnabled &&
      canViewNavType(ParentTypes.InternalAuditReport, navVisibleParentTypes)
    ) {
      internalAuditChildItem.push({
        type: 'link',
        href: internalAuditReportRegisterUrl(),
        text: t('internalAudit.reportsTitle'),
        count: 'internalAuditReport',
      });
    }
    if (
      reportsModuleEnabled &&
      (canViewNavType(
        ParentTypes.RiskControlledInternalAuditResult,
        navVisibleParentTypes
      ) ||
        canViewNavType(
          ParentTypes.RiskUncontrolledInternalAuditResult,
          navVisibleParentTypes
        ) ||
        canViewNavType(
          ParentTypes.DocumentInternalAuditResult,
          navVisibleParentTypes
        ) ||
        canViewNavType(
          ParentTypes.ObligationInternalAuditResult,
          navVisibleParentTypes
        ))
    ) {
      internalAuditChildItem.push({
        type: 'link',
        href: internalAuditReportResultsRegisterUrl(),
        text: t('internalAudit.findingsTitle'),
        count: 'internalAuditReportResult',
      });
    }

    if (internalAuditChildItem.length > 0) {
      const internalAuditNavItem: NavItemWithIcon = {
        type: 'section',
        text: t('internalAudit.sectionTitle'),
        icon: <BezierCurve02 />,
        items: internalAuditChildItem,
      };
      navItems.push(internalAuditNavItem);
      if (navItems.length > 0) {
        navItems.push({ type: 'divider' });
      }
    }
  }

  if (
    canViewEnterpriseRisk &&
    enterpriseRiskEnabled &&
    canViewNavType(ParentTypes.EnterpriseRisk, navVisibleParentTypes)
  ) {
    const enterpriseRiskNavItems: NavItemWithIcon = {
      type: 'section',
      text: t('enterpriseRisks.sectionTitle'),
      items: [
        {
          type: 'link',
          text: t('enterpriseRisks.dashboardTitle'),
          href: '/enterprise-risks/dashboard',
        },
        {
          type: 'link',
          text: t('enterpriseRisks.registerTitle'),
          href: '/enterprise-risks',
        },
      ],
      icon: <ZapFast />,
    };
    navItems.push(enterpriseRiskNavItems);
    navItems.push({ type: 'divider' });
  }

  if (canViewRisk) {
    const items: (SideNavigationProps.Link & {
      count?: TCountOptions;
    })[] = [];
    if (canViewNavType(ParentTypes.Risk, navVisibleParentTypes)) {
      items.push(
        {
          type: 'link',
          text: t('risks.dashboardTitle'),
          href: riskDashboardUrl(),
        },
        {
          type: 'link',
          text: t('risks.registerTitle'),
          href: riskRegisterUrl(),
          count: 'risk',
        }
      );
    }

    if (
      canViewAppetite &&
      !impactsEnabled &&
      canViewNavType(ParentTypes.Appetite, navVisibleParentTypes)
    ) {
      items.push({
        type: 'link',
        text: t('risks.appetitesTitle'),
        href: '/appetites',
        count: 'appetite',
      });
    }

    if (
      canViewAcceptance &&
      canViewNavType(ParentTypes.Acceptance, navVisibleParentTypes)
    ) {
      items.push({
        type: 'link',
        text: t('risks.acceptancesTitle'),
        href: '/acceptances',
        count: 'acceptance',
      });
    }

    if (items.length > 0) {
      const riskNavItems: (SideNavigationProps.Section & {
        icon?: JSX.Element;
      })[] = [
        {
          type: 'section',
          text: t('risks.sectionTitle'),
          icon: <Zap />,
          items: items,
        },
      ];

      navItems.push(...riskNavItems);
    }
  }

  if (policyEnabled && canViewDocument) {
    const policyNavItems: (SideNavigationProps.Item & {
      icon?: JSX.Element;
    })[] = [];
    const canViewDoc = canViewNavType(
      ParentTypes.Document,
      navVisibleParentTypes
    );

    if (attestationsEnabled) {
      const items: SideNavigationProps.Link[] = [];
      if (canViewDoc) {
        items.push({
          type: 'link',
          text: t('policy.registerTitle'),
          href: policyRegisterUrl(),
        });
      }
      if (
        canViewAttestations &&
        canViewNavType(ParentTypes.AttestationRecord, navVisibleParentTypes)
      ) {
        items.push({
          type: 'link',
          text: t('policy.attestationsTitle'),
          href: attestationRegisterUrl(),
        });
      }

      if (items.length > 0) {
        policyNavItems.push({
          type: 'section',
          text: t('policy.sectionTitle'),
          icon: <FileCheck01 />,
          items,
        });
      }
    } else if (canViewDoc) {
      policyNavItems.push({
        type: 'link',
        text: t('policy.sectionTitle'),
        href: policyRegisterUrl(),
        icon: <FileCheck01 />,
      });
    }

    navItems.push(...policyNavItems);
  }

  if (
    canViewObligations &&
    complianceEnabled &&
    canViewNavType(ParentTypes.Obligation, navVisibleParentTypes)
  ) {
    const obligationItems: (SideNavigationProps.Link & {
      count?: TCountOptions;
    })[] = [
      {
        type: 'link',
        text: t('compliance.dashboardTitle'),
        href: complianceDashboardUrl(),
      },
      {
        type: 'link',
        text: t('compliance.registerTitle'),
        href: '/compliance',
      },
    ];

    if (
      canViewObligationChanges &&
      regFeedEnabled &&
      canViewNavType(ParentTypes.ObligationChange, navVisibleParentTypes)
    ) {
      obligationItems.push({
        type: 'link',
        text: t('compliance.obligationChangesTitle'),
        href: obligationChangesRegisterUrl(),
      });
    }

    if (
      complianceMonitoringEnabled &&
      canViewComplianceMonitoring &&
      canViewNavType(
        ParentTypes.ComplianceMonitoringAssessment,
        navVisibleParentTypes
      )
    ) {
      const complianceMonitoringChildItem: (SideNavigationProps.Link & {
        count?: TCountOptions;
      })[] = [
        {
          type: 'link',
          href: complianceMonitoringAssessmentRegisterUrl(),
          text: t('compliance.monitoringTitle'),
          count: 'complianceMonitoringAssessment',
        },
        {
          type: 'link',
          href: complianceMonitoringAssessmentResultsRegisterUrl(),
          text: t('compliance.findingsTitle'),
          count: 'complianceMonitoringAssessmentResult',
        },
      ];
      obligationItems.push(...complianceMonitoringChildItem);
    }

    if (obligationItems.length > 0) {
      const complianceNavItems: (SideNavigationProps.Section & {
        icon?: JSX.Element;
      })[] = [
        {
          type: 'section',
          text: t('compliance.sectionTitle'),
          icon: <CheckVerified03 />,
          items: obligationItems,
        },
      ];
      navItems.push(...complianceNavItems);
    }
  }

  if (canViewThirdParty && thirdPartyEnabled) {
    const thirdPartyChildrenNavItems: NavItemWithIcon[] = [];

    if (canViewNavType(ParentTypes.ThirdParty, navVisibleParentTypes)) {
      thirdPartyChildrenNavItems.push({
        type: 'link',
        text: t('thirdParty.registerTitle'),
        href: '/third-party',
      });
    }

    if (
      canViewNavType(ParentTypes.QuestionnaireTemplate, navVisibleParentTypes)
    ) {
      thirdPartyChildrenNavItems.push({
        type: 'link',
        text: t('thirdParty.questionnaireTemplatesRegisterTitle'),
        href: '/third-party/questionnaire',
      });
    }
    if (canViewNavType(ParentTypes.ThirdPartyResponse, navVisibleParentTypes)) {
      thirdPartyChildrenNavItems.push({
        type: 'link',
        text: t('thirdParty.questionnaireResponsesRegisterTitle'),
        href: '/third-party/questionnaire-responses',
      });
    }

    if (thirdPartyChildrenNavItems.length > 0) {
      navItems.push({
        type: 'section',
        text: t('thirdParty.sectionTitle'),
        icon: <UsersPlus />,
        items: thirdPartyChildrenNavItems,
      });
    }
  }

  if (navItems.length > 0) {
    navItems.push({ type: 'divider' });
  }

  if (canViewControl) {
    const controlChildrenNavItems: NavItemWithIcon[] = [];
    if (
      canViewControlGroup &&
      canViewNavType(ParentTypes.ControlGroup, navVisibleParentTypes)
    ) {
      controlChildrenNavItems.push({
        type: 'link',
        text: t('controls.groupsTitle'),
        href: '/control-groups',
        count: 'controlGroup',
      });
    }

    if (canViewNavType(ParentTypes.TestResult, navVisibleParentTypes)) {
      controlChildrenNavItems.push({
        type: 'link',
        text: t('controls.testsTitle'),
        href: '/controls/tests',
        count: 'testResult',
      });
    }
    const childItems: (NavItemWithIcon & {
      count?: TCountOptions;
    })[] = [];
    if (canViewNavType(ParentTypes.Control, navVisibleParentTypes)) {
      childItems.push({
        type: 'link',
        text: t('controls.registerTitle'),
        href: '/controls',
        count: 'control',
      });
    }

    childItems.push(...controlChildrenNavItems);

    if (childItems.length > 0) {
      const controlNavItems: NavItemWithIcon = {
        type: 'section',
        text: t('controls.sectionTitle'),
        icon: <Settings04 />,
        items: childItems,
      };
      navItems.push(controlNavItems);
    }
  }

  if (canViewIssue && issuesEnabled) {
    const childItems: (NavItemWithIcon & {
      count?: TCountOptions;
    })[] = [];

    const issueNavItems = Object.entries(IssueTypeMapping)
      .map(([_, itm]) => ({
        text: t(`${itm.taxonomy}.registerTitle`),
        type: 'link' as const,
        href: itm.registerUrl(undefined),
        count: itm.count,
        hasAccess: () => {
          if (
            !(itm.featureFlag ? isFeatureFlagEnabled(itm.featureFlag) : true)
          ) {
            return false;
          }

          return canViewNavType(itm.type as ParentType, navVisibleParentTypes);
        },
        items: [],
      }))
      .filter((a) => a.hasAccess());
    if (issueNavItems.length > 0) {
      childItems.push(...issueNavItems);
    }

    if (
      causesEnabled &&
      canViewNavType(ParentTypes.Cause, navVisibleParentTypes)
    ) {
      childItems.push({
        type: 'link',
        text: t('issues.causesTitle'),
        href: causesRegisterUrl(),
        count: 'cause',
      });
    }
    if (
      consequenceEnabled &&
      canViewNavType(ParentTypes.Consequence, navVisibleParentTypes)
    ) {
      childItems.push({
        type: 'link',
        text: t('issues.consequencesTitle'),
        href: consequencesRegisterUrl(),
        count: 'consequence',
      });
    }

    if (childItems.length > 0) {
      if (childItems.length === 1) {
        navItems.push({
          type: 'link',
          href: issueRegisterUrl(),
          text: t('issues.sectionTitle'),
          icon: <AlertTriangle />,
        });
      } else {
        navItems.push({
          type: 'section',
          items: childItems,
          text: t('issues.sectionTitle'),
          icon: <AlertTriangle />,
        });
      }
    }
  }

  if (
    canViewAction &&
    canViewNavType(ParentTypes.Action, navVisibleParentTypes)
  ) {
    navItems.push({
      type: 'link',
      text: t('actionsTitle'),
      icon: <CheckCircleBroken />,
      href: actionRegisterUrl(),
    });
  }
  if (
    canViewIndicator &&
    canViewNavType(ParentTypes.Indicator, navVisibleParentTypes)
  ) {
    const indicatorNavItems: NavItemWithIcon = {
      type: 'link',
      text: t('indicatorsTitle'),
      href: `/indicator`,
      icon: <Activity />,
    };
    navItems.push(indicatorNavItems);
  }
  if (canViewAssessments) {
    const assessmentChildItem: (NavItemWithIcon & {
      count?: TCountOptions;
    })[] = [];
    if (canViewNavType(ParentTypes.Assessment, navVisibleParentTypes)) {
      assessmentChildItem.push({
        type: 'link',
        href: assessmentRegisterUrl(),
        text: t('assessments.registerTitle'),
        count: 'assessment',
      });
    }

    if (canViewNavType(ParentTypes.AssessmentActivity, navVisibleParentTypes)) {
      assessmentChildItem.push({
        type: 'link',
        href: assessmentActivitiesRegisterPageUrl(),
        text: 'Activities',
        count: 'assessmentActivity',
      });
    }

    if (
      canViewNavType(ParentTypes.RiskAssessmentResult, navVisibleParentTypes) ||
      canViewNavType(
        ParentTypes.ObligationAssessmentResult,
        navVisibleParentTypes
      ) ||
      canViewNavType(
        ParentTypes.DocumentAssessmentResult,
        navVisibleParentTypes
      )
    ) {
      assessmentChildItem.push({
        type: 'link',
        href: assessmentResultsRegisterUrl(),
        text: t('assessments.findingsTitle'),
        count: 'assessmentResult',
      });
    }

    if (assessmentChildItem.length > 0) {
      const assessmentsNavItem: NavItemWithIcon = {
        type: 'section',
        text: t('assessments.sectionTitle'),
        icon: <Certificate02 />,
        items: assessmentChildItem,
      };
      navItems.push(assessmentsNavItem);
    }
  }

  if (impactsEnabled && canUpdateImpacts) {
    const childItems: (NavItemWithIcon & {
      count?: TCountOptions;
    })[] = [];
    if (canViewNavType(ParentTypes.Impact, navVisibleParentTypes)) {
      childItems.push({
        type: 'link',
        text: t('impacts.registerTitle'),
        href: impactsUrl(),
        count: 'impact',
      });
    }

    if (canViewNavType(ParentTypes.ImpactRating, navVisibleParentTypes)) {
      childItems.push({
        type: 'link',
        text: t('impacts.ratingsTitle'),
        href: impactRatingsUrl(),
        count: 'impactRating',
      });
    }

    if (childItems.length > 0) {
      const impactsNavItems: NavItemWithIcon & {
        count?: TCountOptions;
      } = {
        type: 'section',
        text: t('impacts.sectionTitle'),
        icon: <Asterisk02 />,
        items: childItems,
      };
      navItems.push(impactsNavItems);
    }
  }

  if (
    multiReportEnabled &&
    canViewCustomDatasources &&
    canViewNavType(ParentTypes.CustomDatasource, navVisibleParentTypes)
  ) {
    const navItem: NavItemWithIcon = {
      type: 'link',
      text: t('customDatasourcesTitle'),
      icon: <BarChart10 />,
      href: customDatasourcesUrl(),
    };
    navItems.push(navItem);
  }

  if (canViewPublicIssueForm) {
    const navItem: NavItemWithIcon = {
      type: 'link',
      text: t('issues.reportAnIssueTitle'),
      icon: <AlertTriangle />,
      href: reportAnIssueUrl(),
    };
    navItems.push(navItem);
  }

  if (policyEnabled && publicDocumentEnabled && canViewPublicPolicies) {
    const navItem: NavItemWithIcon = {
      type: 'link',
      text: t('publicPoliciesTitle'),
      icon: <FileCheck01 />,
      href: publicPoliciesUrl(),
    };
    navItems.push(navItem);
  }

  if (navItems.length > 0) {
    navItems.push({ type: 'divider' });
  }

  // Support section removed as functionality has been moved to Productlane widget
  const generalNavItems: NavItemWithIcon[] = [];

  navItems.push(...generalNavItems);

  if (approvalsEnabled && canViewRequests) {
    navItems.push({
      type: 'link',
      href: '/requests',
      text: t('requestsTitle'),
      icon: <NotificationMessage />,
      count: 'request',
    });
  }

  const automationsEnabled = integrationsEnabled;
  if (automationsEnabled) {
    navItems.push({
      type: 'link',
      href: automationsUrl(),
      text: t('automationsTitle'),
      icon: <Zap />,
    });
  }

  if (canViewSettings) {
    navItems.push({
      type: 'link',
      href: '/settings',
      text: t('settingsTitle'),
      icon: <Settings01 />,
    });
  }

  return navItems;
};
