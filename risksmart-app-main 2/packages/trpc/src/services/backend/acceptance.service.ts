import { ParentTypes } from '@risksmart-app/domain/src/types/consts/parent-type';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { getAcceptanceByIdQueryConfig } from '@risksmart-app/drizzle/src/queries/acceptance.query';
import { getFormConfigurationForType } from '@risksmart-app/drizzle/src/queries/utils';

import type {
  AcceptanceBackendService,
  BackendServiceContext,
} from '../service.types';

export class AcceptanceServiceImpl implements AcceptanceBackendService {
  async getAcceptanceById(ctx: BackendServiceContext, acceptanceId: string) {
    const db = await createDrizzleClient(ctx);

    return db.org(async (tx) => {
      const [formConfig, data] = await Promise.all([
        tx.query.form_configuration.findFirst({
          ...getFormConfigurationForType,
          where: {
            ParentType: ParentTypes.Acceptance,
          },
        }),
        tx.query.acceptance.findFirst({
          ...getAcceptanceByIdQueryConfig,
          where: { Id: acceptanceId },
        }),
      ]);

      return data
        ? { acceptance: data, form_configuration: formConfig ?? null }
        : null;
    });
  }
}
