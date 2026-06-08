import { v4 as uuidv4 } from 'uuid';

import type { FilterModal } from '@/components/customisable-ribbon/customisableRibbonModalSchema';

export const getDefaultRibbonFilters = (
  entityPlural: string
): FilterModal[] => {
  return [
    {
      id: uuidv4(),
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
      id: uuidv4(),
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
      id: uuidv4(),
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
      id: uuidv4(),
      title: `All ${entityPlural}`,
      itemFilterQuery: {
        tokens: [],
        tokenGroups: [],
        operation: 'and',
      },
    },
  ];
};
