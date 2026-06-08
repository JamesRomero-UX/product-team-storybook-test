import { useQuery } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import Table from '@risksmart-app/components/src/table';
import {
  GetAppetitesGroupedByImpactDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ExportButton from 'src/components/export-button';
import { PageLayout } from 'src/layouts';
import { Permission } from 'src/rbac/Permission';

import CustomisableRibbon from '@/components/customisable-ribbon/CustomisableRibbon';
import { useGetRiskRegister } from '@/hooks/queries';
import { useRibbonAndExport } from '@/hooks/useRibbonAndExport';
import { useRiskScores } from '@/hooks/useRiskScore';
import { getCounter } from '@/utils/collectionUtils';
import { addRiskUrl } from '@/utils/urls';

import AssessmentResultModal from '../assessments/modals/AssessmentResultModal';
import { useGetCollectionTableProps } from './config';
import { useGetDefaultRibbonFilters } from './useGetDefaultRibbonFilters';

const Page: FC = () => {
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'risks',
  });
  const { t } = useTranslation(['common'], {});
  const title = st('register_title');
  const { data, loading, refetch } = useGetRiskRegister({ queryArgs: {} });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [openRatingResultId, setOpenRatingResultId] = useState<
    string | undefined
  >();
  const handleRatingResultModalClose = () => {
    setOpenRatingResultId(undefined);
    setIsEditOpen(false);
    refetch();
  };
  const { loading: loadingScores, scores } = useRiskScores();

  const { data: impactAppetites, loading: loadingImpactAppetites } = useQuery(
    GetAppetitesGroupedByImpactDocument
  );

  const tableProps = useGetCollectionTableProps(
    data?.risk,
    scores,
    impactAppetites?.impact,
    (ratingId) => {
      setOpenRatingResultId(ratingId);
      setIsEditOpen(true);
    }
  );
  const counter = getCounter(tableProps.totalItemsCount, loading);

  const { ribbonProps, ribbonExportProps } = useRibbonAndExport(
    useGetDefaultRibbonFilters
  );

  return (
    <PageLayout
      helpTranslationKey={'risks.registerHelp'}
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
            permission={'insert:risk'}
            canHaveAccessAsContributor={true}
          >
            <Button variant={'primary'} href={addRiskUrl()}>
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
        parentType={Parent_Type_Enum.Risk}
        {...ribbonProps}
      />
      <Table
        {...tableProps}
        loading={loading || loadingScores || loadingImpactAppetites}
      />
      {isEditOpen && (
        <AssessmentResultModal
          id={openRatingResultId}
          onDismiss={handleRatingResultModalClose}
          resultType={Parent_Type_Enum.RiskAssessmentResult}
          hideTypeSelector={true}
          i18n={t('ratings')}
          assessmentMode={'rating'}
        />
      )}
    </PageLayout>
  );
};

export default Page;
