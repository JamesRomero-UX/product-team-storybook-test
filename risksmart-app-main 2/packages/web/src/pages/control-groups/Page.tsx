import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import Table from '@risksmart-app/components/src/table';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ExportButton from 'src/components/export-button';
import { PageLayout } from 'src/layouts';
import { Permission } from 'src/rbac/Permission';

import { useGetControlGroupsRegister } from '@/hooks/queries';
import { getCounter } from '@/utils/collectionUtils';

import { useGetCollectionTableProps } from './config';
import ControlGroupModal from './ControlGroupModal';

const Page: FC = () => {
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'controlGroups',
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { data, loading } = useGetControlGroupsRegister({ queryArgs: {} });

  const tableProps = useGetCollectionTableProps(data?.control_group);

  const title = st('register_title', 'Register');
  const counter = getCounter(tableProps.totalItemsCount, loading);

  return (
    <PageLayout
      helpTranslationKey={'controlGroups.registerHelp'}
      title={title}
      counter={counter}
      actions={
        <SpaceBetween direction={'horizontal'} size={'xs'}>
          <ExportButton tableProps={tableProps} entityLabel={title} />
          <Permission permission={'insert:control_group'}>
            <Button variant={'primary'} onClick={() => setIsModalVisible(true)}>
              {st('create_new_button', 'Add')}
            </Button>
          </Permission>
        </SpaceBetween>
      }
    >
      <Table {...tableProps} loading={loading} />
      {isModalVisible && (
        <ControlGroupModal onDismiss={() => setIsModalVisible(false)} />
      )}
    </PageLayout>
  );
};

export default Page;
