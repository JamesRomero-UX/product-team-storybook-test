import _ from 'lodash';
import { useMemo } from 'react';
import type { FieldValues } from 'react-hook-form';
import Tokens from 'src/components/tokens';

import { useGetDocumentList } from '@/hooks/queries';
import { policyDetailsUrl } from '@/utils/urls';

import ControlledMultiselect from '../controlled-multiselect';
import type { ControlledBaseProps } from '../types';

interface Props<T extends FieldValues> extends ControlledBaseProps<T> {
  addEmptyOption?: boolean;
  disabled?: boolean;
  excludedIds?: string[];
}

export const ControlledDocumentMultiselect = <T extends FieldValues>({
  excludedIds,
  disabled,
  ...props
}: Props<T>) => {
  const { data: documents, loading } = useGetDocumentList({ queryArgs: {} });

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
          const document = documents?.document?.find(
            (document) => document.Id === change.value
          );

          return document ? document.Title : change.value;
        })
        .join(', ');

      return formattedChanges;
    },
    [documents?.document]
  );

  return (
    <ControlledMultiselect
      statusType={loading ? 'loading' : 'finished'}
      disabled={disabled}
      {...props}
      hideTokens={true}
      filteringType={'auto'}
      options={
        documents?.document
          ?.filter((document) => !excludedIds?.includes(document.Id))
          .map((document) => ({
            value: String(document.Id),
            label: String(document.Title),
          })) || []
      }
      renderTokens={true}
      customTokenRender={(options, actions) => (
        <Tokens
          disabled={disabled}
          onRemove={actions.removeToken}
          tokens={options.map((o) => ({
            value: o.value!,
            url: policyDetailsUrl(o.value!),
            label: o.label!,
          }))}
        />
      )}
      hasFieldChanged={hasFieldChanged}
      previewChangesFormatter={previewChangesFormatter}
    />
  );
};
