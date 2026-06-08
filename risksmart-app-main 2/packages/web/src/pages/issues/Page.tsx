import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useFileUpdate } from '@risksmart-app/components/src/file/useFileUpdate';
import Table from '@risksmart-app/components/src/table';
import type { ParentIssueType } from '@risksmart-app/domain/src/types/consts';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ExportButton from 'src/components/export-button';
import { ownerAndContributorIds } from 'src/components/form';
import { PageLayout } from 'src/layouts';
import type { IssueFormDataFields } from 'src/pages/issues/update/forms/issueSchema';
import { Permission } from 'src/rbac/Permission';

import CustomisableRibbon from '@/components/customisable-ribbon/CustomisableRibbon';
import { useInsertChildIssue } from '@/hooks/mutations';
import { useGetIssueRegister } from '@/hooks/queries';
import { useRibbonAndExport } from '@/hooks/useRibbonAndExport';
import { getCounter } from '@/utils/collectionUtils';
import { IssueTypeMapping } from '@/utils/issueVariantUtils';

import { useGetRegisterTableProps } from './config';
import IssueModal from './IssueModal';
import { useGetDefaultRibbonFilters } from './useGetDefaultRibbonFilters';
type Props = {
  issueType: ParentIssueType;
};

const Page: FC<Props> = ({ issueType }) => {
  const { t } = useTranslation(['common'], {});
  const issueTypeMap = IssueTypeMapping[issueType];
  const { t: st } = useTranslation(['common'], {
    keyPrefix: issueTypeMap.taxonomy,
  });
  const { updateFiles } = useFileUpdate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { data, loading } = useGetIssueRegister({
    queryArgs: { issueType },
  });

  const tableProps = useGetRegisterTableProps(issueType, data?.issue, loading);

  const { ribbonProps, ribbonExportProps } = useRibbonAndExport(
    useGetDefaultRibbonFilters(t(issueTypeMap.entityLabelOther))
  );

  const counter = getCounter(tableProps.totalItemsCount, loading);
  const { insertChildIssue } = useInsertChildIssue();

  const onSave = async (data: IssueFormDataFields) => {
    const { files } = data;

    const result = await insertChildIssue({
      Type: issueType,
      CustomAttributeData: data.CustomAttributeData || undefined,
      TagTypeIds: data.tags?.map((t) => t.TagTypeId) || [],
      DepartmentTypeIds: data.departments?.map((d) => d.DepartmentTypeId) || [],
      DateIdentified: data.DateIdentified,
      DateOccurred: data.DateOccurred,
      Details: data.Details,
      Title: data.Title,
      ...ownerAndContributorIds(data),
      IsExternalIssue: data.IsExternalIssue,
      ImpactsCustomer: data.ImpactsCustomer,
    });
    const issueId = result.insertChildIssue?.Id;
    if (!issueId) {
      throw new Error('Failed to insert issue');
    }

    await updateFiles({
      parentType: Parent_Type_Enum.Issue,
      parentId: issueId,
      originalFiles: [], // This is always an insert so no original files
      selectedFiles: files,
    });
  };

  const title = st('register_title');

  return (
    <PageLayout
      helpTranslationKey={'issues.registerHelp'}
      title={title}
      counter={counter}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <ExportButton
            tableProps={tableProps}
            entityLabel={title}
            {...ribbonExportProps}
          />
          <Permission permission={'insert:issue'}>
            <Button variant={'primary'} onClick={() => setIsModalVisible(true)}>
              {st('create_new_button')}
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
        parentType={issueType}
        {...ribbonProps}
      />
      <Table {...tableProps} loading={loading} />
      {isModalVisible && (
        <IssueModal
          onDismiss={() => setIsModalVisible(false)}
          onSaving={onSave}
          issueType={issueType}
        />
      )}
    </PageLayout>
  );
};

export default Page;
