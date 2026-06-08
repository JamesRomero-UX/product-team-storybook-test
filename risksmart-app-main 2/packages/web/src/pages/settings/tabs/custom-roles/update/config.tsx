import type { TabsProps } from '@risk-smart/themed-cloudscape-components/tabs';
import type {
  GetCustomRoleByIdQuery,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useTranslation } from 'react-i18next';

import { filterEmptyTabs } from '@/utils/tabUtils';

import DetailsTab from './tabs/details/DetailsTab';

export const useTabs = (
  customRole: GetCustomRoleByIdQuery['custom_role'][number] | undefined,
  availableRoles: {
    roleKey: string;
    name: string;
    groupKey: Parent_Type_Enum;
    category: 'Manager' | 'Viewer';
  }[],
  parentPath: string
): TabsProps['tabs'] => {
  const { t } = useTranslation(['common'], { keyPrefix: 'customRoles' });
  const tabs = [
    {
      label: t('tabs.details'),
      id: 'details',
      href: `${parentPath}/details`,
      content: customRole && (
        <DetailsTab customRole={customRole} availableRoles={availableRoles} />
      ),
    },
  ];

  return filterEmptyTabs(tabs);
};
