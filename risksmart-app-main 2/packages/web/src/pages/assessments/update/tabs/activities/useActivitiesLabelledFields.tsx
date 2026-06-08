import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type {
  AssessmentActivityFields,
  AssessmentActivityRegisterFields,
} from './types';

export const useLabelledFields = (
  records: AssessmentActivityFields[] | undefined
) => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'assessmentActivities',
  });
  const status = t('status');
  const type = t('type');
  const labelledFields = useMemo<
    AssessmentActivityRegisterFields[] | undefined
  >(() => {
    return records?.map((d) => {
      return {
        ...d,
        StatusLabelled: d.Status ? status[d.Status] : '-',
        ActivityTypeLabelled: d.IsRCSA
          ? t('rcsa')
          : d.ActivityType
            ? type[d.ActivityType]
            : '-',
        CreatedById: d.CreatedByUser,
        CreatedByUsername: d.createdByUser?.FriendlyName ?? '-',
        CreatedOn: d.CreatedAtTimestamp,
        UpdatedById: d.ModifiedByUser,
        UpdatedByUsername: d.modifiedByUser?.FriendlyName ?? '-',
        AssignedUser: d.assignedUser?.FriendlyName,
      };
    });
  }, [records, status, type, t]);

  return labelledFields;
};
