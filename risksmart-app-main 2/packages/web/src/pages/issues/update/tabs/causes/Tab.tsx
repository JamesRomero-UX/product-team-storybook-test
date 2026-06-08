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

import { useDeleteCauses } from '@/hooks/mutations/cause';
import { useGetCausesByParentIssueId } from '@/hooks/queries';
import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';

import CauseModal from './CauseModal';
import type { CausesFields } from './config';
import { useGetRegisterTableProps } from './config';

const translationKeyPrefix = 'causes';
type ItemType = CausesFields;

interface Props {
  parent: ObjectWithContributors;
}

const Tab: FC<Props> = ({ parent }) => {
  useI18NSummaryHelpContent('causes.tabHelp');
  const { t } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], {
    keyPrefix: translationKeyPrefix,
  });
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [causeId, setCauseId] = useState<string | undefined>();
  const issueId = useGetGuidParam('issueId');
  const [selectedCauses, setSelectedCause] = useState<ItemType[]>([]);
  const { deleteCauses, loading: deleteLoading } = useDeleteCauses();
  const { hasPermission: canDeleteCauses, loading: canDeleteCausesLoading } =
    useHasPermissionQuery('delete:cause', parent);
  const { data, loading, refetch } = useGetCausesByParentIssueId({
    queryArgs: { parentIssueId: issueId },
  });

  const handleCauseModalOpen = () => {
    setIsEditorOpen(true);
  };

  const handleCauseModalClose = (saved?: boolean) => {
    setCauseId(undefined);
    setIsEditorOpen(false);
    if (saved) {
      refetch();
    }
  };

  const tableProps = useGetRegisterTableProps(
    data?.cause || [],
    (cause) => {
      setCauseId(cause.Id);
      handleCauseModalOpen();
    },
    handleCauseModalOpen,
    parent
  );

  const onDelete = useDeleteResultNotification({
    entityName: st('entity_name'),
    asyncAction: async () => {
      await deleteCauses(selectedCauses.map((c) => c.Id));

      setSelectedCause([]);
      setIsDeleteModalVisible(false);
      refetch();

      return true;
    },
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
  });

  if (!issueId) {
    throw new Error('No issue ID provided');
  }

  return (
    <>
      <Table
        {...tableProps}
        selectionType={
          canDeleteCauses && !canDeleteCausesLoading ? 'multi' : undefined
        }
        selectedItems={selectedCauses}
        trackBy={'Id'}
        onSelectionChange={({ detail }) => {
          setSelectedCause(detail.selectedItems);
        }}
        header={
          <SpaceBetween size={'m'}>
            <TabHeader
              actions={
                <SpaceBetween direction={'horizontal'} size={'xs'}>
                  <Permission permission={'delete:cause'} parentObject={parent}>
                    <Button
                      formAction={'none'}
                      variant={'normal'}
                      disabled={!selectedCauses.length}
                      onClick={() => setIsDeleteModalVisible(true)}
                    >
                      {t('delete')}
                    </Button>
                  </Permission>
                  <Permission permission={'insert:cause'} parentObject={parent}>
                    <Button
                      variant={'primary'}
                      formAction={'none'}
                      onClick={handleCauseModalOpen}
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
      {isEditorOpen && (
        <CauseModal
          causeId={causeId}
          onDismiss={handleCauseModalClose}
          issueId={issueId}
        />
      )}
      <DeleteModal
        loading={deleteLoading}
        isVisible={isDeleteModalVisible}
        header={t('delete')}
        onDelete={onDelete}
        onDismiss={() => {
          setSelectedCause([]);
          setIsDeleteModalVisible(false);
        }}
      >
        {st('confirm_delete_message')}
      </DeleteModal>
    </>
  );
};

export default Tab;
