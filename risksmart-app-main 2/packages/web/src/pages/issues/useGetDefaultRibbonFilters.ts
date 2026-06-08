import { useMemo } from 'react';

import type { FilterModal } from '@/components/customisable-ribbon/customisableRibbonModalSchema';

export const useGetDefaultRibbonFilters = (entityPlural: string) =>
  function useDefaultIssueRibbonFilters(): FilterModal[] {
    return useMemo(
      () => [
        {
          id: crypto.randomUUID(),
          title: `Open ${entityPlural}`,
          itemFilterQuery: {
            tokens: [],
            tokenGroups: [
              {
                operator: '!=',
                propertyKey: 'StatusLabelled',
                value: 'Closed',
              },
            ],
            operation: 'and',
          },
        },
        {
          id: crypto.randomUUID(),
          title: 'Overdue',
          itemFilterQuery: {
            tokens: [],
            tokenGroups: [
              {
                operator: '!=',
                propertyKey: 'StatusLabelled',
                value: 'Closed',
              },
              {
                operator: '=',
                propertyKey: 'TargetCloseDate',
                value: {
                  type: 'relative',
                  unit: 'year',
                  amount: -3,
                },
              },
            ],
            operation: 'and',
          },
        },
        {
          id: crypto.randomUUID(),
          title: 'Without open action',
          itemFilterQuery: {
            tokens: [],
            tokenGroups: [
              {
                operator: '=',
                propertyKey: 'OpenActions',
                value: '0',
              },
              {
                operator: '!=',
                propertyKey: 'StatusLabelled',
                value: 'Closed',
              },
            ],
            operation: 'and',
          },
        },
        {
          id: crypto.randomUUID(),
          title: `All ${entityPlural}`,
          itemFilterQuery: {
            tokens: [],
            tokenGroups: [],
            operation: 'and',
          },
        },
      ],
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [entityPlural]
    );
  };
