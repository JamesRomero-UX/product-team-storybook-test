import type { TabsProps } from '@risk-smart/themed-cloudscape-components/tabs';
import { useGetOptionalGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import type { ParentIssueType } from '@risksmart-app/domain/src/types/consts';
import type {
  GetActionByIdQuery,
  GetControlByIdQuery,
  GetImpactByIdQuery,
  GetIndicatorByIdQuery,
  GetInternalAuditByIdQuery,
  GetIssueByIdQuery,
  GetObligationByIdQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import EntityNotificationHistoryTab from 'src/components/entity-notification-history/EntityNotificationHistoryTab';
import ActionsTab from 'src/pages/actions/ActionsTab';
import ActivityCreateTab from 'src/pages/assessments/update/tabs/activities/create/ActivityCreateTab';
import RCSACreateTab from 'src/pages/assessments/update/tabs/activities/create/RCSACreateTab';
import ActivityUpdateTab from 'src/pages/assessments/update/tabs/activities/update/ActivityUpdateTab';
import { RCSAUpdateTab } from 'src/pages/assessments/update/tabs/activities/update/RCSAUpdateTab';
import EnterpriseRiskCreateTab from 'src/pages/enterprise-risk/create/tabs/CreateTab';
import EnterpriseRiskDetailsTab from 'src/pages/enterprise-risk/update/tabs/DetailsTab';
import EntityRiskRegisterTab from 'src/pages/enterprise-risk/update/tabs/RiskRegisterTab';
import LinkedItemsTab from 'src/pages/linked-items/LinkedItemsTab';
import AuditTab from 'src/pages/settings/tabs/audit/Tab';
import AuthenticationTab from 'src/pages/settings/tabs/authentication/Tab';
import ColoursTab from 'src/pages/settings/tabs/colours/Tab';
import CustomRolesTab from 'src/pages/settings/tabs/custom-roles/Tab';
import DataExportTab from 'src/pages/settings/tabs/data-export/Tab';
import DataImportTab from 'src/pages/settings/tabs/data-import/Tab';
import DepartmentsTab from 'src/pages/settings/tabs/departments/Tab';
import EntitiesTab from 'src/pages/settings/tabs/entities/Tab';
import ExternalApiTab from 'src/pages/settings/tabs/external-api/Tab';
import UserGroupsTab from 'src/pages/settings/tabs/groups/Tab';
import ModulesTab from 'src/pages/settings/tabs/modules/Tab';
import NotificationsTab from 'src/pages/settings/tabs/notifications/Tab';
import SsoTab from 'src/pages/settings/tabs/sso/Tab';
import TagsTab from 'src/pages/settings/tabs/tags/Tab';
import TaxonomyTab from 'src/pages/settings/tabs/taxonomy/Tab';
import UsersTab from 'src/pages/settings/tabs/users/Tab';
import ThirdPartyCreateTab from 'src/pages/third-party/create/tabs/ThirdPartyCreateTab';
import ContactsTab from 'src/pages/third-party/update/tabs/contacts/ContactsTab';
import ThirdPartyDetailsTab from 'src/pages/third-party/update/tabs/details/DetailsTab';
import QuestionnairesTab from 'src/pages/third-party/update/tabs/questionnaires/QuestionnairesTab';
import { ExternalApiProvider } from 'src/providers/ExternalApiProvider';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';
import { useIssueVariantTabs } from '@/utils/useIssueVariantTabs';

import AcceptanceDetailsTab from '../pages/acceptances/detail/tabs/Tab';
import ActionDetailsTab from '../pages/actions/update/tabs/details/Tab';
import ActionUpdatesTab from '../pages/actions/update/tabs/updates/Tab';
import AppetiteDetailsTab from '../pages/appetites/detail/tabs/Tab';
import AssessmentCreateTab from '../pages/assessments/create/tabs/AssessmentCreateTab';
import type { AssessmentTypeEnum } from '../pages/assessments/types';
import AssessmentActivitiesTab from '../pages/assessments/update/tabs/activities/Tab';
import AssessmentDetailsTab from '../pages/assessments/update/tabs/details/Tab';
import AssessmentResultsTab from '../pages/assessments/update/tabs/results/Tab';
import ComplianceMonitoringAssessmentCreateTab from '../pages/compliance/monitoring-assessments/create/tabs/ComplianceMonitoringAssessmentCreateTab';
import SecondLineResultsTab from '../pages/compliance/monitoring-assessments/results/update/results/Tab';
import ComplianceMonitoringAssessmentDetailsTab from '../pages/compliance/monitoring-assessments/update/tabs/details/Tab';
import ObligationCreateTab from '../pages/compliance/obligations/create/tabs/details/Tab';
import ObligationAssessmentsTab from '../pages/compliance/obligations/update/tabs/assessment/Tab';
import ObligationDetailsTab from '../pages/compliance/obligations/update/tabs/details/Tab';
import ObligationImpactsTab from '../pages/compliance/obligations/update/tabs/impact/Tab';
import ControlGroupDetailsTab from '../pages/control-groups/update/tabs/details/Tab';
import ControlGroupControlsTab from '../pages/control-groups/update/tabs/linked-controls/Tab';
import ControlsTab from '../pages/controls/tab/Tab';
import ControlDetailsTab from '../pages/controls/update/tabs/details/Tab';
import TestResultsTab from '../pages/controls/update/tabs/performance/Tab';
import ImpactDetailsTab from '../pages/impacts/update/tabs/details/Tab';
import ImpactAssessmentsTab from '../pages/impacts/update/tabs/ratings/Tab';
import IndicatorTab from '../pages/indicators/tab/Tab';
import IndicatorDetailsTab from '../pages/indicators/update/tabs/details/Tab';
import IndicatorResultsTab from '../pages/indicators/update/tabs/results/Tab';
import InternalAuditEntityCreateTab from '../pages/internal-audit/create/tabs/InternalAuditCreateTab';
import InternalAuditReportCreateTab from '../pages/internal-audit/reports/create/tabs/InternalAuditReportCreateTab';
import InternalAuditResultsTab from '../pages/internal-audit/reports/results/update/results/Tab';
import InternalAuditReportDetailsTab from '../pages/internal-audit/reports/update/tabs/details/Tab';
import InternalAuditEntityDetailsTab from '../pages/internal-audit/update/tabs/details/Tab';
import ReportsTab from '../pages/internal-audit/update/tabs/reports/Tab';
import InternalAuditRiskRegisterTab from '../pages/internal-audit/update/tabs/risks/Tab';
import IssueAssessmentsTab from '../pages/issues/update/tabs/assessments/Tab';
import CausesTab from '../pages/issues/update/tabs/causes/Tab';
import ConsequencesTab from '../pages/issues/update/tabs/consequences/Tab';
import IssueDetailsTab from '../pages/issues/update/tabs/details/Tab';
import IssueUpdatesTab from '../pages/issues/update/tabs/updates/Tab';
import DocumentAssessmentTab from '../pages/policy/update/tabs/assessment/Tab';
import DocumentAttestationsTab from '../pages/policy/update/tabs/attestations/Tab';
import PolicyCreateTab from '../pages/policy/update/tabs/create/Tab';
import FilesTab from '../pages/policy/update/tabs/files/Tab';
import DocumentFileAttestationsTab from '../pages/policy/update/tabs/files/update/tabs/attestations/Tab';
import PolicyFileDetailsTab from '../pages/policy/update/tabs/files/update/tabs/details/Tab';
import PolicyDetailsTab from '../pages/policy/update/tabs/update/Tab';
import QuestionnaireTemplateCreateTab from '../pages/questionnaire-templates/create/tabs/QuestionnaireTemplateCreateTab';
import QuestionnaireTemplateDetailsTab from '../pages/questionnaire-templates/update/tabs/details/Tab';
import QuestionnaireTemplateVersionsTab from '../pages/questionnaire-templates/update/tabs/versions/Tab';
import RiskCreateTab from '../pages/risks/create/tabs/RiskCreateTab';
import AcceptancesTab from '../pages/risks/update/tabs/acceptances/Tab';
import AppetitesTab from '../pages/risks/update/tabs/appetites/Tab';
import RiskAssessmentTab from '../pages/risks/update/tabs/assessments/Tab';
import RiskDetailsTab from '../pages/risks/update/tabs/details/Tab';
import ImpactsTab from '../pages/risks/update/tabs/impacts/Tab';
import { ApprovalsTab } from '../pages/settings/tabs/approvals/Tab';
import useTabLabels from './useTabLabels';
import type { TabId } from './useTabPreferences';
import useTabPreferences from './useTabPreferences';

/**
 * To see how to add a new tab please check the docs folder.
 */
const useTabs = ({
  parentType,
  parent,
  hrefRoot,
  disabled,
  issueSubType,
  assessmentActivityMode,
  assessmentMode,
}: {
  parentType: 'settings' | Parent_Type_Enum;
  parent: null | ObjectWithContributors | undefined;
  hrefRoot: string;
  disabled?: boolean;
  issueSubType?: ParentIssueType;
  assessmentActivityMode?:
    | 'addActivity'
    | 'addRCSA'
    | 'list'
    | 'updateActivity'
    | 'updateRCSA'
    | undefined;
  assessmentMode?: AssessmentTypeEnum;
}) => {
  const { t } = useTranslation([]);
  const documentId = useGetOptionalGuidParam('documentId');
  const id = useGetOptionalGuidParam('id');
  const riskId = useGetOptionalGuidParam('riskId');
  const appetiteId = useGetOptionalGuidParam('appetiteId');
  const acceptanceId = useGetOptionalGuidParam('acceptanceId');
  const tabPreferences = useTabPreferences(parentType);
  const modulesEnabled = useIsFeatureFlagEnabled('modules');
  const impactedEnabled = useIsModuleEnabled('risk.subModules.impact');
  const issuesEnabled = useIsModuleEnabled('issue');
  const internalAuditReportsEnabled = useIsModuleEnabled(
    'internal_audit_entity.subModules.internal_audit_report'
  );
  const { hasPermission: canViewActions, loading: isLoadingActions } =
    useHasPermissionQuery('read:action', parent);
  const { hasPermission: canViewAcceptances, loading: isLoadingAcceptances } =
    useHasPermissionQuery('read:acceptance', parent);
  const { hasPermission: canViewControls, loading: isLoadingControls } =
    useHasPermissionQuery('read:control', parent);
  const { hasPermission: canViewAppetites, loading: isLoadingAppetites } =
    useHasPermissionQuery('read:appetite', parent);
  const { hasPermission: canViewAssessments, loading: isLoadingAssessments } =
    useHasPermissionQuery('read:assessment', parent);
  const { hasPermission: canViewIndicators, loading: isLoadingIndicators } =
    useHasPermissionQuery('read:indicator', parent);
  const {
    hasPermission: canViewImpactRatings,
    loading: isLoadingImpactRatings,
  } = useHasPermissionQuery('read:impact_rating', parent);
  const { hasPermission: canViewLinkedItems, loading: isLoadingLinkedItems } =
    useHasPermissionQuery('read:linked_item', parent);
  const approvalsEnabled = useIsModuleEnabled('approval');
  const { hasPermission: canViewIssues, loading: isLoadingIssues } =
    useHasPermissionQuery('read:issue', parent);
  const {
    hasPermission: canViewQuestionnaires,
    loading: isLoadingQuestionnaires,
  } = useHasPermissionQuery('update:third_party', parent);
  const { hasPermission: canViewTestResults, loading: isLoadingTestResults } =
    useHasPermissionQuery('read:test_result', parent);
  const questionnairesEnabled = useIsModuleEnabled('third_party');
  const tppContactsEnabled = useIsFeatureFlagEnabled('tpp_contacts');
  const causesEnabled = useIsModuleEnabled('issue.subModules.cause');
  const consequenceEnabled = useIsModuleEnabled('issue.subModules.consequence');
  const { hasPermission: canViewCauses, loading: isLoadingCauses } =
    useHasPermissionQuery('read:cause', parent);
  const { hasPermission: canViewConsequences, loading: isLoadingConsequences } =
    useHasPermissionQuery('read:consequence', parent);
  const {
    hasPermission: canViewIssueAssessments,
    loading: isLoadingIssueAssessments,
  } = useHasPermissionQuery('read:issue_assessment', parent);
  const {
    hasPermission: canViewDocumentAssessmentResult,
    loading: isLoadingDocumentAssessmentResult,
  } = useHasPermissionQuery('read:document_assessment_result', parent);
  const { hasPermission: canViewAssessment, loading: isLoadingAssessment } =
    useHasPermissionQuery('read:assessment', parent);
  const canViewDocumentAssessments =
    canViewDocumentAssessmentResult && canViewAssessment;
  const {
    hasPermission: canViewDocumentFiles,
    loading: isLoadingDocumentFiles,
  } = useHasPermissionQuery('read:document_file', parent);
  const attestationsEnabled = useIsModuleEnabled(
    'document.subModules.attestation'
  );
  const improvedAttestationsEnabled = useIsFeatureFlagEnabled(
    'attestation_improvements'
  );
  const { hasPermission: canViewAttestations, loading: isLoadingAttestations } =
    useHasPermissionQuery('read:attestation_record');
  const {
    hasPermission: canViewDocumentAssessmentResults,
    loading: isLoadingDocumentAssessmentResults,
  } = useHasPermissionQuery('read:document_assessment_result', parent);
  const {
    hasPermission: canViewObligationAssessmentResults,
    loading: isLoadingObligationAssessmentResults,
  } = useHasPermissionQuery('read:obligation_assessment_result', parent);
  const {
    hasPermission: canViewAssessmentActivities,
    loading: isLoadingAssessmentActivities,
  } = useHasPermissionQuery('read:assessment_activity', parent);
  const {
    hasPermission: canViewRiskAssessmentResults,
    loading: isLoadingRiskAssessmentResults,
  } = useHasPermissionQuery('read:risk_assessment_result', parent);
  const canViewAssessmentResults =
    canViewDocumentAssessmentResults ||
    canViewObligationAssessmentResults ||
    canViewRiskAssessmentResults;
  const enterpriseRiskEnabled = useIsModuleEnabled('enterprise_risk');
  const { hasPermission: canUpdateUsers, loading: isLoadingUsers } =
    useHasPermissionQuery('update:settings_users');
  const { hasPermission: canUpdateUserGroups, loading: isLoadingUserGroups } =
    useHasPermissionQuery('update:settings_user_groups');
  const { hasPermission: canUpdateTags, loading: isLoadingTags } =
    useHasPermissionQuery('update:settings_tags');
  const { hasPermission: canUpdateDepartments, loading: isLoadingDepartments } =
    useHasPermissionQuery('update:settings_departments');
  const {
    hasPermission: canViewInternalAuditLog,
    loading: isLoadingInternalAuditLog,
  } = useHasPermissionQuery('read:settings_audit');
  const {
    hasPermission: canUpdateGlobalApprovals,
    loading: isLoadingGlobalApprovals,
  } = useHasPermissionQuery('update:settings_approvals');
  const authenticationEnabled = useIsFeatureFlagEnabled('authentication');
  const {
    hasPermission: canUpdateScimConfiguration,
    loading: isLoadingScimConfiguration,
  } = useHasPermissionQuery('update:scim_configuration');
  const { hasPermission: canUpdateTaxonomy, loading: isLoadingTaxonomy } =
    useHasPermissionQuery('update:taxonomy');
  const { hasPermission: canUseDataImport, loading: isLoadingDataImport } =
    useHasPermissionQuery('insert:data_import');
  const { hasPermission: canUseEntities, loading: isLoadingEntities } =
    useHasPermissionQuery('update:entity');
  const { hasPermission: canUseDataExport, loading: isLoadingDataExport } =
    useHasPermissionQuery('read:data_export');
  const {
    hasPermission: canUseSsoConfiguration,
    loading: isLoadingSsoConfiguration,
  } = useHasPermissionQuery('read:sso_configuration');
  const ssoConfigurationEnabled = useIsFeatureFlagEnabled('sso_configuration');

  const appetiteEnabled = useIsModuleEnabled('risk.subModules.appetite');
  const acceptanceEnabled = useIsModuleEnabled('risk.subModules.acceptance');
  const {
    hasPermission: canViewModuleSettings,
    loading: isLoadingModuleSettings,
  } = useHasPermissionQuery('update:settings_module');

  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const notificationsEnabled = useIsModuleEnabled('notification');
  const {
    hasPermission: canViewColourSettings,
    loading: isLoadingColourSettings,
  } = useHasPermissionQuery('update:colour_palette');

  const { hasPermission: canViewCustomRoles, loading: isLoadingCustomRoles } =
    useHasPermissionQuery('update:custom_role');

  const { hasPermission: canViewExternalApi, loading: isLoadingExternalApi } =
    useHasPermissionQuery('update:external_api');

  const {
    hasPermission: canViewNotificationHistory,
    loading: isLoadingNotificationHistory,
  } = useHasPermissionQuery('read:settings');

  const tabLabels = useTabLabels(parentType, issueSubType);

  const issues = _.mapValues(
    _.keyBy(useIssueVariantTabs(hrefRoot, !!disabled, parent), 'id'),
    (tab) => ({
      tab,
      hasAccess: () => canViewIssues && issuesEnabled,
    })
  );

  const isLoading =
    isLoadingActions ||
    isLoadingAcceptances ||
    isLoadingDocumentFiles ||
    isLoadingAttestations ||
    isLoadingControls ||
    isLoadingAppetites ||
    isLoadingAssessments ||
    isLoadingAssessment ||
    isLoadingCauses ||
    isLoadingConsequences ||
    isLoadingIssueAssessments ||
    isLoadingDocumentAssessmentResult ||
    isLoadingTestResults ||
    isLoadingDocumentAssessmentResults ||
    isLoadingObligationAssessmentResults ||
    isLoadingAssessmentActivities ||
    isLoadingRiskAssessmentResults ||
    isLoadingUsers ||
    isLoadingUserGroups ||
    isLoadingTags ||
    isLoadingDepartments ||
    isLoadingInternalAuditLog ||
    isLoadingGlobalApprovals ||
    isLoadingScimConfiguration ||
    isLoadingTaxonomy ||
    isLoadingDataImport ||
    isLoadingEntities ||
    isLoadingDataExport ||
    isLoadingModuleSettings ||
    isLoadingQuestionnaires ||
    isLoadingIssues ||
    isLoadingLinkedItems ||
    isLoadingImpactRatings ||
    isLoadingIndicators ||
    isLoadingColourSettings ||
    isLoadingCustomRoles ||
    isLoadingExternalApi ||
    isLoadingSsoConfiguration ||
    isLoadingNotificationHistory;

  const detailsTabs: { [key in Parent_Type_Enum]?: TabsProps.Tab } = {
    [Parent_Type_Enum.ThirdParty]: {
      label: tabLabels.details,
      id: 'details',
      content: disabled ? <ThirdPartyCreateTab /> : <ThirdPartyDetailsTab />,
      href: disabled ? undefined : hrefRoot,
    },
    [Parent_Type_Enum.Risk]: {
      label: tabLabels.details,
      id: 'details',
      content: disabled ? <RiskCreateTab /> : <RiskDetailsTab />,
      href: disabled ? undefined : hrefRoot,
    },
    [Parent_Type_Enum.Issue]: {
      label: tabLabels.details,
      id: 'details',
      content: <IssueDetailsTab type={issueSubType!} />,
      href: disabled ? undefined : hrefRoot,
    },
    [Parent_Type_Enum.Document]: {
      label: tabLabels.details,
      id: 'details',
      content: disabled ? <PolicyCreateTab /> : <PolicyDetailsTab />,
      href: disabled ? undefined : hrefRoot,
    },
    [Parent_Type_Enum.DocumentFile]: {
      id: 'details',
      label: tabLabels.details,
      content: (
        <PolicyFileDetailsTab
          parentDocumentId={documentId!}
          documentFileId={id!}
        />
      ),
      href: disabled ? undefined : hrefRoot,
    },
    [Parent_Type_Enum.Action]: {
      label: tabLabels.details,
      id: 'details',
      content: <ActionDetailsTab />,
      href: disabled ? undefined : hrefRoot,
    },
    [Parent_Type_Enum.EnterpriseRisk]: {
      label: tabLabels.details,
      id: 'details',
      content: disabled ? (
        <EnterpriseRiskCreateTab />
      ) : (
        <EnterpriseRiskDetailsTab />
      ),
      href: disabled ? undefined : hrefRoot,
    },
    [Parent_Type_Enum.Impact]: {
      label: tabLabels.details,
      id: 'details',
      content: parent && (
        <ImpactDetailsTab
          impact={parent as GetImpactByIdQuery['impact'][number]}
        />
      ),
      href: disabled ? undefined : hrefRoot,
    },
    [Parent_Type_Enum.Control]: {
      label: tabLabels.details,
      id: 'details',
      content: parent && (
        <ControlDetailsTab
          control={parent as GetControlByIdQuery['control'][number]}
        />
      ),
      href: disabled ? undefined : hrefRoot,
    },
    [Parent_Type_Enum.Appetite]: {
      label: tabLabels.details,
      id: 'details',
      content: <AppetiteDetailsTab Id={appetiteId} ParentId={riskId} />,
      href: disabled ? undefined : hrefRoot,
    },
    [Parent_Type_Enum.Acceptance]: {
      label: tabLabels.details,
      id: 'details',
      content: <AcceptanceDetailsTab Id={acceptanceId} ParentId={riskId} />,
      href: disabled ? undefined : hrefRoot,
    },
    [Parent_Type_Enum.Assessment]: {
      label: tabLabels.details,
      id: 'details',
      content: disabled ? <AssessmentCreateTab /> : <AssessmentDetailsTab />,
      href: disabled ? undefined : hrefRoot,
    },
    [Parent_Type_Enum.ComplianceMonitoringAssessment]: {
      label: tabLabels.details,
      id: 'details',
      content: disabled ? (
        <ComplianceMonitoringAssessmentCreateTab />
      ) : (
        <ComplianceMonitoringAssessmentDetailsTab />
      ),
      href: disabled ? undefined : hrefRoot,
    },
    [Parent_Type_Enum.InternalAuditReport]: {
      label: tabLabels.details,
      id: 'details',
      content: disabled ? (
        <InternalAuditReportCreateTab />
      ) : (
        <InternalAuditReportDetailsTab />
      ),
      href: disabled ? undefined : hrefRoot,
    },
    [Parent_Type_Enum.ControlGroup]: {
      label: tabLabels.details,
      id: 'details',
      content: <ControlGroupDetailsTab />,
      href: disabled ? undefined : hrefRoot,
    },
    [Parent_Type_Enum.InternalAuditEntity]: {
      label: tabLabels.details,
      id: 'details',
      content: disabled ? (
        <InternalAuditEntityCreateTab />
      ) : (
        <InternalAuditEntityDetailsTab />
      ),
      href: disabled ? undefined : hrefRoot,
    },
    [Parent_Type_Enum.Obligation]: {
      label: tabLabels.details,
      id: 'details',
      content: disabled ? (
        <ObligationCreateTab />
      ) : (
        parent && (
          <ObligationDetailsTab
            obligation={parent as GetObligationByIdQuery['obligation'][0]}
          />
        )
      ),
      href: hrefRoot,
    },
    [Parent_Type_Enum.QuestionnaireTemplate]: {
      label: tabLabels.details,
      id: 'details',
      content: disabled ? (
        <QuestionnaireTemplateCreateTab />
      ) : (
        <QuestionnaireTemplateDetailsTab />
      ),
      href: disabled ? undefined : hrefRoot,
    },
    [Parent_Type_Enum.Indicator]: {
      label: tabLabels.details,
      id: 'details',
      content: parent && (
        <IndicatorDetailsTab
          indicator={parent as GetIndicatorByIdQuery['indicator'][0]}
        />
      ),
      href: disabled ? undefined : hrefRoot,
    },
  };

  // We use ratings and assessments interchangeably. For the sake of consistency,
  // I'll refer to them as assessments here, but keeping the tab ids as ratings so it doesn't break anything.
  const assessmentsTabs: {
    [key in Parent_Type_Enum]?: {
      tab: TabsProps.Tab;
      hasAccess: () => boolean;
    };
  } = {
    [Parent_Type_Enum.Risk]: {
      tab: {
        label: tabLabels.assessments,
        id: 'ratings',
        content: parent && <RiskAssessmentTab risk={parent} />,
        href: `${hrefRoot}/ratings`,
        disabled,
      },
      hasAccess: () => canViewAssessments && !impactedEnabled,
    },
    [Parent_Type_Enum.Issue]: {
      tab: {
        label: tabLabels.assessments,
        id: 'assessment',
        content: parent && (
          <IssueAssessmentsTab
            issue={parent as GetIssueByIdQuery['issue'][number]}
            type={issueSubType!}
          />
        ),
        href: `${hrefRoot}/assessment`,
        disabled,
      },
      hasAccess: () => canViewIssueAssessments,
    },
    [Parent_Type_Enum.Document]: {
      tab: {
        label: tabLabels.assessments,
        id: 'ratings',
        content: parent && <DocumentAssessmentTab parent={parent} />,
        href: `${hrefRoot}/ratings`,
        disabled,
      },
      hasAccess: () => canViewDocumentAssessments,
    },
    [Parent_Type_Enum.Impact]: {
      tab: {
        label: tabLabels.assessments,
        id: 'ratings',
        content: parent && <ImpactAssessmentsTab />,
        href: `${hrefRoot}/rating`,
        disabled,
      },
      hasAccess: () => canViewImpactRatings,
    },
    [Parent_Type_Enum.Obligation]: {
      tab: {
        label: tabLabels.assessments,
        id: 'ratings',
        content: parent && <ObligationAssessmentsTab parent={parent} />,
        href: `${hrefRoot}/ratings`,
        disabled,
      },
      hasAccess: () => canViewObligationAssessmentResults,
    },
  };

  const updateTabs: {
    [key in Parent_Type_Enum]?: {
      tab: TabsProps.Tab;
      hasAccess: () => boolean;
    };
  } = {
    [Parent_Type_Enum.Action]: {
      tab: {
        label: tabLabels.updates,
        id: 'updates',
        content: parent ? (
          <ActionUpdatesTab
            action={parent as GetActionByIdQuery['action'][number]}
          />
        ) : undefined,
        href: `${hrefRoot}/updates`,
        disabled,
      },
      hasAccess: () => canViewActions,
    },
    [Parent_Type_Enum.Issue]: {
      tab: {
        label: tabLabels.updates,
        id: 'updates',
        content: parent && <IssueUpdatesTab parent={parent} />,
        href: `${hrefRoot}/updates`,
        disabled,
      },
      hasAccess: () => canViewIssues,
    },
  };

  const versionTabs: {
    [key in Parent_Type_Enum]?: {
      tab: TabsProps.Tab;
      hasAccess: () => boolean;
    };
  } = {
    [Parent_Type_Enum.Document]: {
      tab: {
        label: tabLabels.versions,
        id: 'files',
        content: parent && <FilesTab parent={parent} />,
        href: `${hrefRoot}/files`,
        disabled,
      },
      hasAccess: () => canViewDocumentFiles,
    },
    [Parent_Type_Enum.QuestionnaireTemplate]: {
      tab: {
        label: tabLabels.versions,
        id: 'versions',
        content: <QuestionnaireTemplateVersionsTab />,
        href: `${hrefRoot}/versions`,
        disabled,
      },
      hasAccess: () => canViewDocumentFiles,
    },
  };

  const attestationsTabs: {
    [key in Parent_Type_Enum]?: {
      tab: TabsProps.Tab;
      hasAccess: () => boolean;
    };
  } = {
    [Parent_Type_Enum.DocumentFile]: {
      tab: {
        id: 'attestations',
        label: tabLabels.attestations,
        content: <DocumentFileAttestationsTab documentFileId={id!} />,
        href: `${hrefRoot}/attestations`,
        disabled,
      },
      hasAccess: () => attestationsEnabled && canViewAttestations,
    },
    [Parent_Type_Enum.Document]: {
      tab: {
        id: 'attestations',
        label: tabLabels.attestations,
        content: documentId && (
          <DocumentAttestationsTab parentDocumentId={documentId} />
        ),
        href: `${hrefRoot}/attestations`,
        disabled,
      },
      hasAccess: () =>
        attestationsEnabled &&
        improvedAttestationsEnabled &&
        canViewAttestations,
    },
  };

  const tabs: {
    [key in TabId]?: {
      tab: TabsProps.Tab;
      hasAccess: () => boolean;
    };
  } = {
    activities: {
      tab: {
        label: tabLabels.activities,
        id: 'activities',
        content:
          assessmentActivityMode === 'addActivity' ? (
            <ActivityCreateTab assessmentMode={assessmentMode!} />
          ) : assessmentActivityMode === 'addRCSA' ? (
            <RCSACreateTab assessmentMode={assessmentMode!} />
          ) : assessmentActivityMode === 'updateActivity' ? (
            <ActivityUpdateTab assessmentMode={assessmentMode!} />
          ) : assessmentActivityMode === 'updateRCSA' ? (
            <RCSAUpdateTab assessmentMode={assessmentMode!} />
          ) : (
            parent && (
              <AssessmentActivitiesTab
                parent={parent}
                assessmentMode={assessmentMode!}
              />
            )
          ),
        href: parent ? `${hrefRoot}/activities` : '',
        disabled,
      },
      hasAccess: () => canViewAssessmentActivities,
    },

    findings: {
      tab: {
        label: tabLabels.findings,
        id: 'findings',
        content:
          parent &&
          parent &&
          assessmentMode === 'compliance_monitoring_assessment' ? (
            <SecondLineResultsTab parent={parent} />
          ) : parent && assessmentMode === 'internal_audit_report' ? (
            <InternalAuditResultsTab parent={parent} />
          ) : (
            parent && <AssessmentResultsTab parent={parent} />
          ),
        href: parent ? `${hrefRoot}/findings` : '',
        disabled,
      },
      hasAccess: () => canViewAssessmentResults,
    },

    controls: {
      tab: {
        label: tabLabels.controls,
        id: 'controls',
        content:
          parent &&
          (parentType === Parent_Type_Enum.ControlGroup ? (
            <ControlGroupControlsTab parent={parent} />
          ) : (
            <ControlsTab parent={parent} />
          )),
        href: `${hrefRoot}/controls`,
        disabled,
      },
      hasAccess: () => canViewControls,
    },

    assessments: assessmentsTabs[parentType],

    impacts: {
      tab: {
        label: tabLabels.impacts,
        id: 'impacts',
        content:
          parent &&
          (parentType === Parent_Type_Enum.Obligation ? (
            <ObligationImpactsTab obligation={parent} />
          ) : (
            <ImpactsTab parentRisk={parent} />
          )),
        href: `${hrefRoot}/impacts`,
        disabled,
      },
      hasAccess: () =>
        parentType === Parent_Type_Enum.Obligation
          ? true
          : impactedEnabled && canViewImpactRatings,
    },
    appetites: {
      tab: {
        label: tabLabels.appetites,
        id: 'appetites',
        content: parent && <AppetitesTab parent={parent} />,
        href: `${hrefRoot}/appetite`,
        disabled,
      },
      hasAccess: () => canViewAppetites && appetiteEnabled,
    },

    acceptances: {
      tab: {
        label: tabLabels.acceptances,
        id: 'acceptances',
        content: parent && <AcceptancesTab parent={parent} />,
        href: `${hrefRoot}/acceptances`,
        disabled,
      },
      hasAccess: () => canViewAcceptances && acceptanceEnabled,
    },

    actions: {
      tab: {
        label: tabLabels.actions,
        id: 'actions',
        content: parent && <ActionsTab parent={parent} />,
        href: `${hrefRoot}/actions`,
        disabled,
      },
      hasAccess: () => canViewActions,
    },

    indicators: {
      tab: {
        label: tabLabels.indicators,
        id: 'indicators',
        content: parent && <IndicatorTab parent={parent} />,
        href: `${hrefRoot}/indicators`,
        disabled,
      },
      hasAccess: () => canViewIndicators,
    },

    results: {
      tab: {
        label: tabLabels.results,
        id: 'results',
        content: parent && parentType === Parent_Type_Enum.Indicator && (
          <IndicatorResultsTab
            indicatorType={
              (parent as GetIndicatorByIdQuery['indicator'][0]).Type
            }
            parent={parent as GetIndicatorByIdQuery['indicator'][0]}
          />
        ),
        href: `${hrefRoot}/results`,
        disabled,
      },
      hasAccess: () => parentType === Parent_Type_Enum.Indicator,
    },

    approvals: {
      tab: {
        label: tabLabels.approvals,
        id: 'approvals',
        content: parent ? (
          <ApprovalsTab parent={parent} approvalType={parentType} />
        ) : (
          <ApprovalsTab />
        ),
        href: `${hrefRoot}/approvals`,
        disabled,
      },
      hasAccess: () =>
        approvalsEnabled &&
        (parentType === Parent_Type_Enum.Settings
          ? canUpdateGlobalApprovals
          : true),
    },

    linkedItems: {
      tab: {
        label: tabLabels.linkedItems,
        id: 'linkedItems',
        content: parent && (
          <LinkedItemsTab parent={parent} parentType={parentType} />
        ),
        href: `${hrefRoot}/linked-items`,
        disabled,
      },
      hasAccess: () => canViewLinkedItems,
    },

    notificationHistory: {
      tab: {
        label: tabLabels.notificationHistory,
        id: 'notificationHistory',
        content: parent?.Id ? (
          <EntityNotificationHistoryTab objectId={parent.Id} />
        ) : undefined,
        href: `${hrefRoot}/notification-history`,
        disabled,
      },
      hasAccess: () =>
        notificationsEnabled &&
        trpcEnabled &&
        parentType !== 'settings' &&
        parentType !== undefined,
    },

    questionnaires: {
      tab: {
        label: tabLabels.questionnaires,
        id: 'questionnaires',
        content: <QuestionnairesTab />,
        href: `${hrefRoot}/questionnaire-responses`,
        disabled,
      },
      hasAccess: () => questionnairesEnabled && canViewQuestionnaires,
    },

    contacts: {
      tab: {
        label: tabLabels.contacts,
        id: 'contacts',
        content: <ContactsTab />,
        href: `${hrefRoot}/contacts`,
        disabled,
      },
      hasAccess: () =>
        tppContactsEnabled && questionnairesEnabled && canViewQuestionnaires,
    },

    causes: {
      tab: {
        label: tabLabels.causes,
        id: 'causes',
        href: `${hrefRoot}/causes`,
        content: parent && <CausesTab parent={parent} />,
        disabled,
      },
      hasAccess: () => canViewCauses && causesEnabled,
    },

    consequences: {
      tab: {
        label: tabLabels.consequences,
        id: 'consequences',
        content: parent && <ConsequencesTab parent={parent} />,
        href: `${hrefRoot}/consequences`,
        disabled,
      },
      hasAccess: () => canViewConsequences && consequenceEnabled,
    },

    versions: versionTabs[parentType],

    attestations: attestationsTabs[parentType],

    updates: updateTabs[parentType],

    entityRisks: {
      tab: {
        label: tabLabels.entityRisks,
        disabled,
        id: 'risks',
        content: <EntityRiskRegisterTab />,
        href: disabled ? undefined : `${hrefRoot}/risks`,
      },
      hasAccess: () => true,
    },

    internalAuditRisks: {
      tab: {
        label: tabLabels.internalAuditRisks,
        disabled,
        id: 'risks',
        content: (
          <InternalAuditRiskRegisterTab
            parent={
              parent as GetInternalAuditByIdQuery['internal_audit_entity'][number]
            }
          />
        ),
        href: disabled ? undefined : `${hrefRoot}/risks`,
      },
      hasAccess: () => true,
    },

    reports: {
      tab: {
        label: tabLabels.reports,
        id: 'reports',
        content: parent && (
          <ReportsTab
            internalAudit={
              parent as GetInternalAuditByIdQuery['internal_audit_entity'][number]
            }
          />
        ),
        href: `${hrefRoot}/reports`,
        disabled,
      },
      hasAccess: () => internalAuditReportsEnabled,
    },

    testResults: {
      tab: {
        label: tabLabels.testResults,
        id: 'performance',
        content: parent && (
          <TestResultsTab
            control={parent as GetControlByIdQuery['control'][number]}
          />
        ),
        href: `${hrefRoot}/performance`,
        disabled,
      },
      hasAccess: () => canViewTestResults,
    },

    ...issues,

    users: {
      tab: {
        label: tabLabels.users,
        id: 'users',
        href: '/settings/users',
        content: <UsersTab />,
      },
      hasAccess: () => canUpdateUsers,
    },

    userGroups: {
      tab: {
        label: tabLabels.userGroups,
        id: 'groups',
        href: '/settings/groups',
        content: <UserGroupsTab />,
      },
      hasAccess: () => canUpdateUserGroups,
    },

    tags: {
      tab: {
        label: tabLabels.tags,
        id: 'tags',
        href: '/settings/tags',
        content: <TagsTab />,
      },
      hasAccess: () => canUpdateTags,
    },

    departments: {
      tab: {
        label: tabLabels.departments,
        id: 'departments',
        href: '/settings/departments',
        content: <DepartmentsTab />,
      },
      hasAccess: () => canUpdateDepartments,
    },

    taxonomy: {
      tab: {
        label: tabLabels.taxonomy,
        id: 'taxonomy',
        href: '/settings/taxonomy',
        content: <TaxonomyTab />,
      },
      hasAccess: () => canUpdateTaxonomy,
    },

    authentication: {
      tab: {
        label: tabLabels.authentication,
        id: 'authentication',
        href: '/settings/authentication',
        content: <AuthenticationTab />,
      },
      hasAccess: () => authenticationEnabled && canUpdateScimConfiguration,
    },

    sso: {
      tab: {
        label: tabLabels.sso,
        id: 'sso',
        href: '/settings/sso',
        content: <SsoTab />,
      },
      hasAccess: () => ssoConfigurationEnabled && canUseSsoConfiguration,
    },

    dataImport: {
      tab: {
        label: tabLabels.dataImport,
        id: 'dataImport',
        href: '/settings/data-import',
        content: <DataImportTab />,
      },
      hasAccess: () => canUseDataImport,
    },

    dataExport: {
      tab: {
        label: tabLabels.dataExport,
        id: 'dataExport',
        href: '/settings/data-export',
        content: <DataExportTab />,
      },
      hasAccess: () => canUseDataExport,
    },

    entities: {
      tab: {
        label: tabLabels.entities,
        id: 'entities',
        href: '/settings/entities',
        content: <EntitiesTab />,
      },
      hasAccess: () => enterpriseRiskEnabled && canUseEntities,
    },

    audit: {
      tab: {
        label: tabLabels.audit,
        id: 'audit',
        href: '/settings/audit',
        content: <AuditTab />,
      },
      hasAccess: () => canViewInternalAuditLog,
    },

    notifications: {
      tab: {
        label: tabLabels.notifications,
        id: 'notifications',
        href: '/settings/notifications',
        content: <NotificationsTab />,
      },
      hasAccess: () => canViewNotificationHistory && trpcEnabled,
    },

    modules: {
      tab: {
        label: tabLabels.modules,
        id: 'modules',
        href: '/settings/modules',
        content: <ModulesTab />,
      },
      hasAccess: () => canViewModuleSettings && modulesEnabled,
    },

    colours: {
      tab: {
        label: tabLabels.colours,
        id: 'colours',
        href: '/settings/colours',
        content: <ColoursTab />,
      },
      hasAccess: () => canViewColourSettings,
    },

    customRoles: {
      tab: {
        label: tabLabels.customRoles,
        id: 'customRoles',
        href: '/settings/custom-roles',
        content: <CustomRolesTab />,
      },
      hasAccess: () => canViewCustomRoles && trpcEnabled,
    },

    externalApi: {
      tab: {
        label: tabLabels.externalApi,
        id: 'externalApi',
        href: '/settings/external-api',
        content: (
          <ExternalApiProvider>
            <ExternalApiTab />
          </ExternalApiProvider>
        ),
      },
      hasAccess: () => canViewExternalApi && trpcEnabled && modulesEnabled,
    },
  };

  if (
    detailsTabs[parentType] === undefined &&
    parentType !== Parent_Type_Enum.Settings
  ) {
    throw new Error('Details tab not found for parent type');
  }

  if (detailsTabs[parentType] && parentType !== Parent_Type_Enum.Settings) {
    tabs.details = {
      tab: detailsTabs[parentType],
      hasAccess: () => true,
    };
  }

  if (tabPreferences.loading || isLoading) {
    return [
      {
        label: t('loading'),
        id: 'loading',
        content: null,
        href: undefined,
      },
    ];
  }

  return (
    tabPreferences.tabs
      ?.filter((tab) => !tab.hidden) // Filter out hidden tabs
      .filter((tab) => tabs[tab.id]?.hasAccess()) // Filter out tabs that the user doesn't have access to
      .map((tab) => {
        if (tabs[tab.id]) {
          return {
            ...tabs[tab.id]!.tab,
            label: tab.label || tabs[tab.id]!.tab.label, // Override label if provided
          };
        }
      })
      .filter((tab) => !!tab) || [] // Filter out empty tabs
  );
};

export default useTabs;
