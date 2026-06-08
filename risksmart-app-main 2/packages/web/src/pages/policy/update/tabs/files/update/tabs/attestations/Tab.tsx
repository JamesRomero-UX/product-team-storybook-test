import { useQuery } from '@apollo/client';
import Table from '@risksmart-app/components/src/table';
import { GetPolicyAttestationRecordsForDocumentDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

import { useGetRegisterTableProps } from './config';

type TabProps = {
  documentFileId: string;
};

const Tab = ({ documentFileId }: TabProps) => {
  const { data, loading } = useQuery(
    GetPolicyAttestationRecordsForDocumentDocument,
    {
      fetchPolicy: 'no-cache',
      variables: { documentFileId },
    }
  );
  const tableProps = useGetRegisterTableProps(data?.attestation_record);

  return <Table {...tableProps} variant={'embedded'} loading={loading} />;
};

export default Tab;
