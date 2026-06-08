import ExpandableSection from '@risk-smart/themed-cloudscape-components/expandable-section';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import Table from '@risksmart-app/components/src/table';
import type { GetControlByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteModal from 'src/components/delete-modal/DeleteModal';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import TabHeader from 'src/components/tab-header';
import { useGetTestResultsByControlId } from 'src/hooks/queries/test-result/useGetTestResultsByControlId';
import { Permission } from 'src/rbac/Permission';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useDeleteTestResults } from '@/hooks/mutations/test-result/useDeleteTestResults';
import { useDeleteResultNotification } from '@/hooks/useMutationResultNotification';
import { getCounter } from '@/utils/collectionUtils';

import TestResultModal from '../TestResultModal';
import { useGetCollectionTableProps } from './performanceRatingConfig';
import type { PerformanceRegisterFields } from './types';

type Props = {
  control: GetControlByIdQuery['control'][number];
};

const PerformanceRatingRegister: FC<Props> = ({ control }) => {
  useI18NSummaryHelpContent('testResults.tabHelp');
  const { t } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'testResults',
  });
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [selectedTestResults, setSelectedTestResults] = useState<
    PerformanceRegisterFields[]
  >([]);
  const {
    hasPermission: canDeleteTestResults,
    loading: canDeleteTestResultsLoading,
  } = useHasPermissionQuery('delete:test_result', control);
  const [openTestResultId, setOpenTestResultId] = useState<
    string | undefined
  >();

  const { data, loading, refetch } = useGetTestResultsByControlId({
    queryArgs: { controlId: control.Id },
  });

  const handleTestResultModalOpen = () => {
    setIsEditOpen(true);
  };

  const handleTestResultModalClose = async (saved?: boolean) => {
    if (saved) {
      await refetch();
    }
    setOpenTestResultId(undefined);
    setIsEditOpen(false);
  };

  const { deleteTestResults, loading: deleteLoading } = useDeleteTestResults();

  const onDelete = useDeleteResultNotification({
    entityName: st('entity_name'),
    failureAction: () => {
      setIsDeleteModalVisible(false);
    },
    asyncAction: async () => {
      await deleteTestResults({
        ids: selectedTestResults.map((s) => s.Id),
      });
      await refetch();
      setSelectedTestResults([]);
      setIsDeleteModalVisible(false);

      return true;
    },
  });

  const tableProps = useGetCollectionTableProps(
    control,
    (testResult) => {
      setOpenTestResultId(testResult.Id);
      setIsEditOpen(true);
    },
    () => {
      setIsEditOpen(true);
    },
    data?.test_result
  );

  return (
    <>
      <SpaceBetween size={'m'}>
        <TabHeader
          actions={
            <SpaceBetween direction={'horizontal'} size={'xs'}>
              <Permission
                permission={'delete:test_result'}
                parentObject={control}
              >
                <Button
                  formAction={'none'}
                  variant={'normal'}
                  disabled={!selectedTestResults.length}
                  onClick={() => setIsDeleteModalVisible(true)}
                >
                  {t('delete')}
                </Button>
              </Permission>
              <Permission
                permission={'insert:test_result'}
                parentObject={control}
              >
                <Button
                  variant={'primary'}
                  formAction={'none'}
                  onClick={handleTestResultModalOpen}
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

      <ExpandableSection
        header={
          <div className={'flex space-x-2'}>
            <span>{st('performanceRatingSubheading')}</span>
            <span className={'text-grey font-normal'}>
              {getCounter(tableProps.totalItemsCount ?? 0, loading)}
            </span>
          </div>
        }
        defaultExpanded={true}
      >
        <Table
          {...tableProps}
          selectionType={
            canDeleteTestResults || canDeleteTestResultsLoading
              ? 'multi'
              : undefined
          }
          selectedItems={selectedTestResults}
          trackBy={'Id'}
          onSelectionChange={({ detail }) => {
            setSelectedTestResults(detail.selectedItems);
          }}
          resizableColumns={true}
          variant={'embedded'}
          loading={loading}
          loadingText={t('loadingTestResults') ?? ''}
          sortingDisabled={false}
        />
      </ExpandableSection>
      {isEditOpen && control.Id && (
        <TestResultModal
          parentControlId={control.Id}
          Id={openTestResultId}
          onDismiss={handleTestResultModalClose}
          assessmentMode={'rating'}
        />
      )}
      <DeleteModal
        loading={deleteLoading}
        isVisible={isDeleteModalVisible}
        header={t('delete')}
        onDelete={onDelete}
        onDismiss={() => {
          refetch();
          setOpenTestResultId(undefined);
          setSelectedTestResults([]);
          setIsDeleteModalVisible(false);
        }}
      >
        {st('confirm_delete_message')}
      </DeleteModal>
    </>
  );
};

export default PerformanceRatingRegister;
