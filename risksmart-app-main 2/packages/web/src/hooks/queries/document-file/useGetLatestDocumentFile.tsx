import type { VersionStatus } from '@risksmart-app/domain/src/types/consts/version-status';
import type { LatestDocumentFileResponseRow } from '@risksmart-app/trpc/src/types';
import type {
  GetDocumentFileQuery,
  Version_Status_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetDocumentFileDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetLatestDocumentFileArgs = {
  parentDocumentId: string;
  fileId?: string;
  status?: VersionStatus | Version_Status_Enum;
};

export const useGetLatestDocumentFile = createQueryHook<
  UseGetLatestDocumentFileArgs,
  LatestDocumentFileResponseRow[],
  GetDocumentFileQuery
>({
  trpcQueryOptions: (trpc, { parentDocumentId, fileId, status }) =>
    trpc.frontend.documentFile.latestDocumentFile.queryOptions({
      parentDocumentId,
      fileId,
      status: status as VersionStatus,
    }),
  mapTrpcDataToGraphQL: (data) => ({ document_file: data }),
  graphqlDocument: GetDocumentFileDocument,
  graphqlVariables: ({ parentDocumentId, fileId, status }) => {
    const where: Record<string, unknown> = {
      ParentDocumentId: { _eq: parentDocumentId },
    };

    // Add fileId filter if provided and not 'latest'
    if (fileId && fileId !== 'latest') {
      where.Id = { _eq: fileId };
    }

    // Add status filter if provided
    if (status) {
      where.Status = { _eq: status };
    }

    return { where };
  },
});
