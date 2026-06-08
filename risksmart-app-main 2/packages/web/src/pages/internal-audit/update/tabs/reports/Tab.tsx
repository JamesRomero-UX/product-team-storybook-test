import { useMutation } from '@apollo/client';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import Table from '@risksmart-app/components/src/table';
import { DeleteInternalAuditReportsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteModal from 'src/components/delete-modal';
import TabHeader from 'src/components/tab-header';
import { useGetInternalAuditReportsByOriginatingItemId } from 'src/hooks/queries';
import type { ObjectWithContributors } from 'src/rbac/Permission';
import { Permission } from 'src/rbac/Permission';

import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import { evictField } from '@/utils/graphqlUtils';

import InternalAuditReportModal from '../../../modals/InternalAuditReportModal';
import { useGetCollectionTableProps } from '../../../reports/config';
import type { InternalAuditReportFields } from '../../../reports/types';

interface Props {
  internalAudit: ObjectWithContributors;
}

const Tab: FC<Props> = ({ internalAudit }) => {
  const internalAuditId = useGetGuidParam('internalAuditId');
  const { t } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'internalAuditReports',
  });

  const { data, error, loading, refetch } =
    useGetInternalAuditReportsByOriginatingItemId({
      queryArgs: { originatingItemId: internalAuditId },
    });

  if (error) {
    throw error;
  }

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedInternalAuditReports, setSelectedInternalAuditReports] =
    useState<InternalAuditReportFields[]>([]);

  const [deleteInternalAuditReports, deleteResult] = useMutation(
    DeleteInternalAuditReportsDocument,
    {
      update: (cache) => {
        evictField(cache, 'internal_audit_report');
        evictField(cache, 'internal_audit_report_aggregate');
      },
    }
  );

  const onDelete = useDeleteResultNotification({
    entityName: st('entity_name'),
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
    asyncAction: async () => {
      await deleteInternalAuditReports({
        variables: {
          Ids: selectedInternalAuditReports.map((c) => c.Id),
        },
      });
      setSelectedInternalAuditReports([]);
      setIsDeleteModalVisible(false);

      return true;
    },
  });

  const handleInternalAuditReportModalOpen = () => {
    setIsEditOpen(true);
  };

  const handleInternalAuditReportModalClose = (saved: boolean) => {
    if (!saved) {
      setIsEditOpen(false);
    }
  };

  const tableProps = useGetCollectionTableProps(data?.internal_audit_report);

  return (
    <>
      <Table
        {...tableProps}
        selectionType={'multi'}
        selectedItems={selectedInternalAuditReports}
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
                    permission={'delete:internal_audit_report'}
                    parentObject={internalAudit}
                  >
                    <Button
                      formAction={'none'}
                      variant={'normal'}
                      disabled={!selectedInternalAuditReports.length}
                      onClick={() => setIsDeleteModalVisible(true)}
                    >
                      {st('delete_button')}
                    </Button>
                  </Permission>
                  <Permission
                    permission={'insert:internal_audit_report'}
                    parentObject={internalAudit}
                  >
                    <Button
                      iconName={'add-plus'}
                      variant={'primary'}
                      formAction={'none'}
                      onClick={handleInternalAuditReportModalOpen}
                    >
                      {st('add_button')}
                    </Button>
                  </Permission>
                </SpaceBetween>
              }
            >
              {st('tab_title')}
            </TabHeader>
          </SpaceBetween>
        }
        variant={'embedded'}
        loading={loading}
        loadingText={st('loading_message') ?? ''}
        sortingDisabled={false}
      />
      {isEditOpen && (
        <InternalAuditReportModal
          onDismiss={handleInternalAuditReportModalClose}
          onSave={async () => {
            await refetch();
            handleInternalAuditReportModalClose(false);
          }}
          parent={internalAudit}
        />
      )}
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
        {st('confirm_delete_message')}
      </DeleteModal>
    </>
  );
};

export default Tab;
