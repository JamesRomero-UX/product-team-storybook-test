import _ from 'lodash';
import { useMemo } from 'react';
import type { FieldValues } from 'react-hook-form';
import Tokens from 'src/components/tokens';
import { useGetControlsBasic } from 'src/hooks/queries';

import { controlDetailsUrl } from '@/utils/urls';

import ControlledMultiselect from '../controlled-multiselect';
import type { ControlledBaseProps } from '../types';
import { getOptions } from './multiselectUtils';

interface Props<T extends FieldValues> extends ControlledBaseProps<T> {
  disabled?: boolean;
  excludedIds?: string[];
  renderTokens?: boolean;
}

export const ControlledControlMultiSelect = <T extends FieldValues>({
  excludedIds,
  ...props
}: Props<T>) => {
  const { data: controls, loading } = useGetControlsBasic({ queryArgs: {} });

  const orderedOptions = useMemo(() => {
    const defaultValues: { value: string; label: string }[] =
      props.control._defaultValues[props.name] ?? [];

    return _.sortBy(
      getOptions(controls, defaultValues).filter(
        (control) => !excludedIds?.includes(control.value)
      ),
      'label'
    );
  }, [controls, excludedIds, props.control._defaultValues, props.name]);

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
          const control = controls?.control?.find(
            (control) => control.Id === change.value
          );

          return control ? control.Title : change.value;
        })
        .join(', ');

      return formattedChanges;
    },
    [controls]
  );

  return (
    <ControlledMultiselect
      statusType={loading ? 'loading' : 'finished'}
      {...props}
      hideTokens={true}
      renderTokens={true}
      filteringType={'auto'}
      options={orderedOptions}
      hasFieldChanged={hasFieldChanged}
      previewChangesFormatter={previewChangesFormatter}
      customTokenRender={(options, actions) => (
        <Tokens
          onRemove={actions.removeToken}
          disabled={props.disabled}
          tokens={options.map((o) => ({
            value: o.value!,
            url: controlDetailsUrl(o.value!),
            label: o.label!,
          }))}
        />
      )}
    />
  );
};
