import Loading from '@risksmart-app/components/src/loading';
import * as Sentry from '@sentry/browser';
import type { FC } from 'react';
import { useEffect } from 'react';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import DashboardPage from '../dashboards/Page';
import ProtectedAccessDeniedPage from '../error/ProtectedAccessDeniedPage';
import ReportAnIssuePage from '../issues/report-an-issue/Page';

const Page: FC = () => {
  const { hasPermission: hasDashboard, loading: loadingHasDashboard } =
    useHasPermissionQuery('read:dashboard', undefined, true);
  const {
    hasPermission: hasPublicIssueForm,
    loading: loadingHasPublicIssueForm,
  } = useHasPermissionQuery('read:public_issue_form');
  const isLoading = loadingHasDashboard || loadingHasPublicIssueForm;

  useEffect(() => {
    if (!hasDashboard && !hasPublicIssueForm && !isLoading) {
      Sentry.captureMessage(
        'User does not have access to dashboard or report an issue.'
      );

      return;
    }
  }, [hasDashboard, hasPublicIssueForm, isLoading]);

  if (isLoading) {
    return <Loading />;
  }

  if (hasDashboard) {
    return <DashboardPage />;
  }
  if (hasPublicIssueForm) {
    return <ReportAnIssuePage />;
  }

  return <ProtectedAccessDeniedPage hideBackToHome={true} />;
};

export default Page;
