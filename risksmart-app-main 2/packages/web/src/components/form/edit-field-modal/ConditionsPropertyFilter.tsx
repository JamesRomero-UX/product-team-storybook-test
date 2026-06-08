import { useQuery } from '@apollo/client';
import type { FormId } from '@risksmart-app/shared/forms/formConfigRegistry';
import {
  GetDepartmentsDocument,
  GetUserGroupsDocument,
  GetUsersDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import type { FieldValues } from 'react-hook-form';
import { useFormCustomisation } from 'src/hooks/forms/useFormCustomisation';
import { useCustomDatasourceHelpers } from 'src/pages/custom-datasources/useCustomDatasourceHelpers';
import { useFeatures } from 'src/rbac/useFeatures';

import { useGetTags } from '@/hooks/queries';

import { ControlledPropertyFilter } from '../controlled-property-filter';
import { useCustomisableFormDataContext } from '../form/customisable-form-data/CustomisableFormDataContext';
import type { ControlledBaseProps } from '../types';
import { getConditionalPropertyFilterProps } from './formRegistryService';

interface Props<T extends FieldValues> extends ControlledBaseProps<T> {
  formId: FormId;
  fieldId?: string;
}

export const ConditionsPropertyFilter = <T extends FieldValues>({
  control,
  label,
  name,
  formId,
  fieldId,
}: Props<T>) => {
  const { getStandardFieldLabel } = useFormCustomisation([formId]);
  const helpers = useCustomDatasourceHelpers();
  const { customAttributeSchema } = useCustomisableFormDataContext();
  const { data: users, loading: isLoadingUsers } = useQuery(GetUsersDocument);
  const { data: departmentTypes, loading: isLoadingDepartments } = useQuery(
    GetDepartmentsDocument
  );
  const { data: tags, loading: isLoadingTags } = useGetTags({ queryArgs: {} });
  const { data: userGroups, loading: isLoadingUserGroups } = useQuery(
    GetUserGroupsDocument
  );
  const isLoadingData =
    isLoadingUsers ||
    isLoadingDepartments ||
    isLoadingTags ||
    isLoadingUserGroups;
  const enabledFeatures = useFeatures();
  const filteringProps = useMemo(() => {
    if (isLoadingData) {
      return {
        filteringProperties: [],
        filteringOptions: [],
      };
    }

    return getConditionalPropertyFilterProps({
      formId,
      schema: customAttributeSchema?.Schema,
      uiSchema: customAttributeSchema?.UiSchema,
      data: {
        departmentTypes: departmentTypes?.department_type ?? [],
        users: users?.user ?? [],
        tagTypes: tags?.tag_type ?? [],
        userGroups: userGroups?.user_group ?? [],
      },
      enabledFeatures,
      excludedFieldIds: fieldId ? [fieldId] : [],
      helpers,
      getStandardFieldLabel,
    });
  }, [
    departmentTypes,
    users,
    userGroups,
    tags,
    isLoadingData,
    customAttributeSchema,
    formId,
    fieldId,
    helpers,
    enabledFeatures,
    getStandardFieldLabel,
  ]);

  return (
    <ControlledPropertyFilter<T>
      enableTokenGroups={true}
      testId={'conditions'}
      label={label}
      name={name}
      control={control}
      {...filteringProps}
    />
  );
};
