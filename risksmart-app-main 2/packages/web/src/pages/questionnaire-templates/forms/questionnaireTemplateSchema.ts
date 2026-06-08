import type { DefaultValues } from 'react-hook-form';
import { z } from 'zod';

import {
  CustomAttributeDataSchema,
  InheritedContributorSchema,
  TagsAndDepartmentsSchema,
  UserOrGroupsSchema,
} from '../../../schemas/global';

export const questionnaireTemplateFormSchema = z
  .object({
    Title: z.string().min(1, 'Required'),
    Description: z.string().nullish(),
    Contributors: UserOrGroupsSchema,
    Owners: UserOrGroupsSchema.min(1, { message: 'Required' }),
    ancestorContributors: InheritedContributorSchema,
  })
  .and(TagsAndDepartmentsSchema)
  .and(CustomAttributeDataSchema);

export type QuestionnaireTemplateFormData = z.infer<
  typeof questionnaireTemplateFormSchema
>;

export const defaultValues: DefaultValues<QuestionnaireTemplateFormData> = {
  Title: '',
  Description: '',
  Owners: [],
  Contributors: [],
  ancestorContributors: [],
  tags: [],
  departments: [],
  CustomAttributeData: null,
};
