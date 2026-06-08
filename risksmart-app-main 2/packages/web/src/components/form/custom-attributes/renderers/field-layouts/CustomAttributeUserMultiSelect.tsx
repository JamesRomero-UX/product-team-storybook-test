import _ from 'lodash';
import type { FC } from 'react';
import { MultiSelect } from 'src/components/form/controlled-multiselect/ControlledMultiselect';
import type {
  HidableOption,
  HidableOptionGroup,
} from 'src/components/form/controlled-multiselect/types';
import UserSearchPreferences from 'src/components/user-search-preferences';

import type { CustomAttributeProps } from './CustomAttributeProps';

export const CustomAttributeUserMultiSelect: FC<
  CustomAttributeProps<null | string[]>
> = ({ label, onChange, value, disabled, error, description }) => {
  const getSelectedOptions = (
    options: (HidableOption | HidableOptionGroup)[],
    value: string[] | null
  ) => {
    const selectedOptions: (HidableOption | HidableOptionGroup)[] = [];
    for (const option of options) {
      if (option.value && value?.includes(option.value)) {
        selectedOptions.push(option);
      }
      if ('options' in option) {
        for (const subOption of option.options) {
          if (subOption.value && value?.includes(subOption.value)) {
            selectedOptions.push(subOption);
          }
        }
      }
    }

    return selectedOptions;
  };

  return (
    <UserSearchPreferences
      showInheritedContributorsToggle={false}
      includeGroups={false}
    >
      {({
        onBlur,
        onChange: handleUserChange,
        statusType,
        options,
        users,
        preferencesButton,
      }) => (
        <MultiSelect
          statusType={statusType}
          sideControl={preferencesButton}
          testId={label}
          filteringType={'auto'}
          description={description}
          label={label}
          onBlur={onBlur}
          onChange={(e) => {
            handleUserChange(e.detail.selectedOptions);

            const selectedUsers = [];
            for (const option of e.detail.selectedOptions) {
              if ('type' in option && option.type === 'user') {
                selectedUsers.push(option.value!);
              }
            }

            onChange(selectedUsers);
          }}
          options={options}
          disabled={disabled}
          placeholder={'Select'}
          errorMessage={error}
          tokenSection={<></>}
          selectedOptions={getSelectedOptions(options, value)}
          renderTokens={false}
          previewChangesFormatter={(
            val: [{ UserId?: string; value?: string }] | null | undefined
          ) => {
            if (Array.isArray(val)) {
              return val
                .map((v) => v)
                .map((v) => users?.user.find((u) => u.Id === v)?.FriendlyName)
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
      )}
    </UserSearchPreferences>
  );
};
