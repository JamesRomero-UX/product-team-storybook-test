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
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { Permission } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useDeleteConsequences } from '@/hooks/mutations';
import { useGetConsequencesByParentIssueId } from '@/hooks/queries';
import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';

import type { ConsequencesFields } from './config';
import { useGetRegisterTableProps } from './config';
import ConsequenceModal from './ConsequenceModal';
import ConsequenceTotalsRibbon from './ConsequenceTotalsRibbon';

interface Props {
  parent: ObjectWithContributors;
}

const Tab: FC<Props> = ({ parent }) => {
  useI18NSummaryHelpContent('consequences.tabHelp');
  const { t } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'consequences',
  });
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const issueId = useGetGuidParam('issueId');

  const [selectedConsequences, setSelectedConsequences] = useState<
    ConsequencesFields[]
  >([]);
  const {
    hasPermission: canDeleteConsequences,
    loading: canDeleteConsequencesLoading,
  } = useHasPermissionQuery('delete:consequence', parent);
  const { deleteConsequences, loading: deleteLoading } =
    useDeleteConsequences();

  const [consequenceId, setConsequenceId] = useState<string | undefined>();

  const { data, loading, refetch } = useGetConsequencesByParentIssueId({
    queryArgs: { parentIssueId: issueId },
  });

  const handleConsequencesModalOpen = () => {
    setIsEditOpen(true);
  };

  const handleConsequencesModalClose = (saved?: boolean) => {
    setConsequenceId(undefined);
    setIsEditOpen(false);
    if (saved) {
      refetch();
    }
  };

  const tableProps = useGetRegisterTableProps(
    data?.consequence ?? [],
    (consequence) => {
      setConsequenceId(consequence.Id);
      handleConsequencesModalOpen();
    },
    handleConsequencesModalOpen,
    parent
  );
  const onDelete = useDeleteResultNotification({
    entityName: st('entity_name'),
    asyncAction: async () => {
      await deleteConsequences(selectedConsequences.map((s) => s.Id));

      setSelectedConsequences([]);
      setIsDeleteModalVisible(false);
      refetch();

      return true;
    },
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
  });

  return (
    <>
      <Table
        {...tableProps}
        selectionType={
          canDeleteConsequences && !canDeleteConsequencesLoading
            ? 'multi'
            : undefined
        }
        selectedItems={selectedConsequences}
        trackBy={'Id'}
        onSelectionChange={({ detail }) => {
          setSelectedConsequences(detail.selectedItems);
        }}
        resizableColumns={true}
        header={
          <SpaceBetween size={'m'}>
            <TabHeader
              actions={
                <SpaceBetween direction={'horizontal'} size={'xs'}>
                  <Permission
                    permission={'delete:consequence'}
                    parentObject={parent}
                  >
                    <Button
                      formAction={'none'}
                      variant={'normal'}
                      disabled={!selectedConsequences.length}
                      onClick={() => setIsDeleteModalVisible(true)}
                    >
                      {t('delete')}
                    </Button>
                  </Permission>
                  <Permission
                    permission={'insert:consequence'}
                    parentObject={parent}
                  >
                    <Button
                      variant={'primary'}
                      formAction={'none'}
                      onClick={handleConsequencesModalOpen}
                    >
                      {st('add_button')}
                    </Button>
                  </Permission>
                </SpaceBetween>
              }
            >
              {st('tab_title')}
            </TabHeader>
            <ConsequenceTotalsRibbon consequences={data?.consequence ?? []} />
          </SpaceBetween>
        }
        variant={'embedded'}
        loading={loading}
        loadingText={st('loading_message') ?? ''}
        sortingDisabled={false}
      />
      {isEditOpen && (
        <ConsequenceModal
          consequenceId={consequenceId}
          onDismiss={handleConsequencesModalClose}
          issueId={issueId}
        />
      )}
      <DeleteModal
        loading={deleteLoading}
        isVisible={isDeleteModalVisible}
        header={t('delete')}
        onDelete={onDelete}
        onDismiss={() => {
          setSelectedConsequences([]);
          setIsDeleteModalVisible(false);
        }}
      >
        {st('confirm_delete_message')}
      </DeleteModal>
    </>
  );
};

export default Tab;
