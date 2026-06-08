import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FieldValues } from 'react-hook-form';

import { useGetInternalAuditReportsRegister } from '@/hooks/queries';
import { getFriendlyId } from '@/utils/friendlyId';

import ControlledSelect from '../controlled-select';
import type { ControlledBaseProps } from '../types';

interface Props<T extends FieldValues> extends ControlledBaseProps<T> {
  addEmptyOption?: boolean;
  disabled?: boolean;
  testId: string;
}

export const ControlledInternalAuditReportSelector = <T extends FieldValues>({
  ...props
}: Props<T>) => {
  const { data, loading } = useGetInternalAuditReportsRegister({
    queryArgs: {},
  });

  const options =
    data?.internal_audit_report.map((internalAuditReport) => ({
      value: internalAuditReport.Id,
      label:
        internalAuditReport?.Title ??
        getFriendlyId(
          Parent_Type_Enum.InternalAuditReport,
          internalAuditReport.SequentialId
        ),
    })) ?? [];

  return (
    <ControlledSelect
      statusType={loading ? 'loading' : 'finished'}
      options={options}
      filteringType={'auto'}
      {...props}
    />
  );
};

export default ControlledInternalAuditReportSelector;
