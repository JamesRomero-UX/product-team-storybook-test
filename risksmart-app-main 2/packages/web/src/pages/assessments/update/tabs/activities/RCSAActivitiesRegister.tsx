import { useQuery } from '@apollo/client';
import ExpandableSection from '@risk-smart/themed-cloudscape-components/expandable-section';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import Table from '@risksmart-app/components/src/table';
import { GetAssessmentRcsaActivitiesByParentIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { getCounter } from '@/utils/collectionUtils';

import { useGetCollectionTableProps } from './RCSAConfig';
import { useActivitiesStore } from './store/useActivitiesStore';

type Props = {
  parent: ObjectWithContributors;
};

export const RCSAActivitiesRegister: FC<Props> = ({ parent }) => {
  const { addNotification } = useNotifications();
  const {
    hasPermission: canDeleteAssessmentActivities,
    loading: canDeleteAssessmentActivitiesLoading,
  } = useHasPermissionQuery(`delete:assessment_activity`, parent);
  const { t } = useTranslation(['common'], {
    keyPrefix: 'assessmentActivities',
  });

  const { setSelectedRCSAActivities, selectedRCSAActivities } =
    useActivitiesStore();

  const assessmentId = useGetGuidParam('assessmentId');

  const { data, loading } = useQuery(
    GetAssessmentRcsaActivitiesByParentIdDocument,
    {
      variables: {
        AssessmentId: assessmentId,
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          content: <>{error.message}</>,
        });
      },
    }
  );

  const tableProps = useGetCollectionTableProps(data?.assessment_activity);

  return (
    <ExpandableSection
      headerText={
        <div className={'flex space-x-2'}>
          <span className={'m-0'}>{t('rcsaActivityRegisterTitle')}</span>
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
          canDeleteAssessmentActivities && !canDeleteAssessmentActivitiesLoading
            ? 'multi'
            : undefined
        }
        selectedItems={selectedRCSAActivities}
        trackBy={'Id'}
        onSelectionChange={({ detail }) => {
          setSelectedRCSAActivities(detail.selectedItems);
        }}
        variant={'embedded'}
        loading={loading}
      />
    </ExpandableSection>
  );
};
