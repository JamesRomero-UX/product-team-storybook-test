import type { QuestionnaireTemplateVersionByIdResponse } from '@risksmart-app/trpc/src/types';
import type { GetLatestQuestionnaireTemplateVersionQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetLatestQuestionnaireTemplateVersionDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetLatestQuestionnaireTemplateVersionArgs = { parentId: string };

export const useGetLatestQuestionnaireTemplateVersion = createQueryHook<
  UseGetLatestQuestionnaireTemplateVersionArgs,
  QuestionnaireTemplateVersionByIdResponse,
  GetLatestQuestionnaireTemplateVersionQuery
>({
  trpcQueryOptions: (trpc, { parentId }) =>
    trpc.frontend.questionnaireTemplateVersion.getLatest.queryOptions({
      parentId,
    }),
  mapTrpcDataToGraphQL: (data) => ({
    questionnaire_template_version: data?.questionnaire_template_version
      ? [data.questionnaire_template_version]
      : [],
  }),
  graphqlDocument: GetLatestQuestionnaireTemplateVersionDocument,
  graphqlVariables: ({ parentId }) => ({
    where: { ParentId: { _eq: parentId } },
  }),
  graphqlFetchPolicy: 'no-cache',
});
