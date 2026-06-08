import { SpaceBetween } from '@risk-smart/themed-cloudscape-components';
import Button from '@risksmart-app/components/src/button';
import Table from '@risksmart-app/components/src/table';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import CustomisableRibbon from 'src/components/customisable-ribbon/CustomisableRibbon';
import ExportButton from 'src/components/export-button';
import { useRibbonAndExport } from 'src/hooks/useRibbonAndExport';
import { Permission } from 'src/rbac/Permission';

import { useGetQuestionnaireTemplateRegister } from '@/hooks/queries/questionnaire-template/useGetQuestionnaireTemplateRegister';
import { getCounter } from '@/utils/collectionUtils';
import { addQuestionnaireTemplateUrl } from '@/utils/urls';

import { PageLayout } from '../../layouts';
import { useGetCollectionTableProps } from './config';
import { useGetDefaultRibbonFilters } from './useGetDefaultRibbonFilters';

const Page: FC = () => {
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'questionnaire_templates',
  });

  const { data, loading } = useGetQuestionnaireTemplateRegister({
    queryArgs: {},
  });
  const tableProps = useGetCollectionTableProps(data?.questionnaire_template);
  const counter = getCounter(tableProps.totalItemsCount, loading);
  const title = st('register_title');

  const { ribbonProps, ribbonExportProps } = useRibbonAndExport(
    useGetDefaultRibbonFilters
  );

  return (
    <PageLayout
      helpTranslationKey={'third_party.registerHelp'}
      title={title}
      counter={counter}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <ExportButton
            tableProps={tableProps}
            entityLabel={title}
            {...ribbonExportProps}
          />
          <Permission permission={'insert:questionnaire_template'}>
            <Button variant={'primary'} href={addQuestionnaireTemplateUrl()}>
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
        parentType={Parent_Type_Enum.QuestionnaireTemplate}
        {...ribbonProps}
      />
      <Table {...tableProps} loading={loading} />
    </PageLayout>
  );
};

export default Page;
