import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';

import type { DepartmentService, ServiceContext } from '../service.types';

export class DepartmentServiceImpl implements DepartmentService {
  async getDepartments(ctx: ServiceContext) {
    const db = await createDrizzleClient(ctx);

    // Query department types with comprehensive relationships
    const data = await db.org((tx) => {
      return tx.query.department_type.findMany({
        with: {
          createdByUser: true,
          modifiedByUser: true,
          department_type_group: true,
        },
      });
    });

    return data;
  }
}
