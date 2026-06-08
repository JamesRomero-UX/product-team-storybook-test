import type { QuestionnaireTemplateVersionByIdResponse } from '@risksmart-app/trpc/src/types';
import type { GetQuestionnaireTemplateVersionByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetQuestionnaireTemplateVersionByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetQuestionnaireTemplateVersionByIdArgs = { id: string };

export const useGetQuestionnaireTemplateVersionById = createQueryHook<
  UseGetQuestionnaireTemplateVersionByIdArgs,
  QuestionnaireTemplateVersionByIdResponse,
  GetQuestionnaireTemplateVersionByIdQuery
>({
  trpcQueryOptions: (trpc, { id }) =>
    trpc.frontend.questionnaireTemplateVersion.getById.queryOptions({ id }),
  mapTrpcDataToGraphQL: (data) => ({
    questionnaire_template_version: data?.questionnaire_template_version,
  }),
  graphqlDocument: GetQuestionnaireTemplateVersionByIdDocument,
  graphqlVariables: ({ id }) => ({ Id: id }),
});
