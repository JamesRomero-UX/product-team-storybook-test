import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import Table from '@risksmart-app/components/src/table';
import { Appetite_Model_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteModal from 'src/components/delete-modal/DeleteModal';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import TabHeader from 'src/components/tab-header';
import { useAggregation } from 'src/hooks/useAggregation';
import type { AppetiteTableFields } from 'src/pages/appetites/types';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { Permission } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';
import { notEmpty } from 'src/utilityTypes';

import { useDeleteAppetites } from '@/hooks/mutations/appetite';
import { useGetAppetitesByRiskId, useGetRiskById } from '@/hooks/queries';
import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';

import { useGetCollectionStatelessTableProps } from './config';

interface Props {
  parent: ObjectWithContributors;
}

const Tab: FC<Props> = ({ parent }) => {
  useI18NSummaryHelpContent('appetites.help');
  const { t } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], { keyPrefix: 'appetites' });
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const [selectedAppetites, setSelectedAppetites] = useState<
    AppetiteTableFields[]
  >([]);
  const {
    hasPermission: canDeleteAppetites,
    loading: canDeleteAppetitesLoading,
  } = useHasPermissionQuery('delete:appetite', parent);
  const riskId = useGetGuidParam('riskId');
  const { data: risk } = useGetRiskById({ queryArgs: { riskId } });
  const {
    appetiteAggregation,
    enableTierTwoCascading,
    loading: aggregationLoading,
  } = useAggregation();
  const { data, loading, refetch } = useGetAppetitesByRiskId({
    queryArgs: { riskId },
  });

  const { deleteAppetites, loading: deleteLoading } = useDeleteAppetites();

  const onDelete = useDeleteResultNotification({
    entityName: st('entity_name'),
    asyncAction: async () => {
      await deleteAppetites(
        selectedAppetites.map((s) => s.Id).filter(notEmpty)
      );
      setSelectedAppetites([]);
      setIsDeleteModalVisible(false);
      refetch();

      return true;
    },
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
  });

  const tableProps = useGetCollectionStatelessTableProps(
    data?.appetite_parent,
    {
      sortingColumn: 'EffectiveDate',
      sortingDirection: 'desc',
    }
  );

  const parentTier = risk?.risk?.[0]?.Tier;

  const isDefaultAppetiteAggregation =
    appetiteAggregation === Appetite_Model_Enum.Default;
  const isAllowedParentTier =
    parentTier === 1 || (parentTier === 2 && enableTierTwoCascading);
  const canPerformAppetiteAction =
    isDefaultAppetiteAggregation || isAllowedParentTier;

  return (
    <>
      <Table
        {...tableProps}
        selectionType={
          canDeleteAppetites &&
          !canDeleteAppetitesLoading &&
          canPerformAppetiteAction
            ? 'multi'
            : undefined
        }
        selectedItems={selectedAppetites}
        trackBy={'Id'}
        onSelectionChange={({ detail }) => {
          setSelectedAppetites(detail.selectedItems);
        }}
        resizableColumns={true}
        header={
          <SpaceBetween size={'m'}>
            <TabHeader
              actions={
                canPerformAppetiteAction && (
                  <SpaceBetween direction={'horizontal'} size={'xs'}>
                    <Permission
                      permission={'delete:appetite'}
                      parentObject={parent}
                    >
                      <Button
                        formAction={'none'}
                        variant={'normal'}
                        disabled={!selectedAppetites.length}
                        onClick={() => setIsDeleteModalVisible(true)}
                      >
                        {t('delete')}
                      </Button>
                    </Permission>
                    <Permission
                      permission={'insert:appetite'}
                      parentObject={parent}
                    >
                      <Button
                        variant={'primary'}
                        formAction={'none'}
                        href={'add'}
                      >
                        {st('add_button')}
                      </Button>
                    </Permission>
                  </SpaceBetween>
                )
              }
            >
              {st('tab_title')}
            </TabHeader>
          </SpaceBetween>
        }
        variant={'embedded'}
        loading={loading || aggregationLoading}
        loadingText={st('loading_message')}
        sortingDisabled={false}
      />
      <DeleteModal
        isVisible={isDeleteModalVisible}
        loading={deleteLoading}
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
