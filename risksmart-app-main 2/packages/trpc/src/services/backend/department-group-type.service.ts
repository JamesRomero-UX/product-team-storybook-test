import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { getDepartmentGroupTypesQueryConfig } from '@risksmart-app/drizzle/src/queries/department-group-type.query';

import type { ListQueryByUuidTs } from '../../routers/backend/query.schema';
import {
  computePageAndMetaCompound,
  DEFAULT_PAGE_LIMIT,
  uuidDateTimePaginationConfig,
} from '../../utils/pagination';
import type {
  BackendServiceContext,
  DepartmentGroupTypeBackendService,
  DepartmentGroupTypeListFilter,
} from '../service.types';

export class DepartmentGroupTypeServiceImpl implements DepartmentGroupTypeBackendService {
  async getDepartmentGroupTypeById(ctx: BackendServiceContext, id: string) {
    const db = await createDrizzleClient(ctx);

    return db.org(async (tx) => {
      const data = await tx.query.department_type_group.findFirst({
        where: { Id: id },
        ...getDepartmentGroupTypesQueryConfig,
      });

      return data ? { departmentGroupType: data } : null;
    });
  }

  async getDepartmentGroupTypeList(
    ctx: BackendServiceContext,
    opts: ListQueryByUuidTs,
    filter?: DepartmentGroupTypeListFilter
  ) {
    const db = await createDrizzleClient(ctx);
    const listPagination = uuidDateTimePaginationConfig(
      opts,
      DEFAULT_PAGE_LIMIT,
      'desc'
    );

    const idFilter =
      filter?.Id && filter.Id.length > 0 ? { in: filter.Id } : undefined;

    const data = await db.org(async (tx) => {
      return tx.query.department_type_group.findMany({
        where: {
          ...listPagination.queryConfig.where,
          ...(idFilter ? { Id: idFilter } : {}),
        },
        limit: listPagination.queryConfig.limit,
        orderBy: (tbl, { asc, desc }) =>
          listPagination.direction === 'asc'
            ? [asc(tbl.CreatedAtTimestamp), asc(tbl.Id)]
            : [desc(tbl.CreatedAtTimestamp), desc(tbl.Id)],
        ...getDepartmentGroupTypesQueryConfig,
      });
    });

    const { page, metadata } = computePageAndMetaCompound(
      {
        beforeId: opts?.beforeId ?? null,
        beforeDateTime: opts?.beforeDateTime ?? null,
        afterId: opts?.afterId ?? null,
        afterDateTime: opts?.afterDateTime ?? null,
      },
      data,
      listPagination.limit,
      'Id',
      'CreatedAtTimestamp'
    );

    return {
      pageMetadata: metadata,
      departmentGroupType: page,
    };
  }
}
