import { ParentTypes } from '@risksmart-app/domain/src/types/consts/index';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { getImpactRatingByIdConfig } from '@risksmart-app/drizzle/src/queries/impact-rating.query';
import { getFormConfigurationForType } from '@risksmart-app/drizzle/src/queries/utils';

import type { ImpactRatingByIdResponse } from '../../types/backend/v1/impact-rating.types';
import type {
  BackendServiceContext,
  ImpactRatingBackendService,
} from '../service.types';

export class ImpactRatingImpl implements ImpactRatingBackendService {
  async getImpactRatingById(
    ctx: BackendServiceContext,
    id: string
  ): Promise<ImpactRatingByIdResponse | null> {
    const db = await createDrizzleClient(ctx);

    return db.org(async (tx) => {
      const [formConfig, data] = await Promise.all([
        tx.query.form_configuration.findFirst({
          ...getFormConfigurationForType,
          where: {
            ParentType: ParentTypes.ImpactRating,
          },
        }),
        tx.query.impact_rating.findFirst({
          ...getImpactRatingByIdConfig,
          where: { Id: id },
        }),
      ]);

      return data
        ? { impactRating: data, form_configuration: formConfig ?? null }
        : null;
    });
  }
}
