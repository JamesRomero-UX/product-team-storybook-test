import { useLazyQuery } from '@apollo/client';
import { GetTagTypesByNameDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

export const useTagTypeSchema = (tagTypeId: string | undefined) => {
  const [getTagTypeByName] = useLazyQuery(GetTagTypesByNameDocument, {
    fetchPolicy: 'no-cache',
  });
  const { t } = useTranslation(['common'], { keyPrefix: 'tags' });
  const TagTypeSchema = z.object({
    Name: z
      .string()
      .min(1, { message: 'Required' })
      .refine(
        async (name) => {
          const { data } = await getTagTypeByName({
            variables: {
              Name: name,
            },
          });

          return (
            data?.tag_type.filter((cg) => cg.TagTypeId !== tagTypeId).length ===
            0
          );
        },
        {
          message: t('fields.validation.uniqueName'),
        }
      ),
    Description: z.string().nullish(),
    TagGroupId: z.string().uuid().nullish(),
    TagGroupName: z.string().nullish(),
  });

  return TagTypeSchema;
};

export type TagTypeFormFields = z.infer<ReturnType<typeof useTagTypeSchema>>;

export const defaultValues: TagTypeFormFields = {
  Name: '',
};
