import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import Table from '@risksmart-app/components/src/table';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import TabHeader from 'src/components/tab-header/TabHeader';
import { useGetEntities } from 'src/hooks/queries/entity/useGetEntities';

import { useGetCollectionTableProps } from './config';
import EntityDetailsModal from './EntityDetailsModal';
import type { EntityFields } from './types';
import { buildHierarchy } from './utils';

const Tab: FC = () => {
  const { t } = useTranslation(['common'], { keyPrefix: 'entity' });
  const { data, loading, refetch } = useGetEntities({ queryArgs: {} });
  const [selectedItem, setSelectedItem] = useState<EntityFields>();
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Array<{ Id: string }>>([]);

  const tableProps = useGetCollectionTableProps(
    data?.entity,
    setSelectedItem,
    () => {
      setShowAddModal(true);
    }
  );

  // Turn flat list of entities into a hierarchy
  tableProps.items = buildHierarchy(tableProps.items);

  return (
    <>
      <Table
        {...tableProps}
        expandableRows={{
          isItemExpandable: (item) => item.children.length > 0,
          getItemChildren: (item) => item.children,
          expandedItems: expandedItems,
          onExpandableItemToggle: ({ detail }) =>
            setExpandedItems((prev) => {
              const next = new Set((prev ?? []).map((item) => item.Id));

              if (detail.expanded) {
                next.add(detail.item.Id);
              } else {
                next.delete(detail.item.Id);
              }

              return Array.from(next).map((Id) => ({ Id }));
            }),
        }}
        variant={'embedded'}
        trackBy={'Id'}
        loading={loading}
        header={
          <SpaceBetween size={'m'}>
            <TabHeader
              actions={
                <SpaceBetween direction={'horizontal'} size={'xs'}>
                  <Button
                    variant={'primary'}
                    formAction={'none'}
                    onClick={() => {
                      setSelectedItem(undefined);
                      setShowAddModal(true);
                    }}
                  >
                    {t('add_button')}
                  </Button>
                </SpaceBetween>
              }
            >
              {t('entityTabTitle')}
            </TabHeader>
          </SpaceBetween>
        }
      />
      <EntityDetailsModal
        onDismiss={() => {
          setSelectedItem(undefined);
          setShowAddModal(false);
          refetch();
        }}
        isVisible={!!selectedItem || showAddModal}
        Id={selectedItem?.Id}
      />
    </>
  );
};

export default Tab;
