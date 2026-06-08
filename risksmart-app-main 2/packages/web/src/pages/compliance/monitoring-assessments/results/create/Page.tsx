import { useQuery } from '@apollo/client';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import { GetComplianceMonitoringAssessmentByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import ControlledTabs from 'src/components/controlled-tabs';
import { PageLayout } from 'src/layouts';

import { useTabs } from '../useTabs';

const Page: FC = () => {
  const { t } = useTranslation(['common'], { keyPrefix: 'assessmentResults' });
  const title = t('create_title');

  const assessmentId = useGetGuidParam('assessmentId');
  const { data, error } = useQuery(
    GetComplianceMonitoringAssessmentByIdDocument,
    {
      variables: {
        Id: assessmentId,
      },
    }
  );
  if (error) {
    throw error;
  }

  const assessment = data?.compliance_monitoring_assessment[0];
  const tabs = useTabs(assessment, 'add', false, true);

  return (
    <PageLayout title={title}>
      <ControlledTabs tabs={tabs} variant={'container'} parent={assessment} />
    </PageLayout>
  );
};

export default Page;
