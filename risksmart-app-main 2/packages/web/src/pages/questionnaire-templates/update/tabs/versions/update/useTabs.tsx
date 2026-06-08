import type { TabsProps } from '@risk-smart/themed-cloudscape-components/tabs';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import { useTranslation } from 'react-i18next';

import { filterEmptyTabs } from '@/utils/tabUtils';

import { useGetDetailPath } from '../../../../../../routes/useGetDetailParentPath';
import DetailsTab from './tabs/details/Tab';

export const useTabs = () => {
  const parentId = useGetGuidParam('questionnaireTemplateId');
  const questionnaireTemplateVersionId = useGetGuidParam(
    'questionnaireTemplateVersionId'
  );

  const parentUrl = useGetDetailPath(questionnaireTemplateVersionId);
  const { t } = useTranslation(['common', 'taxonomy']);

  const tabs: TabsProps['tabs'][number][] = [
    {
      id: 'details',
      label: t('details'),
      content: (
        <DetailsTab
          parentId={parentId}
          questionnaireTemplateVersionId={questionnaireTemplateVersionId}
        />
      ),
      href: parentUrl,
    },
  ];

  return filterEmptyTabs(tabs);
};
