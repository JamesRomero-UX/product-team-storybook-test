import type { TabsProps } from '@risk-smart/themed-cloudscape-components/tabs';
import type { GetUserGroupByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useTranslation } from 'react-i18next';

import { filterEmptyTabs } from '@/utils/tabUtils';

import DetailsTab from './tabs/details/DetailsTab';
import MembersTab from './tabs/members/MembersTab';

export const useTabs = (
  userGroup: GetUserGroupByIdQuery['user_group'][number] | undefined,
  parentPath: string
): TabsProps['tabs'] => {
  const { t } = useTranslation(['common'], { keyPrefix: 'userGroups' });
  const tabs = [
    {
      label: t('tabs.details'),
      id: 'details',
      href: `${parentPath}/details`,
      content: userGroup && <DetailsTab userGroup={userGroup} />,
    },
    {
      label: t('tabs.members'),
      id: 'members',
      href: `${parentPath}/members`,
      content: userGroup && <MembersTab userGroup={userGroup} />,
    },
  ];

  return filterEmptyTabs(tabs);
};
