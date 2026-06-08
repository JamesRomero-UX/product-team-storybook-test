import { Questionnaire_Template_Version_Status_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';

import type { QuestionnaireTemplateVersionFormFieldData } from './questionnaireTemplateVersionSchema';
import { QuestionnaireTemplateVersionFormSchema } from './questionnaireTemplateVersionSchema';

const validInput: QuestionnaireTemplateVersionFormFieldData = {
  Version: '1',
  Status: Questionnaire_Template_Version_Status_Enum.Archived,
  Schema: {},
  UISchema: {},
};

describe('QuestionnaireTemplateVersionFormSchema', () => {
  it('should parse valid input', () => {
    expect(
      QuestionnaireTemplateVersionFormSchema.parse(validInput)
    ).toStrictEqual(validInput);
  });
});
