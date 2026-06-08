import { useQuery } from '@apollo/client';
import Alert from '@risk-smart/themed-cloudscape-components/alert';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Loading from '@risksmart-app/components/src/loading';
import Table from '@risksmart-app/components/src/table';
import { GetEntitiesDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useGetCollectionTableProps } from 'src/pages/settings/tabs/entities/config';
import type { EntityFields } from 'src/pages/settings/tabs/entities/types';
import { buildHierarchy } from 'src/pages/settings/tabs/entities/utils';

const InstantiateEnterpriseRiskForm = () => {
  const { setValue } = useFormContext();
  const { data, loading } = useQuery(GetEntitiesDocument);
  const [selectedItems, setSelectedItems] = useState<EntityFields[]>([]);
  const [expandedItems, setExpandedItems] = useState<Array<{ Id: string }>>([]);
  const tableProps = useGetCollectionTableProps(data?.entity);
  const { t } = useTranslation(['common'], { keyPrefix: 'enterpriseRisks' });

  if (loading) {
    return <Loading />;
  }

  // Turn flat list of entities into a hierarchy
  tableProps.items = buildHierarchy(tableProps.items);

  return (
    <SpaceBetween direction={'vertical'} size={'xs'}>
      <Alert>{t('instantiateDepartments')}</Alert>
      <Table
        {...tableProps}
        className={'max-w-6xl'}
        data-testid={'insantiate-entity-table'}
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
        selectedItems={selectedItems}
        selectionType={'multi'}
        onSelectionChange={(items) => {
          setSelectedItems(items.detail.selectedItems);
          setValue(
            'Entities',
            items.detail.selectedItems.map((si) => ({ value: si.Id }))
          );
        }}
      />
    </SpaceBetween>
  );
};

export default InstantiateEnterpriseRiskForm;
