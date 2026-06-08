import { useMemo } from 'react';

import { buildEntityPathFromArray } from '@/utils/entityUtils';

import { useGetEntities } from './queries/entity/useGetEntities';

/**
 * Custom hook to provide entity path functionality
 * Uses the buildEntityPathFromArray utility with all entities data
 */
export const useEntityPath = () => {
  const { data: entitiesData } = useGetEntities({ queryArgs: {} });

  const entities = useMemo(() => {
    return (entitiesData?.entity || []).map((entity) => ({
      Id: entity.Id,
      Name: entity.Name,
      ParentId: entity.ParentId ?? null,
    }));
  }, [entitiesData?.entity]);

  const getEntityPath = useMemo(() => {
    return (entityId: string | null | undefined, separator: string = ' > ') => {
      return buildEntityPathFromArray(entityId, entities, separator);
    };
  }, [entities]);

  return {
    getEntityPath,
    entities,
    loading: !entitiesData,
  };
};
