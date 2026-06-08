import { useMutation } from '@apollo/client';
import Button from '@risksmart-app/components/src/button';
import {
  useGetGuidParam,
  useGetOptionalGuidParam,
} from '@risksmart-app/components/src/routes/routes.utils';
import {
  DeleteInternalAuditResultsDocument,
  GetAllInternalAuditReportResultsDocument,
  GetInternalAuditResultsByParentIdDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import ControlledTabs from 'src/components/controlled-tabs';
import DeleteModal from 'src/components/delete-modal';
import {
  useGetInternalAuditReportById,
  useGetInternalAuditResultsById,
} from 'src/hooks/queries';
import { PageLayout } from 'src/layouts';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import { evictField } from '@/utils/graphqlUtils';
import { internalAuditReportResultsUrl } from '@/utils/urls';

import { useTabs } from '../useTabs';

const Page: FC = () => {
  const { t } = useTranslation(['common'], { keyPrefix: 'assessmentResults' });
  const title = t('edit_title');
  const optionalInternalAuditReportId = useGetOptionalGuidParam('assessmentId');
  const findingId = useGetGuidParam('findingId');
  const navigate = useNavigate();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const { data: resultData, error: resultError } =
    useGetInternalAuditResultsById({
      queryArgs: { internalAuditResultId: findingId },
    });

  if (resultError) {
    throw resultError;
  }
  const resultParentId = resultData?.internal_audit_result_parent.find(
    (ar) => ar.ParentType == Parent_Type_Enum.InternalAuditReport
  )?.ParentId;
  const internalAuditReportId = optionalInternalAuditReportId ?? resultParentId;

  const { data, error } = useGetInternalAuditReportById({
    queryArgs: { reportId: internalAuditReportId ?? '' },
    shouldSkip: !internalAuditReportId,
  });

  if (error) {
    throw error;
  }

  const internalAuditReport = data?.internal_audit_report?.[0];

  const {
    hasPermission: canDeleteDocumentInternalAuditResult,
    loading: canDeleteDocumentLoading,
  } = useHasPermissionQuery(
    'delete:document_internal_audit_result',
    internalAuditReport
  );
  const {
    hasPermission: canDeleteObligationInternalAuditResult,
    loading: canDeleteObligationLoading,
  } = useHasPermissionQuery(
    'delete:obligation_internal_audit_result',
    internalAuditReport
  );
  const {
    hasPermission: canDeleteRiskControlledInternalAuditResult,
    loading: canDeleteRiskControlledLoading,
  } = useHasPermissionQuery(
    'delete:risk_controlled_internal_audit_result',
    internalAuditReport
  );
  const {
    hasPermission: canDeleteRiskUncontrolledInternalAuditResult,
    loading: canDeleteRiskUncontrolledLoading,
  } = useHasPermissionQuery(
    'delete:risk_uncontrolled_internal_audit_result',
    internalAuditReport
  );
  const {
    hasPermission: canDeleteControlTestInternalAuditResult,
    loading: canDeleteControlTestLoading,
  } = useHasPermissionQuery(
    'delete:control_test_internal_audit_result',
    internalAuditReport
  );

  const isPermissionLoading =
    canDeleteDocumentLoading ||
    canDeleteObligationLoading ||
    canDeleteRiskControlledLoading ||
    canDeleteRiskUncontrolledLoading ||
    canDeleteControlTestLoading;

  const canDelete =
    !isPermissionLoading &&
    (canDeleteDocumentInternalAuditResult ||
      canDeleteObligationInternalAuditResult ||
      canDeleteRiskControlledInternalAuditResult ||
      canDeleteRiskUncontrolledInternalAuditResult ||
      canDeleteControlTestInternalAuditResult);

  const [deleteInternalAuditResults, deleteResult] = useMutation(
    DeleteInternalAuditResultsDocument,
    {
      update: (cache) => {
        evictField(cache, 'obligation_internal_audit_result');
        evictField(cache, 'document_internal_audit_result');
        evictField(cache, 'risk_controlled_internal_audit_result');
        evictField(cache, 'risk_uncontrolled_internal_audit_result');
        evictField(cache, 'internal_audit_report');
        evictField(cache, 'obligation_internal_audit_result_aggregate');
        evictField(cache, 'document_internal_audit_result_aggregate');
        evictField(cache, 'risk_controlled_internal_audit_result_aggregate');
        evictField(cache, 'risk_uncontrolled_internal_audit_result_aggregate');
      },
      refetchQueries: [
        GetInternalAuditResultsByParentIdDocument,
        GetAllInternalAuditReportResultsDocument,
      ],
    }
  );

  const onDelete = useDeleteResultNotification({
    entityName: t('entity_name'),
    asyncAction: async () => {
      await deleteInternalAuditResults({
        variables: { Ids: [findingId] },
      });
      setIsDeleteModalVisible(false);
      navigate(internalAuditReportResultsUrl(internalAuditReportId));

      return true;
    },
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
  });

  const tabs = useTabs(
    internalAuditReport || undefined,
    'update',
    !optionalInternalAuditReportId,
    !!optionalInternalAuditReportId
  );

  return (
    <PageLayout
      title={title}
      actions={
        canDelete ? (
          <Button
            formAction={'none'}
            variant={'normal'}
            onClick={() => setIsDeleteModalVisible(true)}
          >
            {t('delete_button')}
          </Button>
        ) : undefined
      }
    >
      <ControlledTabs
        tabs={tabs}
        variant={'container'}
        parent={internalAuditReport}
      />
      <DeleteModal
        isVisible={isDeleteModalVisible}
        loading={deleteResult.loading}
        header={t('delete_button')}
        onDelete={onDelete}
        onDismiss={() => setIsDeleteModalVisible(false)}
      >
        {t('confirm_single_delete_message')}
      </DeleteModal>
    </PageLayout>
  );
};

export default Page;
