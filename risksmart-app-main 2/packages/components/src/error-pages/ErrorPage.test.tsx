import * as Sentry from '@sentry/browser';
import { render, screen } from '@testing-library/react';
import { useRouteError } from 'react-router';
import { vi } from 'vitest';

import { Forbidden, PageNotFound } from '../errors/errors';
import { handleError } from '../utils/errorUtils';
import AccessDeniedPage from './AccessDeniedPage';
import ErrorContent from './ErrorContent';
import Page from './ErrorPage';
import NotFoundPage from './NotFoundPage';

// Mock dependencies
vi.mock('@sentry/browser');
vi.mock('react-router', () => ({
  useRouteError: vi.fn(),
}));
vi.mock('./NotFoundPage');
vi.mock('./AccessDeniedPage');
vi.mock('./ErrorContent');
vi.mock('../utils/errorUtils');

const mockedUseRouteError = vi.mocked(useRouteError);
const mockedCaptureMessage = vi.mocked(Sentry.captureMessage);
const mockedHandleError = vi.mocked(handleError);
const mockedNotFoundPage = vi.mocked(NotFoundPage);
const mockedAccessDeniedPage = vi.mocked(AccessDeniedPage);
const mockedErrorContent = vi.mocked(ErrorContent);

describe('ErrorPage Component', () => {
  beforeEach(() => {
    mockedUseRouteError.mockClear();
    mockedCaptureMessage.mockClear();
    mockedHandleError.mockClear();
    mockedNotFoundPage.mockReturnValue(<div>{'Mocked NotFoundPage'}</div>);
    mockedAccessDeniedPage.mockReturnValue(
      <div>{'Mocked AccessDeniedPage'}</div>
    );
    mockedErrorContent.mockReturnValue(<div>{'Mocked ErrorContent'}</div>);
  });

  it('renders the NotFoundPage when the error is a PageNotFound instance', () => {
    mockedUseRouteError.mockReturnValue(new PageNotFound());

    render(<Page />);

    expect(screen.getByText('Mocked NotFoundPage')).toBeInTheDocument();
    expect(mockedCaptureMessage).toHaveBeenCalledWith('Page not found');
  });

  it('renders the AccessDeniedPage when the error is a Forbidden instance', () => {
    mockedUseRouteError.mockReturnValue(new Forbidden());

    render(<Page />);

    expect(screen.getByText('Mocked AccessDeniedPage')).toBeInTheDocument();
    expect(mockedCaptureMessage).toHaveBeenCalledWith('Access denied');
  });

  it('renders ErrorContent when the error is neither PageNotFound nor Forbidden', () => {
    const unknownError = new Error('Some unknown error');
    mockedUseRouteError.mockReturnValue(unknownError);

    render(<Page />);

    expect(screen.getByText('Mocked ErrorContent')).toBeInTheDocument();
    expect(mockedHandleError).toHaveBeenCalledWith(unknownError);
  });

  it('does not log or handle errors if there is no error', () => {
    mockedUseRouteError.mockReturnValue(undefined);

    render(<Page />);

    expect(mockedCaptureMessage).not.toHaveBeenCalled();
    expect(mockedHandleError).not.toHaveBeenCalled();
    expect(screen.getByText('Mocked ErrorContent')).toBeInTheDocument();
  });
});
