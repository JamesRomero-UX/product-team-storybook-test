import { useQuery } from '@apollo/client';
import type { Issue_Assessment_Audit_Bool_Exp } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  GetIssueAssessmentHistoryDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useTranslation } from 'react-i18next';

import { useDashboardStore } from '../../../useDashboardStore';
import {
  applyOpenInDateRangeFilter,
  compose,
  convertDateRangeValues,
} from '../../filterHelpers';
import LineChartWidget from '../../line-chart-widget/LineChartWidget';
import { calculateOpenIssues } from './openIssuesOverTimeUtils';

export const OpenIssuesOverTime = () => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'dashboard.widgets.openIssuesOverTime',
  });
  const { loading, values } = useOpenIssuesOverTime();

  return (
    <LineChartWidget
      values={values?.map((v) => ({ x: new Date(v.x), y: v.y }))}
      loading={loading}
      xTitle={t('xTitle')}
      yTitle={t('yTitle')}
    />
  );
};

const useOpenIssuesOverTime = () => {
  const { filters } = useDashboardStore();
  const whereStatement = compose<Issue_Assessment_Audit_Bool_Exp>(
    applyOpenInDateRangeFilter(filters.dateRange)
  )({
    Type: {
      _eq: Parent_Type_Enum.IssueAssessment,
    },
  });
  const { startDate, endDate } = convertDateRangeValues(filters.dateRange);

  const { loading, data } = useQuery(GetIssueAssessmentHistoryDocument, {
    variables: {
      where: whereStatement,
    },
  });

  return {
    values: data?.issue_assessment_audit
      ? calculateOpenIssues(
          'day',
          data.issue_assessment_audit,
          startDate,
          endDate
        )
      : undefined,
    loading,
  };
};
