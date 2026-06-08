import { ParentTypes } from '@risksmart-app/domain/src/types/consts/parent-type';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import {
  getControlByIdQueryConfig,
  getControlListQueryConfig,
} from '@risksmart-app/drizzle/src/queries/control.query';
import { getFormConfigurationForType } from '@risksmart-app/drizzle/src/queries/utils';

import type { ListQueryBySeqId } from '../../routers/backend/query.schema';
import {
  computePageAndMeta,
  sequentialIdPaginationConfig,
} from '../../utils/pagination';
import type {
  BackendServiceContext,
  ControlBackendService,
} from '../service.types';

export class ControlServiceImpl implements ControlBackendService {
  async getControlList(ctx: BackendServiceContext, opts: ListQueryBySeqId) {
    const db = await createDrizzleClient(ctx);
    const listPagination = sequentialIdPaginationConfig(opts);
    const { beforeSequentialId = null, afterSequentialId = null } = opts || {};

    if (!listPagination) {
      throw new Error(
        "Provide only one of 'after' or 'before' for pagination."
      );
    }

    const data = await db.org((tx) => {
      return tx.query.control.findMany({
        ...getControlListQueryConfig,
        ...(listPagination ? listPagination.queryConfig : {}),
      });
    });

    const { page, metadata } = computePageAndMeta(
      { beforeId: beforeSequentialId, afterId: afterSequentialId },
      data,
      listPagination.limit,
      'SequentialId'
    );

    return {
      pageMetadata: metadata,
      control: page,
    };
  }
  async getControlById(ctx: BackendServiceContext, controlId: string) {
    const db = await createDrizzleClient(ctx);

    return db.org(async (tx) => {
      const [formConfig, controlData] = await Promise.all([
        tx.query.form_configuration.findFirst({
          ...getFormConfigurationForType,
          where: {
            ParentType: ParentTypes.Control,
          },
        }),
        tx.query.control.findFirst({
          where: { Id: controlId },
          ...getControlByIdQueryConfig,
        }),
      ]);

      return controlData
        ? { control: controlData, form_configuration: formConfig ?? null }
        : null;
    });
  }
}
