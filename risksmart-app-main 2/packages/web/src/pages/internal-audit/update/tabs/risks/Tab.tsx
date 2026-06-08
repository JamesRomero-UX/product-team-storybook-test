import { useMutation } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import Table from '@risksmart-app/components/src/table';
import { DeleteLinkedItemsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteModal from 'src/components/delete-modal';
import EmptyEntityCollection from 'src/components/empty-collection/EmptyEntityCollection';
import TabHeader from 'src/components/tab-header';
import { useGetAppetitesGroupedByImpact } from 'src/hooks/queries';
import { useGetLinkedRisksByInternalAuditId } from 'src/hooks/queries';
import type { RiskFields } from 'src/pages/risks/types';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { Permission } from 'src/rbac/Permission';

import { useRemoveResultNotification } from '@/hooks/useMutationResultNotification';
import { useRiskScores } from '@/hooks/useRiskScore';
import { evictField } from '@/utils/graphqlUtils';

import { useGetCollectionStatelessTableProps } from '../../../../risks/config';
import LinkRiskModal from '../../../modals/LinkRisksModal';

interface Props {
  parent: ObjectWithContributors;
}

const Tab: FC<Props> = ({ parent }) => {
  const internalAuditId = useGetGuidParam('internalAuditId');
  const { t } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'internalAudits.riskTab',
  });
  const { t: rt } = useTranslation(['common'], {
    keyPrefix: 'risks',
  });
  const { data, error, loading, refetch } = useGetLinkedRisksByInternalAuditId({
    queryArgs: { internalAuditId },
  });

  if (error) {
    throw error;
  }
  const { loading: loadingScores, scores } = useRiskScores();

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [selectedLinkedRisks, setSelectedInternalAuditReports] = useState<
    RiskFields[]
  >([]);

  const [deleteLink, deleteResult] = useMutation(DeleteLinkedItemsDocument, {
    update: (cache) => {
      evictField(cache, 'linked_item');
      evictField(cache, 'internal_audit_entity');
      evictField(cache, 'internal_audit_entity_aggregate');
    },
  });

  const onDelete = useRemoveResultNotification({
    entityName: st('entity_name'),
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
    asyncAction: async () => {
      const links = data?.linked_risks.filter((c) =>
        selectedLinkedRisks.map((d) => d.Id).includes(c.risk!.Id)
      );
      await deleteLink({
        variables: {
          Ids: links!.map((c) => c.Id),
        },
      });
      setSelectedInternalAuditReports([]);
      setIsDeleteModalVisible(false);

      return true;
    },
  });

  const handleLinkModalOpen = () => {
    setIsLinkOpen(true);
  };

  const handleLinkClose = () => {
    setIsLinkOpen(false);
  };
  const risks = data?.linked_risks?.map((c) => c.risk!) ?? [];

  const { data: impactAppetites } = useGetAppetitesGroupedByImpact({
    queryArgs: {},
  });

  const tableProps = useGetCollectionStatelessTableProps(
    risks,
    scores,
    impactAppetites?.impact
  );

  return (
    <>
      <Table
        {...tableProps}
        empty={
          <EmptyEntityCollection
            entityLabel={rt('entity_name')}
            action={
              <Permission
                parentObject={parent}
                permission={'insert:linked_item'}
              >
                <Button onClick={() => handleLinkModalOpen()}>
                  {st('addButton')}
                </Button>
              </Permission>
            }
          />
        }
        selectionType={'multi'}
        selectedItems={selectedLinkedRisks}
        trackBy={'Id'}
        onSelectionChange={({ detail }) => {
          setSelectedInternalAuditReports(detail.selectedItems);
        }}
        resizableColumns={true}
        header={
          <SpaceBetween size={'m'}>
            <TabHeader
              actions={
                <SpaceBetween direction={'horizontal'} size={'xs'}>
                  <Permission
                    parentObject={parent}
                    permission={'delete:linked_item'}
                  >
                    <Button
                      formAction={'none'}
                      variant={'normal'}
                      disabled={!selectedLinkedRisks.length}
                      onClick={() => setIsDeleteModalVisible(true)}
                    >
                      {st('removeButton')}
                    </Button>
                  </Permission>
                  <Permission
                    parentObject={parent}
                    permission={'insert:linked_item'}
                  >
                    <Button
                      iconName={'add-plus'}
                      variant={'primary'}
                      formAction={'none'}
                      onClick={handleLinkModalOpen}
                    >
                      {st('addButton')}
                    </Button>
                  </Permission>
                </SpaceBetween>
              }
            >
              {st('header')}
            </TabHeader>
          </SpaceBetween>
        }
        variant={'embedded'}
        loading={loading || loadingScores}
        loadingText={st('loadingMessage') ?? ''}
        sortingDisabled={false}
      />
      <LinkRiskModal
        isVisible={isLinkOpen}
        onDismiss={handleLinkClose}
        sourceId={internalAuditId}
        excludeIds={risks.map((c) => c.Id)}
      />
      <DeleteModal
        loading={deleteResult.loading}
        isVisible={isDeleteModalVisible}
        header={t('delete')}
        onDelete={onDelete}
        onDismiss={() => {
          refetch();
          setSelectedInternalAuditReports([]);
          setIsDeleteModalVisible(false);
        }}
      >
        {st('confirmDeleteMessage')}
      </DeleteModal>
    </>
  );
};

export default Tab;
