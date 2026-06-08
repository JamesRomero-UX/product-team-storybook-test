import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { MAX_COL_WIDTH } from 'src/App.config';
import SimpleRatingBadge from 'src/components/simple-rating-badge';

import Link from '@/components/link';
import { useGetTablePropsWithoutUrlHash } from '@/utils/table/hooks/useGetTablePropsWithoutUrlHash';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';

import type { AssessmentTypeEnum } from '../../../types';
import { useAssessmentTypeConfig } from '../../../useAssessmentTypeConfig';
import type {
  AssessmentActivityFields,
  AssessmentActivityRegisterFields,
} from './types';
import { useLabelledFields } from './useActivitiesLabelledFields';

const useGetFieldConfig = (
  assessmentMode: AssessmentTypeEnum
): TableFields<AssessmentActivityRegisterFields> => {
  const {
    routing: { activityEditUrl },
  } = useAssessmentTypeConfig(assessmentMode);
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'assessmentActivities.columns',
  });
  const { getByValue: statusGetByValue } = useRating(
    'assessment_activity_status'
  );
  const navigate = useNavigate();

  return {
    Title: {
      formId: 'assessment_activity',
      fieldId: 'Title',
      cell: (item) => (
        <Link
          variant={'secondary'}
          href={'#'}
          onFollow={() => {
            navigate(activityEditUrl(item.ParentId, item.Id));
          }}
        >
          {item.Title}
        </Link>
      ),
      maxWidth: MAX_COL_WIDTH,
      isRowHeader: true,
    },
    StatusLabelled: {
      formId: 'assessment_activity',
      fieldId: 'Status',
      sortingField: 'StatusLabelled',
      cell: (item) => {
        return <SimpleRatingBadge rating={statusGetByValue(item.Status)} />;
      },
      maxWidth: MAX_COL_WIDTH,
      isRowHeader: true,
    },
    ActivityTypeLabelled: {
      formId: 'assessment_activity',
      fieldId: 'ActivityType',
      sortingField: 'ActivityTypeLabelled',
      cell: (item) => item.ActivityTypeLabelled,
      maxWidth: MAX_COL_WIDTH,
      isRowHeader: true,
    },
    CompletionDate: dateColumnFromConfig({
      header: {
        formId: 'assessment_activity',
        fieldId: 'CompletionDate',
      },
      dateField: 'CompletionDate',
    }),
    AssignedUser: {
      formId: 'assessment_activity',
      fieldId: 'AssignedUser',
      cell: (item) => item.assignedUser?.FriendlyName ?? '-',
    },
    ModifiedAtTimestamp: dateColumnFromConfig({
      header: { header: st('UpdatedOn') },
      dateField: 'ModifiedAtTimestamp',
    }),
    CreatedById: {
      header: st('CreatedById'),
      cell: (item) => item.CreatedById,
    },
    CreatedByUsername: {
      header: st('CreatedByUsername'),
      cell: (item) => item.CreatedByUsername,
    },
    CreatedOn: dateColumnFromConfig({
      header: { header: st('CreatedOn') },
      dateField: 'CreatedAtTimestamp',
    }),
    UpdatedById: {
      header: st('UpdatedById'),
      cell: (item) => item.UpdatedById,
    },
    UpdatedByUsername: {
      header: st('UpdatedByUsername'),
      cell: (item) => item.UpdatedByUsername,
    },
  };
};

export const useGetCollectionTableProps = (
  assessmentMode: AssessmentTypeEnum,
  records: AssessmentActivityFields[] | undefined
): TablePropsWithActions<AssessmentActivityRegisterFields> => {
  const { t } = useTranslation(['taxonomy']);
  const fields = useGetFieldConfig(assessmentMode);
  const labelledFields = useLabelledFields(records);

  return useGetTablePropsWithoutUrlHash({
    data: labelledFields,
    customAttributeFormIds: ['assessment_activity'],
    entityLabel: t('activity'),
    emptyCollectionAction: <></>,
    preferencesStorageKey: 'AssessmentActivitiesRegister-Preferences',
    enableFiltering: true,
    initialColumns: [
      'Title',
      'ActivityTypeLabelled',
      'StatusLabelled',
      'CompletionDate',
    ],
    fields,
    defaultSortingState: {
      sortingColumn: 'CompletionDate',
      sortingDirection: 'desc',
    },
  });
};
