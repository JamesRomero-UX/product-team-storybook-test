import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useTranslation } from 'react-i18next';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import Link from '@/components/link';
import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';
import { toLocalDate } from '@/utils/dateUtils';
import { getFriendlyId } from '@/utils/friendlyId';
import { useGetTablePropsWithoutUrlHash } from '@/utils/table/hooks/useGetTablePropsWithoutUrlHash';
import type {
  DefaultSortingState,
  TableFields,
  TablePropsWithActions,
} from '@/utils/table/types';
import { impactDetailsUrl } from '@/utils/urls';

import type { AppetiteFields, AppetiteTableFields } from './types';
import { useLabelledFields } from './useLabelledFields';

const useGetFieldConfig = (): TableFields<AppetiteTableFields> => {
  const { t } = useTranslation(['common'], { keyPrefix: 'columns' });
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'appetites.columns',
  });
  const impactsEnabled = useIsModuleEnabled('risk.subModules.impact');
  const { hasPermission: canUpdateImpact, loading: canUpdateImpactLoading } =
    useHasPermissionQuery('update:impact');
  const { getByValue } = useRating('risk_appetite');
  const { getByValue: getByImpactAppetiteValue } = useRating('impact_appetite');
  const { getByValue: getAppetiteStatusByValue } = useRating('appetite_status');
  const { getByValue: getLikelihoodAppetiteByValue } = useRating(
    'likelihood_appetite'
  );

  return {
    SequentialId: {
      header: t('id'),
      cell: (item) => (
        <Link href={item.Id}>
          {item.SequentialId
            ? getFriendlyId(Parent_Type_Enum.Appetite, item.SequentialId)
            : '-'}
        </Link>
      ),
      exportVal: (item) =>
        item.SequentialId
          ? getFriendlyId(Parent_Type_Enum.Appetite, item.SequentialId)
          : '-',
    },
    AppetiteType: {
      header: st('appetiteType'),
      isRowHeader: true,
    },
    EffectiveDate: {
      formId: 'appetite',
      fieldId: 'EffectiveDate',
      cell: (item) => toLocalDate(item.EffectiveDate),
    },
    StatusLabelled: {
      header: st('status'),
      cell: (item) => (
        <SimpleRatingBadge rating={getAppetiteStatusByValue(item.Status)} />
      ),
    },
    ...(impactsEnabled
      ? {
          ImpactName: {
            header: st('impact'),
            cell: (item) =>
              item.ImpactId ? (
                canUpdateImpact && !canUpdateImpactLoading ? (
                  <Link
                    href={impactDetailsUrl(item.ImpactId ?? '#')}
                    variant={'secondary'}
                  >
                    {item.ImpactName}
                  </Link>
                ) : (
                  item.ImpactName
                )
              ) : (
                '-'
              ),
            isRowHeader: true,
          },
          ImpactAppetiteLabelled: {
            header: st('impactAppetite'),
            cell: (item) => (
              <SimpleRatingBadge
                rating={getByImpactAppetiteValue(item.ImpactAppetite)}
              />
            ),
          },
          LikelihoodAppetiteLabelled: {
            header: st('likelihoodAppetite'),
            cell: (item) => (
              <SimpleRatingBadge
                rating={getLikelihoodAppetiteByValue(item.LikelihoodAppetite)}
              />
            ),
          },
        }
      : {
          LowerAppetiteLabelled: {
            formId: 'appetite',
            fieldId: 'LowerAppetite',
            cell: (item) => (
              <SimpleRatingBadge rating={getByValue(item.LowerAppetite)} />
            ),
          },
          UpperAppetiteLabelled: {
            formId: 'appetite',
            fieldId: 'UpperAppetite',
            cell: (item) => (
              <SimpleRatingBadge rating={getByValue(item.UpperAppetite)} />
            ),
          },
        }),
  };
};

export const useGetCollectionStatelessTableProps = (
  records: AppetiteFields[] | undefined,
  defaultSortingState?: DefaultSortingState<AppetiteTableFields>
): TablePropsWithActions<AppetiteTableFields> => {
  const labelledFields = useLabelledFields(records);
  const { t: st } = useTranslation(['common'], { keyPrefix: 'appetites' });
  const fields = useGetFieldConfig();
  const posture = useIsFeatureFlagEnabled('posture');
  const initialColumns: (keyof AppetiteTableFields)[] = [
    'SequentialId',
    'AppetiteType',
    'EffectiveDate',
    'StatusLabelled',
    'ImpactName',
    'UpperAppetiteLabelled',
    'ImpactAppetiteLabelled',
    'LikelihoodAppetiteLabelled',
  ];
  if (!posture) {
    initialColumns.push('LowerAppetiteLabelled');
  }

  return useGetTablePropsWithoutUrlHash({
    data: labelledFields,
    customAttributeFormIds: [],
    entityLabel: st('entity_name'),
    emptyCollectionAction: <></>,
    enableFiltering: true,
    initialColumns,
    fields,
    defaultSortingState,
  });
};
