import _ from 'lodash';
import type { FC } from 'react';
import { MultiSelect } from 'src/components/form/controlled-multiselect/ControlledMultiselect';

import { useGetDepartments } from '@/hooks/queries';

import type { CustomAttributeProps } from './CustomAttributeProps';

export const CustomAttributeDepartmentMultiSelect: FC<
  CustomAttributeProps<null | string[]>
> = ({ label, onChange, value, disabled, error, description }) => {
  const { data: departments } = useGetDepartments({ queryArgs: {} });
  const multiselectOptions = (departments?.department_type ?? []).map(
    (item) => ({
      value: item.DepartmentTypeId!,
      label: item.Name!,
    })
  );

  return (
    <MultiSelect
      filteringType={'auto'}
      testId={label}
      description={description}
      label={label}
      onChange={(e) => onChange(e.detail.selectedOptions.map((c) => c.value!))}
      options={multiselectOptions}
      disabled={disabled}
      placeholder={'Select'}
      errorMessage={error}
      tokenSection={<></>}
      selectedOptions={multiselectOptions.filter((o) =>
        value?.includes(o.value)
      )}
      renderTokens={false}
      previewChangesFormatter={(
        val: [{ UserId?: string; value?: string }] | null | undefined
      ) => {
        if (Array.isArray(val)) {
          return val
            .map((v) => v)
            .map(
              (v) =>
                departments?.department_type.find(
                  (u) => u.DepartmentTypeId === v
                )?.Name
            )
            .join(', ');
        }

        return '-';
      }}
      hasFieldChanged={(
        val:
          | {
              from: { UserId?: string; value?: string }[];
              to: { UserId?: string; value?: string }[];
            }
          | null
          | undefined
      ) => {
        if (val === undefined || val === null) {
          return false;
        }
        const from = val.from?.map((v) => v).sort();
        const to = val.to?.map((v) => v).sort();

        return !_.isEqual(from, to);
      }}
    />
  );
};
