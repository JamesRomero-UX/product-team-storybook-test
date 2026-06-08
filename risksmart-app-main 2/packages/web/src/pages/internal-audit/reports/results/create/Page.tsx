import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import ControlledTabs from 'src/components/controlled-tabs';
import { useGetInternalAuditReportById } from 'src/hooks/queries';
import { PageLayout } from 'src/layouts';

import { useTabs } from '../useTabs';

const Page: FC = () => {
  const { t } = useTranslation(['common'], { keyPrefix: 'assessmentResults' });
  const title = t('create_title');

  const internalAuditReportId = useGetGuidParam('assessmentId');

  const { data, error } = useGetInternalAuditReportById({
    queryArgs: { reportId: internalAuditReportId },
  });

  if (error) {
    throw error;
  }

  const internalAuditReport = data?.internal_audit_report[0];
  const tabs = useTabs(internalAuditReport, 'add', true, false);

  return (
    <PageLayout title={title}>
      <ControlledTabs
        tabs={tabs}
        variant={'container'}
        parent={internalAuditReport}
      />
    </PageLayout>
  );
};

export default Page;
