import type { QuestionnaireTemplateVersionByParentIdResponse } from '@risksmart-app/trpc/src/types';
import type { GetQuestionnaireTemplateVersionsByQuestionnaireTemplateIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetQuestionnaireTemplateVersionsByQuestionnaireTemplateIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetQuestionnaireTemplateVersionsByQuestionnaireTemplateIdArgs = {
  parentId: string;
};

export const useGetQuestionnaireTemplateVersionsByQuestionnaireTemplateId =
  createQueryHook<
    UseGetQuestionnaireTemplateVersionsByQuestionnaireTemplateIdArgs,
    QuestionnaireTemplateVersionByParentIdResponse,
    GetQuestionnaireTemplateVersionsByQuestionnaireTemplateIdQuery
  >({
    trpcQueryOptions: (trpc, { parentId }) =>
      trpc.frontend.questionnaireTemplateVersion.getByParentId.queryOptions({
        parentId,
      }),
    mapTrpcDataToGraphQL: (data) => ({
      questionnaire_template_version: data.questionnaire_template_version ?? [],
    }),
    graphqlDocument:
      GetQuestionnaireTemplateVersionsByQuestionnaireTemplateIdDocument,
    graphqlVariables: ({ parentId }) => ({
      questionnaireTemplateId: parentId,
    }),
  });
