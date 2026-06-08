import * as Sentry from '@sentry/browser';
import { render, screen } from '@testing-library/react';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';
import { vi } from 'vitest';

import DashboardPage from '../dashboards/Page';
import ProtectedAccessDeniedPage from '../error/ProtectedAccessDeniedPage';
import ReportAnIssuePage from '../issues/report-an-issue/Page';
import Page from './Page';

// Mock dependencies
vi.mock('@sentry/browser');
vi.mock('src/rbac/useHasPermission');
vi.mock('../dashboards/Page');
vi.mock('../issues/report-an-issue/Page');
vi.mock('../error/ProtectedAccessDeniedPage');
vi.mock('src/context/dashboard-filter');

const mockedUseHasPermission = vi.mocked(useHasPermissionQuery);
const mockedCaptureMessage = vi.mocked(Sentry.captureMessage);
const mockedDashboardPage = vi.mocked(DashboardPage);
const mockedReportAnIssuePage = vi.mocked(ReportAnIssuePage);
const mockedProtectedAccessDeniedPage = vi.mocked(ProtectedAccessDeniedPage);

describe('Page Component', () => {
  beforeEach(() => {
    mockedUseHasPermission.mockClear();
    mockedCaptureMessage.mockClear();
    mockedDashboardPage.mockReturnValue(<div>{'Mocked DashboardPage'}</div>);
    mockedReportAnIssuePage.mockReturnValue(
      <div>{'Mocked ReportAnIssuePage'}</div>
    );
    mockedProtectedAccessDeniedPage.mockReturnValue(
      <div>{'Mocked ProtectedAccessDeniedPage'}</div>
    );
  });

  it('renders the DashboardPage when the user has dashboard permission', () => {
    mockedUseHasPermission
      .mockReturnValueOnce({ hasPermission: true, loading: false }) // hasDashboard
      .mockReturnValueOnce({ hasPermission: false, loading: false }); // hasPublicIssueForm

    render(<Page />);

    expect(screen.getByText('Mocked DashboardPage')).toBeInTheDocument();
  });

  it('renders the ReportAnIssuePage when the user has public issue form permission', () => {
    mockedUseHasPermission
      .mockReturnValueOnce({ hasPermission: false, loading: false }) // hasDashboard
      .mockReturnValueOnce({ hasPermission: true, loading: false }); // hasPublicIssueForm

    render(<Page />);

    expect(screen.getByText('Mocked ReportAnIssuePage')).toBeInTheDocument();
  });

  it('renders the ProtectedAccessDeniedPage when the user has neither permission', () => {
    mockedUseHasPermission
      .mockReturnValueOnce({ hasPermission: false, loading: false }) // hasDashboard
      .mockReturnValueOnce({ hasPermission: false, loading: false }); // hasPublicIssueForm

    render(<Page />);

    expect(
      screen.getByText('Mocked ProtectedAccessDeniedPage')
    ).toBeInTheDocument();
  });

  it('logs a message to Sentry when the user has neither permission', () => {
    mockedUseHasPermission
      .mockReturnValueOnce({ hasPermission: false, loading: false }) // hasDashboard
      .mockReturnValueOnce({ hasPermission: false, loading: false }); // hasPublicIssueForm

    render(<Page />);

    expect(mockedCaptureMessage).toHaveBeenCalledWith(
      'User does not have access to dashboard or report an issue.'
    );
  });

  it('does not log to Sentry when the user has dashboard or public issue form permission', () => {
    mockedUseHasPermission
      .mockReturnValueOnce({ hasPermission: true, loading: false }) // hasDashboard
      .mockReturnValueOnce({ hasPermission: false, loading: false }); // hasPublicIssueForm

    render(<Page />);

    expect(mockedCaptureMessage).not.toHaveBeenCalled();
  });
});
