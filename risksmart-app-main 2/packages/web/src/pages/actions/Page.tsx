import { useApolloClient } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useFileUpdate } from '@risksmart-app/components/src/file/useFileUpdate';
import Table from '@risksmart-app/components/src/table';
import type { RelationFile } from '@risksmart-app/shared/forms/shared-schemas/fileSchema';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ExportButton from 'src/components/export-button';
import { ownerAndContributorIds } from 'src/components/form';
import { useRibbonAndExport } from 'src/hooks/useRibbonAndExport';
import { PageLayout } from 'src/layouts';
import { useGetDefaultRibbonFilters } from 'src/pages/actions/useGetDefaultRibbonFilters';
import { Permission } from 'src/rbac/Permission';

import CustomisableRibbon from '@/components/customisable-ribbon/CustomisableRibbon';
import { useInsertChildAction } from '@/hooks/mutations/action/useInsertChildAction';
import { useGetActionsRegister } from '@/hooks/queries';
import { getCounter } from '@/utils/collectionUtils';
import { evictField } from '@/utils/graphqlUtils';

import ActionModal from './ActionModal';
import { useGetCollectionTableProps } from './config';
import type { ActionFormFieldData } from './update/forms/actionsSchema';

const Page: FC = () => {
  const [isAddActionOpen, setIsAddActionOpen] = useState(false);
  const { updateFiles } = useFileUpdate();
  const handleActionCreateClose = () => {
    setIsAddActionOpen(false);
  };
  const apolloClient = useApolloClient();
  const { t: st } = useTranslation(['common'], { keyPrefix: 'actions' });
  const title = st('register_title');
  const { data, loading, refetch } = useGetActionsRegister({ queryArgs: {} });

  const { insertChildAction } = useInsertChildAction();

  const saveAction = async (values: ActionFormFieldData) => {
    const { files } = values;
    const result = await insertChildAction({
      ...values,
      CustomAttributeData: values.CustomAttributeData || undefined,
      DepartmentTypeIds:
        values.departments?.map((d) => d.DepartmentTypeId) || [],
      TagTypeIds: values.tags?.map((t) => t.TagTypeId) || [],
      ...ownerAndContributorIds(values),
    });
    const actionId = result?.insertChildAction?.Id;
    if (!actionId) {
      throw new Error('Missing actionId');
    }
    await updateFiles({
      parentType: Parent_Type_Enum.Action,
      parentId: actionId,
      originalFiles: values?.files?.filter(
        (f) => !(f instanceof File)
      ) as RelationFile[],
      selectedFiles: files,
    });
    evictField(apolloClient.cache, 'action');
    evictField(apolloClient.cache, 'action_aggregate');
    evictField(apolloClient.cache, 'internal_audit_entity');
    refetch();
  };

  const tableProps = useGetCollectionTableProps(data?.action);
  const counter = getCounter(tableProps.totalItemsCount, loading);

  const { ribbonProps, ribbonExportProps } = useRibbonAndExport(
    useGetDefaultRibbonFilters
  );

  return (
    <PageLayout
      helpTranslationKey={'actions.registerHelp'}
      title={title}
      counter={counter}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <ExportButton
            tableProps={tableProps}
            entityLabel={title}
            {...ribbonExportProps}
          />
          <Permission
            permission={'insert:action'}
            canHaveAccessAsContributor={true}
          >
            <Button
              variant={'primary'}
              onClick={() => setIsAddActionOpen(true)}
            >
              {st('createNewButton')}
            </Button>
          </Permission>
        </SpaceBetween>
      }
    >
      <CustomisableRibbon
        items={tableProps.allItems}
        propertyFilterQuery={tableProps.propertyFilterQuery}
        onFilterQueryChanged={tableProps.actions.setPropertyFiltering}
        filteringProperties={tableProps.filteringProperties}
        filteringOptions={tableProps.propertyFilterProps.filteringOptions}
        parentType={Parent_Type_Enum.Action}
        {...ribbonProps}
      />
      <Table {...tableProps} loading={loading} />
      {isAddActionOpen && (
        <ActionModal
          onSaving={saveAction}
          onDismiss={handleActionCreateClose}
        />
      )}
    </PageLayout>
  );
};

export default Page;
