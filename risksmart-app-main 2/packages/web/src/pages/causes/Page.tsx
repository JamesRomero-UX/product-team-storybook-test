import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Table from '@risksmart-app/components/src/table';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomisableRibbon from 'src/components/customisable-ribbon/CustomisableRibbon';
import ExportButton from 'src/components/export-button';
import { useRibbonAndExport } from 'src/hooks/useRibbonAndExport';
import { PageLayout } from 'src/layouts';

import { useGetCauseRegister } from '@/hooks/queries';
import { getCounter } from '@/utils/collectionUtils';

import CauseModal from '../issues/update/tabs/causes/CauseModal';
import { useGetRegisterTableProps } from './config';
import type { CauseFlatField, CauseRegisterFields } from './types';
import { useGetDefaultRibbonFilters } from './useGetDefaultRibbonFilters';

const Page: FC = () => {
  const [openCause, setOpenCause] = useState<CauseFlatField | null>(null);
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'causes',
  });
  const { data, loading, refetch } = useGetCauseRegister({ queryArgs: {} });

  const tableProps = useGetRegisterTableProps(
    data?.cause,
    (consequence: CauseRegisterFields) => setOpenCause(consequence)
  );

  const title = st('register_title');
  const counter = getCounter(tableProps.totalItemsCount, loading);

  const { ribbonProps, ribbonExportProps } = useRibbonAndExport(
    useGetDefaultRibbonFilters
  );

  return (
    <PageLayout
      helpTranslationKey={'causes.registerHelp'}
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
        parentType={Parent_Type_Enum.Cause}
        {...ribbonProps}
      />
      <Table {...tableProps} loading={loading} />
      {openCause && (
        <CauseModal
          causeId={openCause.Id}
          onDismiss={(saved) => {
            setOpenCause(null);
            if (saved) {
              refetch();
            }
          }}
          issueId={openCause.ParentIssueId}
        />
      )}
    </PageLayout>
  );
};

export default Page;
