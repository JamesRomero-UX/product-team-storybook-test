import { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

import type { FilterModal } from '@/components/customisable-ribbon/customisableRibbonModalSchema';

export const useGetDefaultRibbonFilters = (): FilterModal[] =>
  useMemo(
    () => [
      {
        id: uuidv4(),
        title: 'Tier 1',
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              operator: '=',
              propertyKey: 'TierLabelled',
              value: 'Tier 1',
            },
          ],
          operation: 'and',
        },
      },
      {
        id: uuidv4(),
        title: 'Tier 2',
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              operator: '=',
              propertyKey: 'TierLabelled',
              value: 'Tier 2',
            },
          ],
          operation: 'and',
        },
      },
      {
        id: uuidv4(),
        title: 'Tier 3',
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              operator: '=',
              propertyKey: 'TierLabelled',
              value: 'Tier 3',
            },
          ],
          operation: 'and',
        },
      },
      {
        id: uuidv4(),
        title: 'All risks',
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [],
          operation: 'and',
        },
      },
    ],
    []
  );
