import Button from '@risksmart-app/components/src/button';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import type { GetConsequencesByParentIssueIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { Permission } from 'src/rbac/Permission';

import Link from '@/components/link';
import type { UseGetTablePropsOptions } from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';

export type ConsequencesFields =
  GetConsequencesByParentIssueIdQuery['consequence'][0];

const useGetFieldConfig = (
  onConsequenceClick?: (consequence: ConsequencesFields) => void
): TableFields<ConsequencesFields> => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'consequences',
  });

  const { getByValue: getCriticalityByValue } = useRating('criticality');

  return useMemo(
    () => ({
      Title: {
        formId: 'consequence',
        fieldId: 'Title',
        cell: (item) => (
          <Link href={'#'} onFollow={() => onConsequenceClick?.(item)}>
            {item.Title}
          </Link>
        ),
        isRowHeader: true,
      },
      CostType: {
        formId: 'consequence',
        fieldId: 'CostType',
        cell: (data) => (data.CostType ? t('costType')[data.CostType] : '-'),
      },
      CostValue: {
        formId: 'consequence',
        fieldId: 'CostValue',
        cell: (data) => {
          // Format financial values to 2 decimal places to match the banner display
          if (
            data.CostType === 'financial' &&
            typeof data.CostValue === 'number'
          ) {
            return data.CostValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
          }

          return data.CostValue;
        },
        fieldType: 'number',
      },

      Criticality: {
        formId: 'consequence',
        fieldId: 'Criticality',
        cell: (item: ConsequencesFields) => (
          <SimpleRatingBadge rating={getCriticalityByValue(item.Criticality)} />
        ),
      },
      Description: {
        formId: 'consequence',
        fieldId: 'Description',
      },
    }),
    [t, onConsequenceClick, getCriticalityByValue]
  );
};

const useGetConsequenceTableProps = (
  data: ConsequencesFields[] | undefined,
  onConsequenceClick: (consequence: ConsequencesFields) => void,
  handleConsequencesModalOpen: () => void,
  parentObject: ObjectWithContributors
): UseGetTablePropsOptions<ConsequencesFields> => {
  const { t } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'consequences',
  });
  const fields = useGetFieldConfig(onConsequenceClick);

  return useMemo<UseGetTablePropsOptions<ConsequencesFields>>(
    () => ({
      tableId: 'consequencesTab',
      data,
      customAttributeFormIds: [],
      entityLabel: t('consequence_one'),
      emptyCollectionAction: (
        <Permission
          permission={'insert:consequence'}
          parentObject={parentObject}
        >
          <Button formAction={'none'} onClick={handleConsequencesModalOpen}>
            {st('add_button')}
          </Button>
        </Permission>
      ),
      preferencesStorageKey: 'ConsequencesTab-PreferencesV1',
      enableFiltering: false,
      initialColumns: [
        'Title',
        'CostType',
        'CostValue',
        'Criticality',
        'Description',
      ],
      fields,
    }),
    [data, fields, t, parentObject, handleConsequencesModalOpen, st]
  );
};

export const useGetRegisterTableProps = (
  records: ConsequencesFields[] | undefined,
  onConsequenceClick: (consequence: ConsequencesFields) => void,
  handleConsequencesModalOpen: () => void,
  parentObject: ObjectWithContributors
): TablePropsWithActions<ConsequencesFields> => {
  const props = useGetConsequenceTableProps(
    records,
    onConsequenceClick,
    handleConsequencesModalOpen,
    parentObject
  );

  return useGetTableProps(props);
};
