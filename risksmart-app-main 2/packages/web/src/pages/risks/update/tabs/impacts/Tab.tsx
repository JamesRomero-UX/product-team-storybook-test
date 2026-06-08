import { useMutation, useQuery } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import Table from '@risksmart-app/components/src/table';
import {
  DeleteImpactRatingsDocument,
  GetActiveAppetitesByParentIdDocument,
  GetImpactRatingsByRatedItemIdDocument,
  InsertChildImpactRatingsDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteModal from 'src/components/delete-modal/DeleteModal';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import TabHeader from 'src/components/tab-header';
import ImpactRatingModal from 'src/pages/impacts/ratings/ImpactRatingModal';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { Permission } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import { evictField } from '@/utils/graphqlUtils';

import InsertMultipleImpactRatingsModal from '../../../../impacts/ratings/InsertMultipleImpactRatingsModal';
import { useGetCollectionTableProps } from './config';
import type { ImpactRatingTableFields } from './types';

interface Props {
  parentRisk: ObjectWithContributors;
}

const Tab: FC<Props> = ({ parentRisk }) => {
  useI18NSummaryHelpContent('impactRatings.tabHelp');
  const { t } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'impactRatings',
  });
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditMultipleOpen, setIsEditMultipleOpen] = useState(false);
  const [ratingId, setRatingId] = useState<string | undefined>(undefined);
  const [selectedRatings, setSelectedRatings] = useState<
    ImpactRatingTableFields[]
  >([]);

  const { hasPermission: canDeleteRatings, loading: canDeleteRatingsLoading } =
    useHasPermissionQuery('delete:impact_rating', parentRisk);

  const { addNotification } = useNotifications();
  const { data, loading, refetch } = useQuery(
    GetImpactRatingsByRatedItemIdDocument,
    {
      variables: {
        ratedItemId: parentRisk.Id,
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          content: <>{error.message}</>,
        });
      },
      fetchPolicy: 'no-cache',
    }
  );

  const { data: appetiteData, loading: loadingAppetites } = useQuery(
    GetActiveAppetitesByParentIdDocument,
    {
      variables: {
        parentId: parentRisk.Id,
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          content: <>{error.message}</>,
        });
      },
    }
  );

  const [deleteRatings, deleteResult] = useMutation(
    DeleteImpactRatingsDocument,
    {
      update: (cache) => evictField(cache, 'impact_rating'),
    }
  );

  const handleRatingsOpen = () => {
    setIsEditMultipleOpen(true);
  };

  const handleRatingCreateClose = () => {
    setRatingId(undefined);
    setIsEditOpen(false);
  };

  const handleMultipleRatingsCreateClose = () => {
    setRatingId(undefined);
    setIsEditMultipleOpen(false);
  };

  const [insertRatings] = useMutation(InsertChildImpactRatingsDocument, {
    update: (cache) => {
      evictField(cache, 'impact_rating');
      refetch();
    },
  });

  const onDelete = useDeleteResultNotification({
    entityName: st('entity_name'),
    asyncAction: async () => {
      await deleteRatings({
        variables: { Ids: selectedRatings.map((s) => s.Id) },
      });
      setSelectedRatings([]);
      setIsDeleteModalVisible(false);

      return true;
    },
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
  });

  const tableProps = useGetCollectionTableProps(
    parentRisk,
    data,
    appetiteData?.appetite_parent.map((a) => a.appetite),
    ({ Id }) => {
      setRatingId(Id);
      setIsEditOpen(true);
    },
    handleRatingsOpen
  );

  return (
    <>
      <Table
        {...tableProps}
        selectionType={
          canDeleteRatings && !canDeleteRatingsLoading ? 'multi' : undefined
        }
        selectedItems={selectedRatings}
        trackBy={'Id'}
        onSelectionChange={({ detail }) => {
          setSelectedRatings(detail.selectedItems);
        }}
        resizableColumns={true}
        header={
          <SpaceBetween size={'m'}>
            <TabHeader
              actions={
                <SpaceBetween direction={'horizontal'} size={'xs'}>
                  <Permission
                    permission={'delete:impact_rating'}
                    parentObject={parentRisk}
                  >
                    <Button
                      formAction={'none'}
                      variant={'normal'}
                      disabled={!selectedRatings.length}
                      onClick={() => setIsDeleteModalVisible(true)}
                    >
                      {t('delete')}
                    </Button>
                  </Permission>
                  <Permission
                    permission={'insert:impact_rating'}
                    parentObject={parentRisk}
                  >
                    <Button
                      variant={'primary'}
                      formAction={'none'}
                      onClick={handleRatingsOpen}
                    >
                      {t('impactRatingsMultiple.create_new_button')}
                    </Button>
                  </Permission>
                </SpaceBetween>
              }
            >
              {st('tab_title')}
            </TabHeader>
          </SpaceBetween>
        }
        variant={'embedded'}
        loading={loading || loadingAppetites}
        sortingDisabled={false}
      />
      {isEditOpen && (
        <ImpactRatingModal
          ratedItemId={parentRisk.Id}
          impactRatingId={ratingId}
          onSaving={async (data) => {
            await insertRatings({
              variables: {
                ...data,
                CompletedBy: data.CompletedBy?.value,
                Ratings: [
                  {
                    ImpactId: data.ImpactId,
                    Rating: data.Rating,
                  },
                ],
              },
            });
          }}
          onDismiss={handleRatingCreateClose}
        />
      )}
      {isEditMultipleOpen && (
        <InsertMultipleImpactRatingsModal
          impactRatingId={ratingId}
          onSaving={async (data) => {
            await insertRatings({
              variables: {
                ...data,
                CompletedBy: data.CompletedBy?.value,
                RatedItemId: parentRisk.Id,
                TestDate: data.TestDate,
                CustomAttributeData: data.CustomAttributeData,
                Ratings: data.Ratings,
              },
            });
          }}
          onDismiss={handleMultipleRatingsCreateClose}
        />
      )}
      <DeleteModal
        loading={deleteResult.loading}
        isVisible={isDeleteModalVisible}
        header={t('delete')}
        onDelete={onDelete}
        onDismiss={() => setIsDeleteModalVisible(false)}
      >
        {st('confirm_delete_message')}
      </DeleteModal>
    </>
  );
};

export default Tab;
