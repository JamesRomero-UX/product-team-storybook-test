import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { getDepartmentTypesQueryConfig } from '@risksmart-app/drizzle/src/queries/department-type.query';

import type { ListQueryByUuidTs } from '../../routers/backend/query.schema';
import {
  computePageAndMetaCompound,
  DEFAULT_PAGE_LIMIT,
  uuidDateTimePaginationConfig,
} from '../../utils/pagination';
import type {
  BackendServiceContext,
  DepartmentTypeBackendService,
  DepartmentTypeListFilter,
} from '../service.types';

export class DepartmentTypeServiceImpl implements DepartmentTypeBackendService {
  async getDepartmentTypeById(ctx: BackendServiceContext, id: string) {
    const db = await createDrizzleClient(ctx);

    return db.org(async (tx) => {
      const data = await tx.query.department_type.findFirst({
        where: { DepartmentTypeId: id },
        ...getDepartmentTypesQueryConfig,
      });

      return data ? { departmentType: data, form_configuration: null } : null;
    });
  }

  async getDepartmentTypeList(
    ctx: BackendServiceContext,
    opts: ListQueryByUuidTs,
    filter?: DepartmentTypeListFilter
  ) {
    const db = await createDrizzleClient(ctx);
    const listPagination = uuidDateTimePaginationConfig(
      opts,
      DEFAULT_PAGE_LIMIT,
      'desc',
      'CreatedAtTimestamp',
      'DepartmentTypeId'
    );

    const idFilter =
      filter?.Id && filter.Id.length > 0 ? { in: filter.Id } : undefined;

    const data = await db.org(async (tx) => {
      return tx.query.department_type.findMany({
        where: {
          ...listPagination.queryConfig.where,
          ...(idFilter ? { DepartmentTypeId: idFilter } : {}),
        },
        limit: listPagination.queryConfig.limit,
        orderBy: (tbl, { asc, desc }) =>
          listPagination.direction === 'asc'
            ? [asc(tbl.CreatedAtTimestamp), asc(tbl.DepartmentTypeId)]
            : [desc(tbl.CreatedAtTimestamp), desc(tbl.DepartmentTypeId)],
        ...getDepartmentTypesQueryConfig,
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
      'DepartmentTypeId',
      'CreatedAtTimestamp'
    );

    return {
      pageMetadata: metadata,
      departmentType: page,
    };
  }
}
