import type { PropertyFilterToken } from '@cloudscape-design/collection-hooks';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

import type { FilterModal } from '@/components/customisable-ribbon/customisableRibbonModalSchema';

type PerformanceValue = {
  value: string;
  label: string;
  tokens?: PropertyFilterToken[];
};

type PerformanceEntity = {
  value: number;
  label: string;
  tokens?: PropertyFilterToken[];
};

const transformPerformanceValueFilters = (
  performanceSummary: PerformanceEntity[],
  performanceResult: PerformanceEntity[]
): FilterModal[] => {
  return performanceSummary.map(({ value, label }) => {
    const item: PerformanceValue = { value: `${value}`, label };

    if (value === 3) {
      item.tokens = performanceResult
        .filter(({ value: prValue }) => [3, 4].includes(prValue))
        .map((pr) => ({
          propertyKey: 'LatestAssessmentResultsLabelled',
          value: pr.label,
          operator: '=',
        }));
    }

    return {
      id: uuidv4(),
      title: label,
      itemFilterQuery: {
        operation: 'or',
        tokens: item.tokens ?? [
          {
            propertyKey: 'LatestAssessmentResultsLabelled',
            value: label,
            operator: '=',
          },
        ],
      },
    };
  });
};

export const useGetDefaultRibbonFilters = (): FilterModal[] => {
  const { t: tr } = useTranslation(['ratings']);
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'obligations.dashboard',
  });

  return useMemo<FilterModal[]>(() => {
    const performanceSummary = tr('performance_summary');
    const performanceResult = tr('performance_result');

    return [
      ...transformPerformanceValueFilters(
        performanceSummary,
        performanceResult
      ),
      {
        id: uuidv4(),
        title: st('in_progress'),
        itemFilterQuery: {
          tokens: [
            {
              propertyKey: 'LatestAssessmentResultsLabelled',
              value:
                tr('assessment_status').find(
                  ({ value }) => value === 'inprogress'
                )?.label || '',
              operator: '=',
            },
          ],
          operation: 'or',
        },
      },
      {
        id: uuidv4(),
        title: st('all'),
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [],
          operation: 'and',
        },
      },
    ];
  }, [st, tr]);
};
