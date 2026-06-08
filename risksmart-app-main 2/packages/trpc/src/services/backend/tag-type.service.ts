import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { getTagTypesQueryConfig } from '@risksmart-app/drizzle/src/queries/tag-type.query';

import type { ListQueryByUuidTs } from '../../routers/backend/query.schema';
import {
  computePageAndMetaCompound,
  DEFAULT_PAGE_LIMIT,
  uuidDateTimePaginationConfig,
} from '../../utils/pagination';
import type {
  BackendServiceContext,
  TagTypeBackendService,
  TagTypeListFilter,
} from '../service.types';

export class TagTypeServiceImpl implements TagTypeBackendService {
  async getTagTypeById(ctx: BackendServiceContext, id: string) {
    const db = await createDrizzleClient(ctx);

    return db.org(async (tx) => {
      const data = await tx.query.tag_type.findFirst({
        where: { TagTypeId: id },
        ...getTagTypesQueryConfig,
      });

      return data ? { tagType: data } : null;
    });
  }

  async getTagTypeList(
    ctx: BackendServiceContext,
    opts: ListQueryByUuidTs,
    filter?: TagTypeListFilter
  ) {
    const db = await createDrizzleClient(ctx);
    const listPagination = uuidDateTimePaginationConfig(
      opts,
      DEFAULT_PAGE_LIMIT,
      'desc',
      'CreatedAtTimestamp',
      'TagTypeId'
    );

    const idFilter =
      filter?.Id && filter.Id.length > 0 ? { in: filter.Id } : undefined;

    const data = await db.org(async (tx) => {
      return tx.query.tag_type.findMany({
        where: {
          ...listPagination.queryConfig.where,
          ...(idFilter ? { TagTypeId: idFilter } : {}),
        },
        limit: listPagination.queryConfig.limit,
        orderBy: (tbl, { asc, desc }) =>
          listPagination.direction === 'asc'
            ? [asc(tbl.CreatedAtTimestamp), asc(tbl.TagTypeId)]
            : [desc(tbl.CreatedAtTimestamp), desc(tbl.TagTypeId)],
        ...getTagTypesQueryConfig,
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
      'TagTypeId',
      'CreatedAtTimestamp'
    );

    return {
      pageMetadata: metadata,
      tagType: page,
    };
  }
}
