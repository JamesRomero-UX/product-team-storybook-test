import type { GetDashboardByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useMemo } from 'react';

import MyItemsDashboard from './my-items/Dashboard';
import getMyItemWidgets from './my-items/privateWidgets';
import { setWidgets as setMyItemWidgets } from './my-items/widgets';
import OverallDashboard from './OverallDashboard';
import { useDashboardStore } from './useDashboardStore';
import { privateWidgets } from './widgetPrivate';
import { setWidgets } from './widgets';

export type Dashboard = GetDashboardByIdQuery['dashboard_by_pk'];

const Page: FC = () => {
  useMemo(() => {
    setWidgets(privateWidgets);
    setMyItemWidgets(getMyItemWidgets());
  }, []);

  const { selectedDashboard } = useDashboardStore();

  return selectedDashboard === 'dashboard' ? (
    <OverallDashboard />
  ) : (
    <MyItemsDashboard />
  );
};

export default Page;
