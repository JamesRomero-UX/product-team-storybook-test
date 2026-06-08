import type {
  DepartmentTypeListQueryResponse,
  IClient,
} from '../../clients/client.interface';
import { DepartmentValidationError } from '../../errors/department.errors';
import type { MutateServiceContext } from '../../schemas/common/base.schema';
import type {
  ListDateTimeQueryFetchFn,
  ServiceCallContext,
} from '../../types/service';
import { chunk } from '../../utils/array';

const DEPARTMENT_ID_BATCH_SIZE = 100;

export type DepartmentsService = ReturnType<typeof departmentsService>;

export const departmentsService = (client: IClient) => {
  const getDepartments: ListDateTimeQueryFetchFn<
    DepartmentTypeListQueryResponse['departmentType']
  > = async (query, ctx) => {
    const response = await client.queryDepartmentTypeList(
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

    return { data: response.departmentType, metadata: response.pageMetadata };
  };

  const getDepartmentById = async (id: string, ctx: ServiceCallContext) => {
    const response = await client.getDepartmentTypeById(
      { authorization: ctx.authToken },
      id
    );

    if (response === null) {
      return null;
    }

    const { departmentType } = response;

    return { data: departmentType };
  };

  const validateDepartmentIds = async (
    departmentIds: string[],
    ctx: MutateServiceContext
  ) => {
    const uniqueIds = [...new Set(departmentIds)];

    if (uniqueIds.length === 0) {
      throw new DepartmentValidationError(
        `Provided department ID list empty, at least one required.`
      );
    }

    const batches = chunk(uniqueIds, DEPARTMENT_ID_BATCH_SIZE);

    const batchResults = await Promise.all(
      batches.map((batch) =>
        getDepartments(
          {
            filters: { ids: batch },
            limit: batch.length,
            beforeDateTime: null,
            beforeId: null,
            afterDateTime: null,
            afterId: null,
          },
          ctx
        )
      )
    );

    const returnedIds = batchResults.flatMap((r) =>
      r.data.map((dept) => dept.DepartmentTypeId)
    );
    const returnedIdSet = new Set(returnedIds);
    const unmatchedIds = uniqueIds.filter((id) => !returnedIdSet.has(id));

    if (unmatchedIds.length > 0) {
      throw new DepartmentValidationError(
        `Departments with IDs ${unmatchedIds.join(', ')} not found`
      );
    }

    return returnedIds;
  };

  return { getDepartments, getDepartmentById, validateDepartmentIds };
};
