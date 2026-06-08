import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { getOrganisationModuleByOrgQueryConfig } from '@risksmart-app/drizzle/src/queries/organisation-module.query';
import { bulkCheck } from '@risksmart-app/permitio/src/permit';

import type {
  OrganisationModuleService,
  ServiceContext,
} from '../service.types';

export class OrganisationModuleServiceImpl implements OrganisationModuleService {
  async getByOrgId(ctx: ServiceContext) {
    const result = await bulkCheck(
      [
        {
          resourceName: `organisation_module`,
          action: 'read',
        },
      ],
      ctx.userId,
      ctx.orgId
    );

    if (!result || result.length === 0) {
      return null;
    }

    const db = await createDrizzleClient(ctx);

    return db.org(async (tx) => {
      const organisationModuleData =
        await tx.query.organisation_module.findFirst({
          ...getOrganisationModuleByOrgQueryConfig,
          orderBy: (t, { desc }) => [desc(t.CreatedAtTimestamp)],
        });

      return organisationModuleData
        ? { organisationModule: organisationModuleData }
        : null;
    });
  }
}
