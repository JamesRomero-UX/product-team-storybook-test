import type {
  DepartmentGroupTypeListQueryResponse,
  IClient,
} from '../../clients/client.interface';
import type { ListDateTimeQueryFetchFn, ServiceCallContext } from '../../types/service';


export type DepartmentGroupsService = ReturnType<typeof departmentGroupsService>;

export const departmentGroupsService = (client: IClient) => {
  const getDepartmentGroups: ListDateTimeQueryFetchFn<
    DepartmentGroupTypeListQueryResponse['departmentGroupType']
  > = async (query, ctx) => {
    const response = await client.queryDepartmentGroupTypeList(
      { authorization: ctx.authToken },
      {
        limit: query.limit,
        afterDateTime: query.afterDateTime,
        afterId: query.afterId,
        beforeDateTime: query.beforeDateTime,
        beforeId: query.beforeId,
        ...(query.filters?.ids?.length
          ? { filter: { Id: query.filters.ids } }
          : {}),
      }
    );

    return { data: response.departmentGroupType, metadata: response.pageMetadata };
  };

  const getDepartmentGroupById = async (id: string, ctx: ServiceCallContext) => {
    const response = await client.getDepartmentGroupTypeById(
      { authorization: ctx.authToken },
      id
    );

    if (response === null) {
      return null;
    }

    const { departmentGroupType } = response;

    return { data: departmentGroupType };
  };

  return { getDepartmentGroups, getDepartmentGroupById };
};
