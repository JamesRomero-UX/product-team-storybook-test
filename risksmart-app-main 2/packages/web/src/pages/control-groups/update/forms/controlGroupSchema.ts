import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetControlGroupsByTitle } from 'src/hooks/queries';
import {
  CustomAttributeDataSchema,
  UserOptionSchema,
} from 'src/schemas/global';
import { z } from 'zod';

export const useControlGroupSchema = (
  controlGroupId: string | undefined = undefined
) => {
  const { t } = useTranslation(['common'], { keyPrefix: 'controlGroups' });
  const [title, setTitle] = useState('');
  const { refetch } = useGetControlGroupsByTitle({ queryArgs: { title } });

  const ControlGroupSchema = z
    .object({
      Title: z
        .string()
        .min(1, { message: 'Required' })
        .refine(
          async (title) => {
            setTitle(title);
            const { data } = await refetch();

            return (
              data === undefined ||
              data.control_group.filter((cg) => cg.Id !== controlGroupId)
                .length === 0
            );
          },
          {
            message: t('fields.Title_duplicate', 'Please use a unique title'),
          }
        ),
      Description: z.string(),
      Owner: UserOptionSchema,
    })
    .and(CustomAttributeDataSchema);

  return ControlGroupSchema;
};

export type ControlGroupFormFieldData = z.infer<
  ReturnType<typeof useControlGroupSchema>
>;

export const defaultValues: ControlGroupFormFieldData = {
  Title: '',
  Description: '',
  Owner: null as unknown as z.infer<typeof UserOptionSchema>,
  CustomAttributeData: null,
};
