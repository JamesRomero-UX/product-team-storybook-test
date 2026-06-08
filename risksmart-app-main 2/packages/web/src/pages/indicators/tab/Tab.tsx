import { useMutation } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useFileUpdate } from '@risksmart-app/components/src/file/useFileUpdate';
import Table from '@risksmart-app/components/src/table';
import {
  InsertIndicatorDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteModal from 'src/components/delete-modal/DeleteModal';
import { ownerAndContributorIds } from 'src/components/form';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import TabHeader from 'src/components/tab-header';
import { useGetIndicatorsByParentId } from 'src/hooks/queries';
import type { IndicatorFormDataFields } from 'src/pages/indicators/forms/indicatorSchema';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { Permission } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useDeleteIndicators } from '@/hooks/mutations/indicator/useDeleteIndicators';
import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import { evictField } from '@/utils/graphqlUtils';

import CreateIndicatorModal from '../modals/CreateIndicatorModal';
import { useGetCollectionTableProps } from './config';
import type { IndicatorTableFields } from './types';

interface Props {
  parent: ObjectWithContributors;
}

const Tab: FC<Props> = ({ parent }) => {
  useI18NSummaryHelpContent('indicators.tabHelp');
  const { updateFiles } = useFileUpdate();
  const { t: st } = useTranslation(['common'], { keyPrefix: 'indicators' });
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const {
    hasPermission: canDeleteIndicators,
    loading: canDeleteIndicatorsLoading,
  } = useHasPermissionQuery('delete:indicator', parent);
  const [selected, setSelected] = useState<IndicatorTableFields[]>([]);

  const { data, loading, refetch } = useGetIndicatorsByParentId({
    queryArgs: { parentId: parent.Id },
  });

  const { deleteIndicators, loading: deleteLoading } = useDeleteIndicators();
  const handleCreateOpen = () => {
    setIsCreateOpen(true);
  };
  const handleCreateClose = () => {
    setIsCreateOpen(false);
  };

  const onDelete = useDeleteResultNotification({
    asyncAction: async () => {
      await deleteIndicators(selected.map((s) => s.Id));
      setSelected([]);
      setIsDeleteModalVisible(false);
      refetch();

      return true;
    },
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
    entityName: st('entity_name'),
  });

  const [mutate] = useMutation(InsertIndicatorDocument, {
    update: (cache) => {
      evictField(cache, 'control');
      evictField(cache, 'risk');
    },
  });

  const save = async (data: IndicatorFormDataFields) => {
    const { files, ...rest } = data;
    const result = await mutate({
      variables: {
        object: {
          ParentId: parent.Id,
          CustomAttributeData: data.CustomAttributeData || undefined,
          DepartmentTypeIds:
            rest.departments?.map((d) => d.DepartmentTypeId) || [],
          TagTypeIds: rest.tags?.map((t) => t.TagTypeId) || [],
          Description: rest.Description,
          LowerAppetiteNum:
            rest.Type == 'number' ? rest.LowerAppetiteNum : undefined,
          LowerToleranceNum:
            rest.Type == 'number' ? rest.LowerToleranceNum : undefined,
          TargetValueTxt:
            rest.Type === 'text' ? rest.TargetValueTxt : undefined,

          Title: rest.Title,
          Type: rest.Type,
          Unit: rest.Unit,
          UpperAppetiteNum:
            rest.Type == 'number' ? rest.UpperAppetiteNum : undefined,
          UpperToleranceNum:
            rest.Type == 'number' ? rest.UpperToleranceNum : undefined,
          schedule: rest.schedule,
          ...ownerAndContributorIds(data),
        },
      },
    });
    const indicatorId = result.data?.insertChildIndicator?.Id;
    if (!indicatorId) {
      throw new Error('Missing indicator id');
    }
    await updateFiles({
      parentType: Parent_Type_Enum.Indicator,
      parentId: indicatorId,
      originalFiles: [],
      selectedFiles: files,
    });
    refetch();
  };

  const tableProps = useGetCollectionTableProps(
    data?.indicator,
    handleCreateOpen,
    parent
  );

  return (
    <>
      <Table
        {...tableProps}
        selectionType={
          canDeleteIndicators && !canDeleteIndicatorsLoading
            ? 'multi'
            : undefined
        }
        selectedItems={selected}
        trackBy={'Id'}
        onSelectionChange={({ detail }) => {
          setSelected(detail.selectedItems);
        }}
        header={
          <SpaceBetween size={'m'}>
            <TabHeader
              actions={
                <SpaceBetween direction={'horizontal'} size={'xs'}>
                  <Permission
                    permission={'delete:indicator'}
                    parentObject={parent}
                  >
                    <Button
                      formAction={'none'}
                      variant={'normal'}
                      disabled={!selected.length}
                      onClick={() => setIsDeleteModalVisible(true)}
                    >
                      {st('delete_button')}
                    </Button>
                  </Permission>
                  <Permission
                    permission={'insert:indicator'}
                    parentObject={parent}
                  >
                    <Button
                      variant={'primary'}
                      formAction={'none'}
                      onClick={handleCreateOpen}
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
        loading={loading}
        loadingText={st('loading_message') ?? ''}
        sortingDisabled={false}
      />

      {isCreateOpen && (
        <CreateIndicatorModal onSave={save} onDismiss={handleCreateClose} />
      )}

      <DeleteModal
        loading={deleteLoading}
        isVisible={isDeleteModalVisible}
        header={st('delete_title')}
        onDelete={onDelete}
        onDismiss={() => setIsDeleteModalVisible(false)}
      >
        {st('confirm_delete_message')}
      </DeleteModal>
    </>
  );
};

export default Tab;
