import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { useMemo } from 'react';
import {
  getAllContributorsCellValue,
  getAllOwnersCellValue,
} from 'src/rbac/contributorHelper';

import { getFriendlyId } from '@/utils/friendlyId';

import type {
  ObligationChangeFields,
  ObligationChangeRegisterFields,
} from './types';

export const useLabelledFields = (
  records: ObligationChangeFields[] | undefined
) => {
  const { user } = useRisksmartUser();
  const labelledFields = useMemo<
    ObligationChangeRegisterFields[] | undefined
  >(() => {
    return records?.map((d) => {
      return {
        ...d,
        SequentialIdLabel: getFriendlyId('obligation_change', d.SequentialId),
        ObligationTitle: d.obligation?.Title ?? null,
        CreatedBy: d.CreatedByUser || '-',
        ModifiedBy: d.ModifiedByUser || '-',
        StatusLabelled: d.attestations.some((a) => a.UserId === user?.userId)
          ? 'read'
          : 'unread',
        ActionsLabelled: d.actions.map((a) => a.action),
        allOwners: getAllOwnersCellValue(d),
        allContributors: getAllContributorsCellValue(d),
        Regulator: d.obligation?.regulatorySource?.RegulatorName ?? '-',
      };
    });
  }, [records, user?.userId]);

  return labelledFields;
};
