import { useQuery } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import {
  GetRiskListOptimizedDocument,
  GetRiskListWithEntitiesDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';
import type { FieldValues } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';

import { useEntityLabelsFeature } from '@/hooks/useEntityLabelsFeature';
import { useEntityPath } from '@/hooks/useEntityPath';

import ControlledSelect from '../controlled-select';
import type { ControlledBaseProps } from '../types';
import { getOptions } from './selectUtils';
import { getOptionsWithEntities } from './selectUtilsWithEntities';

interface Props<T extends FieldValues> extends ControlledBaseProps<T> {
  addEmptyOption?: boolean;
  disabled?: boolean;
  single?: boolean;
  testId: string;
  showEntityLabels?: boolean;
}

export const ControlledRiskSelect = <T extends FieldValues>({
  showEntityLabels,
  ...props
}: Props<T>) => {
  const { addNotification } = useNotifications();
  const { watch } = useFormContext();
  const value = watch(props.name);
  const { shouldShowEntityLabels } = useEntityLabelsFeature(showEntityLabels);
  const { getEntityPath } = useEntityPath();

  // Use different queries based on whether we need entity information
  const { data: dataWithEntities, loading: loadingWithEntities } = useQuery(
    GetRiskListWithEntitiesDocument,
    {
      fetchPolicy: 'no-cache',
      skip: !shouldShowEntityLabels,
      onError: (error) => {
        addNotification({
          type: 'error',
          content: <>{error.message}</>,
        });
      },
    }
  );

  const { data: dataBasic, loading: loadingBasic } = useQuery(
    GetRiskListOptimizedDocument,
    {
      fetchPolicy: 'no-cache',
      skip: shouldShowEntityLabels,
      onError: (error) => {
        addNotification({
          type: 'error',
          content: <>{error.message}</>,
        });
      },
    }
  );

  const loading = shouldShowEntityLabels ? loadingWithEntities : loadingBasic;

  // Generate options based on whether we're showing entity labels
  const options = shouldShowEntityLabels
    ? getOptionsWithEntities(dataWithEntities, value, true).map((opt) => ({
        value: opt.value,
        label: opt.label,
        description: opt.entityInfo?.entityId
          ? getEntityPath(opt.entityInfo.entityId)
          : undefined,
      }))
    : getOptions(dataBasic, value);

  return (
    <ControlledSelect
      statusType={loading ? 'loading' : 'finished'}
      {...props}
      options={options}
      filteringType={'auto'}
    />
  );
};
