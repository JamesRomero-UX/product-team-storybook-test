import { useCollection } from '@cloudscape-design/collection-hooks';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useFileUpdate } from '@risksmart-app/components/src/file/useFileUpdate';
import Table from '@risksmart-app/components/src/table';
import type { ParentIssueType } from '@risksmart-app/domain/src/types/consts';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteModal from 'src/components/delete-modal/DeleteModal';
import EmptyEntityCollection from 'src/components/empty-collection/EmptyEntityCollection';
import { ownerAndContributorIds } from 'src/components/form';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import TabHeader from 'src/components/tab-header';
import { useGetIssuesByParentId } from 'src/hooks/queries/issue/useGetIssuesByParentId';
import IssueModal from 'src/pages/issues/IssueModal';
import type { IssueFormDataFields } from 'src/pages/issues/update/forms/issueSchema';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { Permission } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useDeleteIssues, useInsertChildIssue } from '@/hooks/mutations';
import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import { IssueTypeMapping } from '@/utils/issueVariantUtils';

import type { IssueTableFields } from './issueTabConfig';
import { useGetIssueColumnDefinitions } from './issueTabConfig';

type Props = {
  parent: ObjectWithContributors;
  type: ParentIssueType;
};

const IssuesTab: FC<Props> = ({ parent, type }) => {
  const issueMapping = IssueTypeMapping[type];
  useI18NSummaryHelpContent(`${issueMapping.taxonomy}.tabHelp`);
  const { updateFiles } = useFileUpdate();
  const { t } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], {
    keyPrefix: issueMapping.taxonomy,
  });
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const issueColumnDefinitions = useGetIssueColumnDefinitions(type);
  const [selectedIssues, setSelectedIssues] = useState<IssueTableFields[]>([]);
  const { hasPermission: canDeleteIssues, loading: canDeleteIssuesLoading } =
    useHasPermissionQuery('delete:issue', parent);

  const { insertChildIssue } = useInsertChildIssue();

  const onSave = async (data: IssueFormDataFields) => {
    const { files } = data;
    const result = await insertChildIssue({
      ParentId: parent.Id,
      CustomAttributeData: data.CustomAttributeData || undefined,
      ...ownerAndContributorIds(data),
      DateIdentified: data.DateIdentified,
      DateOccurred: data.DateOccurred,
      TagTypeIds: data.tags?.map((t) => t.TagTypeId) || [],
      DepartmentTypeIds: data.departments?.map((d) => d.DepartmentTypeId) || [],
      Details: data.Details,
      Title: data.Title,
      Type: data.Type,
      IsExternalIssue: data.IsExternalIssue,
      ImpactsCustomer: data.ImpactsCustomer,
    });
    const issueId = result.insertChildIssue?.Id;
    if (!issueId) {
      throw new Error('Issue id not returned');
    }
    await updateFiles({
      parentType: Parent_Type_Enum.Issue,
      parentId: issueId,
      originalFiles: [], // This is always an insert so no original files
      selectedFiles: files,
    });
  };

  const { data, loading } = useGetIssuesByParentId({
    queryArgs: { parentId: parent.Id, type },
  });

  const { deleteIssues, loading: deleteLoading } = useDeleteIssues();

  const handleIssueModalOpen = () => {
    setIsCreateOpen(true);
  };

  const handleIssueModalClose = () => {
    setIsCreateOpen(false);
  };

  const onDelete = useDeleteResultNotification({
    entityName: st('entity_name'),
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
    asyncAction: async () => {
      await deleteIssues({
        Ids: selectedIssues.map((s) => s.Id),
      });
      setSelectedIssues([]);
      setIsDeleteModalVisible(false);

      return true;
    },
  });

  const labelledFields = useMemo<IssueTableFields[]>(() => {
    return (
      data?.issue.map((i) => ({
        ...i,
        TargetCloseDate: i.assessment?.TargetCloseDate ?? null,
        Severity: i.assessment?.Severity ?? null,
        Status: i.assessment?.Status ?? null,
      })) || []
    );
  }, [data?.issue]);

  const { items, collectionProps } = useCollection(labelledFields, {
    propertyFiltering: {
      filteringProperties: [],
      empty: (
        <EmptyEntityCollection
          entityLabel={st('entity_name')}
          action={
            <Permission permission={'insert:issue'} parentObject={parent}>
              <Button formAction={'none'} onClick={handleIssueModalOpen}>
                {st('add_button')}
              </Button>
            </Permission>
          }
        />
      ),
    },
    sorting: {
      defaultState: {
        sortingColumn: issueColumnDefinitions[4],
        isDescending: true,
      },
    },
  });

  return (
    <>
      <Table
        {...collectionProps}
        selectionType={
          canDeleteIssues && !canDeleteIssuesLoading ? 'multi' : undefined
        }
        selectedItems={selectedIssues}
        trackBy={'Id'}
        onSelectionChange={({ detail }) => {
          setSelectedIssues(detail.selectedItems);
        }}
        resizableColumns={true}
        header={
          <SpaceBetween size={'m'}>
            <TabHeader
              actions={
                <SpaceBetween direction={'horizontal'} size={'xs'}>
                  <Permission permission={'delete:issue'} parentObject={parent}>
                    <Button
                      formAction={'none'}
                      variant={'normal'}
                      disabled={!selectedIssues.length}
                      onClick={() => setIsDeleteModalVisible(true)}
                    >
                      {t('delete')}
                    </Button>
                  </Permission>
                  <Permission permission={'insert:issue'} parentObject={parent}>
                    <Button
                      variant={'primary'}
                      formAction={'none'}
                      onClick={handleIssueModalOpen}
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
        columnDefinitions={issueColumnDefinitions}
        items={items}
        loadingText={st('loading_message') ?? ''}
        sortingDisabled={false}
      />
      {isCreateOpen && (
        <IssueModal
          onDismiss={handleIssueModalClose}
          onSaving={onSave}
          issueType={type}
        />
      )}
      <DeleteModal
        loading={deleteLoading}
        isVisible={isDeleteModalVisible}
        header={t('delete')}
        onDelete={onDelete}
        onDismiss={() => {
          setSelectedIssues([]);
          setIsDeleteModalVisible(false);
        }}
      >
        {st('confirm_delete_message')}
      </DeleteModal>
    </>
  );
};

export default IssuesTab;
