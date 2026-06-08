import Button from '@risksmart-app/components/src/button';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MAX_COL_WIDTH } from 'src/App.config';
import { Permission } from 'src/rbac/Permission';

import Link from '@/components/link';
import { useGetOwnersFieldConfig } from '@/utils/table/hooks/useGetOwnersFieldConfig';
import type {
  StatefulTableOptions,
  UseGetTablePropsOptions,
} from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetStatelessTableProps } from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';

import type { EntityFields, EntityRegisterFields } from './types';
import { useLabelledFields } from './useLabelledFields';

export const useGetFieldConfig = (
  onEdit?: (entity: EntityFields) => void
): TableFields<EntityRegisterFields> => {
  const { t } = useTranslation(['common'], { keyPrefix: 'columns' });
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'entity.columns',
  });
  const ownersField = useGetOwnersFieldConfig<EntityRegisterFields>();

  return {
    Id: {
      header: t('guid'),
    },
    Name: {
      header: st('name'),
      cell: (item) => (
        <Link variant={'secondary'} href={'#'} onClick={() => onEdit?.(item)}>
          {item.Name}
        </Link>
      ),
    },
    ParentTitle: {
      header: st('parent_entity'),
      cell: (item) => item.ParentTitle,
    },
    Description: {
      header: st('description'),
      cell: (item) => item.Description,
      maxWidth: MAX_COL_WIDTH,
    },
    Weight: {
      header: st('weight'),
      cell: (item) => item.Weight?.toFixed(2) ?? '1.00',
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
    allOwners: ownersField,
  };
};

export const useGetEntityTableProps = (
  records: EntityFields[] | undefined,
  onEdit?: (entity: EntityFields) => void,
  onCreate?: () => void
): UseGetTablePropsOptions<EntityRegisterFields> => {
  const { t: st } = useTranslation('common', {
    keyPrefix: 'entity',
  });
  const data = useLabelledFields(records);
  const fields = useGetFieldConfig(onEdit);

  return useMemo(() => {
    return {
      customAttributeFormIds: [],
      tableId: 'entityRegister',
      data,
      fields,
      entityLabel: st('entity_name'), // @TODO: this should be using _one and _other, instead of appending an 's' at the end
      emptyCollectionAction: (
        <Permission permission={'insert:entity'}>
          <Button onClick={() => onCreate?.()}>{st('createNewButton')}</Button>
        </Permission>
      ),
      enableFiltering: true,
      initialColumns: [
        'Name',
        'ParentTitle',
        'Description',
        'Weight',
        'allOwners',
      ],
      preferencesStorageKey: 'EntityRegisterTable-Preferences',
    };
  }, [st, data, fields, onCreate]);
};

export const useGetCollectionTableProps = (
  records: EntityFields[] | undefined,
  onEdit?: (entity: EntityFields) => void,
  onCreate?: () => void
): TablePropsWithActions<EntityRegisterFields> => {
  const props = useGetEntityTableProps(records, onEdit, onCreate);

  return useGetTableProps(props);
};

export const useGetEntitySmartWidgetTableProps = (
  records: EntityFields[] | undefined,
  statefulTableOptions: StatefulTableOptions<EntityRegisterFields>,
  onEdit?: (entity: EntityFields) => void,
  onCreate?: () => void
): TablePropsWithActions<EntityRegisterFields> => {
  const props = useGetEntityTableProps(records, onEdit, onCreate);

  return useGetStatelessTableProps<EntityRegisterFields>({
    ...props,
    ...statefulTableOptions,
    enableFiltering: false,
  });
};
