import { ParentTypes } from '@risksmart-app/domain/src/types/consts/parent-type';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { getAppetiteByIdQueryConfig } from '@risksmart-app/drizzle/src/queries/appetite.query';
import { getFormConfigurationForType } from '@risksmart-app/drizzle/src/queries/utils';

import type {
  AppetiteBackendService,
  BackendServiceContext,
} from '../service.types';

export class AppetiteServiceImpl implements AppetiteBackendService {
  async getAppetiteById(ctx: BackendServiceContext, id: string) {
    const db = await createDrizzleClient(ctx);

    return db.org(async (tx) => {
      const [formConfig, data] = await Promise.all([
        tx.query.form_configuration.findFirst({
          ...getFormConfigurationForType,
          where: {
            ParentType: ParentTypes.Appetite,
          },
        }),
        tx.query.appetite.findFirst({
          ...getAppetiteByIdQueryConfig,
          where: { Id: id },
        }),
      ]);

      return data
        ? { appetite: data, form_configuration: formConfig ?? null }
        : null;
    });
  }
}
