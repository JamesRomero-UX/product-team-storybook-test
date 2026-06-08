import { useLazyQuery } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import {
  DataExportOneOffExportDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ControlledTabs from 'src/components/controlled-tabs/ControlledTabs';
import { PageLayout } from 'src/layouts';
import { Permission } from 'src/rbac/Permission';

import useTabs from '@/hooks/useTabs';

import useDataExportStore from './tabs/data-export/dataExportStore';

type Props = {
  activeTabId?:
    | 'approvals'
    | 'audit'
    | 'authentication'
    | 'colours'
    | 'customRoles'
    | 'dataExport'
    | 'dataImport'
    | 'departments'
    | 'entities'
    | 'externalApi'
    | 'groups'
    | 'modules'
    | 'sso'
    | 'notifications'
    | 'tags'
    | 'taxonomy'
    | 'users';
};

const Page: FC<Props> = ({ activeTabId }) => {
  const { i18n: taxonomy } = useTranslation('taxonomy');
  const { t } = useTranslation('common');

  const { setDataExportLoading, setDataExportResult, setDataExportError } =
    useDataExportStore();

  const [
    dataExport,
    {
      loading: dataExportLoading,
      data: dataExportResult,
      error: dataExportError,
    },
  ] = useLazyQuery(DataExportOneOffExportDocument, {
    fetchPolicy: 'no-cache',
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setDataExportLoading(dataExportLoading), [dataExportLoading]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setDataExportResult(dataExportResult), [dataExportResult]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setDataExportError(dataExportError), [dataExportError]);

  const tabs = useTabs({
    parentType: Parent_Type_Enum.Settings,
    parent: undefined,
    hrefRoot: '/settings',
  });
  const title = taxonomy.format(t('setting_other'), 'capitalize');
  const isDataExportTab = activeTabId === 'dataExport';

  return (
    <PageLayout
      title={title}
      actions={
        isDataExportTab ? (
          <SpaceBetween direction={'horizontal'} size={'xs'}>
            <Permission permission={'read:data_export'}>
              <Button
                iconName={'download'}
                onClick={async () => {
                  await dataExport();
                }}
                disabled={dataExportLoading}
              >
                {t('dataExport.download')}
              </Button>
            </Permission>
          </SpaceBetween>
        ) : undefined
      }
    >
      <ControlledTabs
        activeTabId={activeTabId}
        tabs={tabs}
        variant={'container'}
      />
    </PageLayout>
  );
};

export default Page;
