import { useInternalAuditRating } from '@risksmart-app/components/src/hooks/useRating';
import { useTranslation } from 'react-i18next';
import SimpleRatingBadge from 'src/components/simple-rating-badge';

import Link from '@/components/link';
import { useGetTablePropsWithoutUrlHash } from '@/utils/table/hooks/useGetTablePropsWithoutUrlHash';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';
import { internalAuditReportResultsEditUrl } from '@/utils/urls';

import type {
  InternalAuditResultFields,
  InternalAuditResultRegisterFields,
} from './types';
import { useLabelledFields } from './useLabelledFields';

const useGetFieldConfig =
  (): TableFields<InternalAuditResultRegisterFields> => {
    const { t } = useTranslation('common', {
      keyPrefix: 'assessmentResults.columns',
    });
    const { getByValue: getByResultValue } =
      useInternalAuditRating('performance_result');
    const { getByValue: getEffectivenessByValue } =
      useInternalAuditRating('effectiveness');
    const { getByValue: getRiskControlledByValue } =
      useInternalAuditRating('risk_controlled');
    const { getByValue: getRiskUncontrolledByValue } =
      useInternalAuditRating('risk_uncontrolled');
    const ratingFns = {
      document_internal_audit_result: (d: InternalAuditResultFields) =>
        getByResultValue(d.Rating),
      obligation_internal_audit_result: (d: InternalAuditResultFields) =>
        getByResultValue(d.Rating),
      control_test_internal_audit_result: (d: InternalAuditResultFields) =>
        getEffectivenessByValue(d.OverallEffectiveness),
      risk_controlled_internal_audit_result: (d: InternalAuditResultFields) =>
        getRiskControlledByValue(d.Rating),
      risk_uncontrolled_internal_audit_result: (d: InternalAuditResultFields) =>
        getRiskUncontrolledByValue(d.Rating),
    };

    return {
      TypeLabelled: {
        header: t('Type'),
        cell: (item) => {
          return (
            <Link
              variant={'secondary'}
              href={internalAuditReportResultsEditUrl(item.ParentId, item.Id)}
            >
              {item.TypeLabelled}
            </Link>
          );
        },
        isRowHeader: true,
      },
      ParentTitle: {
        header: t('Item'),
      },
      RatingLabelled: {
        header: t('Result'),
        cell: (item) => {
          return (
            <SimpleRatingBadge
              rating={ratingFns[item.typename as keyof typeof ratingFns](item)}
            />
          );
        },
        sortingField: 'Rating',
      },
      TestDate: dateColumnFromConfig({
        header: { header: t('TestDate') },
        dateField: 'TestDate',
      }),
      Rationale: {
        header: t('Rationale'),
      },
    };
  };

export const useGetCollectionStatelessTableProps = (
  records: InternalAuditResultFields[] | undefined
): TablePropsWithActions<InternalAuditResultRegisterFields> => {
  const { t: at } = useTranslation('common', {
    keyPrefix: 'assessmentResults',
  });

  const labelledFields = useLabelledFields(records);
  const fields = useGetFieldConfig();

  return useGetTablePropsWithoutUrlHash({
    customAttributeFormIds: [],
    data: labelledFields,
    entityLabel: at('entity_name'),
    emptyCollectionAction: <></>,
    preferencesStorageKey: 'AssessmentResults-Preferences',
    enableFiltering: true,
    initialColumns: [
      'TestDate',
      'ParentTitle',
      'TypeLabelled',
      'RatingLabelled',
    ],
    fields,
  });
};
