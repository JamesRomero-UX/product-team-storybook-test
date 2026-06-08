import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import {
  getUserByIdQueryConfig,
  getUserListQueryConfig,
} from '@risksmart-app/drizzle/src/queries/user.query';

import type { ListQueryByUuidTs } from '../../routers/backend/query.schema';
import {
  computePageAndMetaCompound,
  DEFAULT_PAGE_LIMIT,
  uuidDateTimePaginationConfig,
} from '../../utils/pagination';
import type {
  BackendServiceContext,
  UserBackendService,
  UserListFilter,
} from '../service.types';

export class UserServiceImpl implements UserBackendService {
  async getUserById(ctx: BackendServiceContext, id: string) {
    const db = await createDrizzleClient(ctx);

    return db.org(async (tx) => {
      const userData = await tx.query.user_view_active.findFirst({
        where: { Id: id },
        ...getUserByIdQueryConfig,
      });

      return userData ? { user: userData, form_configuration: null } : null;
    });
  }

  async getUserList(
    ctx: BackendServiceContext,
    opts: ListQueryByUuidTs,
    filter?: UserListFilter
  ) {
    const db = await createDrizzleClient(ctx);
    const listPagination = uuidDateTimePaginationConfig(
      opts,
      DEFAULT_PAGE_LIMIT,
      'desc',
      'LastSeen'
    );

    const idFilter =
      filter?.Id && filter.Id.length > 0 ? { in: filter.Id } : undefined;

    const data = await db.org(async (tx) => {
      return tx.query.user_view_active.findMany({
        where: {
          ...listPagination.queryConfig.where,
          ...(idFilter ? { Id: idFilter } : {}),
        },
        limit: listPagination.queryConfig.limit,
        orderBy: (tbl, { asc, desc }) =>
          listPagination.direction === 'asc'
            ? [asc(tbl.LastSeen), asc(tbl.Id)]
            : [desc(tbl.LastSeen), desc(tbl.Id)],
        ...getUserListQueryConfig,
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
      'LastSeen'
    );

    return {
      pageMetadata: metadata,
      user: page,
    };
  }
}
