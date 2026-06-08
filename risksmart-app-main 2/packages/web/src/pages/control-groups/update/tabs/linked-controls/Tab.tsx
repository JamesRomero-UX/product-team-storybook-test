import { useMutation } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import Table from '@risksmart-app/components/src/table';
import { RemoveParentControlsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import RemovalModal from 'src/components/remove-modal';
import TabHeader from 'src/components/tab-header';
import AddControlModal from 'src/pages/control-groups/AddControlModal';
import { useGetCollectionTableProps } from 'src/pages/controls/config';
import type { ControlTableFields } from 'src/pages/controls/types';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { Permission } from 'src/rbac/Permission';

import { useGetControlsRegister } from '@/hooks/queries';
import { useRemoveResultNotification } from '@/hooks/useMutationResultNotification';
import { evictField } from '@/utils/graphqlUtils';

interface Props {
  parent: ObjectWithContributors;
}

const Tab: FC<Props> = ({ parent }) => {
  useI18NSummaryHelpContent('controls.tabHelp');
  const { t } = useTranslation(['common']);
  const { t: sst } = useTranslation(['common'], {
    keyPrefix: 'linkControl',
  });
  const [selectedControls, setSelectedControls] = useState<
    ControlTableFields[]
  >([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [removeControls] = useMutation(RemoveParentControlsDocument, {
    update: (cache) => {
      evictField(cache, 'control');
      evictField(cache, 'control_group');
    },
  });
  const { data, loading, refetch } = useGetControlsRegister({
    queryArgs: { parentId: parent.Id },
  });

  const openAddModal = () => setIsAddModalVisible(true);

  const tableProps = useGetCollectionTableProps(
    openAddModal,
    data?.control,
    <Permission permission={'insert:control'} parentObject={parent}>
      <Button formAction={'none'} onClick={openAddModal}>
        {sst('create_button')}
      </Button>
    </Permission>
  );

  const onRemove = useRemoveResultNotification({
    asyncAction: async () => {
      await removeControls({
        variables: {
          ParentId: parent.Id,
          ControlIds: selectedControls.map((s) => s.Id),
        },
      });
      setSelectedControls([]);
      refetch();
      setIsDeleteModalVisible(false);

      return true;
    },
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
    entityName: sst('entity_name'),
  });

  return (
    <>
      <Table
        {...tableProps}
        header={
          <SpaceBetween size={'m'}>
            <TabHeader
              actions={
                <SpaceBetween direction={'horizontal'} size={'xs'}>
                  <Permission
                    permission={'delete:control'}
                    parentObject={parent}
                  >
                    <Button
                      formAction={'none'}
                      variant={'normal'}
                      disabled={!selectedControls.length}
                      onClick={() => setIsDeleteModalVisible(true)}
                    >
                      {t('remove')}
                    </Button>
                  </Permission>
                  <Permission
                    permission={'insert:control'}
                    parentObject={parent}
                  >
                    <Button
                      variant={'primary'}
                      formAction={'none'}
                      onClick={() => setIsAddModalVisible(true)}
                    >
                      {sst('add_button')}
                    </Button>
                  </Permission>
                </SpaceBetween>
              }
            >
              {sst('tab_title')}
            </TabHeader>
          </SpaceBetween>
        }
        trackBy={'Id'}
        selectionType={'multi'}
        onSelectionChange={({ detail }) => {
          setSelectedControls(detail.selectedItems);
        }}
        selectedItems={selectedControls}
        variant={'embedded'}
        loading={loading}
        loadingText={sst('loading_message') ?? ''}
        sortingDisabled={false}
        resizableColumns={true}
      />
      <RemovalModal
        isVisible={isDeleteModalVisible}
        header={t('remove')}
        onRemove={onRemove}
        onDismiss={() => {
          setIsDeleteModalVisible(false);
        }}
      >
        {sst('confirm_remove_message')}
      </RemovalModal>
      {isAddModalVisible && (
        <AddControlModal
          excludedControlIds={data?.control.map((c) => c.Id)}
          onDismiss={() => {
            setIsAddModalVisible(false);
            refetch();
          }}
          controlGroupId={parent.Id}
        />
      )}
    </>
  );
};

export default Tab;
