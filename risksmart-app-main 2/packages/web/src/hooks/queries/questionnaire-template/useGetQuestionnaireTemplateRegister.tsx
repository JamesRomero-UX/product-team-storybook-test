import type { QuestionnaireTemplateRegisterResponse } from '@risksmart-app/trpc/src/types';
import type {
  GetQuestionnaireTemplatesQuery,
  Questionnaire_Template_Bool_Exp,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  GetQuestionnaireTemplatesDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

import useEntityWhereFilter from '@/hooks/useEntityWhereFilter';

/**
 * Maps TRPC questionnaire template data to match the GraphQL query structure
 */
export function mapTrpcQuestionnaireTemplatesToGraphQL(
  trpcData: QuestionnaireTemplateRegisterResponse
): GetQuestionnaireTemplatesQuery {
  return {
    questionnaire_template: trpcData.questionnaire_template.map(
      (questionnaireTemplate) => ({ ...questionnaireTemplate })
    ),
  };
}

const useQuestionnaireTemplateRegisterGraphqlVariables = () => {
  const where = useEntityWhereFilter<Questionnaire_Template_Bool_Exp>(
    Parent_Type_Enum.QuestionnaireTemplate
  );

  return { where };
};

type UseGetQuestionnaireTemplateRegisterArgs = Record<string, never>;

export const useGetQuestionnaireTemplateRegister = createQueryHook<
  UseGetQuestionnaireTemplateRegisterArgs,
  QuestionnaireTemplateRegisterResponse,
  GetQuestionnaireTemplatesQuery
>({
  trpcQueryOptions: (trpc) =>
    trpc.frontend.questionnaireTemplate.register.queryOptions(),
  mapTrpcDataToGraphQL: mapTrpcQuestionnaireTemplatesToGraphQL,
  graphqlDocument: GetQuestionnaireTemplatesDocument,
  graphqlVariables: useQuestionnaireTemplateRegisterGraphqlVariables,
});
