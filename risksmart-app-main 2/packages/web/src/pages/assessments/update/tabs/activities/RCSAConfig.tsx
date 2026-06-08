import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import {
  Assessment_Activity_Status_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { MAX_COL_WIDTH } from 'src/App.config';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import { useWizardStore } from 'src/components/wizard/store/useWizardStore';

import Link from '@/components/link';
import { getFriendlyId } from '@/utils/friendlyId';
import { useGetAssignedUsersFieldConfig } from '@/utils/table/hooks/useGetAssignedUsersFieldConfig';
import { useGetTablePropsWithoutUrlHash } from '@/utils/table/hooks/useGetTablePropsWithoutUrlHash';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';
import { assessmentRCSADetailsUrl, riskDetailsUrl } from '@/utils/urls';

import type {
  AssessmentRCSAActivityFields,
  AssessmentRCSAActivityRegisterFields,
} from './types';
import { useLabelledFields } from './useRCSALabelledFields';

const useGetFieldConfig =
  (): TableFields<AssessmentRCSAActivityRegisterFields> => {
    const { t: st } = useTranslation(['common'], {
      keyPrefix: 'assessmentActivities.columns',
    });

    const { getByValue: statusGetByValue } = useRating(
      'assessment_activity_status'
    );
    const navigate = useNavigate();
    const { setIsNavigatingFromActivity } = useWizardStore();

    const assignedUsersField =
      useGetAssignedUsersFieldConfig<AssessmentRCSAActivityRegisterFields>(
        st('AssignedUser')
      );

    return {
      Id: {
        header: 'GUID',
      },
      RiskSequentialId: {
        header: st('RiskId'),
        sortingComparator: (a, b) => {
          if (!a.parentRisk?.SequentialId || !b.parentRisk?.SequentialId) {
            return 0;
          }

          return a.parentRisk?.SequentialId > b.parentRisk?.SequentialId
            ? 1
            : -1;
        },
        cell: (item) =>
          item.parentRisk ? (
            <Link
              variant={'secondary'}
              onClick={() => {
                if (!item.RiskId) {
                  return;
                }

                if (
                  item.Status === Assessment_Activity_Status_Enum.Inprogress ||
                  item.Status === Assessment_Activity_Status_Enum.Notstarted
                ) {
                  setIsNavigatingFromActivity(true);
                }

                navigate(riskDetailsUrl(item.RiskId));
              }}
            >
              {getFriendlyId(
                Parent_Type_Enum.Risk,
                item.parentRisk?.SequentialId
              )}
            </Link>
          ) : (
            ''
          ),
      },
      LinkedRisk: {
        header: st('LinkedRisk'),
        cell: (item) =>
          item.parentRisk ? (
            <Link
              variant={'secondary'}
              onClick={() => {
                if (!item.RiskId) {
                  return;
                }

                if (
                  item.Status === Assessment_Activity_Status_Enum.Inprogress ||
                  item.Status === Assessment_Activity_Status_Enum.Notstarted
                ) {
                  setIsNavigatingFromActivity(true);
                }

                navigate(riskDetailsUrl(item.RiskId));
              }}
            >
              {item.LinkedRisk}
            </Link>
          ) : (
            ''
          ),
      },
      Title: {
        formId: 'assessment_activity',
        fieldId: 'Title',
        cell: (item) => (
          <Link
            variant={'secondary'}
            href={'#'}
            onFollow={() => {
              navigate(assessmentRCSADetailsUrl(item.ParentId, item.Id));
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
      allAssignedUsers: assignedUsersField,
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
      NextTestDate: dateColumnFromConfig({
        header: { header: st('NextTestDate') },
        dateField: 'NextTestDate',
      }),
      NextTestOverdueDate: dateColumnFromConfig({
        header: { header: st('NextTestOverdue') },
        dateField: 'NextTestOverdueDate',
      }),
    };
  };

export const useGetCollectionTableProps = (
  records: AssessmentRCSAActivityFields[] | undefined
): TablePropsWithActions<AssessmentRCSAActivityRegisterFields> => {
  const { t } = useTranslation(['taxonomy']);
  const fields = useGetFieldConfig();
  const labelledFields = useLabelledFields(records);

  return useGetTablePropsWithoutUrlHash({
    data: labelledFields,
    customAttributeFormIds: ['assessment_activity'],
    entityLabel: t('activity'),
    emptyCollectionAction: <></>,
    preferencesStorageKey: 'AssessmentRCSAActivitiesRegister-Preferences',
    enableFiltering: true,
    initialColumns: [
      'RiskSequentialId',
      'Title',
      'ActivityTypeLabelled',
      'StatusLabelled',
      'CompletionDate',
      'allAssignedUsers',
      'LinkedRisk',
    ],
    fields,
    defaultSortingState: {
      sortingColumn: 'CompletionDate',
      sortingDirection: 'desc',
    },
  });
};
