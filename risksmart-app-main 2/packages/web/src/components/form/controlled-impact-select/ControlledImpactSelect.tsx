import { useQuery } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import { GetImpactListDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FieldValues } from 'react-hook-form';

import ControlledSelect from '../controlled-select';
import type { ControlledBaseProps } from '../types';

interface Props<T extends FieldValues> extends ControlledBaseProps<T> {
  addEmptyOption?: boolean;
  disabled?: boolean;
  single?: boolean;
  testId: string;
}

export const ControlledImpactSelect = <T extends FieldValues>({
  ...props
}: Props<T>) => {
  const { addNotification } = useNotifications();

  const { data, loading } = useQuery(GetImpactListDocument, {
    fetchPolicy: 'no-cache',
    onError: (error) => {
      addNotification({
        type: 'error',
        content: <>{error.message}</>,
      });
    },
  });

  const options =
    data?.impact.map((r) => ({
      value: r.Id,
      label: r.Name,
    })) ?? [];

  return (
    <ControlledSelect
      statusType={loading ? 'loading' : 'finished'}
      {...props}
      options={options}
      filteringType={'auto'}
    />
  );
};
