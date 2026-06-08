import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import Table from '@risksmart-app/components/src/table';
import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteModal from 'src/components/delete-modal/DeleteModal';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import TabHeader from 'src/components/tab-header';
import { useDeleteIssueUpdates } from 'src/hooks/mutations/issue-update';
import { useGetIssueUpdateRegister } from 'src/hooks/queries/issue-update/useGetIssueUpdateRegister';
import IssueUpdateModal from 'src/pages/issue-updates/IssueUpdateModal';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { Permission } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';

import type { IssueUpdateTableFields } from './config';
import { useGetCollectionTableProps } from './config';

interface Props {
  parent: ObjectWithContributors;
}

const Tab: FC<Props> = ({ parent }) => {
  useI18NSummaryHelpContent('issueUpdates.tabHelp');
  const { t } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'actionUpdates', // could make this into an "updates" section?
  });
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const issueId = useGetGuidParam('issueId');
  const [selectedIssueUpdates, setSelectedIssueUpdates] = useState<
    IssueUpdateTableFields[]
  >([]);
  const {
    hasPermission: canDeleteIssueUpdates,
    loading: canDeleteIssueUpdatesLoading,
  } = useHasPermissionQuery('delete:issue_update', parent);

  const { deleteIssueUpdates, loading: deleteLoading } =
    useDeleteIssueUpdates();

  const [issueUpdateId, setIssueUpdateId] = useState<string | undefined>();

  const { data, loading, refetch } = useGetIssueUpdateRegister({
    queryArgs: { issueId },
  });

  const handleIssueUpdateModalOpen = () => {
    setIsEditOpen(true);
  };

  const handleIssueUpdateModalClose = () => {
    setIssueUpdateId(undefined);
    setIsEditOpen(false);
    refetch();
  };

  const onDelete = useDeleteResultNotification({
    entityName: st('entity_name'),
    asyncAction: async () => {
      await deleteIssueUpdates({
        ids: selectedIssueUpdates.map((s) => s.Id),
      });
      setSelectedIssueUpdates([]);
      setIsDeleteModalVisible(false);

      return true;
    },
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
  });

  const labelledFields = useMemo<IssueUpdateTableFields[]>(() => {
    return (
      data?.issue_update.map((iu) => ({
        ...iu,
        CreatedByUserName: iu.createdByUser?.FriendlyName ?? null,
      })) || []
    );
  }, [data?.issue_update]);

  const tableProps = useGetCollectionTableProps(
    labelledFields,
    (issueUpdate) => {
      setIssueUpdateId(issueUpdate.Id);
      handleIssueUpdateModalOpen();
    },
    handleIssueUpdateModalOpen,
    parent
  );

  return (
    <>
      <Table
        {...tableProps}
        selectionType={
          canDeleteIssueUpdates && !canDeleteIssueUpdatesLoading
            ? 'multi'
            : undefined
        }
        selectedItems={selectedIssueUpdates}
        trackBy={'Id'}
        onSelectionChange={({ detail }) => {
          setSelectedIssueUpdates(detail.selectedItems);
        }}
        resizableColumns={true}
        header={
          <SpaceBetween size={'m'}>
            <TabHeader
              actions={
                <SpaceBetween direction={'horizontal'} size={'xs'}>
                  <Permission
                    permission={'delete:issue_update'}
                    parentObject={parent}
                  >
                    <Button
                      formAction={'none'}
                      variant={'normal'}
                      disabled={!selectedIssueUpdates.length}
                      onClick={() => setIsDeleteModalVisible(true)}
                    >
                      {t('delete')}
                    </Button>
                  </Permission>
                  <Permission
                    permission={'insert:issue_update'}
                    parentObject={parent}
                  >
                    <Button
                      variant={'primary'}
                      formAction={'none'}
                      onClick={handleIssueUpdateModalOpen}
                    >
                      {st('add_button')}
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
        loadingText={st('loading_message') ?? ''}
        sortingDisabled={false}
      />
      {isEditOpen && (
        <IssueUpdateModal
          parent={parent}
          issueUpdateId={issueUpdateId}
          onDismiss={handleIssueUpdateModalClose}
        />
      )}
      <DeleteModal
        loading={deleteLoading}
        isVisible={isDeleteModalVisible}
        header={t('delete')}
        onDelete={onDelete}
        onDismiss={() => {
          setSelectedIssueUpdates([]);
          setIsDeleteModalVisible(false);
        }}
      >
        {st('confirm_delete_message')}
      </DeleteModal>
    </>
  );
};

export default Tab;
