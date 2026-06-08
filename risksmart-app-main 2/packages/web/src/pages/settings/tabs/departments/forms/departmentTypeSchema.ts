import { useLazyQuery } from '@apollo/client';
import { GetDepartmentTypesByNameDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

export const useDepartmentTypeSchema = (
  departmentTypeId: string | undefined
) => {
  const [getDepartmentTypeByName] = useLazyQuery(
    GetDepartmentTypesByNameDocument,
    {
      fetchPolicy: 'no-cache',
    }
  );
  const { t } = useTranslation(['common'], { keyPrefix: 'departments' });
  const DepartmentTypeSchema = z.object({
    Name: z
      .string()
      .min(1, { message: 'Required' })
      .refine(
        async (name) => {
          const { data } = await getDepartmentTypeByName({
            variables: {
              Name: name,
            },
          });

          return (
            data?.department_type.filter(
              (cg) => cg.DepartmentTypeId !== departmentTypeId
            ).length === 0
          );
        },
        {
          message: t('fields.validation.uniqueName'),
        }
      ),
    Description: z.string().nullish(),
    DepartmentGroupId: z.string().uuid().nullish(),
    DepartmentGroupName: z.string().nullish(),
  });

  return DepartmentTypeSchema;
};

export type DepartmentTypeFormFields = z.infer<
  ReturnType<typeof useDepartmentTypeSchema>
>;

export const defaultValues: DepartmentTypeFormFields = {
  Name: '',
};
