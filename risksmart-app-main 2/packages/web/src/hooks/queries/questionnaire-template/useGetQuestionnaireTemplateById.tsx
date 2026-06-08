import type { QuestionnaireTemplateResponse } from '@risksmart-app/trpc/src/types';
import type { GetQuestionnaireTemplateByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetQuestionnaireTemplateByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetQuestionnaireTemplateByIdArgs = { id: string };

export const useGetQuestionnaireTemplateById = createQueryHook<
  UseGetQuestionnaireTemplateByIdArgs,
  QuestionnaireTemplateResponse,
  GetQuestionnaireTemplateByIdQuery
>({
  trpcQueryOptions: (trpc, { id }) =>
    trpc.frontend.questionnaireTemplate.getById.queryOptions({ id }),
  mapTrpcDataToGraphQL: (data) => data,
  graphqlDocument: GetQuestionnaireTemplateByIdDocument,
  graphqlVariables: ({ id }) => ({ Id: id }),
});
