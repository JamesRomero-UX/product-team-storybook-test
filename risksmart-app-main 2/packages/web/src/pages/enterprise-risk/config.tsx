import Button from '@risksmart-app/components/src/button';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MAX_COL_WIDTH } from 'src/App.config';
import SimpleRatingBadge from 'src/components/simple-rating-badge/SimpleRatingBadge';
import { Permission } from 'src/rbac/Permission';

import Link from '@/components/link';
import type {
  StatefulTableOptions,
  UseGetTablePropsOptions,
} from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetStatelessTableProps } from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import { exportStyleFromValue } from '@/utils/table/pdfExportStyles';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';
import { addEnterpriseRiskUrl, enterpriseRiskDetailsUrl } from '@/utils/urls';

import type {
  EnterpriseRiskFields,
  EnterpriseRiskRegisterFields,
} from './types';
import { useLabelledFields } from './useLabelledFields';

export const useGetFieldConfig =
  (): TableFields<EnterpriseRiskRegisterFields> => {
    const { t } = useTranslation(['common'], { keyPrefix: 'columns' });
    const { t: st } = useTranslation(['common'], {
      keyPrefix: 'risks.columns',
    });
    const { t: et } = useTranslation(['common'], {
      keyPrefix: 'enterpriseRisks.columns',
    });
    const { getByRange: getResidualRating } = useRating('risk_controlled');
    const { getByRange: getInherentRating } = useRating('risk_uncontrolled');

    return {
      Id: {
        header: t('guid'),
      },
      SequentialIdLabelled: {
        header: t('id'),
        sortingField: 'SequentialId',
      },
      Title: {
        header: t('title'),
        cell: (item) => (
          <Link variant={'secondary'} href={enterpriseRiskDetailsUrl(item.Id)}>
            {item.Title}
          </Link>
        ),
      },
      ParentTitle: {
        header: st('parent_risk'),
      },
      TierLabelled: {
        header: st('risk_tier'),
      },
      TreatmentLabelled: {
        header: st('risk_treatment'),
      },
      Description: {
        header: st('risk_description'),
        maxWidth: MAX_COL_WIDTH,
      },
      InherentMeanLabelled: {
        header: et('inherentRatingMean'),
        cell: (item) => (
          <SimpleRatingBadge
            rating={getInherentRating(item.score?.InherentScoreMean)}
          />
        ),
        exportCellStyle: exportStyleFromValue(
          (item) => item.score?.InherentScoreMean,
          getInherentRating
        ),
      },
      InherentWorstCaseLabelled: {
        header: et('inherentRatingWorstCase'),
        cell: (item) => (
          <SimpleRatingBadge
            rating={getInherentRating(item.score?.InherentScoreWorstCase)}
          />
        ),
        exportCellStyle: exportStyleFromValue(
          (item) => item.score?.InherentScoreWorstCase,
          getInherentRating
        ),
      },
      ResidualMeanLabelled: {
        header: et('residualRatingMean'),
        cell: (item) => (
          <SimpleRatingBadge
            rating={getResidualRating(item.score?.ResidualScoreMean)}
          />
        ),
        exportCellStyle: exportStyleFromValue(
          (item) => item.score?.ResidualScoreMean,
          getResidualRating
        ),
      },
      ResidualWorstCaseLabelled: {
        header: et('residualRatingWorstCase'),
        cell: (item) => (
          <SimpleRatingBadge
            rating={getResidualRating(item.score?.ResidualScoreWorstCase)}
          />
        ),
        exportCellStyle: exportStyleFromValue(
          (item) => item.score?.ResidualScoreWorstCase,
          getResidualRating
        ),
      },
      CreatedAtTimestamp: dateColumnFromConfig({
        header: { header: t('created_on') },
        dateField: 'CreatedAtTimestamp',
      }),
      ModifiedAtTimestamp: dateColumnFromConfig({
        header: { header: t('updated_on') },
        dateField: 'ModifiedAtTimestamp',
      }),
      CreatedByUser: {
        header: t('created_by_id'),
      },
      ModifiedByUser: {
        header: t('updated_by_id'),
      },
    };
  };

export const useGetEnterpriseRiskTableProps = (
  records: EnterpriseRiskFields[] | undefined
): UseGetTablePropsOptions<EnterpriseRiskRegisterFields> => {
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'enterpriseRisks',
  });
  const data = useLabelledFields(records);
  const fields = useGetFieldConfig();

  return useMemo(() => {
    return {
      tableId: 'enterpriseRiskRegister',
      data,
      fields,
      entityLabel: st('entity_name'),
      emptyCollectionAction: (
        <Permission permission={'insert:enterprise_risk'}>
          <Button href={addEnterpriseRiskUrl()}>{st('createNewButton')}</Button>
        </Permission>
      ),
      enableFiltering: true,
      initialColumns: ['Title', 'ParentTitle', 'TierLabelled'],
      preferencesStorageKey: 'EnterpriseRisksTable-Preferences',
      customAttributeFormIds: ['risk'],
    };
  }, [st, data, fields]);
};

export const useGetCollectionTableProps = (
  records: EnterpriseRiskFields[] | undefined
): TablePropsWithActions<EnterpriseRiskRegisterFields> => {
  const props = useGetEnterpriseRiskTableProps(records);

  return useGetTableProps(props);
};

export const useGetEnterpriseRiskSmartWidgetTableProps = (
  records: EnterpriseRiskFields[] | undefined,
  statefulTableOptions: StatefulTableOptions<EnterpriseRiskRegisterFields>
): TablePropsWithActions<EnterpriseRiskRegisterFields> => {
  const props = useGetEnterpriseRiskTableProps(records);

  return useGetStatelessTableProps<EnterpriseRiskRegisterFields>({
    ...props,
    ...statefulTableOptions,
    enableFiltering: false,
  });
};
