import Button from '@risk-smart/themed-cloudscape-components/button';
import ExpandableSection from '@risk-smart/themed-cloudscape-components/expandable-section';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import Table from '@risksmart-app/components/src/table';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import TabHeader from 'src/components/tab-header';
import { useGetAssessmentActivitiesByParentId } from 'src/hooks/queries';
import type { AssessmentTypeEnum } from 'src/pages/assessments/types';
import { useAssessmentTypeConfig } from 'src/pages/assessments/useAssessmentTypeConfig';
import { type ObjectWithContributors, Permission } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { getCounter } from '@/utils/collectionUtils';

import { useGetCollectionTableProps } from './activtiesConfig';
import { useActivitiesStore } from './store/useActivitiesStore';

type Props = {
  parent: ObjectWithContributors;
  assessmentMode: AssessmentTypeEnum;
};

export const ActivitiesRegister: FC<Props> = ({ assessmentMode, parent }) => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'assessmentActivities',
  });
  const { t: st } = useTranslation(['common']);
  const assessmentId = useGetGuidParam('assessmentId');
  const navigate = useNavigate();
  const {
    setSelectedActivities,
    selectedActivities,
    setIsActivityDeleteModalVisible,
  } = useActivitiesStore();

  const {
    routing: { activityAddUrl },
  } = useAssessmentTypeConfig(assessmentMode);

  const {
    hasPermission: canDeleteAssessmentActivities,
    loading: canDeleteAssessmentActivitiesLoading,
  } = useHasPermissionQuery(`delete:assessment_activity`, parent);

  const { data, loading } = useGetAssessmentActivitiesByParentId({
    queryArgs: { id: assessmentId },
  });

  const tableProps = useGetCollectionTableProps(
    assessmentMode,
    data?.assessment_activity
  );

  return (
    <>
      <SpaceBetween size={'m'}>
        <TabHeader
          actions={
            assessmentMode !== 'rating' && (
              <SpaceBetween direction={'horizontal'} size={'s'}>
                <Permission
                  permission={'delete:assessment_activity'}
                  parentObject={parent}
                >
                  <Button
                    formAction={'none'}
                    variant={'normal'}
                    disabled={!selectedActivities.length}
                    onClick={() => setIsActivityDeleteModalVisible(true)}
                  >
                    {st('delete')}
                  </Button>
                </Permission>
                <Permission
                  permission={'insert:assessment_activity'}
                  parentObject={parent}
                >
                  <Button
                    variant={'primary'}
                    formAction={'none'}
                    onClick={() => {
                      navigate(activityAddUrl(assessmentId));
                    }}
                  >
                    {t('add_button')}
                  </Button>
                </Permission>
              </SpaceBetween>
            )
          }
        >
          {t('tab_title')}
        </TabHeader>
      </SpaceBetween>
      <ExpandableSection
        headerText={
          <div className={'flex space-x-2'}>
            <span className={'m-0'}>{t('activityRegisterTitle')}</span>
            <span className={'text-grey font-normal'}>
              {getCounter(tableProps.totalItemsCount ?? 0, loading)}
            </span>
          </div>
        }
        defaultExpanded={true}
      >
        <Table
          {...tableProps}
          selectionType={
            canDeleteAssessmentActivities &&
            !canDeleteAssessmentActivitiesLoading
              ? 'multi'
              : undefined
          }
          selectedItems={selectedActivities}
          trackBy={'Id'}
          onSelectionChange={({ detail }) => {
            setSelectedActivities(detail.selectedItems);
          }}
          variant={'embedded'}
          loading={loading}
        />
      </ExpandableSection>
    </>
  );
};
