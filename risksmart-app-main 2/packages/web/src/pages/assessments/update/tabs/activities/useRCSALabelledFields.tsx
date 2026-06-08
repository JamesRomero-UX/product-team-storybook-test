import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllOwnersCellValue } from 'src/rbac/contributorHelper';
import { getFriendlyId } from 'src/utils/friendlyId';

import type {
  AssessmentRCSAActivityFields,
  AssessmentRCSAActivityRegisterFields,
} from './types';

export const useLabelledFields = (
  records: AssessmentRCSAActivityFields[] | undefined
) => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'assessmentActivities',
  });
  const status = t('status');
  const type = t('type');
  const labelledFields = useMemo<
    AssessmentRCSAActivityRegisterFields[] | undefined
  >(() => {
    return records?.map((d) => {
      return {
        ...d,
        RiskSequentialId:
          getFriendlyId(Parent_Type_Enum.Risk, d.parentRisk?.SequentialId) ??
          '-',
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
        LinkedRisk: d.parentRisk?.Title,
        LinkedRiskSequentialId: d.parentRisk?.SequentialId,
        allAssignedUsers: getAllOwnersCellValue(d),
        NextTestDate: d.parentRisk?.scheduleState?.DueDate ?? '-',
        NextTestOverdueDate: d.parentRisk?.scheduleState?.OverdueDate ?? '-',
      };
    });
  }, [records, status, type, t]);

  return labelledFields;
};
