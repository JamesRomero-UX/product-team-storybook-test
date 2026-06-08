import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import Table from '@risksmart-app/components/src/table';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteModal from 'src/components/delete-modal/DeleteModal';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import TabHeader from 'src/components/tab-header';
import { useDeleteObligationImpact } from 'src/hooks/mutations';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { Permission } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useGetObligationImpactsByParentId } from '@/hooks/queries';
import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';

import ImpactModel from '../../../modals/ImpactModal';
import type { ImpactFields } from './config';
import { useGetCollectionTableProps } from './config';

type Props = {
  obligation: ObjectWithContributors;
};

const Tab: FC<Props> = ({ obligation }) => {
  useI18NSummaryHelpContent('impacts.tabHelp');
  const { t } = useTranslation(['common']);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const obligationId = useGetGuidParam('obligationId');
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [selectedImpacts, setSelectedImpacts] = useState<ImpactFields[]>([]);

  const [openImpactId, setOpenImpactId] = useState<string | undefined>();

  const {
    hasPermission: userCanDeleteImpacts,
    loading: userCanDeleteImpactsLoading,
  } = useHasPermissionQuery('delete:obligation_impact', obligation);

  const { deleteObligationImpacts, loading: deleteLoading } =
    useDeleteObligationImpact();

  const { data, loading, refetch } = useGetObligationImpactsByParentId({
    queryArgs: { parentId: obligationId },
  });

  const handleImpactModalOpen = () => {
    setIsEditOpen(true);
  };

  const handleImpactModalClose = async (saved: boolean) => {
    setOpenImpactId(undefined);
    setIsEditOpen(false);
    if (saved) {
      await refetch();
    }
  };

  const onDelete = useDeleteResultNotification({
    entityName: t('impacts.entity_name'),
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
    asyncAction: async () => {
      await deleteObligationImpacts({
        ids: selectedImpacts.map((impact) => impact.Id),
      });
      setSelectedImpacts([]);
      setIsDeleteModalVisible(false);
      await refetch();

      return true;
    },
  });

  const tableProps = useGetCollectionTableProps(
    data?.obligation_impact ?? [],
    (impact) => {
      setOpenImpactId(impact.Id);
      setIsEditOpen(true);
    },
    handleImpactModalOpen,
    obligation
  );

  return (
    <>
      <Table
        {...tableProps}
        selectionType={'multi'}
        selectedItems={selectedImpacts}
        trackBy={'Id'}
        onSelectionChange={({ detail }) => {
          setSelectedImpacts(detail.selectedItems);
        }}
        resizableColumns={true}
        header={
          <SpaceBetween size={'m'}>
            <TabHeader
              variant={'h2'}
              actions={
                <SpaceBetween direction={'horizontal'} size={'xs'}>
                  <Permission
                    permission={'delete:obligation_impact'}
                    parentObject={obligation}
                  >
                    <Button
                      formAction={'none'}
                      variant={'normal'}
                      disabled={
                        !selectedImpacts.length ||
                        !userCanDeleteImpacts ||
                        userCanDeleteImpactsLoading
                      }
                      onClick={() => setIsDeleteModalVisible(true)}
                    >
                      {t('impacts.delete_button')}
                    </Button>
                  </Permission>
                  <Permission
                    permission={'insert:obligation_impact'}
                    parentObject={obligation}
                  >
                    <Button
                      variant={'primary'}
                      formAction={'none'}
                      onClick={handleImpactModalOpen}
                    >
                      {t('impacts.create_new_button')}
                    </Button>
                  </Permission>
                </SpaceBetween>
              }
            >
              {t('impacts.tab_title')}
            </TabHeader>
          </SpaceBetween>
        }
        variant={'embedded'}
        loading={loading}
        loadingText={t('impacts.loading_message') ?? ''}
        sortingDisabled={false}
      />
      {isEditOpen && obligationId && (
        <ImpactModel
          Id={openImpactId}
          onDismiss={handleImpactModalClose}
          parentObligationId={obligationId}
        />
      )}
      <DeleteModal
        loading={deleteLoading}
        isVisible={isDeleteModalVisible}
        header={t('impacts.delete_modal_title')}
        onDelete={onDelete}
        onDismiss={() => {
          setOpenImpactId(undefined);
          setSelectedImpacts([]);
          setIsDeleteModalVisible(false);
        }}
      >
        {t('impacts.confirm_delete_message')}
      </DeleteModal>
    </>
  );
};

export default Tab;
