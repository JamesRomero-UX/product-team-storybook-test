import type { TabsProps } from '@risk-smart/themed-cloudscape-components/tabs';

export const filterEmptyTabs = (tabs: TabsProps.Tab[]) =>
  tabs.filter((c) => c.label && c.label.toString().replace(' ', '').length > 0);
