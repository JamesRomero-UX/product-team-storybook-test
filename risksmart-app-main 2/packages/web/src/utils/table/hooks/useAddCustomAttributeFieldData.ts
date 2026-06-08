import { useQuery } from '@apollo/client';
import { GetUsersDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';

import { useGetDepartments } from '@/hooks/queries';
import type { JSONObject } from '@/types/types';

import type { Dataset, FieldConfig, TableFields, TableRecord } from '../types';
import { getCustomAttributeDataForRecord } from '../utils/customAttributes';

export type TableFieldsWithCustomAttributes<T extends TableRecord> =
  TableFields<T> & {
    [key: string]: FieldConfig<{
      CustomAttributeData: JSONObject;
    }>;
  };

type Options<T extends TableRecord> = {
  data?: Dataset<T> | undefined;
  tableFields: TableFieldsWithCustomAttributes<T>;
};

/**
 * Spreads custom attribute fields onto the dataset so they can be used as
 * columns in the datagrid
 *
 * @param
 * @returns
 */
export const useAddCustomAttributeFieldData = <T extends TableRecord>({
  data,
  tableFields,
}: Options<T>) => {
  const { data: userData } = useQuery(GetUsersDocument);
  const userLookup = useMemo(() => {
    return userData?.user.reduce(
      (acc, user) => {
        if (user.Id && user.FriendlyName) {
          acc[user.Id] = user.FriendlyName;
        }

        return acc;
      },
      {} as Record<string, string>
    );
  }, [userData]);
  const { data: departmentTypeData } = useGetDepartments({ queryArgs: {} });
  const departmentTypeLookup = useMemo(
    () =>
      departmentTypeData?.department_type.reduce(
        (acc, department) => {
          if (department.DepartmentTypeId && department.Name) {
            acc[department.DepartmentTypeId] = department.Name;
          }

          return acc;
        },
        {} as Record<string, string>
      ),
    [departmentTypeData]
  );

  // Get all fields and convert into table columns.
  return useMemo(
    () =>
      (data ?? []).map((record) => ({
        ...record,
        ...getCustomAttributeDataForRecord(tableFields, record, {
          userLookup,
          departmentTypeLookup,
        }),
      })),
    [tableFields, data, departmentTypeLookup, userLookup]
  );
};
