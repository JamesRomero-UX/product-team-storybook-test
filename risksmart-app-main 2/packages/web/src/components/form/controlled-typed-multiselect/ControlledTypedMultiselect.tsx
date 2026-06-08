import type { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';
import { useMemo } from 'react';
import type { FieldValues } from 'react-hook-form';

import { getFriendlyId } from '@/utils/friendlyId';

import ControlledMultiselect from '../controlled-multiselect';
import type { ControlledBaseProps } from '../types';

export interface DataItem {
  Id: string;
  SequentialId?: null | number | undefined;
  Title?: string;
  Name?: string;
}

export interface ControlledTypeMultipleSelectProps<
  T extends FieldValues,
  TData extends DataItem,
> extends ControlledBaseProps<T> {
  filter?: (value: TData, index: number, array: TData[]) => boolean;
  parentType: Parent_Type_Enum;
  disabled?: boolean;
  excludedIds?: string[];
  renderTokens?: boolean;
  data: TData[];
  loading: boolean;
}

function getOptions(
  data: DataItem[] | undefined,
  parentType: Parent_Type_Enum
): { value: string; label: string; tags: string[] }[] {
  return (
    data?.map((o) => ({
      value: o.Id,
      tags: o ? [getFriendlyId(parentType, o.SequentialId)] : [],
      label: o?.Title ?? o?.Name ?? getFriendlyId(parentType, o.SequentialId),
    })) ?? []
  );
}

export const ControlledTypedMultiselect = <
  T extends FieldValues,
  TData extends DataItem,
>({
  excludedIds,
  renderTokens,
  filter,
  parentType,
  data,
  loading,
  testId,
  ...props
}: ControlledTypeMultipleSelectProps<T, TData>) => {
  const filtered = useMemo(() => {
    const d = data ?? [];

    return filter ? d.filter(filter) : d;
  }, [data, filter]);

  const orderedOptions = useMemo(() => {
    return _.sortBy(
      getOptions(filtered, parentType).filter(
        (control) => !excludedIds?.includes(control.value)
      ),
      'label'
    );
  }, [filtered, excludedIds, parentType]);

  return (
    <ControlledMultiselect
      filteringType={'auto'}
      testId={testId}
      statusType={loading ? 'loading' : 'finished'}
      {...props}
      hideTokens={!renderTokens}
      options={orderedOptions}
    />
  );
};
