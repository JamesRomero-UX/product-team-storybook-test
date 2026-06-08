import type { ParentType } from '@risksmart-app/domain/src/types/consts';
import type { DB } from '@risksmart-app/drizzle/src/db';
import { getFormConfigurationQueryConfig } from '@risksmart-app/drizzle/src/queries/form-configuration.query';

import type { FormConfigurationRow } from '../types/form-configuration.types';
import { getLogger } from '../utils/logger';

const logger = getLogger();

export interface FormConfigurationFilters {
  parentTypes?: ParentType[];
}

/**
 * Repository for form configuration data access
 */
export function createFormConfigurationRepository(db: DB['transaction']) {
  return {
    /**
     * Get form configurations with optional filters
     * @param filters - Optional filters to apply
     * @param filters.parentTypes - Array of parent type enums to filter by
     */
    findMany: async (
      filters: FormConfigurationFilters = {}
    ): Promise<FormConfigurationRow[]> => {
      const { parentTypes } = filters;

      try {
        return await db((tx) => {
          return tx.query.form_configuration.findMany({
            ...getFormConfigurationQueryConfig,
            ...(parentTypes?.length && {
              where: {
                ParentType: { in: parentTypes },
              },
            }),
          });
        });
      } catch (error) {
        logger.error('Failed to query form configurations', { error, filters });
        throw error;
      }
    },
  };
}
