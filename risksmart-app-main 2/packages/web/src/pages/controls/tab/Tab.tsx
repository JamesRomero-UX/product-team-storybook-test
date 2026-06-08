import { useMutation } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { StyledStars02 } from '@risksmart-app/components/src/styled-stars-02/StyledStars02';
import Table from '@risksmart-app/components/src/table';
import {
  DeleteControlsDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { type FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ownerAndContributorIds } from 'src/components/form';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import TabHeader from 'src/components/tab-header';
import { AISuggestedRiskControls } from 'src/pages/controls/tab/suggested-risk-controls/AISuggestedRiskControls';
import type { ControlFormFieldData } from 'src/pages/controls/update/forms/controlSchema';
import LinkItemModal from 'src/pages/linked-items/modal/LinkItemModal';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { Permission } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import ActionsButton from '@/components/actions-button';
import type { ActionItem } from '@/components/actions-button/ActionsButton';
import { useSidePanelStore } from '@/components/side-panel/useSidePanelStore';
import { useInsertControl } from '@/hooks/mutations';
import { useGetControlsRegister } from '@/hooks/queries';
import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';
import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import { type CacheFieldName, evictField } from '@/utils/graphqlUtils';

import { useGetCollectionStatelessTableProps } from '../config';
import ControlCreateModal from '../modals/ControlCreateModal';
import type { ControlTableFields } from '../types';
import DeleteControlModal from './delete-modal/DeleteControlModal';

interface Props {
  parent: ObjectWithContributors;
  deleteCacheInvalidationFields?: CacheFieldName[];
}

const Tab: FC<Props> = ({ deleteCacheInvalidationFields = [], parent }) => {
  useI18NSummaryHelpContent('controls.tabHelp');
  const {
    hasPermission: canViewLinkedItems,
    loading: canViewLinkedItemsLoading,
  } = useHasPermissionQuery('read:linked_item', parent);
  const { t } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], { keyPrefix: 'controls' });
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const {
    hasPermission: canDeleteControls,
    loading: canDeleteControlsLoading,
  } = useHasPermissionQuery('delete:control', parent);
  const [selectedControls, setSelectedControls] = useState<
    ControlTableFields[]
  >([]);
  const { data, loading, refetch } = useGetControlsRegister({
    queryArgs: { parentId: parent.Id },
  });
  const { insertControl } = useInsertControl();
  const saveControl = async (data: ControlFormFieldData) => {
    await insertControl({
      DepartmentTypeIds: data.departments?.map((d) => d.DepartmentTypeId) || [],
      TagTypeIds: data.tags?.map((t) => t.TagTypeId) || [],
      Description: data.Description,
      Title: data.Title,
      Type: data.Type,
      ParentId: parent.Id,
      CustomAttributeData: data.CustomAttributeData ?? null,
      schedule: data.schedule,
      ...ownerAndContributorIds(data),
    });
    await refetch();
  };

  const [deleteControls, deleteResult] = useMutation(DeleteControlsDocument, {
    update: (cache) => {
      const fields: CacheFieldName[] = [
        'control',
        'linked_item',
        ...deleteCacheInvalidationFields,
      ];
      fields.forEach((field) => evictField(cache, field));
      refetch();
    },
  });
  const handleControlCreateOpen = () => {
    setIsCreateOpen(true);
  };
  const handleControlCreateClose = () => {
    setIsCreateOpen(false);
  };

  const onDelete = useDeleteResultNotification({
    asyncAction: async () => {
      await deleteControls({
        variables: { Ids: selectedControls.map((s) => s.Id) },
      });
      setSelectedControls([]);
      setIsDeleteModalVisible(false);

      return true;
    },
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
    entityName: st('entity_name'),
  });

  const [showLinkModal, setShowLinkModal] = useState(false);

  const controlIdsToExclude = useMemo(() => {
    return [parent.Id, ...(data?.control.map((ctrl) => ctrl.Id!) ?? [])];
  }, [data?.control, parent.Id]);

  const onLinkItemModalDismiss = async (saved?: boolean) => {
    if (saved) {
      await refetch();
    }
    setShowLinkModal(false);
  };

  const onAddLinkedControlClicked = () => {
    setShowLinkModal(true);
  };

  const isSuggestControlsEnabled = useIsModuleEnabled(
    'ai.subModules.suggested_controls'
  );

  const { open: openSidePanel } = useSidePanelStore();

  const actions: ActionItem[] = [];

  const { hasPermission: canAddControl, loading: canAddControlLoading } =
    useHasPermissionQuery('insert:control', parent);
  const { hasPermission: canLinkItem, loading: canLinkItemLoading } =
    useHasPermissionQuery('insert:linked_item');

  if (canAddControl && !canAddControlLoading) {
    actions.push({
      text: st('add_button'),
      id: 'addControlButton',
      onItemClick: handleControlCreateOpen,
    });
  }

  if (canAddControl && !canAddControlLoading && isSuggestControlsEnabled) {
    actions.push({
      text: st('suggest_controls'),
      id: 'suggestControlsButton',
      onItemClick: async () => {
        openSidePanel(
          'suggest_controls',
          <AISuggestedRiskControls
            riskId={parent.Id}
            onActionCompleted={refetch}
          ></AISuggestedRiskControls>,
          true,
          true
        );
      },
      iconSvg: <StyledStars02 asIcon />,
    });
  }

  if (canLinkItem && !canLinkItemLoading) {
    actions.push({
      text: st('add_linked_control'),
      id: 'linkControlButton',
      onItemClick: onAddLinkedControlClicked,
    });
  }

  const tableProps = useGetCollectionStatelessTableProps(
    handleControlCreateOpen,
    data?.control,
    <Permission permission={'insert:control'} parentObject={parent}>
      <Button formAction={'none'} onClick={handleControlCreateOpen}>
        {st('create_button')}
      </Button>
    </Permission>
  );

  return (
    <>
      <Table
        {...tableProps}
        selectionType={
          canDeleteControls && !canDeleteControlsLoading ? 'multi' : undefined
        }
        selectedItems={selectedControls}
        trackBy={'Id'}
        onSelectionChange={({ detail }) => {
          setSelectedControls(detail.selectedItems);
        }}
        resizableColumns={true}
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
                      {t('delete')}
                    </Button>
                  </Permission>
                  {actions.length >= 1 && (
                    <ActionsButton
                      key={'control_actions'}
                      buttonText={'Actions'}
                      items={actions}
                      testId={'control-actions'}
                    />
                  )}
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

      {isCreateOpen && (
        <ControlCreateModal
          onSave={saveControl}
          onDismiss={handleControlCreateClose}
        />
      )}

      <DeleteControlModal
        loading={deleteResult.loading}
        isVisible={isDeleteModalVisible}
        onDelete={onDelete}
        onDismiss={() => setIsDeleteModalVisible(false)}
        showUnlink={!!canViewLinkedItems && !canViewLinkedItemsLoading}
      />

      {showLinkModal && (
        <LinkItemModal
          onDismiss={onLinkItemModalDismiss}
          sourceId={parent.Id}
          excludeIds={controlIdsToExclude}
          restrictTypesTo={Parent_Type_Enum.Control}
        />
      )}
    </>
  );
};

export default Tab;
