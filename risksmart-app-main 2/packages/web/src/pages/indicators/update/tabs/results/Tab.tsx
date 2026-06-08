import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import Table from '@risksmart-app/components/src/table';
import type { GetIndicatorByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { Indicator_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteModal from 'src/components/delete-modal/DeleteModal';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import TabHeader from 'src/components/tab-header';
import IndicatorResultModel from 'src/pages/indicators/modals/IndicatorResultModal';
import { Permission } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useDeleteIndicatorResults } from '@/hooks/mutations/indicator-result';
import { useGetIndicatorResultsByIndicatorId } from '@/hooks/queries';
import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';

import type { IndicatorResultFields } from './config';
import { useGetCollectionTableProps } from './config';
import ResultsChart from './ResultsChart';

interface Props {
  indicatorType: Indicator_Type_Enum;
  parent: GetIndicatorByIdQuery['indicator'][number];
}

const Tab: FC<Props> = ({ indicatorType, parent }) => {
  useI18NSummaryHelpContent('indicator_results.tabHelp');
  const { t } = useTranslation(['common'], { keyPrefix: 'indicator_results' });
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const indicatorId = useGetGuidParam('indicatorId');

  const [isEditOpen, setIsEditOpen] = useState(false);

  const [selectedIndicatorResults, setSelectedIndicatorResults] = useState<
    IndicatorResultFields[]
  >([]);

  const [openIndicatorResultId, setOpenIndicatorResultId] = useState<
    string | undefined
  >();

  const {
    hasPermission: userCanDeleteIndicatorResult,
    loading: userCanDeleteIndicatorResultLoading,
  } = useHasPermissionQuery('delete:indicator_result', parent);

  const {
    deleteIndicatorResults: deleteIndicatorResult,
    loading: deleteLoading,
  } = useDeleteIndicatorResults();

  const { data, loading, refetch } = useGetIndicatorResultsByIndicatorId({
    queryArgs: { indicatorId },
  });

  const handleModalOpen = () => {
    setIsEditOpen(true);
  };

  const handleModalClose = (saved: boolean) => {
    setOpenIndicatorResultId(undefined);
    setIsEditOpen(false);
    if (saved) {
      refetch();
    }
  };

  const tableProps = useGetCollectionTableProps(
    parent,
    data,
    (indicatorResult) => {
      setOpenIndicatorResultId(indicatorResult.Id);
      setIsEditOpen(true);
    },
    handleModalOpen
  );

  const onDelete = useDeleteResultNotification({
    entityName: t('entity_name'),
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
    asyncAction: async () => {
      await deleteIndicatorResult({
        ids: selectedIndicatorResults.map((result) => result.Id),
      });
      setSelectedIndicatorResults([]);
      setIsDeleteModalVisible(false);

      return true;
    },
  });

  return (
    <>
      <Table
        {...tableProps}
        selectionType={
          userCanDeleteIndicatorResult && !userCanDeleteIndicatorResultLoading
            ? 'multi'
            : undefined
        }
        selectedItems={selectedIndicatorResults}
        trackBy={'Id'}
        onSelectionChange={({ detail }) => {
          setSelectedIndicatorResults(detail.selectedItems);
        }}
        resizableColumns={true}
        header={
          <SpaceBetween size={'m'}>
            <TabHeader
              variant={'h2'}
              actions={
                <SpaceBetween direction={'horizontal'} size={'xs'}>
                  <Permission
                    permission={'delete:indicator_result'}
                    parentObject={parent}
                  >
                    <Button
                      formAction={'none'}
                      variant={'normal'}
                      disabled={
                        !selectedIndicatorResults.length ||
                        !userCanDeleteIndicatorResult ||
                        userCanDeleteIndicatorResultLoading
                      }
                      onClick={() => setIsDeleteModalVisible(true)}
                    >
                      {t('delete_button')}
                    </Button>
                  </Permission>
                  <Permission
                    permission={'insert:indicator_result'}
                    parentObject={parent}
                  >
                    <Button
                      variant={'primary'}
                      formAction={'none'}
                      onClick={handleModalOpen}
                    >
                      {t('create_new_button')}
                    </Button>
                  </Permission>
                </SpaceBetween>
              }
            >
              {t('tab_title')}
            </TabHeader>

            {indicatorType === Indicator_Type_Enum.Number && (
              <ResultsChart
                data={data?.indicator_result || []}
                upperAppetite={parent.UpperAppetiteNum}
                lowerAppetite={parent.LowerAppetiteNum}
                upperTolerance={parent.UpperToleranceNum}
                lowerTolerance={parent.LowerToleranceNum}
              />
            )}
          </SpaceBetween>
        }
        variant={'embedded'}
        loading={loading}
        loadingText={t('loading_message') ?? ''}
        sortingDisabled={false}
      />
      {isEditOpen && indicatorId && (
        <IndicatorResultModel
          Id={openIndicatorResultId}
          onDismiss={handleModalClose}
          parentIndicatorId={indicatorId}
          parentIndicatorType={indicatorType}
          indicator={parent}
        />
      )}
      <DeleteModal
        loading={deleteLoading}
        isVisible={isDeleteModalVisible}
        header={t('delete_modal_title')}
        onDelete={onDelete}
        onDismiss={() => {
          refetch();
          setOpenIndicatorResultId(undefined);
          setSelectedIndicatorResults([]);
          setIsDeleteModalVisible(false);
        }}
      >
        {t('confirm_delete_message')}
      </DeleteModal>
    </>
  );
};

export default Tab;
