import type { GetTagsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Link from '@/components/link';
import type { CollectionData } from '@/utils/collectionUtils';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';

export type TagTypeTableFields = CollectionData<
  GetTagsQuery['tag_type'][number]
>;

export type TagsTableFields = TagTypeTableFields & {
  CreatedByUserName: null | string;
  ModifiedByUserName: null | string;
  TagGroup: null | string;
};

export const useGetCollectionTableProps = (
  records: TagTypeTableFields[],
  onEdit: (tagType: TagTypeTableFields) => void
): TablePropsWithActions<TagsTableFields> => {
  const { t } = useTranslation(['common'], { keyPrefix: 'tags' });
  const { t: st } = useTranslation(['common'], { keyPrefix: 'tags.columns' });
  const { t: stc } = useTranslation(['common'], { keyPrefix: 'columns' });
  const labelledFields = useMemo<TagsTableFields[]>(
    () =>
      records?.map((record) => {
        return {
          ...record,
          CreatedByUserName: record.createdByUser?.FriendlyName || '-',
          ModifiedByUserName: record.modifiedByUser?.FriendlyName || '-',
          TagGroup: record.tag_type_group?.Name || '',
        };
      }),
    [records]
  );

  const fields: TableFields<TagsTableFields> = {
    Name: {
      id: 'name',
      header: st('name'),
      cell: (item) => (
        <Link variant={'secondary'} href={'#'} onFollow={() => onEdit(item)}>
          {item.Name}
        </Link>
      ),
    },
    Description: {
      header: st('description'),
    },
    CreatedAtTimestamp: dateColumnFromConfig({
      header: { header: st('created_on') },
      dateField: 'CreatedAtTimestamp',
    }),
    CreatedByUserName: {
      header: st('created_by_user'),
    },
    ModifiedAtTimestamp: dateColumnFromConfig({
      header: { header: st('updated_on') },
      dateField: 'ModifiedAtTimestamp',
    }),
    ModifiedByUserName: {
      header: st('updated_by_user'),
    },
    TagGroup: {
      header: st('tag_type_group'),
    },
    TagTypeId: {
      header: stc('guid'),
    },
  };

  return useGetTableProps({
    customAttributeFormIds: [],
    tableId: 'tagRegister',
    data: labelledFields,
    entityLabel: t('entity_name'),
    fields,
    initialColumns: ['Name', 'Description', 'TagGroup'],
    preferencesStorageKey: 'TagsSettingsTable-Preferences',
  });
};
