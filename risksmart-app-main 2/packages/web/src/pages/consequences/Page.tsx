import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Table from '@risksmart-app/components/src/table';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ExportButton from 'src/components/export-button';
import { PageLayout } from 'src/layouts';

import CustomisableRibbon from '@/components/customisable-ribbon/CustomisableRibbon';
import { useGetConsequenceRegister } from '@/hooks/queries/consequence/useGetConsequenceRegister';
import { useRibbonAndExport } from '@/hooks/useRibbonAndExport';
import { getCounter } from '@/utils/collectionUtils';

import ConsequenceModal from '../issues/update/tabs/consequences/ConsequenceModal';
import { useGetRegisterTableProps } from './config';
import type { ConsequenceFlatField, ConsequenceRegisterFields } from './types';
import { useGetDefaultRibbonFilters } from './useGetDefaultRibbonFilters';

const Page: FC = () => {
  const [openConsequence, setOpenConsequence] =
    useState<ConsequenceFlatField | null>(null);
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'consequences',
  });
  const { data, loading, refetch } = useGetConsequenceRegister({
    queryArgs: {},
  });

  const tableProps = useGetRegisterTableProps(
    data?.consequence,
    (consequence: ConsequenceRegisterFields) => setOpenConsequence(consequence)
  );

  const title = st('register_title');
  const counter = getCounter(tableProps.totalItemsCount, loading);

  const { ribbonProps, ribbonExportProps } = useRibbonAndExport(
    useGetDefaultRibbonFilters
  );

  return (
    <PageLayout
      helpTranslationKey={'consequences.registerHelp'}
      title={title}
      counter={counter}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <ExportButton
            tableProps={tableProps}
            entityLabel={title}
            {...ribbonExportProps}
          />
        </SpaceBetween>
      }
    >
      <CustomisableRibbon
        items={tableProps.allItems}
        propertyFilterQuery={tableProps.propertyFilterQuery}
        onFilterQueryChanged={tableProps.actions.setPropertyFiltering}
        filteringProperties={tableProps.filteringProperties}
        filteringOptions={tableProps.propertyFilterProps.filteringOptions}
        parentType={Parent_Type_Enum.Consequence}
        {...ribbonProps}
      />
      <Table {...tableProps} loading={loading} />
      {openConsequence && (
        <ConsequenceModal
          consequenceId={openConsequence.Id}
          onDismiss={(saved) => {
            setOpenConsequence(null);
            if (saved) {
              refetch();
            }
          }}
          issueId={openConsequence.ParentIssueId}
        />
      )}
    </PageLayout>
  );
};

export default Page;
