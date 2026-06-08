import ExpandableSection from '@risk-smart/themed-cloudscape-components/expandable-section';
import Table from '@risksmart-app/components/src/table';
import type { GetControlByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import { useGetInternalAuditReportTestResultsByControlId } from 'src/hooks/queries/test-result/useGetInternalAuditReportTestResultsByControlId';

import { getCounter } from '@/utils/collectionUtils';

import TestResultModal from '../TestResultModal';
import { useGetCollectionTableProps } from './internalAuditPerformanceRatingConfig';

type Props = {
  control: GetControlByIdQuery['control'][number];
};

const InternalAuditPerformanceRatingRegister: FC<Props> = ({ control }) => {
  useI18NSummaryHelpContent('testResults.tabHelp');
  const { t } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'testResults',
  });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [openTestResultId, setOpenTestResultId] = useState<
    string | undefined
  >();

  const { data, loading } = useGetInternalAuditReportTestResultsByControlId({
    queryArgs: { controlId: control.Id },
  });

  const handleTestResultModalClose = () => {
    setOpenTestResultId(undefined);
    setIsEditOpen(false);
  };

  const tableProps = useGetCollectionTableProps((testResult) => {
    setOpenTestResultId(testResult.Id);
    setIsEditOpen(true);
  }, data?.control_test_internal_audit_result);

  return (
    <>
      <ExpandableSection
        header={
          <div className={'flex space-x-2'}>
            <span>{st('internalAuditRatingSubheading')}</span>
            <span className={'text-grey font-normal'}>
              {getCounter(tableProps.totalItemsCount ?? 0, loading)}
            </span>
          </div>
        }
        defaultExpanded={true}
      >
        <Table
          {...tableProps}
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
          assessmentMode={'internal_audit_report'}
        />
      )}
    </>
  );
};

export default InternalAuditPerformanceRatingRegister;
