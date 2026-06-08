import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import Table from '@risksmart-app/components/src/table';
import type { GetAcceptancesByParentRiskIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import DeleteModal from 'src/components/delete-modal/DeleteModal';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import TabHeader from 'src/components/tab-header';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { Permission } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useDeleteAcceptances } from '@/hooks/mutations/acceptance';
import { useGetAcceptancesByParentRiskId } from '@/hooks/queries';
import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import type { CollectionData } from '@/utils/collectionUtils';

import { useGetCollectionStatelessTableProps } from '../../../../acceptances/config';

type RiskAcceptanceFields = CollectionData<
  GetAcceptancesByParentRiskIdQuery['acceptance'][0]
>;

interface Props {
  parent: ObjectWithContributors;
}

const Tab: FC<Props> = ({ parent }) => {
  useI18NSummaryHelpContent('acceptances.help');
  const { t } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'acceptances',
  });
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const navigate = useNavigate();
  const [selectedAcceptances, setSelectedAcceptances] = useState<
    RiskAcceptanceFields[]
  >([]);

  const {
    hasPermission: canDeleteAcceptances,
    loading: canDeleteAcceptancesLoading,
  } = useHasPermissionQuery('delete:acceptance', parent);
  const riskId = useGetGuidParam('riskId');
  const { data, loading, refetch } = useGetAcceptancesByParentRiskId({
    queryArgs: { riskId },
  });

  const { deleteAcceptances, loading: deleteLoading } = useDeleteAcceptances();

  const handleAcceptanceOpen = () => {
    navigate('add');
  };

  const onDelete = useDeleteResultNotification({
    entityName: st('entity_name'),
    asyncAction: async () => {
      await deleteAcceptances(selectedAcceptances.map((s) => s.Id));
      await refetch();
      setSelectedAcceptances([]);
      setIsDeleteModalVisible(false);

      return true;
    },
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
  });

  const tableProps = useGetCollectionStatelessTableProps(data?.acceptance, {
    sortingColumn: 'ModifiedAtTimestamp',
    sortingDirection: 'desc',
  });

  return (
    <>
      <Table
        {...tableProps}
        selectionType={
          canDeleteAcceptances && !canDeleteAcceptancesLoading
            ? 'multi'
            : undefined
        }
        selectedItems={selectedAcceptances}
        trackBy={'Id'}
        onSelectionChange={({ detail }) => {
          setSelectedAcceptances(detail.selectedItems);
        }}
        header={
          <SpaceBetween size={'m'}>
            <TabHeader
              actions={
                <SpaceBetween direction={'horizontal'} size={'xs'}>
                  <Permission
                    permission={'delete:acceptance'}
                    parentObject={parent}
                  >
                    <Button
                      formAction={'none'}
                      variant={'normal'}
                      disabled={!selectedAcceptances.length}
                      onClick={() => setIsDeleteModalVisible(true)}
                    >
                      {t('delete')}
                    </Button>
                  </Permission>
                  <Permission
                    permission={'insert:acceptance'}
                    parentObject={parent}
                  >
                    <Button
                      variant={'primary'}
                      formAction={'none'}
                      onClick={handleAcceptanceOpen}
                    >
                      {st('create_button')}
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
        loading={loading}
      />
      <DeleteModal
        loading={deleteLoading}
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
