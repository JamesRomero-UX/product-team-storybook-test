import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';
import {
  getAllContributorsCellValue,
  getAllOwnersCellValue,
} from 'src/rbac/contributorHelper';

import type { ThirdPartyFields, ThirdPartyRegisterFields } from './types';

export const useLabelledFields = (
  data: ThirdPartyFields[] | undefined
): ThirdPartyRegisterFields[] => {
  const statusRating = useRating('third_party_status');
  const typeRating = useRating('third_party_type');
  const criticalityRating = useRating('third_party_criticality');

  return useMemo(() => {
    return (
      data?.map((record) => ({
        ...record,
        StatusLabelled: statusRating.getLabel(record.Status),
        TypeLabelled: typeRating.getLabel(record.Type),
        CriticalityLabelled: criticalityRating.getLabel(record.Criticality),
        allOwners: getAllOwnersCellValue(record),
        allContributors: getAllContributorsCellValue(record),
      })) ?? []
    );
  }, [data, criticalityRating, statusRating, typeRating]);
};
