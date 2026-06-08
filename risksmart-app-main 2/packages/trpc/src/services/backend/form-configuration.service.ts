import type { ParentType } from '@risksmart-app/domain/src/types/consts/parent-type';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { getFormConfigurationForType } from '@risksmart-app/drizzle/src/queries/utils';

import type {
  BackendServiceContext,
  FormConfigurationBackendService,
} from '../service.types';

export class FormConfigurationBackendServiceImpl implements FormConfigurationBackendService {
  async getByParentTypes(
    ctx: BackendServiceContext,
    parentTypes: ParentType[]
  ) {
    const db = await createDrizzleClient(ctx);

    const formConfiguration = await db.org((tx) => {
      return tx.query.form_configuration.findMany({
        ...getFormConfigurationForType,
        where: {
          ParentType: { in: parentTypes },
        },
      });
    });

    return { formConfiguration };
  }
}
