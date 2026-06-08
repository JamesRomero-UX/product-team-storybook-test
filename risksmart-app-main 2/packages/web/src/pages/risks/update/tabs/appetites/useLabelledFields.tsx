import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import _ from 'lodash';
import { useMemo } from 'react';

import { useCommonLookupLazy } from '@/hooks/useCommonLookupLazy';

import type { AppetiteFields, AppetiteTableFields } from './types';

export const useLabelledFields = (records: AppetiteFields[] | undefined) => {
  const { getLabel } = useRating('risk_appetite');
  const { getLabel: getImpactAppetiteLabel } = useRating('impact_appetite');
  const { getLabel: getLikelihoodAppetiteLabel } = useRating(
    'likelihood_appetite'
  );
  const { getLabel: getStatusLabel } = useRating('appetite_status');
  const { getByValue: getCommonLookLazy } = useCommonLookupLazy();

  return useMemo<AppetiteTableFields[] | undefined>(() => {
    return records
      ?.filter((r) => r.appetite)
      .map((d) => {
        const impact = d.appetite?.impact;
        const appetite = d.appetite;
        if (!appetite) {
          throw new Error('Missing appetite');
        }

        return {
          Id: appetite.Id,
          EffectiveDate: appetite.EffectiveDate,
          SequentialId: appetite.SequentialId,
          AppetiteType:
            getCommonLookLazy('appetiteTypes', appetite.AppetiteType)?.label ??
            '',
          ImpactId: impact?.Id,
          ImpactName: impact?.Name,
          LowerAppetite: appetite.LowerAppetite,
          UpperAppetite: appetite.UpperAppetite,
          Status: d.Status,
          LowerAppetiteLabelled: appetite.LowerAppetite
            ? getLabel(appetite.LowerAppetite)
            : 'Undefined',
          UpperAppetiteLabelled: appetite.UpperAppetite
            ? getLabel(appetite.UpperAppetite)
            : 'Undefined',
          ImpactAppetite: appetite.ImpactAppetite,
          LikelihoodAppetite: appetite.LikelihoodAppetite,
          ImpactAppetiteLabelled: appetite.ImpactAppetite
            ? getImpactAppetiteLabel(appetite.ImpactAppetite)
            : 'Undefined',
          StatusLabelled: getStatusLabel(d.Status) ?? '-',
          LikelihoodAppetiteLabelled:
            getLikelihoodAppetiteLabel(appetite.LikelihoodAppetite) ?? '-',
        };
      });
  }, [
    records,
    getCommonLookLazy,
    getLabel,
    getImpactAppetiteLabel,
    getStatusLabel,
    getLikelihoodAppetiteLabel,
  ]);
};
