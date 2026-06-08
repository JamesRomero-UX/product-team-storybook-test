import {
  defaultSchema,
  defaultUISchema,
} from '@risksmart-app/components/src/form-builder/store/useFormBuilderStore';
import {
  Questionnaire_Template_Version_Status_Enum,
  Version_Status_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { CustomAttributeDataSchema } from 'src/schemas/global';
import { z } from 'zod';

export const QuestionnaireTemplateVersionFormSchema = z
  .object({
    Version: z.string().min(1, { message: 'Required' }),
    Status: z.nativeEnum(Questionnaire_Template_Version_Status_Enum),
    Schema: z.any(),
    UISchema: z.any(),
  })
  .and(CustomAttributeDataSchema);

export type QuestionnaireTemplateVersionFormFieldData = z.infer<
  typeof QuestionnaireTemplateVersionFormSchema
>;

export const defaultValues: QuestionnaireTemplateVersionFormFieldData = {
  Version: '0.1',
  Status: Version_Status_Enum.Draft,
  Schema: defaultSchema,
  UISchema: defaultUISchema,
};
