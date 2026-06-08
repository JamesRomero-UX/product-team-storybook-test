import { useQuery } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type {
  GetRisksWithAncestorContributorsAndEntitiesQuery,
  GetRisksWithAncestorContributorsQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  GetRisksWithAncestorContributorsAndEntitiesDocument,
  GetRisksWithAncestorContributorsDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import type { FieldValues } from 'react-hook-form';
import ControlledMultiselect from 'src/components/form/controlled-multiselect';
import Tokens from 'src/components/tokens';
import type { Filter } from 'src/components/user-search-preferences/useGroupAndUserOptions';

import { useEntityLabelsFeature } from '@/hooks/useEntityLabelsFeature';
import { useEntityPath } from '@/hooks/useEntityPath';
import { getFriendlyId } from '@/utils/friendlyId';
import { riskDetailsUrl } from '@/utils/urls';

import type { ControlledBaseProps } from '../types';

interface Props<T extends FieldValues> extends ControlledBaseProps<T> {
  addEmptyOption?: boolean;
  disabled?: boolean;
  single?: boolean;
  testId?: string;
  excludedIds?: string[];
  riskFilter?:
    | Filter<GetRisksWithAncestorContributorsAndEntitiesQuery['risk'][number]>
    | Filter<GetRisksWithAncestorContributorsQuery['risk'][number]>;
  disabledOptions?: { riskId: string; reason: string }[];
  showEntityLabels?: boolean;
}

export const ControlledRiskWithAncestorsMultiSelect = <T extends FieldValues>({
  showEntityLabels,
  ...props
}: Props<T>) => {
  const { addNotification } = useNotifications();
  const { shouldShowEntityLabels } = useEntityLabelsFeature(showEntityLabels);
  const { getEntityPath } = useEntityPath();

  const riskFilter = props.riskFilter ?? (() => true);

  // Use different queries based on whether we need entity information
  const { data: dataWithEntities, loading: loadingWithEntities } = useQuery(
    GetRisksWithAncestorContributorsAndEntitiesDocument,
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
    GetRisksWithAncestorContributorsDocument,
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
  const data = shouldShowEntityLabels ? dataWithEntities : dataBasic;

  // Apply risk filter with proper typing
  const risks = data?.risk.filter((risk) => {
    if (shouldShowEntityLabels) {
      return riskFilter(
        risk as GetRisksWithAncestorContributorsAndEntitiesQuery['risk'][number]
      );
    } else {
      return riskFilter(
        risk as GetRisksWithAncestorContributorsQuery['risk'][number]
      );
    }
  });

  const options =
    risks
      ?.filter((risk) => !props.excludedIds?.includes(risk.Id))
      .map((risk) => {
        const riskLabel =
          risk?.Title ??
          getFriendlyId(Parent_Type_Enum.Risk, risk.SequentialId);
        const tags = risk
          ? [getFriendlyId(Parent_Type_Enum.Risk, risk.SequentialId)]
          : [];

        // Add entity description and ancestor contributors for display in dropdown
        let description: string | undefined;

        // Add ancestor contributors information
        const ancestorContributorsText = risk.ancestorContributors
          ?.map((contributor) => {
            if (contributor.user?.FriendlyName) {
              return contributor.user.FriendlyName;
            }
            if (contributor.user_group?.Name) {
              return contributor.user_group.Name;
            }

            return null;
          })
          .filter(Boolean)
          .join(', ');

        if (shouldShowEntityLabels) {
          const entityId = (
            risk as GetRisksWithAncestorContributorsAndEntitiesQuery['risk'][number]
          ).enterpriseRiskInstance?.entity?.Id;
          if (entityId) {
            const entityPath = `Entity: ${getEntityPath(entityId)}`;
            description = ancestorContributorsText
              ? `${entityPath} | Contributors: ${ancestorContributorsText}`
              : entityPath;
          }
        } else if (ancestorContributorsText) {
          description = `Contributors: ${ancestorContributorsText}`;
        }

        return {
          value: risk.Id,
          tags,
          label: riskLabel,
          description,
        };
      }) ?? [];

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

  // Pre-calculate and memoize entity path information for performance
  const riskEntityPathMap = useMemo(() => {
    if (!shouldShowEntityLabels || !dataWithEntities) {
      return new Map<string, string>();
    }

    const pathMap = new Map<string, string>();

    dataWithEntities.risk.forEach((risk) => {
      const entityId = risk.enterpriseRiskInstance?.entity?.Id;
      if (entityId) {
        const entityPath = getEntityPath(entityId);
        pathMap.set(risk.Id, entityPath);
      }
    });

    return pathMap;
  }, [shouldShowEntityLabels, dataWithEntities, getEntityPath]);

  return (
    <ControlledMultiselect
      statusType={loading ? 'loading' : 'finished'}
      {...props}
      hideTokens={true}
      options={withDisabledOptions}
      renderTokens={true}
      filteringType={'auto'}
      customTokenRender={(selectedOptions, actions) => {
        const validOptions = selectedOptions.filter((o) => o.value != null);

        const enhancedTokens = validOptions.map((selectedOption) => {
          let subtitle: string | undefined;

          if (shouldShowEntityLabels) {
            // Use pre-calculated entity path from memoized map for performance
            subtitle = riskEntityPathMap.get(selectedOption.value!);
          }

          return {
            value: selectedOption.value!,
            url: riskDetailsUrl(selectedOption.value!),
            label: selectedOption.label!,
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
      }}
    />
  );
};
