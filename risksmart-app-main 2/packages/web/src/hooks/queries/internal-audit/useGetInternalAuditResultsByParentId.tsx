import { ParentTypes } from '@risksmart-app/domain/src/types/consts/parent-type';
import type { InternalAuditResultsByParentIdResponse } from '@risksmart-app/trpc/src/types';
import type { GetInternalAuditResultsByParentIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetInternalAuditResultsByParentIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetInternalAuditResultsByParentIdArgs = {
  parentId: string;
};

export const useGetInternalAuditResultsByParentId = createQueryHook<
  UseGetInternalAuditResultsByParentIdArgs,
  InternalAuditResultsByParentIdResponse,
  GetInternalAuditResultsByParentIdQuery
>({
  trpcQueryOptions: (trpc, { parentId }) =>
    trpc.frontend.internalAuditResult.internalAuditResultByParentId.queryOptions(
      {
        parentId,
      }
    ),
  mapTrpcDataToGraphQL: (data) => ({
    ...data,
    document_internal_audit_result: data.document_internal_audit_result.map(
      (result) => ({
        ...result,
        __typename: ParentTypes.DocumentInternalAuditResult,
      })
    ),
    obligation_internal_audit_result: data.obligation_internal_audit_result.map(
      (result) => ({
        ...result,
        __typename: ParentTypes.ObligationInternalAuditResult,
      })
    ),
    risk_controlled_internal_audit_result:
      data.risk_controlled_internal_audit_result.map((result) => ({
        ...result,
        __typename: ParentTypes.RiskControlledInternalAuditResult,
      })),
    risk_uncontrolled_internal_audit_result:
      data.risk_uncontrolled_internal_audit_result.map((result) => ({
        ...result,
        __typename: ParentTypes.RiskUncontrolledInternalAuditResult,
      })),
    control_test_internal_audit_result:
      data.control_test_internal_audit_result.map((result) => ({
        ...result,
        __typename: ParentTypes.ControlTestInternalAuditResult,
      })),
    impact_internal_audit_rating: data.impact_internal_audit_rating.map(
      (rating) => ({ ...rating, ratedItem: rating.ratedItem! })
    ),
  }),
  graphqlDocument: GetInternalAuditResultsByParentIdDocument,
  graphqlVariables: ({ parentId }) => ({ ParentId: parentId }),
});
