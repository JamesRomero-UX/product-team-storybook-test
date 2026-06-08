import Table from '@risksmart-app/components/src/table';
import type { GetIssuesQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useGetStatelessRegisterTableProps } from 'src/pages/issues/config';

import type { CollectionData } from '@/utils/collectionUtils';
type IssueFlatField = CollectionData<GetIssuesQuery['issue'][number]>;
interface Props {
  loading: boolean;
  records: IssueFlatField[] | undefined;
}

const AssessmentIssueRegister: FC<Props> = ({ loading, records }) => {
  const tableProps = useGetStatelessRegisterTableProps(
    Parent_Type_Enum.Issue,
    records
  );

  return <Table variant={'embedded'} {...tableProps} loading={loading} />;
};

export default AssessmentIssueRegister;
