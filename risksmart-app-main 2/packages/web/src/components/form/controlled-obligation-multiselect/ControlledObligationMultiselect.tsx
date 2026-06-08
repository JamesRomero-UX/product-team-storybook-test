import { useQuery } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import { GetObligationListDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';
import { useMemo } from 'react';
import type { FieldValues } from 'react-hook-form';
import Tokens from 'src/components/tokens';

import { obligationDetailsUrl } from '@/utils/urls';

import ControlledMultiselect from '../controlled-multiselect';
import type { ControlledBaseProps } from '../types';
import { getOptions } from './selectUtils';

interface Props<T extends FieldValues> extends ControlledBaseProps<T> {
  addEmptyOption?: boolean;
  disabled?: boolean;
  excludedIds?: string[];
}

export const ControlledObligationMultiselect = <T extends FieldValues>({
  ...props
}: Props<T>) => {
  const { addNotification } = useNotifications();

  const defaultValues: { value: string }[] =
    props.control._defaultValues[props.name] ?? [];
  const { data: obligations, loading } = useQuery(GetObligationListDocument, {
    fetchPolicy: 'no-cache',
    onError: (error) => {
      addNotification({
        type: 'error',
        content: <>{error.message}</>,
      });
    },
  });

  const hasFieldChanged = useMemo(
    () =>
      (
        value:
          | {
              from: { value: string }[] | null | undefined;
              to: { value: string }[] | null | undefined;
            }
          | null
          | undefined
      ) => {
        if (value === undefined || value === null) {
          return false;
        }

        return !(
          (_.isNil(value.from) && _.isNil(value.to)) ||
          _.isEqual(
            value.from?.map(({ value }) => value) || [],
            value.to?.map(({ value }) => value) || []
          )
        );
      },
    []
  );

  const previewChangesFormatter = useMemo(
    () => (changes: { value: string }[]) => {
      const formattedChanges = changes
        .map((change) => {
          const obligation = obligations?.obligation?.find(
            (obligation) => obligation.Id === change.value
          );

          return obligation ? obligation.Title : change.value;
        })
        .join(', ');

      return formattedChanges;
    },
    [obligations]
  );

  return (
    <ControlledMultiselect
      statusType={loading ? 'loading' : 'finished'}
      {...props}
      hideTokens={true}
      options={getOptions(obligations, defaultValues, props.excludedIds)}
      renderTokens={true}
      customTokenRender={(options, actions) => (
        <Tokens
          onRemove={actions.removeToken}
          tokens={options.map((o) => ({
            value: o.value!,
            url: obligationDetailsUrl(o.value!),
            label: o.label!,
          }))}
        />
      )}
      hasFieldChanged={hasFieldChanged}
      previewChangesFormatter={previewChangesFormatter}
    />
  );
};
