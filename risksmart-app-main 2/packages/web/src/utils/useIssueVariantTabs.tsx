import type { TabsProps } from '@risk-smart/themed-cloudscape-components/tabs';
import { useTranslation } from 'react-i18next';
import IssuesTab from 'src/pages/issues/IssueTab';
import type { ObjectWithContributors } from 'src/rbac/Permission';

import { useIsFeatureFlagEnabledLazy } from '@/hooks/useIsFeatureFlagEnabled';

import { IssueTypeMapping } from './issueVariantUtils';

export const useIssueVariantTabs = (
  detailsPath: string,
  disabled: boolean,
  parent?: null | ObjectWithContributors
): TabsProps.Tab[] => {
  const { t } = useTranslation(['common']);
  const isFeatureFlagEnabled = useIsFeatureFlagEnabledLazy();

  return Object.entries(IssueTypeMapping)
    .map(([_, itm]) => ({
      label: t(`${itm.taxonomy}.tab_title`),
      id: itm.taxonomy,
      content: parent && <IssuesTab parent={parent} type={itm.type} />,
      href: `${detailsPath}/${itm.uriPath}`,
      hasAccess: () =>
        itm.featureFlag ? isFeatureFlagEnabled(itm.featureFlag) : true,
      disabled: disabled,
    }))
    .filter((a) => a.hasAccess());
};
