import type {
  GetRiskListOnlyOptimizedQuery,
  GetRiskListOnlyWithEntitiesOptimizedQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FieldValues } from 'react-hook-form';
import ControlledMultiselect from 'src/components/form/controlled-multiselect';
import type { HidableOption } from 'src/components/form/controlled-multiselect/types';
import Tokens from 'src/components/tokens';
import {
  useGetRiskListOnlyOptimized,
  useGetRiskListOnlyWithEntitiesOptimized,
} from 'src/hooks/queries';

import { useEntityLabelsFeature } from '@/hooks/useEntityLabelsFeature';
import { useEntityPath } from '@/hooks/useEntityPath';
import { getFriendlyId } from '@/utils/friendlyId';
import { riskDetailsUrl } from '@/utils/urls';

import type { ControlledBaseProps } from '../types';

type RiskItem =
  | GetRiskListOnlyOptimizedQuery['risk'][number]
  | GetRiskListOnlyWithEntitiesOptimizedQuery['risk'][number];

interface Props<T extends FieldValues> extends ControlledBaseProps<T> {
  addEmptyOption?: boolean;
  disabled?: boolean;
  single?: boolean;
  testId?: string;
  excludedIds?: string[];
  disabledOptions?: { riskId: string; reason: string }[];
  showEntityLabels?: boolean;
  filter?: (risk: RiskItem) => boolean;
}

export const ControlledRiskMultiSelect = <T extends FieldValues>({
  showEntityLabels,
  filter,
  ...props
}: Props<T>) => {
  const { shouldShowEntityLabels } = useEntityLabelsFeature(showEntityLabels);
  const { getEntityPath } = useEntityPath();

  const { data: dataWithEntities, loading: loadingWithEntities } =
    useGetRiskListOnlyWithEntitiesOptimized({
      queryArgs: {},
      shouldSkip: !shouldShowEntityLabels,
    });

  const { data: dataBasic, loading: loadingBasic } =
    useGetRiskListOnlyOptimized({
      queryArgs: {},
      shouldSkip: shouldShowEntityLabels,
    });

  const loading = shouldShowEntityLabels ? loadingWithEntities : loadingBasic;

  // Apply permission filter to raw data before processing
  const applyPermissionFilter = (risks: RiskItem[]) => {
    if (filter) {
      return risks.filter(filter);
    }

    return risks;
  };

  // Apply permission filter when working with the entity-aware query type
  const applyPermissionFilterWithEntities = (
    risks: GetRiskListOnlyWithEntitiesOptimizedQuery['risk']
  ) => {
    if (filter) {
      return risks.filter((r) => filter(r as RiskItem));
    }

    return risks;
  };

  // Generate options based on whether we're showing entity labels
  let options: Array<{
    value: string;
    label: string;
    tags: string[];
    description?: string;
  }> = [];

  if (shouldShowEntityLabels) {
    const risks = applyPermissionFilterWithEntities(
      dataWithEntities?.risk ?? []
    ).filter((risk) => !props.excludedIds?.includes(risk.Id));

    options = risks.map((risk) => {
      const label =
        risk?.Title ?? getFriendlyId(Parent_Type_Enum.Risk, risk.SequentialId);
      const tags = risk
        ? [getFriendlyId(Parent_Type_Enum.Risk, risk.SequentialId)]
        : [];
      const entityId = risk.enterpriseRiskInstance?.entity?.Id;

      return {
        value: risk.Id,
        label,
        tags,
        description: entityId
          ? `Entity: ${getEntityPath(entityId)}`
          : undefined,
      };
    });
  } else {
    const risks = applyPermissionFilter(dataBasic?.risk ?? []).filter(
      (risk) => !props.excludedIds?.includes(risk.Id)
    );

    options = risks.map((risk) => ({
      value: risk.Id,
      tags: risk
        ? [getFriendlyId(Parent_Type_Enum.Risk, risk.SequentialId)]
        : [],
      label:
        risk?.Title ?? getFriendlyId(Parent_Type_Enum.Risk, risk.SequentialId),
    }));
  }

  const withDisabledOptions = props.disabledOptions
    ? options.map((option) => {
        const disabledOption = props.disabledOptions?.find(
          (disabled) => disabled.riskId === option.value
        );

        return {
          ...option,
          disabled: !!disabledOption,
          disabledReason: disabledOption?.reason,
        };
      })
    : options;

  // Enhanced token rendering with entity information
  const renderTokensWithEntity = (
    selectedOptions: HidableOption[],
    actions: { removeToken: (value: string) => void }
  ) => {
    // Filter out options with undefined values
    const validOptions = selectedOptions.filter((o) => o.value != null);

    if (!shouldShowEntityLabels) {
      return (
        <Tokens
          onRemove={actions.removeToken}
          disabled={props.disabled}
          tokens={validOptions.map((o) => ({
            value: o.value!,
            url: riskDetailsUrl(o.value!),
            label: o.label || '',
          }))}
        />
      );
    }

    // Compute entity path for selected tokens based on entityId from query data
    const enhancedTokens = validOptions.map((selectedOption) => {
      const risk = dataWithEntities?.risk.find(
        (r) => r.Id === selectedOption.value
      );
      const entityId = risk?.enterpriseRiskInstance?.entity?.Id;
      const subtitle = entityId ? getEntityPath(entityId) : undefined;

      return {
        value: selectedOption.value!,
        url: riskDetailsUrl(selectedOption.value!),
        label: selectedOption.label || '',
        subtitle,
      };
    });

    return (
      <Tokens
        onRemove={actions.removeToken}
        disabled={props.disabled}
        tokens={enhancedTokens}
      />
    );
  };

  return (
    <ControlledMultiselect
      statusType={loading ? 'loading' : 'finished'}
      {...props}
      hideTokens={true}
      options={withDisabledOptions}
      renderTokens={true}
      filteringType={'auto'}
      customTokenRender={renderTokensWithEntity}
    />
  );
};
