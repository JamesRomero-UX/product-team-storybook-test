import type { PropertyFilterToken } from '@cloudscape-design/collection-hooks';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import type { GigawidgetSettings } from './util';

dayjs.extend(customParseFormat);

export const sanitiseTokens = (
  tokens: PropertyFilterToken[]
): PropertyFilterToken[] => {
  return tokens.map((token) => {
    if (dayjs(token?.value, 'YYYY-MM-DDTHH:mm:ss', true).isValid()) {
      const startOfTokenDate = dayjs(token.value).startOf('day');
      let startDate = null;
      let endDate = null;

      if (token.operator === '>=') {
        startDate = startOfTokenDate.format('YYYY-MM-DD');
        endDate = startOfTokenDate.add(10, 'year').format('YYYY-MM-DD');
      }

      if (token.operator === '>') {
        startDate = startOfTokenDate.add(1, 'day').format('YYYY-MM-DD');
        endDate = startOfTokenDate.add(10, 'year').format('YYYY-MM-DD');
      }

      if (token.operator === '<=') {
        startDate = startOfTokenDate.subtract(10, 'year').format('YYYY-MM-DD');
        endDate = startOfTokenDate.format('YYYY-MM-DD');
      }

      if (token.operator === '<') {
        startDate = startOfTokenDate.subtract(10, 'year').format('YYYY-MM-DD');
        endDate = startOfTokenDate.subtract(1, 'day').format('YYYY-MM-DD');
      }

      if (token.operator === '=') {
        startDate = startOfTokenDate.format('YYYY-MM-DD');
        endDate = dayjs(token.value).endOf('day').format('YYYY-MM-DD');
      }

      const newTokenValue = {
        type: 'absolute',
        startDate,
        endDate,
      };

      return {
        propertyKey: token.propertyKey,
        operator: '=',
        value: newTokenValue,
      };
    }

    return token;
  });
};

export const sanitiseSettings = (
  settings: GigawidgetSettings
): GigawidgetSettings => {
  if (!settings?.dataSource) {
    return settings;
  }

  if (settings?.filtering?.tokens?.length ?? 0 > 0) {
    return {
      ...settings,
      filtering: {
        ...settings.filtering,
        tokens: sanitiseTokens(
          settings?.filtering?.tokens as PropertyFilterToken[]
        ),
      },
    } as GigawidgetSettings;
  }

  return settings;
};
