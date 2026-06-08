import type {
  GetUserGroupsQuery,
  GetUsersQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';
import { type ReactNode, useMemo } from 'react';
import type { FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormField } from 'src/components/form/form/FormField';
import type { Filter } from 'src/components/user-search-preferences/useGroupAndUserOptions';
import type { UserOrGroup } from 'src/schemas/global';

import UserSearchPreferences from '../../user-search-preferences/UserSearchPreferences';
import type {
  HidableOption,
  HidableOptionGroup,
} from '../controlled-multiselect/types';
import { getSelectedOption } from '../controlled-select/SelectUtils';
import { Controller } from '../field-controller/Controller';
import { useIsFieldReadOnly } from '../form/customisable-form/hooks/useIsFieldReadOnly';
import HiddenOptionSelect from '../select/HideableSelect';
import type { ControlledBaseProps } from '../types';
import styles from './style.module.scss';

interface Props<T extends FieldValues> extends ControlledBaseProps<T> {
  addEmptyOption?: boolean;
  disabled?: boolean;
  constraintText?: ReactNode;
  includeGroups: boolean;
  testId: string;
  userFilter?: Filter<GetUsersQuery['user'][number]>;
  groupFilter?: Filter<GetUserGroupsQuery['user_group'][number]>;
}

export const ControlledGroupAndUserSelect = <T extends FieldValues>({
  control,
  constraintText,
  name,
  label,
  forceRequired,
  addEmptyOption,
  defaultRequired,
  allowDefaultValue,
  includeGroups,
  userFilter,
  groupFilter,
  testId,
  ...props
}: Props<T>) => {
  const { t } = useTranslation(['common']);
  const { error } = control.getFieldState(name);
  const readOnly = useIsFieldReadOnly(name);

  const hasFieldChanged = useMemo(
    () =>
      (
        value:
          | {
              from: { value: string; type: string } | null | undefined;
              to: { value: string; type: string } | null | undefined;
            }
          | null
          | undefined
      ) => {
        if (value === undefined || value === null) {
          return false;
        }

        return !(
          (_.isNil(value.from) && _.isNil(value.to)) ||
          value.from?.value === value.to?.value
        );
      },
    []
  );

  const previewChangesFormatter = useMemo(
    () =>
      (
        changes: null | string | undefined | { value: string },
        options: (HidableOption | HidableOptionGroup)[]
      ) => {
        return typeof changes === 'object' && changes?.value
          ? (getSelectedOption(changes.value, options)?.label ?? '-')
          : (getSelectedOption(changes as string, options)?.label ?? '-');
      },
    []
  );

  return (
    <UserSearchPreferences
      includeGroups={includeGroups}
      userFilter={userFilter}
      groupFilter={groupFilter}
      addEmptyOption={addEmptyOption}
      showInheritedContributorsToggle={false}
    >
      {({
        preferencesButton,
        statusType,
        options,
        onBlur: onBlurPreferences,
        onChange: onChangePreferences,
      }) => (
        <Controller
          defaultRequired={defaultRequired}
          forceRequired={forceRequired}
          allowDefaultValue={allowDefaultValue}
          name={name}
          control={control}
          render={({ field: { onChange, onBlur, value } }) => {
            const optionValue =
              typeof value === 'string' ? value : (value as UserOrGroup)?.value;

            const currentSelectedOption = getSelectedOption(
              optionValue,
              options
            );

            return (
              <FormField
                constraintText={constraintText}
                label={label}
                errorText={error?.message}
                stretch
                testId={testId}
                previewChangesFormatter={(value) => {
                  return previewChangesFormatter(value, options);
                }}
                hasFieldChanged={hasFieldChanged}
              >
                <div className={'flex flex-row'}>
                  <div className={'flex-grow'}>
                    <HiddenOptionSelect
                      filteringType={'auto'}
                      statusType={statusType}
                      className={styles.root}
                      selectedOption={currentSelectedOption}
                      placeholder={t('enterAValue')}
                      empty={t('noMatchedFound')}
                      {...props}
                      onChange={(e) => {
                        const selectedOption = e.detail.selectedOption;
                        let userOrGroup: undefined | UserOrGroup = undefined;
                        if ('type' in selectedOption) {
                          userOrGroup = {
                            value: (e.detail.selectedOption as UserOrGroup)
                              .value,
                            type: (e.detail.selectedOption as UserOrGroup).type,
                          };
                        }
                        if (userOrGroup) {
                          onChangePreferences([userOrGroup]);
                        }
                        onChange?.(userOrGroup || null);
                      }}
                      onBlur={() => {
                        onBlurPreferences();
                        onBlur?.();
                      }}
                      options={options}
                      disabled={readOnly || props.readOnly || props.disabled}
                    />
                  </div>
                  {preferencesButton}
                </div>
              </FormField>
            );
          }}
        />
      )}
    </UserSearchPreferences>
  );
};
