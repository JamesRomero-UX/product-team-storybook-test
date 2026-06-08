import { useMutation, useQuery } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import Table from '@risksmart-app/components/src/table';
import {
  DeleteImpactRatingsDocument,
  GetAppetitesGroupedByImpactDocument,
  GetImpactRatingsByImpactIdDocument,
  InsertChildImpactRatingsDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteModal from 'src/components/delete-modal/DeleteModal';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import TabHeader from 'src/components/tab-header';
import ImpactRatingModal from 'src/pages/impacts/ratings/ImpactRatingModal';
import { Permission } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import { evictField } from '@/utils/graphqlUtils';

import { useGetCollectionTableProps } from './config';
import type { ImpactRatingTableFields } from './types';

const Tab: FC = () => {
  useI18NSummaryHelpContent('impactRatings.tabHelp');
  const { t: st } = useTranslation(['common'], { keyPrefix: 'impactRatings' });
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isImpactRatingModalOpen, setIsImpactRatingModalOpen] = useState(false);
  const [openImpactRatingId, setOpenImpactRatingId] = useState<string>();
  const impactId = useGetGuidParam('impactId');

  const { addNotification } = useNotifications();

  const [selectedImpactRatings, setSelectedImpactRatings] = useState<
    ImpactRatingTableFields[]
  >([]);

  const {
    hasPermission: userCanDeleteImpactRating,
    loading: userCanDeleteImpactRatingLoading,
  } = useHasPermissionQuery('delete:impact_rating');
  const [insertImpactRating] = useMutation(InsertChildImpactRatingsDocument, {
    update: (cache) => evictField(cache, 'impact_rating'),
  });
  const [deleteImpactRatings, deleteResult] = useMutation(
    DeleteImpactRatingsDocument,
    {
      update: (cache) => evictField(cache, 'impact_rating'),
    }
  );

  const { data, loading, refetch } = useQuery(
    GetImpactRatingsByImpactIdDocument,
    {
      variables: {
        impactId: impactId,
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          content: <>{error.message}</>,
        });
      },
    }
  );

  const { data: impactAppetites, loading: loadingImpactAppetites } = useQuery(
    GetAppetitesGroupedByImpactDocument
  );

  const handleModalClose = () => {
    setOpenImpactRatingId(undefined);
    setIsImpactRatingModalOpen(false);
  };

  const tableProps = useGetCollectionTableProps(
    data?.impact_rating,
    impactAppetites?.impact,
    (impactRating) => {
      setIsImpactRatingModalOpen(true);
      setOpenImpactRatingId(impactRating.Id);
    },
    () => {
      setIsImpactRatingModalOpen(true);
    }
  );

  const onDelete = useDeleteResultNotification({
    entityName: st('entity_name'),
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
    asyncAction: async () => {
      await deleteImpactRatings({
        variables: {
          Ids: selectedImpactRatings.map((result) => result.Id),
        },
      });
      setSelectedImpactRatings([]);
      setIsDeleteModalVisible(false);

      return true;
    },
  });

  return (
    <>
      <Table
        {...tableProps}
        selectionType={
          userCanDeleteImpactRating && !userCanDeleteImpactRatingLoading
            ? 'multi'
            : undefined
        }
        selectedItems={selectedImpactRatings}
        trackBy={'Id'}
        onSelectionChange={({ detail }) => {
          setSelectedImpactRatings(detail.selectedItems);
        }}
        header={
          <SpaceBetween size={'m'}>
            <TabHeader
              variant={'h2'}
              actions={
                <SpaceBetween direction={'horizontal'} size={'xs'}>
                  <Permission permission={'delete:impact_rating'}>
                    <Button
                      formAction={'none'}
                      variant={'normal'}
                      disabled={
                        !selectedImpactRatings.length ||
                        !userCanDeleteImpactRating ||
                        userCanDeleteImpactRatingLoading
                      }
                      onClick={() => setIsDeleteModalVisible(true)}
                    >
                      {st('delete_button')}
                    </Button>
                  </Permission>
                  <Permission permission={'insert:impact_rating'}>
                    <Button
                      variant={'primary'}
                      formAction={'none'}
                      onClick={() => {
                        setIsImpactRatingModalOpen(true);
                      }}
                    >
                      {st('create_new_button')}
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
        loading={loading || loadingImpactAppetites}
        sortingDisabled={false}
      />
      {isImpactRatingModalOpen && (
        <ImpactRatingModal
          impactId={impactId}
          impactRatingId={openImpactRatingId}
          onDismiss={handleModalClose}
          onSaving={async (data) => {
            await insertImpactRating({
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
            await refetch();
          }}
        />
      )}
      <DeleteModal
        loading={deleteResult.loading}
        isVisible={isDeleteModalVisible}
        header={st('delete_modal_title')}
        onDelete={onDelete}
        onDismiss={() => {
          refetch();
          setSelectedImpactRatings([]);
          setIsDeleteModalVisible(false);
        }}
      >
        {st('confirm_delete_message')}
      </DeleteModal>
    </>
  );
};

export default Tab;
