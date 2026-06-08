import type { StatefulTableOptions } from 'src/utils/table/hooks/useGetStatelessTableProps';
import { useGetStatelessTableProps } from 'src/utils/table/hooks/useGetStatelessTableProps';
import type { TablePropsWithActions } from 'src/utils/table/types';

import { useGetAttestationTableProps } from './by-user/config';
import type {
  AttestationFlatField,
  AttestationRegisterByUserFields,
} from './types';
export const useGetAttestationSmartWidgetTableProps = (
  records: AttestationFlatField[] | undefined,
  statefulTableOptions: StatefulTableOptions<AttestationRegisterByUserFields>
): TablePropsWithActions<AttestationRegisterByUserFields> => {
  const props = useGetAttestationTableProps(records);

  return useGetStatelessTableProps<AttestationRegisterByUserFields>({
    ...props,
    ...statefulTableOptions,
    enableFiltering: false,
  });
};
