import type {
  ControlRegisterItem,
  ControlRegisterResponse,
} from '@risksmart-app/trpc/src/types';
import type {
  Control_Bool_Exp,
  GetControlsQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  GetControlsDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

import useEntityWhereFilter from '@/hooks/useEntityWhereFilter';

type UseGetControlsRegisterArgs = {
  parentId?: string;
};

const useControlsGraphqlVariables = (args: UseGetControlsRegisterArgs) => {
  const entityFilter = useEntityWhereFilter<Control_Bool_Exp>(
    Parent_Type_Enum.Control
  );

  // Override with parent filter when parentId exists
  if (args.parentId) {
    return {
      where: {
        parents: { ParentId: { _eq: args.parentId } },
      },
    };
  }

  return {
    where: entityFilter,
  };
};

function mapTrpcControlToGraphQL(
  control: ControlRegisterItem
): GetControlsQuery['control'][number] {
  return {
    ...control,
    actions_aggregate: {
      aggregate: {
        count: control.actionCount ?? 0,
      },
    },
    issues_aggregate: {
      aggregate: {
        count: control.issueCount ?? 0,
      },
    },
    open_issue_aggregate: {
      aggregate: {
        count: control.openIssueCount ?? 0,
      },
    },
    indicators_aggregate: {
      aggregate: {
        count: control.indicatorCount ?? 0,
      },
    },
  };
}

export const useGetControlsRegister = createQueryHook<
  UseGetControlsRegisterArgs,
  ControlRegisterResponse,
  GetControlsQuery
>({
  trpcQueryOptions: (trpc, args) =>
    trpc.frontend.control.register.queryOptions({ parentId: args.parentId }),
  mapTrpcDataToGraphQL: (data) => ({
    control: data.control.map((control) => mapTrpcControlToGraphQL(control)),
  }),
  graphqlDocument: GetControlsDocument,
  graphqlVariables: useControlsGraphqlVariables,
});

/**
 * Maps TRPC control data to match the GraphQL query structure
 * Exported for use in data sources
 */
export function mapTrpcControlsToGraphQL(
  trpcData: ControlRegisterResponse | undefined
): GetControlsQuery | undefined {
  if (!trpcData) {
    return undefined;
  }

  return {
    control: trpcData.control.map((control) =>
      mapTrpcControlToGraphQL(control)
    ),
  };
}
