import { useQuery } from '@apollo/client';
import type { SelectProps } from '@risk-smart/themed-cloudscape-components/select';
import type { GetDepartmentsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetDepartmentsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';

import type { DepartmentType } from '@/types/types';

import type { StatusType } from '../controlled-select/ControlledSelect';
import { sortByLabel } from '../form-utils';

const cleanRawDepartmentTypes = (
  rawDepartments?: GetDepartmentsQuery
): Array<DepartmentType> => {
  return (rawDepartments?.department_type || []).map(
    ({ Name, Description, DepartmentTypeId, department_type_group }) => ({
      Name: Name,
      Description: Description || '',
      DepartmentTypeId: DepartmentTypeId,
      DepartmentTypeGroupName: department_type_group?.Name,
    })
  );
};

const departmentsToGroupDefinition = (groupedDepartments: {
  [key: string]: DepartmentType[];
}) =>
  Object.keys(groupedDepartments)
    .sort()
    .map<SelectProps.OptionGroup>((groupName) => ({
      label: groupName,
      options: groupedDepartments[groupName]
        .map((dept) => ({
          value: dept.DepartmentTypeId,
          label: dept.Name || '',
          description: dept.Description || '',
        }))
        .sort(sortByLabel),
    }));

export const useDepartmentOptions = () => {
  const { data, loading, error } = useQuery(GetDepartmentsDocument, {});
  const departments = cleanRawDepartmentTypes(data);

  const optionItems = useMemo<
    (SelectProps.Option | SelectProps.OptionGroup)[]
  >(() => {
    const noGroup = 'No group';
    const groupedDepartments = departments.reduce<{
      [key: string]: DepartmentType[];
    }>((acc, obj) => {
      const groupName = obj.DepartmentTypeGroupName ?? noGroup;
      acc[groupName] = acc[groupName] || [];
      acc[groupName].push(obj);

      return acc;
    }, {});

    const departmentOptions = departmentsToGroupDefinition(groupedDepartments);

    const groupedDepartmentOptions = departmentOptions.filter(
      (x) => x.label !== noGroup
    );
    const ungroupedDepartmentOptions = departmentOptions.filter(
      (x) => x.label === noGroup
    );

    if (
      groupedDepartmentOptions.length <= 0 &&
      ungroupedDepartmentOptions.length > 0
    ) {
      return ungroupedDepartmentOptions[0].options as SelectProps.Option[];
    }

    return [...groupedDepartmentOptions, ...ungroupedDepartmentOptions];
  }, [departments]);

  let statusType: StatusType | undefined = undefined;
  if (loading) {
    statusType = 'loading';
  } else if (error) {
    statusType = 'error';
  }

  return { departments, optionItems, statusType };
};
