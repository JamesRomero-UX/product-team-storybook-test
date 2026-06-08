import { useQuery } from '@apollo/client';
import type { SelectProps } from '@risk-smart/themed-cloudscape-components';
import Checkbox from '@risk-smart/themed-cloudscape-components/checkbox';
import Button from '@risksmart-app/components/src/button';
import {
  Approval_Rule_Type_Enum,
  GetOwnersAndContributorsDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { X } from '@untitled-ui/icons-react';
import type {
  FieldErrorsImpl,
  FieldPath,
  FieldValues,
  Path,
  PathValue,
} from 'react-hook-form';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ControlledSelect from 'src/components/form/controlled-select';
import { useRiskSmartForm } from 'src/components/form/form/customisable-form/RiskSmartFormContext';
import { FormField } from 'src/components/form/form/FormField';
import HiddenOptionMultiSelect from 'src/components/form/multi-select/HideableMultiselect';
import type { ControlledBaseProps } from 'src/components/form/types';
import { contentToHtml } from 'src/components/help-panel/convertHtmlContentToHtml';
import HelpLink from 'src/components/help-panel/HelpLink';
import UserSearchPreferences from 'src/components/user-search-preferences';
import type { UserOrGroup } from 'src/schemas/global';

import type { ApprovalFormValues } from './approvalFormSchema';
import styles from './style.module.scss';

type LevelPaths<T extends FieldValues> = {
  [K in FieldPath<T>]: PathValue<T, K> extends ApprovalFormValues['levels']
    ? K
    : never;
}[FieldPath<T>];

type Props<
  T extends FieldValues,
  TName extends LevelPaths<T>,
> = ControlledBaseProps<T, TName> & {
  parentId?: string;
};

type UserOrGroupOption = SelectProps.Option & UserOrGroup;

const ControlledApprovalLevels = <
  T extends FieldValues,
  TName extends LevelPaths<T>,
>({
  control,
  name,
  parentId,
  description,
  label,
}: Props<T, TName>) => {
  const isGlobal = !parentId;
  const { watch, setValue } = useFormContext();
  const { t } = useTranslation(['common'], { keyPrefix: 'approvals' });
  const { readOnly } = useRiskSmartForm();
  const { data } = useQuery(GetOwnersAndContributorsDocument, {
    variables: { parentId: parentId! },
    skip: isGlobal,
    fetchPolicy: 'network-only',
  });

  const isGroupOwnerContributorOfObject = (group: {
    Id: string;
    OwnerContributor: boolean;
  }) =>
    group.OwnerContributor &&
    (data?.ancestor_contributor.map((c) => c.UserGroupId) ?? []).includes(
      group.Id
    );

  const isUserARiskManagerOrOwnerContributorOfObject = (user: {
    Id?: null | string | undefined;
    RoleKey?: null | string | undefined;
  }) =>
    user.RoleKey === 'RiskManager' ||
    (data?.ancestor_contributor.map((c) => c.UserId) ?? []).includes(user.Id);

  const levels = watch(name) as ApprovalFormValues['levels'];

  const addApprovalLevel = () => {
    setValue(name as string, [
      ...levels,
      { approvers: [], ApprovalRuleType: Approval_Rule_Type_Enum.AllApprove },
    ] satisfies ApprovalFormValues['levels']);
  };

  const deleteApprovalLevel = (index: number) => {
    setValue(
      name as string,
      levels.filter(
        (_, i) => i !== index
      ) satisfies ApprovalFormValues['levels']
    );
  };

  const setOwnerApprover = (level: number, value: boolean) => {
    setValue(
      `${name}.${level}.approvers`,
      // @ts-expect-error ???
      (value
        ? [
            ...levels[level].approvers,
            {
              OwnerApprover: value,
            },
          ]
        : levels[level].approvers.filter(
            (approver) => !approver.OwnerApprover
          )) satisfies ApprovalFormValues['levels'][0]['approvers']
    );
  };

  const setUserApprovers = (
    level: number,
    value: readonly UserOrGroupOption[]
  ) => {
    // @ts-expect-error ???
    setValue(`${name}.${level}.approvers`, [
      ...levels[level].approvers.filter((a) => a.OwnerApprover),
      ...value.map((v) => {
        return v.type === 'userGroup'
          ? {
              UserGroupId: v.value,
              group: { Name: v.label },
            }
          : {
              UserId: v.value,
              user: { FriendlyName: v.label },
            };
      }),
    ] satisfies ApprovalFormValues['levels'][0]['approvers']);
  };

  const ruleTypes = ['all_approve', 'any_one_approve'] as const;
  const ruleTypeMapping = t('level_rule_types');
  const ruleTypeOptions = ruleTypes.map((value) => ({
    label: ruleTypeMapping?.[value] ?? value,
    value,
  }));

  return (
    <FormField
      label={'Approval Levels'}
      info={
        description && (
          <HelpLink
            id={label}
            title={label}
            content={contentToHtml(description)}
          />
        )
      }
    >
      <div className={'space-y-4 my-3'}>
        {levels.map((_, index) => {
          return (
            <UserSearchPreferences
              showInheritedContributorsToggle={false}
              key={index}
              includeGroups={true}
              userFilter={isUserARiskManagerOrOwnerContributorOfObject}
              groupFilter={
                !isGlobal ? isGroupOwnerContributorOfObject : undefined
              }
            >
              {({
                statusType,
                options,
                preferencesButton,
                onChange,
                onBlur,
              }) => (
                <Controller
                  render={({ field: { value }, formState: { errors } }) => {
                    const level = value as ApprovalFormValues['levels'][number];
                    const selectedApprovers: UserOrGroupOption[] =
                      level.approvers
                        .filter((a) => a.UserId || a.UserGroupId)
                        .map((a) => ({
                          label:
                            a.group?.Name ??
                            a.user?.FriendlyName ??
                            a.UserId ??
                            '',
                          value: a.UserId ?? a.UserGroupId ?? '',
                          type: a.UserId ? 'user' : 'userGroup',
                        }));

                    return (
                      <div
                        className={
                          'rounded-md border-2 border-grey150 space-y-2 border-solid p-5'
                        }
                      >
                        <FormField
                          label={`Level ${index + 1}`}
                          errorText={(
                            errors?.[name] as unknown as FieldErrorsImpl[]
                          )?.[index]?.approvers?.message?.toString()}
                          actions={
                            index > 0 && (
                              <Button
                                iconSvg={<X viewBox={'0 0 24 24'} />}
                                variant={'inline-icon'}
                                onClick={() => deleteApprovalLevel(index)}
                              />
                            )
                          }
                          disableBottomPadding
                        >
                          <div className={'space-y-3'}>
                            <div className={'flex flex-row'}>
                              <div className={'flex-grow'}>
                                <HiddenOptionMultiSelect
                                  className={styles.root}
                                  statusType={statusType}
                                  testId={'approvers'}
                                  options={options}
                                  // TODO: Translation
                                  placeholder={'Select approvers'}
                                  onChange={(value) => {
                                    const selectedOptions = value.detail
                                      .selectedOptions as UserOrGroupOption[];
                                    setUserApprovers(index, selectedOptions);
                                    onChange(selectedOptions);
                                  }}
                                  onBlur={onBlur}
                                  selectedOptions={selectedApprovers}
                                />
                              </div>
                              {preferencesButton}
                            </div>

                            <Checkbox
                              data-testid={'requireOwnerApprovalAtThisLevel'}
                              checked={
                                !!level.approvers.find((a) => a.OwnerApprover)
                              }
                              onChange={(e) =>
                                setOwnerApprover(index, e.detail.checked)
                              }
                            >
                              {'Require owner approval at this level'}
                              {/* TODO translation */}
                            </Checkbox>
                          </div>
                        </FormField>
                        <div
                          className={`flex gap-3 items-center ${styles.inlineSelect}`}
                        >
                          <strong>{'Approval Level Rule: '}</strong>
                          <ControlledSelect
                            testId={'approvalRuleType'}
                            options={ruleTypeOptions}
                            label={''}
                            name={
                              `${name}.${index}.ApprovalRuleType` as Path<T>
                            }
                            control={control}
                          />
                        </div>
                      </div>
                    );
                  }}
                  name={`${name}.${index}`}
                />
              )}
            </UserSearchPreferences>
          );
        })}
      </div>
      {!readOnly ? (
        <Button onClick={addApprovalLevel}>{'Add level'}</Button>
      ) : null}
    </FormField>
  );
};

export default ControlledApprovalLevels;
