import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { Risk_Assessment_Result_Control_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useTranslation } from 'react-i18next';
import SimpleRatingBadge from 'src/components/simple-rating-badge';

import Link from '@/components/link';
import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { useRiskRatingResolver } from '@/ratings/useRiskRatingResolver';
import { useGetContributorsFieldConfig } from '@/utils/table/hooks/useGetContributorsFieldConfig';
import { useGetOwnersFieldConfig } from '@/utils/table/hooks/useGetOwnersFieldConfig';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';

import type { ActiveRiskAppetiteFields, AppetiteTableFields } from './types';
import { useLabelledFields } from './useLabelledFields';

const useGetFieldConfig = (): TableFields<AppetiteTableFields> => {
  const allOwners = useGetOwnersFieldConfig<AppetiteTableFields>({
    formId: 'risk',
    fieldId: 'Owners',
    includeFromTypePostfix: true,
  });
  const allContributors = useGetContributorsFieldConfig<AppetiteTableFields>({
    formId: 'risk',
    fieldId: 'Contributors',
    includeFromTypePostfix: true,
  });
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'appetites.columns',
  });
  const { t } = useTranslation(['common'], {
    keyPrefix: 'columns',
  });
  const { resolveRiskRating } = useRiskRatingResolver();
  const { getByValue } = useRating('risk_appetite');
  const { getByValue: getAppetitePerformanceByValue } = useRating(
    'appetite_performance'
  );
  const posture = useIsFeatureFlagEnabled('posture');

  return {
    ParentTitle: {
      formId: 'risk',
      fieldId: 'Title',
      includeFromTypePostfix: true,
      cell: (item) => (
        <Link href={item.Id} isRelativeUrl={true} variant={'secondary'}>
          {item.ParentTitle}
        </Link>
      ),
      isRowHeader: true,
    },
    TierLabelled: {
      formId: 'risk',
      fieldId: 'Tier',
      includeFromTypePostfix: true,
    },
    allOwners,
    allContributors,
    ...(!posture
      ? {
          LowerAppetiteLabelled: {
            formId: 'appetite',
            fieldId: 'LowerAppetite',
            cell: (item) => (
              <SimpleRatingBadge rating={getByValue(item.LowerAppetite)} />
            ),
          },
        }
      : {}),
    UpperAppetiteLabelled: {
      formId: 'appetite',
      fieldId: 'UpperAppetite',
      cell: (item) => (
        <SimpleRatingBadge rating={getByValue(item.UpperAppetite)} />
      ),
    },
    ControlledRatingLabelled: {
      header: st('controlledRating'),
      cell: (item) => {
        const option = resolveRiskRating({
          likelihood: item.ControlledLikelihoodValue ?? null,
          impact: item.ControlledImpactValue ?? null,
          controlType: Risk_Assessment_Result_Control_Type_Enum.Controlled,
          rating: item.ControlledRating ?? null,
        });

        return (
          <SimpleRatingBadge
            rating={option ?? { label: 'Unrated', color: 'light-grey' }}
          />
        );
      },
    },
    PerformanceLabelled: {
      header: st('appetitePerformance'),
      cell: (item) => {
        if (!item.Performance) {
          return '-';
        }

        const performanceItem = getAppetitePerformanceByValue(
          item.Performance
        ) ?? {
          label: 'Undefined',
          color: 'light-grey',
        };

        return <SimpleRatingBadge rating={performanceItem} />;
      },
    },
    ParentRiskId: { header: st('parentRiskId') },
    ParentRiskGuid: { header: st('parentRiskGuid') },
    Statement: {
      formId: 'appetite',
      fieldId: 'Statement',
    },
    CreatedAtTimestamp: dateColumnFromConfig({
      header: { header: t('created_on') },
      dateField: 'CreatedAtTimestamp',
    }),
    Id: { header: t('guid') },
    SequentialId: {
      header: t('id'),
    },
    ModifiedAtTimestamp: dateColumnFromConfig({
      header: { header: t('updated_on') },
      dateField: 'ModifiedAtTimestamp',
    }),
    ModifiedByUser: { header: t('updated_by_id') },
    ModifiedByUserName: { header: t('updated_by_username') },
    EffectiveDate: dateColumnFromConfig({
      dateField: 'EffectiveDate',
      header: {
        formId: 'appetite',
        fieldId: 'EffectiveDate',
      },
    }),
  };
};

export const useGetCollectionTableProps = (
  records: ActiveRiskAppetiteFields[] | undefined
): TablePropsWithActions<AppetiteTableFields> => {
  const labelledFields = useLabelledFields(records);
  const { t: st } = useTranslation(['common'], { keyPrefix: 'appetites' });
  const fields = useGetFieldConfig();
  const posture = useIsFeatureFlagEnabled('posture');
  const initialColumns: (keyof AppetiteTableFields)[] = [
    'ParentTitle',
    'TierLabelled',
    'UpperAppetiteLabelled',
    'ControlledRatingLabelled',
    'PerformanceLabelled',
  ];
  if (!posture) {
    initialColumns.push('LowerAppetiteLabelled');
  }

  return useGetTableProps({
    tableId: 'appetiteRegister',
    data: labelledFields,
    customAttributeFormIds: ['appetite'],
    entityLabel: st('entity_name'),
    emptyCollectionAction: <></>,
    preferencesStorageKey: 'AppetiteRegisterTable-PreferencesV2',
    enableFiltering: true,
    initialColumns,
    fields,
  });
};
