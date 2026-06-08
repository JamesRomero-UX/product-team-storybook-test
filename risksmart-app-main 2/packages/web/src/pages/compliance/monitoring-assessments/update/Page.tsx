import { useMutation, useQuery } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { PageNotFound } from '@risksmart-app/components/src/errors/errors';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import {
  DeleteComplianceMonitoringAssessmentsDocument,
  GetComplianceMonitoringAssessmentByIdDocument,
  GetComplianceMonitoringAssessmentsDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import ControlledTabs from 'src/components/controlled-tabs';
import DeleteModal from 'src/components/delete-modal/DeleteModal';
import { PageLayout } from 'src/layouts';
import { Permission } from 'src/rbac/Permission';
import {
  useGetDetailParentPath,
  useGetDetailPath,
} from 'src/routes/useGetDetailParentPath';

import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import useTabs from '@/hooks/useTabs';
import { getFriendlyId } from '@/utils/friendlyId';
import { evictField } from '@/utils/graphqlUtils';

import useExporter from './useExporter';

type Props = {
  activeTabId:
    | 'activities'
    | 'details'
    | 'findings'
    | 'impacts'
    | 'linkedItems';
  activityMode?: 'addActivity' | 'list' | 'updateActivity' | undefined;
};

const Page: FC<Props> = ({ activeTabId, activityMode = undefined }) => {
  const { t } = useTranslation(['common']);
  const assessmentId = useGetGuidParam('assessmentId');
  const [exportItem, { loading: exporting }] = useExporter(assessmentId);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const navigate = useNavigate();
  const parentUrl = useGetDetailParentPath(assessmentId);
  const detailsPath = useGetDetailPath(assessmentId);
  const [mutate, deleteResult] = useMutation(
    DeleteComplianceMonitoringAssessmentsDocument,
    {
      update: (cache) => {
        evictField(cache, 'compliance_monitoring_assessment');
        evictField(cache, 'compliance_monitoring_assessment_aggregate');
      },
      refetchQueries: [
        GetComplianceMonitoringAssessmentByIdDocument,
        GetComplianceMonitoringAssessmentsDocument,
      ],
    }
  );

  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'complianceMonitoringAssessment',
  });
  const { data, loading, error } = useQuery(
    GetComplianceMonitoringAssessmentByIdDocument,
    {
      variables: {
        Id: assessmentId,
      },
    }
  );
  if (error) {
    throw error;
  }

  const assessment = data?.compliance_monitoring_assessment[0];
  const tabs = useTabs({
    parentType: Parent_Type_Enum.ComplianceMonitoringAssessment,
    parent: assessment,
    assessmentActivityMode: activityMode,
    assessmentMode: 'compliance_monitoring_assessment',
    hrefRoot: detailsPath,
  });
  const onDelete = useDeleteResultNotification({
    entityName: st('entity'),
    asyncAction: async () => {
      if (!assessment) {
        return false;
      }
      await mutate({
        variables: {
          Ids: [assessment.Id],
        },
      });
      await navigate(parentUrl);

      return true;
    },
  });

  if (!loading && !assessment?.Id) {
    throw new PageNotFound(`Assessment with id ${assessmentId} not found`);
  }

  const counter =
    assessment &&
    `(${getFriendlyId(
      Parent_Type_Enum.ComplianceMonitoringAssessment,
      assessment.SequentialId
    )})`;
  const fallbackTitle = st('fallback_title');

  return (
    <PageLayout
      actions={
        <Permission
          permission={'delete:compliance_monitoring_assessment'}
          parentObject={assessment}
        >
          <SpaceBetween direction={'horizontal'} size={'xs'}>
            <Button
              iconName={'download'}
              disabled={exporting}
              onClick={exportItem}
            >
              {t('export.export')}
            </Button>
            <Button
              variant={'normal'}
              formAction={'none'}
              onClick={() => {
                setIsDeleteModalVisible(true);
              }}
            >
              {st('delete_button')}
            </Button>
          </SpaceBetween>
        </Permission>
      }
      meta={{
        title: fallbackTitle,
      }}
      title={assessment?.Title}
      counter={counter}
    >
      <ControlledTabs
        tabs={tabs}
        activeTabId={activeTabId}
        variant={'container'}
        parentType={Parent_Type_Enum.ComplianceMonitoringAssessment}
        parent={assessment}
      />

      <DeleteModal
        loading={deleteResult.loading}
        isVisible={isDeleteModalVisible}
        header={st('delete_modal_title')}
        onDelete={onDelete}
        onDismiss={() => setIsDeleteModalVisible(false)}
      >
        {st('confirm_delete_message')}
      </DeleteModal>
    </PageLayout>
  );
};

export default Page;
