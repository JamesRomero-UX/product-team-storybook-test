import { IndicatorsUpdatePage } from '@pages';
import i18n from '@risksmart-app/i18n/src/i18n';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { RouteObject } from 'react-router';
import { ParamId } from 'src/routes/constants';

export const indicatorRoute: RouteObject = {
  path: `:${ParamId.Indicator}`,
  handle: {
    breadcrumbNode: {
      nodeType: Parent_Type_Enum.Indicator,
      paramName: ParamId.Indicator,
    },
  },
  children: [
    {
      path: '',
      element: <IndicatorsUpdatePage activeTabId={'details'} />,
    },
    {
      path: 'results',
      handle: {
        // TODO: translation
        title: 'Results',
      },
      element: <IndicatorsUpdatePage activeTabId={'results'} />,
    },
    {
      path: 'linked-items',
      handle: {
        title: 'Linked items',
      },
      children: [
        {
          path: '',
          element: <IndicatorsUpdatePage activeTabId={'linkedItems'} />,
        },
      ],
    },
    {
      path: 'notification-history',
      handle: {
        title: () => i18n.t('notificationHistory.tab_title'),
      },
      element: <IndicatorsUpdatePage activeTabId={'notificationHistory'} />,
    },
  ],
};
