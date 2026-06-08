import { useQuery } from '@apollo/client';
import type {
  PropertyFilterOperator,
  PropertyFilterProperty,
} from '@cloudscape-design/collection-hooks';
import { GetControlGroupsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { Settings04 } from '@untitled-ui/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Popover from 'src/components/popover';

import type { FieldConfig } from '@/utils/table/types';

export function useGetControlGroupFieldConfig<
  T extends {
    ControlGroups: { label: string; id: string }[];
  },
>(): FieldConfig<T> {
  const { data: controlGroups } = useQuery(GetControlGroupsDocument);
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'controls.columns',
  });
  const controlGroupsOptions = useMemo(
    () =>
      controlGroups?.control_group.map((u) => ({
        label: u.Title ?? '',
        id: u.Id ?? '',
      })) ?? [],
    [controlGroups?.control_group]
  );

  return useMemo(
    () => ({
      header: st('control_groups'),
      cell: (item) => (
        <Popover
          title={st('control_groups')}
          icon={<Settings04 color={'#A2A2B3'} />}
          items={item.ControlGroups.map((c) => ({
            id: c?.id ?? '-',
            label: c?.label ?? '-',
            onClick: undefined,
          }))}
          iconName={undefined}
        />
      ),
      filterOptions: {
        filteringProperties:
          createControlGroupFieldPropertyFilter(controlGroupsOptions),
        filteringOptions:
          controlGroupsOptions?.map((t) => ({
            value: t.id,
            label: t.label,
          })) ?? [],
      },
      exportVal: (item) =>
        item.ControlGroups.map((group) => group?.label || '').join(','),
    }),
    [st, controlGroupsOptions]
  );
}
const createControlGroupFieldPropertyFilter = (
  options: { label: string; id: string }[]
): Partial<PropertyFilterProperty> => {
  return {
    operators: [
      ...(['=', ':'] as PropertyFilterOperator[]).map((operator) => ({
        operator,
        format: (id: string): string => {
          return options.find((t) => t.id === id)?.label || '-';
        },
        match: (groups: unknown, id: string) => {
          return !!((groups || []) as { label: string; id: string }[]).find(
            (t) => t.id === id
          );
        },
      })),
    ],
  };
};
