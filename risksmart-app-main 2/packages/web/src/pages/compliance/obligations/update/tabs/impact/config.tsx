import Button from '@risksmart-app/components/src/button';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import type { GetObligationImpactsByParentIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { Permission } from 'src/rbac/Permission';
import type { UseGetTablePropsOptions } from 'src/utils/table/hooks/useGetStatelessTableProps';
import type { TableFields, TablePropsWithActions } from 'src/utils/table/types';

import Link from '@/components/link';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';

export type ImpactFields =
  GetObligationImpactsByParentIdQuery['obligation_impact'][0];

const useGetFieldConfig = (
  onEdit: (impact: ImpactFields) => void
): TableFields<ImpactFields> => {
  const { getByValue } = useRating('impact');

  return useMemo(
    () => ({
      Description: {
        formId: 'obligation_impact',
        fieldId: 'Description',
        cell: (item) => (
          <Link variant={'secondary'} href={'#'} onFollow={() => onEdit(item)}>
            {item.Description}
          </Link>
        ),

        isRowHeader: true,
      },
      ImpactRating: {
        formId: 'obligation_impact',
        fieldId: 'ImpactRating',
        cell: (item) => (
          <SimpleRatingBadge rating={getByValue(item.ImpactRating || 0)} />
        ),
        sortingField: 'Impact',
      },
    }),
    [getByValue, onEdit]
  );
};

const useGetImpactTableProps = (
  records: ImpactFields[] | undefined,
  onEdit: (impact: ImpactFields) => void,
  handleImpactModalOpen: () => void,
  obligation: ObjectWithContributors
): UseGetTablePropsOptions<ImpactFields> => {
  const { t } = useTranslation(['common']);

  const fields = useGetFieldConfig(onEdit);

  return useMemo<UseGetTablePropsOptions<ImpactFields>>(
    () => ({
      customAttributeFormIds: ['obligation_impact'],
      tableId: 'obligationImpactTabTable',
      data: records,
      fields,
      entityLabel: t('impacts.entity_name'),
      emptyCollectionAction: (
        <Permission
          permission={'insert:obligation_impact'}
          parentObject={obligation}
        >
          <Button formAction={'none'} onClick={handleImpactModalOpen}>
            {t('impacts.create_new_button')}
          </Button>
        </Permission>
      ),
      enableFiltering: true,
      initialColumns: ['Description', 'ImpactRating'],
      preferencesStorageKey: 'ObligationImpactTable-Preferences',
      defaultSortingState: {
        sortingColumn: 'Description',
        sortingDirection: 'asc',
      },
    }),
    [t, records, fields, handleImpactModalOpen, obligation]
  );
};

export const useGetCollectionTableProps = (
  records: ImpactFields[] | undefined,
  onEdit: (impact: ImpactFields) => void,
  handleImpactModalOpen: () => void,
  obligation: ObjectWithContributors
): TablePropsWithActions<ImpactFields> => {
  const props = useGetImpactTableProps(
    records,
    onEdit,
    handleImpactModalOpen,
    obligation
  );

  return useGetTableProps(props);
};
