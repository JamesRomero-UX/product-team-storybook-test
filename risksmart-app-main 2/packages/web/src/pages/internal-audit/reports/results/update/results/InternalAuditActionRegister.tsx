import Table from '@risksmart-app/components/src/table';
import type { FC } from 'react';
import { useGetCollectionStatelessTableProps } from 'src/pages/actions/config';
import type { ActionFields } from 'src/pages/actions/types';

interface Props {
  loading: boolean;
  records: ActionFields[] | undefined;
}

const InternalAuditActionRegister: FC<Props> = ({ loading, records }) => {
  const tableProps = useGetCollectionStatelessTableProps(records, true);

  return <Table variant={'embedded'} {...tableProps} loading={loading} />;
};

export default InternalAuditActionRegister;
