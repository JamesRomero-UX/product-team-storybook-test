import type { TabsProps } from '@risk-smart/themed-cloudscape-components/tabs';
import { useTranslation } from 'react-i18next';
import { useGetDetailPath } from 'src/routes/useGetDetailParentPath';

import ResultsTab from '../results/Tab';
import type { DataImport } from '../types';
import { DataImportForm } from './forms/DataImportForm';

export const useTabs = (dataImport: DataImport | undefined) => {
  const { t } = useTranslation([]);
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'dataImportResult',
  });
  const detailsOnly = !dataImport;
  const detailsPath = useGetDetailPath(dataImport?.Id ?? '');
  const tabs: TabsProps.Tab[] = [
    {
      label: t('details'),
      id: 'details',
      content: <DataImportForm dataImport={dataImport} />,
      disabled: false,
      href: detailsOnly ? undefined : detailsPath,
    },
    {
      label: st('tabTitle'),
      id: 'results',
      content: <ResultsTab />,
      disabled: !dataImport,
      href: detailsOnly ? undefined : `${detailsPath}/results`,
    },
  ];

  return tabs;
};
