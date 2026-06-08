import Table from '@risksmart-app/components/src/table';
import type { GetPolicyAttestationRecordsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import ExportButton from 'src/components/export-button';
import TabHeader from 'src/components/tab-header';
import { PageLayout } from 'src/layouts';
import { getCounter } from 'src/utils';

import { useGetRegisterTableProps } from './config';

export interface ByUserViewProps {
  attestationsRegisterData: GetPolicyAttestationRecordsQuery | undefined;
  loading: boolean;
  viewSelector: React.ReactNode;
  title: string;
  subTitle?: string;
}

const View: React.FC<ByUserViewProps> = ({
  attestationsRegisterData,
  loading,
  viewSelector,
  title,
  subTitle,
}) => {
  const tableProps = useGetRegisterTableProps(
    attestationsRegisterData?.attestation_record
  );

  const header = (
    <div className={'flex justify-between'}>
      <TabHeader>{subTitle}</TabHeader>
      {viewSelector}
    </div>
  );

  return (
    <PageLayout
      helpTranslationKey={'policy.registerHelp'}
      title={title}
      counter={getCounter(tableProps.totalItemsCount, loading)}
      actions={<ExportButton tableProps={tableProps} entityLabel={title} />}
    >
      <Table {...tableProps} loading={loading} header={header} />
    </PageLayout>
  );
};

export default View;
