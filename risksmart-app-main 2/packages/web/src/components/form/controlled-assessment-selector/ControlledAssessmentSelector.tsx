import { useQuery } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import { GetAssessmentsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FieldValues } from 'react-hook-form';

import { getFriendlyId } from '@/utils/friendlyId';

import ControlledSelect from '../controlled-select';
import type { ControlledBaseProps } from '../types';

interface Props<T extends FieldValues> extends ControlledBaseProps<T> {
  addEmptyOption?: boolean;
  disabled?: boolean;
  testId: string;
}

export const ControlledAssessmentSelector = <T extends FieldValues>({
  ...props
}: Props<T>) => {
  const { addNotification } = useNotifications();
  const { data, loading } = useQuery(GetAssessmentsDocument, {
    fetchPolicy: 'no-cache',
    onError: (error) => {
      addNotification({
        type: 'error',
        content: <>{error.message}</>,
      });
    },
  });

  const options =
    data?.assessment.map((assessment) => ({
      value: assessment.Id,
      label:
        assessment?.Title ??
        getFriendlyId(Parent_Type_Enum.Assessment, assessment.SequentialId),
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

export default ControlledAssessmentSelector;
