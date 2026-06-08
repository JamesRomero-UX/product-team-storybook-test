import type {
  GetRiskListOptimizedQuery,
  GetRiskListWithEntitiesQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';

export interface RiskOptionWithEntity {
  value: string;
  label: string;
  entityInfo?: {
    entityId: string;
  };
}

/**
 * Enhanced version of getOptions that includes entity identifier
 * Consumers should compute display paths using useEntityPath() with entityId
 */
export const getOptionsWithEntities = (
  data: GetRiskListWithEntitiesQuery | undefined,
  selectedRiskId: string | undefined,
  showEntityLabels: boolean = true
): RiskOptionWithEntity[] => {
  const risksById = _.keyBy(data?.risk, 'Id');
  let options: Array<{
    Id: string;
    Title?: string;
    SequentialId?: null | number | undefined;
    enterpriseRiskInstance?: GetRiskListWithEntitiesQuery['risk'][number]['enterpriseRiskInstance'];
  }> = data?.risk ?? [];

  // Add any missing risks from node data (for access control)
  options = options.concat(
    (data?.node ?? [])
      .filter((n) => !risksById[n.Id] && n.Id === selectedRiskId)
      .map((n) => ({
        Id: n.Id,
        SequentialId: n.SequentialId,
        Title: undefined,
        enterpriseRiskInstance: undefined,
      }))
  );

  return options.map((risk) => {
    const riskLabel =
      risk.Title ??
      // fall back to friendly id when title is missing
      `${Parent_Type_Enum.Risk}-${risk.SequentialId ?? ''}`;

    const entityId = risk.enterpriseRiskInstance?.entity?.Id;

    return {
      value: risk.Id,
      label: riskLabel,
      entityInfo: showEntityLabels && entityId ? { entityId } : undefined,
    };
  });
};

/**
 * Backwards compatibility function that returns standard options format
 * Used when entities feature is disabled or for legacy components
 */
export const getOptions = (
  data: GetRiskListOptimizedQuery | undefined,
  selectedRiskId: string | undefined
) => {
  const risksById = _.keyBy(data?.risk, 'Id');
  let options: {
    Id: string;
    Title?: string;
    SequentialId?: null | number | undefined;
  }[] = data?.risk ?? [];

  options = options.concat(
    (data?.node ?? []).filter(
      (n) => !risksById[n.Id] && n.Id === selectedRiskId
    )
  );

  return (
    options.map((r) => ({
      value: r.Id,
      label: r.Title ?? `${Parent_Type_Enum.Risk}-${r.SequentialId ?? ''}`,
    })) ?? []
  );
};

// Removed formatRiskOptionForSelect; formatting now occurs in component using useEntityPath()
