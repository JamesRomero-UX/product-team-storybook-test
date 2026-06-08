import { useQuery } from '@apollo/client';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import type { GetUsersQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  Dashboard_Sharing_Type_Enum,
  GetDashboardsDocument,
  GetUsersDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { TFunction } from 'i18next';
import _ from 'lodash';
import type { FC } from 'react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FormField } from 'src/components/form/form/FormField';
import Select from 'src/components/form/select';

import styles from './style.module.scss';
import type { State as DashboardPreferences } from './useDashboardStore';

interface Props {
  onChange: (dashboardPreferences: DashboardPreferences) => void;
  selected?: string;
}

// Returns '(shared with you by XY)' if the board was created by someone else from the same org
const getSharingSuffix = (
  t: TFunction<'common', 'dashboard'>,
  sharing: Dashboard_Sharing_Type_Enum | null | undefined,
  createdByUser: null | string | undefined,
  loggedInUserId: string,
  users: GetUsersQuery | undefined
) => {
  if (
    sharing === Dashboard_Sharing_Type_Enum.UserOnly ||
    createdByUser === loggedInUserId ||
    _.isNil(sharing)
  ) {
    return '';
  }

  const userName = users?.user.find(
    (u) => u.Id === createdByUser
  )?.FriendlyName;

  return t('shared_with_you_by', {
    user: userName,
  });
};

export const DashboardSelector: FC<Props> = ({ onChange, selected }) => {
  const { t } = useTranslation('common', { keyPrefix: 'dashboard' });
  const { user } = useRisksmartUser();

  const { data: users, refetch: refetchUsers } = useQuery(GetUsersDocument, {
    fetchPolicy: 'no-cache',
  });
  const { data: dashboards, refetch: refetchDashboards } = useQuery(
    GetDashboardsDocument,
    {
      fetchPolicy: 'no-cache',
    }
  );

  // Refresh queries when dashboard selection changes
  useEffect(() => {
    if (selected) {
      // Refetch both queries to ensure we have the latest data
      refetchDashboards();
      refetchUsers();
    }
  }, [selected, refetchDashboards, refetchUsers]);

  const selectedDashboard = dashboards?.dashboard.find(
    (d) => d.Id === selected
  );

  const selectedOption = {
    value: selected,
    label: `${
      selectedDashboard?.Name ?? t('select_dashboard_placeholder')
    } ${getSharingSuffix(
      t,
      selectedDashboard?.Sharing ?? null,
      selectedDashboard?.CreatedByUser ?? null,
      user!.userId,
      users
    )}`,
  };

  return (
    <FormField>
      <Select
        className={`min-w-full w-full print:hidden ${styles.dashboardSelector}`}
        selectedOption={selectedOption}
        options={dashboards?.dashboard.map((d) => ({
          label: `${d.Name} ${getSharingSuffix(
            t,
            d.Sharing,
            d.CreatedByUser,
            user!.userId,
            users
          )}`,
          description: d.Description || '',
          value: d.Id,
        }))}
        onChange={(e) => {
          const dashboardToLoad = dashboards?.dashboard.find(
            (d) => d.Id === e.detail.selectedOption.value
          );
          if (!dashboardToLoad) {
            throw new Error('Dashboard not found');
          }
          try {
            onChange({ ...dashboardToLoad.Content, id: dashboardToLoad.Id });
          } catch (e) {
            console.error(e);
            throw new Error(t('load_dashboard_error'));
          }
        }}
        placeholder={t('select_dashboard_placeholder')}
      />
    </FormField>
  );
};
