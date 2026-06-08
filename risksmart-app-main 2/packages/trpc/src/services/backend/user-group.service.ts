import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import {
  getUserGroupByIdQueryConfig,
  getUserGroupsWithApproversQueryConfig,
} from '@risksmart-app/drizzle/src/queries/user-group.query';

import type { ListQueryByUuidTs } from '../../routers/backend/query.schema';
import {
  computePageAndMetaCompound,
  uuidDateTimePaginationConfig,
} from '../../utils/pagination';
import type {
  BackendServiceContext,
  UserGroupBackendService,
  UserGroupListFilter,
} from '../service.types';

export class UserGroupServiceImpl implements UserGroupBackendService {
  async getUserGroupById(ctx: BackendServiceContext, id: string) {
    const db = await createDrizzleClient(ctx);

    return db.org(async (tx) => {
      const userGroupData = await tx.query.user_group.findFirst({
        where: { Id: id },
        ...getUserGroupByIdQueryConfig,
      });

      return userGroupData
        ? { userGroup: userGroupData, form_configuration: null }
        : null;
    });
  }

  async getUserGroupList(
    ctx: BackendServiceContext,
    opts: ListQueryByUuidTs,
    filter?: UserGroupListFilter
  ) {
    const db = await createDrizzleClient(ctx);
    const listPagination = uuidDateTimePaginationConfig(opts);

    const idFilter =
      filter?.Id && filter.Id.length > 0 ? { in: filter.Id } : undefined;

    const data = await db.org(async (tx) => {
      return tx.query.user_group.findMany({
        where: {
          ...listPagination.queryConfig.where,
          ...(idFilter ? { Id: idFilter } : {}),
        },
        limit: listPagination.queryConfig.limit,
        orderBy: (tbl, { asc, desc }) =>
          listPagination.direction === 'asc'
            ? [asc(tbl.CreatedAtTimestamp), asc(tbl.Id)]
            : [desc(tbl.CreatedAtTimestamp), desc(tbl.Id)],
        ...getUserGroupsWithApproversQueryConfig,
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
      userGroup: page,
    };
  }
}
