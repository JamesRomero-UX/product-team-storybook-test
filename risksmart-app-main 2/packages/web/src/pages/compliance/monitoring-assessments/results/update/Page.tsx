import { useMutation, useQuery } from '@apollo/client';
import Button from '@risksmart-app/components/src/button';
import {
  useGetGuidParam,
  useGetOptionalGuidParam,
} from '@risksmart-app/components/src/routes/routes.utils';
import { ParentTypes } from '@risksmart-app/domain/src/types/consts';
import {
  DeleteSecondLineResultsDocument,
  GetAllComplianceMonitoringAssessmentResultsDocument,
  GetComplianceMonitoringAssessmentByIdDocument,
  GetSecondLineResultByIdDocument,
  GetSecondLineResultsByParentIdDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import ControlledTabs from 'src/components/controlled-tabs';
import DeleteModal from 'src/components/delete-modal';
import { PageLayout } from 'src/layouts';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import { evictField } from '@/utils/graphqlUtils';
import { complianceMonitoringAssessmentResultsUrl } from '@/utils/urls';

import { useTabs } from '../useTabs';

const Page: FC = () => {
  const { t } = useTranslation(['common'], { keyPrefix: 'assessmentResults' });
  const title = t('edit_title');
  const optionalAssessmentId = useGetOptionalGuidParam('assessmentId');
  const findingId = useGetGuidParam('findingId');
  const navigate = useNavigate();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const { data: resultData, error: resultError } = useQuery(
    GetSecondLineResultByIdDocument,
    {
      variables: { Id: findingId },
      skip: !!optionalAssessmentId,
    }
  );
  if (resultError) {
    throw resultError;
  }
  const resultParentId = resultData?.second_line_result_parent.find(
    (ar) => ar.ParentType === ParentTypes.ComplianceMonitoringAssessment
  )?.ParentId;
  const assessmentId = optionalAssessmentId ?? resultParentId;

  const { data, error } = useQuery(
    GetComplianceMonitoringAssessmentByIdDocument,
    {
      variables: {
        Id: assessmentId!,
      },
      skip: !assessmentId,
    }
  );
  if (error) {
    throw error;
  }

  const assessment = data?.compliance_monitoring_assessment?.[0];

  const {
    hasPermission: canDeleteDocumentSecondLineResult,
    loading: canDeleteDocumentLoading,
  } = useHasPermissionQuery('delete:document_second_line_result', assessment);
  const {
    hasPermission: canDeleteObligationSecondLineResult,
    loading: canDeleteObligationLoading,
  } = useHasPermissionQuery('delete:obligation_second_line_result', assessment);
  const {
    hasPermission: canDeleteRiskControlledSecondLineResult,
    loading: canDeleteRiskControlledLoading,
  } = useHasPermissionQuery(
    'delete:risk_controlled_second_line_result',
    assessment
  );
  const {
    hasPermission: canDeleteRiskUncontrolledSecondLineResult,
    loading: canDeleteRiskUncontrolledLoading,
  } = useHasPermissionQuery(
    'delete:risk_uncontrolled_second_line_result',
    assessment
  );
  const {
    hasPermission: canDeleteControlTestSecondLineResult,
    loading: canDeleteControlTestLoading,
  } = useHasPermissionQuery(
    'delete:control_test_second_line_result',
    assessment
  );

  const isPermissionLoading =
    canDeleteDocumentLoading ||
    canDeleteObligationLoading ||
    canDeleteRiskControlledLoading ||
    canDeleteRiskUncontrolledLoading ||
    canDeleteControlTestLoading;

  const canDelete =
    !isPermissionLoading &&
    (canDeleteDocumentSecondLineResult ||
      canDeleteObligationSecondLineResult ||
      canDeleteRiskControlledSecondLineResult ||
      canDeleteRiskUncontrolledSecondLineResult ||
      canDeleteControlTestSecondLineResult);

  const [deleteSecondLineResults, deleteResult] = useMutation(
    DeleteSecondLineResultsDocument,
    {
      update: (cache) => {
        evictField(cache, 'obligation_second_line_result');
        evictField(cache, 'document_second_line_result');
        evictField(cache, 'risk_controlled_second_line_result');
        evictField(cache, 'risk_uncontrolled_second_line_result');
        evictField(cache, 'compliance_monitoring_assessment');
        evictField(cache, 'obligation_second_line_result_aggregate');
        evictField(cache, 'document_second_line_result_aggregate');
        evictField(cache, 'risk_controlled_second_line_result_aggregate');
        evictField(cache, 'risk_uncontrolled_second_line_result_aggregate');
      },
      refetchQueries: [
        GetSecondLineResultsByParentIdDocument,
        GetAllComplianceMonitoringAssessmentResultsDocument,
      ],
    }
  );

  const onDelete = useDeleteResultNotification({
    entityName: t('entity_name'),
    asyncAction: async () => {
      await deleteSecondLineResults({
        variables: { Ids: [findingId] },
      });
      setIsDeleteModalVisible(false);
      navigate(complianceMonitoringAssessmentResultsUrl(assessmentId));

      return true;
    },
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
  });

  const tabs = useTabs(
    assessment || undefined,
    'update',
    !optionalAssessmentId,
    !!optionalAssessmentId
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
      <ControlledTabs tabs={tabs} variant={'container'} parent={assessment} />
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
