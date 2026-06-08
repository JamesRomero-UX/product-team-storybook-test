import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { PageNotFound } from '@risksmart-app/components/src/errors/errors';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import ActionsButton from 'src/components/actions-button';
import AddToEnterpriseRiskModal from 'src/components/add-to-enterprise-risk-modal/AddToEnterpriseRiskModal';
import ControlledTabs from 'src/components/controlled-tabs';
import DeleteModal from 'src/components/delete-modal/DeleteModal';
import { useInitiateWizard } from 'src/components/wizard/hooks/useInitiateWizard';
import { CreateAssessmentModal } from 'src/components/wizard/modals/CreateAssessmentModal';
import { LinkAssessmentModal } from 'src/components/wizard/modals/LinkAssessmentModal';
import { WizardButton } from 'src/components/wizard/WizardButton';
import { PageLayout } from 'src/layouts';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';
import { useGetDetailParentPath } from 'src/routes/useGetDetailParentPath';

import { useDeleteRisk } from '@/hooks/mutations/risk';
import { useGetRiskById } from '@/hooks/queries';
import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';
import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import useTabs from '@/hooks/useTabs';
import { getFriendlyId } from '@/utils/friendlyId';

import useExporter from './useExporter';

type Props = {
  selectedTabId:
    | 'acceptances'
    | 'actions'
    | 'appetites'
    | 'approvals'
    | 'controls'
    | 'details'
    | 'impacts'
    | 'indicators'
    | 'linkedItems'
    | 'notificationHistory'
    | 'ratings';
  showDeleteButton?: boolean;
};

const Page: FC<Props> = ({ selectedTabId, showDeleteButton }) => {
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isLinkAssessmentModalVisible, setIsLinkAssessmentModalVisible] =
    useState(false);
  const [isCreateAssessmentModalVisible, setIsCreateAssessmentModalVisible] =
    useState(false);

  const [
    isAddToEnterpriseRiskModalVisible,
    setIsAddToEnterpriseRiskModalVisible,
  ] = useState(false);
  const [isAddToEntityModalVisible, setIsAddToEntityModalVisible] =
    useState(false);
  const navigate = useNavigate();
  const riskId = useGetGuidParam('riskId');
  const params = useParams();
  const { user } = useRisksmartUser();

  const parentUrl = useGetDetailParentPath(riskId);
  const { deleteRisk, loading: deleteLoading } = useDeleteRisk();
  const { t } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], { keyPrefix: 'risks' });
  const { data, error } = useGetRiskById({ queryArgs: { riskId } });
  if (error) {
    throw error;
  }

  const risk = data?.risk[0];
  const complianceMonitoringEnabled = useIsModuleEnabled(
    'obligation.subModules.compliance_monitoring_assessment'
  );
  const internalAuditEnabled = useIsModuleEnabled('internal_audit_entity');
  const {
    hasPermission: canViewCompliance,
    loading: canViewComplianceLoading,
  } = useHasPermissionQuery('read:compliance_monitoring_assessment', risk);
  const {
    hasPermission: canViewInternalAudit,
    loading: canViewInternalAuditLoading,
  } = useHasPermissionQuery('read:internal_audit_report', risk);
  const [exportItem, { loading: exporting }] = useExporter(
    riskId,
    internalAuditEnabled &&
      canViewInternalAudit &&
      !canViewInternalAuditLoading,
    complianceMonitoringEnabled &&
      canViewCompliance &&
      !canViewComplianceLoading
  );
  const tabs = useTabs({
    parentType: Parent_Type_Enum.Risk,
    parent: risk,
    hrefRoot: `/risks/${riskId}`,
    disabled: !risk,
  });
  const onDelete = useDeleteResultNotification({
    entityName: st('entity_name'),
    asyncAction: async () => {
      if (!risk) {
        return false;
      }
      await deleteRisk(risk.Id);
      await navigate(parentUrl);

      return true;
    },
  });

  if (data?.risk.length === 0) {
    throw new PageNotFound(`Risk with id ${riskId} not found`);
  }

  const counter =
    risk && `(${getFriendlyId(Parent_Type_Enum.Risk, risk.SequentialId)})`;
  const fallbackTitle = st('fallback_title');

  const wizardFeatureEnabled = useIsModuleEnabled(
    'risk.subModules.rcsa_wizard'
  );
  const { hasPermission: canViewWizard, loading: canViewWizardLoading } =
    useHasPermissionQuery('update:risk', risk, true);

  const isOwnerOrContributor =
    risk?.ancestorContributors?.some(
      (contributor) => contributor.UserId === user?.userId
    ) ?? false;

  useInitiateWizard(
    { riskId: riskId, title: risk?.Title ?? '' },
    isOwnerOrContributor,
    wizardFeatureEnabled
  );

  const wizardButtonVisible =
    !canViewWizardLoading &&
    wizardFeatureEnabled &&
    canViewWizard &&
    isOwnerOrContributor;

  const isEnterpriseRiskEnabled = useIsModuleEnabled('enterprise_risk');
  const {
    hasPermission: canLinkToEnterpriseRisk,
    loading: canLinkToEnterpriseRiskLoading,
  } = useHasPermissionQuery('insert:enterprise_risk');
  const { hasPermission: canLinkToEntity, loading: canLinkToEntityLoading } =
    useHasPermissionQuery('update:risk');

  const buttons = [
    <Button
      iconName={'download'}
      disabled={exporting}
      onClick={exportItem}
      key={'export'}
    >
      {t('export.export')}
    </Button>,
  ];

  if (
    isEnterpriseRiskEnabled &&
    canLinkToEnterpriseRisk &&
    !canLinkToEnterpriseRiskLoading
  ) {
    buttons.push(
      <Button
        variant={'normal'}
        formAction={'none'}
        key={'addToEnterpriseRisk'}
        onClick={() => {
          setIsAddToEnterpriseRiskModalVisible(true);
        }}
      >
        {t('enterpriseRisks.addRiskToEnterpriseRisk.linkToEnterpriseRisk')}
      </Button>
    );
  }

  if (isEnterpriseRiskEnabled && canLinkToEntity && !canLinkToEntityLoading) {
    buttons.push(
      <Button
        variant={'normal'}
        formAction={'none'}
        key={'addToEntity'}
        onClick={() => {
          setIsAddToEntityModalVisible(true);
        }}
      >
        {t('enterpriseRisks.addRiskToEnterpriseRisk.linkToEntity')}
      </Button>
    );
  }

  const {
    hasPermission: hasPermissionToDelete,
    loading: hasPermissionToDeleteLoading,
  } = useHasPermissionQuery('delete:risk', risk);
  // Always last so it shows on the right for consistency
  if (
    showDeleteButton &&
    hasPermissionToDelete &&
    !hasPermissionToDeleteLoading
  ) {
    buttons.push(
      <Button
        variant={'normal'}
        formAction={'none'}
        key={'delete'}
        onClick={() => {
          setIsDeleteModalVisible(true);
        }}
      >
        {st('delete_button')}
      </Button>
    );
  }

  let actions = buttons;

  // More than 2 buttons, show actions dropdown
  if (
    (wizardButtonVisible && buttons.length > 1) ||
    (!wizardButtonVisible && buttons.length > 2)
  ) {
    actions = [
      <ActionsButton
        key={'actions'}
        buttonText={'Actions'}
        items={buttons.map((b) => {
          return {
            text: b.props.children,
            id: b.props.children,
            onItemClick: b.props.onClick,
          };
        })}
      />,
    ];
  }

  return (
    <PageLayout
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          {wizardButtonVisible && (
            <>
              <WizardButton
                riskId={riskId}
                basePath={`${parentUrl}/${params.riskId}`}
                onClick={() => {
                  setIsLinkAssessmentModalVisible(true);
                }}
              />
            </>
          )}
          {actions}
        </SpaceBetween>
      }
      meta={{
        title: fallbackTitle,
      }}
      title={risk?.Title}
      counter={counter}
    >
      <ControlledTabs
        tabs={tabs}
        activeTabId={selectedTabId}
        variant={'container'}
        parentType={Parent_Type_Enum.Risk}
        parent={risk}
      />

      <DeleteModal
        loading={deleteLoading}
        isVisible={isDeleteModalVisible}
        header={st('delete_modal_title')}
        onDelete={onDelete}
        onDismiss={() => setIsDeleteModalVisible(false)}
      >
        {st('confirm_delete_message')}
      </DeleteModal>

      <AddToEnterpriseRiskModal
        riskId={riskId}
        enterpriseRiskId={risk?.enterpriseRiskInstance?.EnterpriseRiskId}
        entityId={risk?.enterpriseRiskInstance?.EntityId}
        riskTier={risk?.Tier ?? 1}
        isVisible={
          isAddToEnterpriseRiskModalVisible || isAddToEntityModalVisible
        }
        modalSubType={
          isAddToEnterpriseRiskModalVisible ? 'enterpriseRisk' : 'entity'
        }
        onDismiss={() => {
          setIsAddToEnterpriseRiskModalVisible(false);
          setIsAddToEntityModalVisible(false);
        }}
      />
      <LinkAssessmentModal
        isVisible={isLinkAssessmentModalVisible}
        setIsVisible={setIsLinkAssessmentModalVisible}
        setIsCreateAssessmentModalVisible={setIsCreateAssessmentModalVisible}
        basePath={`${parentUrl}/${params.riskId}`}
        riskId={riskId}
        riskTitle={risk?.Title ?? ''}
      />
      <CreateAssessmentModal
        isVisible={isCreateAssessmentModalVisible}
        setIsVisible={setIsCreateAssessmentModalVisible}
        basePath={`${parentUrl}/${params.riskId}`}
        riskId={riskId}
        riskTitle={risk?.Title ?? ''}
      />
    </PageLayout>
  );
};

export default Page;
