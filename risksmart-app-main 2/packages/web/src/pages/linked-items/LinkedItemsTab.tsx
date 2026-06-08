import { useMutation } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import Table from '@risksmart-app/components/src/table';
import type { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { DeleteLinkedItemsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteModal from 'src/components/delete-modal';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import TabHeader from 'src/components/tab-header';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { Permission } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useGetLinkedItems } from '@/hooks/queries/linked-item/useGetLinkedItems';
import { useRemoveResultNotification } from '@/hooks/useMutationResultNotification';
import { evictField } from '@/utils/graphqlUtils';

import { useGetLinkedItemsTableProps } from './config';
import { getUnlinkFriendlyErrorMessage } from './linkedItemUtils';
import LinkItemModal from './modal/LinkItemModal';
import type { LinkedItemsTableFields } from './types';

interface Props {
  parent: ObjectWithContributors;
  parentType?: Parent_Type_Enum;
  includeAssessments?: boolean;
}

const LinkedItemsTab: FC<Props> = ({
  parent,
  parentType,
  includeAssessments,
}) => {
  useI18NSummaryHelpContent('linkedItems.tabHelp');
  const { t } = useTranslation('common', { keyPrefix: 'linkedItems' });
  const { addNotification } = useNotifications();

  const [selectedItems, setSelectedItems] = useState<LinkedItemsTableFields[]>(
    []
  );
  const {
    hasPermission: canViewInternalAudit,
    loading: canViewInternalAuditLoading,
  } = useHasPermissionQuery('read:internal_audit_entity');
  const {
    hasPermission: canViewCompliance,
    loading: canViewComplianceLoading,
  } = useHasPermissionQuery('read:compliance_monitoring_assessment');

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showUnlinkModal, setShowUnlinkModal] = useState(false);

  const { data, loading, refetch } = useGetLinkedItems({
    queryArgs: {
      id: parent.Id,
      includeInternalAudit:
        canViewInternalAudit && !canViewInternalAuditLoading,
      includeCompliance: canViewCompliance && !canViewComplianceLoading,
    },
  });

  // Deduplicate bidirectional sibling relationships (both directions exist in DB)
  // For siblings, both (A→B) and (B→A) records exist, so we deduplicate by canonical pair
  const uniqueLinkedItems = useMemo(() => {
    if (!data?.linked_item) {
      return [];
    }
    const seen = new Set<string>();

    return data.linked_item.filter((li) => {
      // Only deduplicate siblings - parent_child/child_parent are distinct relationship types
      if (li.RelationshipType !== 'sibling') {
        return true;
      }
      // Create canonical key regardless of direction for siblings
      const key = [li.Source, li.Target].sort().join('-');
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);

      return true;
    });
  }, [data?.linked_item]);

  const [unlink, { loading: deleteLinkedItemsLoading }] = useMutation(
    DeleteLinkedItemsDocument,
    {
      update: (cache) => {
        evictField(cache, 'linked_item');
        evictField(cache, 'control');
        evictField(cache, 'control_group');
        evictField(cache, 'action');
        evictField(cache, 'appetite');
        evictField(cache, 'issue');
        evictField(cache, 'document');
        evictField(cache, 'obligation');
        evictField(cache, 'obligation_change');
        evictField(cache, 'risk');
        evictField(cache, 'acceptance');
        evictField(cache, 'indicator');
        evictField(cache, 'risk_score');
      },
      onError: (error) => {
        const friendlyErrorMessage = getUnlinkFriendlyErrorMessage(
          error.message
        );
        addNotification({
          type: 'error',
          content: <>{friendlyErrorMessage}</>,
        });
      },
    }
  );

  // Create data with deduplicated linked items for table props
  const deduplicatedData = useMemo(
    () => (data ? { ...data, linked_item: uniqueLinkedItems } : undefined),
    [data, uniqueLinkedItems]
  );

  const tableProps = useGetLinkedItemsTableProps(
    deduplicatedData,
    parentType,
    parent
  );

  // Exclude both Source and Target IDs from the "add link" modal to prevent duplicates
  const excludeIds = useMemo(() => {
    const ids = new Set([parent.Id]);
    uniqueLinkedItems.forEach((li) => {
      if (li.Source) {
        ids.add(li.Source);
      }
      if (li.Target) {
        ids.add(li.Target);
      }
    });

    return Array.from(ids);
  }, [uniqueLinkedItems, parent.Id]);

  const onLinkItemClicked = () => {
    setShowLinkModal(true);
  };

  const onLinkItemModalDismiss = async (saved?: boolean) => {
    if (saved) {
      await refetch();
    }
    setShowLinkModal(false);
  };

  const onUnlinkItemsClicked = () => {
    setShowUnlinkModal(true);
  };

  const onUnlinkItemsModalDismiss = async (saved?: boolean) => {
    if (saved) {
      await refetch();
    }
    setSelectedItems([]);
    setShowUnlinkModal(false);
  };

  const unlinkItems = useRemoveResultNotification({
    asyncAction: async () => {
      await unlink({
        variables: {
          Ids: selectedItems.map((si) => si.Id),
        },
      });
      await refetch();
      setShowUnlinkModal(false);

      return true;
    },
    failureAction: () => {
      setShowUnlinkModal(false);
    },
    entityName: t('entity_name'),
  });

  return (
    <>
      <Table
        {...tableProps}
        key={'Id'}
        trackBy={'Id'}
        selectionType={'multi'}
        selectedItems={selectedItems}
        onSelectionChange={({ detail }) => {
          setSelectedItems(detail.selectedItems);
        }}
        header={
          <SpaceBetween size={'m'}>
            <TabHeader
              actions={
                <SpaceBetween direction={'horizontal'} size={'xs'}>
                  <Permission
                    permission={'delete:linked_item'}
                    parentObject={parent}
                  >
                    <Button
                      onClick={onUnlinkItemsClicked}
                      disabled={selectedItems.length < 1}
                    >
                      {t('remove_button')}
                    </Button>
                  </Permission>
                  <Permission
                    permission={'insert:linked_item'}
                    parentObject={parent}
                  >
                    <Button
                      iconName={'add-plus'}
                      onClick={onLinkItemClicked}
                      variant={'primary'}
                    >
                      {t('add_button')}
                    </Button>
                  </Permission>
                </SpaceBetween>
              }
            >
              {t('tab_title')}
            </TabHeader>
          </SpaceBetween>
        }
        variant={'embedded'}
        loading={loading}
      />
      {showLinkModal && (
        <LinkItemModal
          onDismiss={onLinkItemModalDismiss}
          sourceId={parent.Id}
          excludeIds={excludeIds}
          includeAssessments={includeAssessments}
        />
      )}
      {showUnlinkModal && (
        <DeleteModal
          deleteButtonLabel={t('confirm_remove_button')}
          onDismiss={onUnlinkItemsModalDismiss}
          isVisible={true}
          onDelete={unlinkItems}
          loading={deleteLinkedItemsLoading}
          header={t('confirm_remove_title')}
        >
          <p>{t('remove_confirmation')}</p>
        </DeleteModal>
      )}
    </>
  );
};

export default LinkedItemsTab;
