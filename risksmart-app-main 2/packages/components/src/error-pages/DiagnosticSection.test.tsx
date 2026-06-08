import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import DiagnosticSection from './DiagnosticSection';
import { maskUrl } from './diagnosticUtils';

describe('DiagnosticSection', () => {
  describe('static rendering', () => {
    it('should render the diagnostic toggle button', () => {
      render(<DiagnosticSection />);
      expect(screen.getByText('Connection Diagnostics')).toBeInTheDocument();
    });

    it('should render collapsed by default', () => {
      const { container } = render(<DiagnosticSection />);
      expect(screen.getByText('Run Checks')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Connection Diagnostics/i })
      ).toBeInTheDocument();
      const contentDiv = container.querySelector('[class*="content"]');
      expect(contentDiv?.className).not.toMatch(/contentExpanded/);
    });

    it('should use CSS modules for styling', () => {
      const { container } = render(<DiagnosticSection />);
      const rootDiv = container.firstChild;
      expect(rootDiv).toBeInstanceOf(HTMLDivElement);
      expect(rootDiv).toHaveAttribute('class');
    });

    it('should render endpoint rows in table', () => {
      const endpoints = {
        graphqlUrl: 'https://graphql.example.com',
        restUrl: 'https://rest.example.com',
        trpcUrl: 'https://trpc.example.com',
        externalUrl: 'https://external.example.com',
        auth0Domain: 'auth.example.com',
      };

      render(<DiagnosticSection endpoints={endpoints} />);

      expect(screen.getByText('GraphQL API')).toBeInTheDocument();
      expect(screen.getByText('REST API')).toBeInTheDocument();
      expect(screen.getByText('tRPC API')).toBeInTheDocument();
      expect(screen.getByText('External API')).toBeInTheDocument();
      expect(screen.getByText('Auth0')).toBeInTheDocument();
    });

    it('should handle undefined endpoint props gracefully', () => {
      render(<DiagnosticSection endpoints={{}} />);

      expect(screen.getByText('GraphQL API')).toBeInTheDocument();
      expect(screen.getByText('REST API')).toBeInTheDocument();
      expect(screen.getByText('tRPC API')).toBeInTheDocument();
      expect(screen.getByText('External API')).toBeInTheDocument();
      expect(screen.getByText('Auth0')).toBeInTheDocument();

      const notCheckedElements = screen.getAllByText('Not checked');
      expect(notCheckedElements).toHaveLength(5);
    });

    it('should render the run checks and copy report buttons', () => {
      render(<DiagnosticSection />);
      expect(screen.getByText('Run Checks')).toBeInTheDocument();
      expect(screen.getByText('Copy Report')).toBeInTheDocument();
    });

    it('should render table headers', () => {
      render(<DiagnosticSection />);
      expect(screen.getByText('Service')).toBeInTheDocument();
      expect(screen.getByText('Endpoint')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });
  });

  describe('expand/collapse behavior', () => {
    it('should expand when toggle button is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(<DiagnosticSection />);

      const toggleButton = screen.getByRole('button', {
        name: /Connection Diagnostics/i,
      });
      const contentDiv = container.querySelector('[class*="content"]');

      // Initially collapsed - content div should not have expanded class
      expect(contentDiv?.className).not.toMatch(/contentExpanded/);

      await user.click(toggleButton);

      // After click - content div should have expanded class
      expect(contentDiv?.className).toMatch(/contentExpanded/);
    });

    it('should collapse when toggle button is clicked again', async () => {
      const user = userEvent.setup();
      const { container } = render(<DiagnosticSection />);

      const toggleButton = screen.getByRole('button', {
        name: /Connection Diagnostics/i,
      });
      const contentDiv = container.querySelector('[class*="content"]');

      // Expand
      await user.click(toggleButton);
      expect(contentDiv?.className).toMatch(/contentExpanded/);

      // Collapse
      await user.click(toggleButton);
      expect(contentDiv?.className).not.toMatch(/contentExpanded/);
    });

    it('should rotate toggle icon when expanded', async () => {
      const user = userEvent.setup();
      const { container } = render(<DiagnosticSection />);

      const toggleButton = screen.getByRole('button', {
        name: /Connection Diagnostics/i,
      });
      const iconSpan = container.querySelector('[class*="toggleIcon"]');

      // Initially not rotated
      expect(iconSpan?.className).not.toMatch(/toggleIconExpanded/);

      await user.click(toggleButton);

      // After click - should have expanded class for rotation
      expect(iconSpan?.className).toMatch(/toggleIconExpanded/);
    });
  });

  describe('run checks behavior', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('should show checking state when run checks is clicked', async () => {
      const user = userEvent.setup();

      // Mock fetch to delay response
      vi.spyOn(global, 'fetch').mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(new Response('', { status: 200 })), 100)
          )
      );

      render(
        <DiagnosticSection
          endpoints={{ graphqlUrl: 'https://api.example.com' }}
        />
      );

      const runButton = screen.getByRole('button', { name: /Run Checks/i });
      await user.click(runButton);

      // Should show checking state - button changes to "Checking..."
      expect(
        screen.getByRole('button', { name: /Checking.../i })
      ).toBeInTheDocument();
    });

    it('should show OK status for successful fetch', async () => {
      const user = userEvent.setup();

      vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response('OK', { status: 200 })
      );

      render(
        <DiagnosticSection
          endpoints={{ graphqlUrl: 'https://api.example.com' }}
        />
      );

      const runButton = screen.getByRole('button', { name: /Run Checks/i });
      await user.click(runButton);

      await waitFor(() => {
        expect(screen.getByText('OK (200)')).toBeInTheDocument();
      });
    });

    it('should show client error status for 4xx responses', async () => {
      const user = userEvent.setup();

      vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response('Unauthorized', { status: 401 })
      );

      render(
        <DiagnosticSection
          endpoints={{ graphqlUrl: 'https://api.example.com' }}
        />
      );

      const runButton = screen.getByRole('button', { name: /Run Checks/i });
      await user.click(runButton);

      await waitFor(() => {
        expect(screen.getByText('Client error (401)')).toBeInTheDocument();
      });
    });

    it('should show server error status for 5xx responses', async () => {
      const user = userEvent.setup();

      vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response('Server Error', { status: 500 })
      );

      render(
        <DiagnosticSection
          endpoints={{ graphqlUrl: 'https://api.example.com' }}
        />
      );

      const runButton = screen.getByRole('button', { name: /Run Checks/i });
      await user.click(runButton);

      await waitFor(() => {
        expect(screen.getByText('Server error (500)')).toBeInTheDocument();
      });
    });

    it('should show network error for fetch failures', async () => {
      const user = userEvent.setup();

      vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

      render(
        <DiagnosticSection
          endpoints={{ graphqlUrl: 'https://api.example.com' }}
        />
      );

      const runButton = screen.getByRole('button', { name: /Run Checks/i });
      await user.click(runButton);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('should show timeout error when fetch is aborted', async () => {
      const user = userEvent.setup();

      vi.spyOn(global, 'fetch').mockImplementation(() => {
        const error = new Error('Aborted');
        error.name = 'AbortError';

        return Promise.reject(error);
      });

      render(
        <DiagnosticSection
          endpoints={{ graphqlUrl: 'https://api.example.com' }}
        />
      );

      const runButton = screen.getByRole('button', { name: /Run Checks/i });
      await user.click(runButton);

      await waitFor(() => {
        expect(screen.getByText('Timeout (5s)')).toBeInTheDocument();
      });
    });

    it('should show not configured for empty URLs', async () => {
      const user = userEvent.setup();

      vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response('OK', { status: 200 })
      );

      render(<DiagnosticSection endpoints={{}} />);

      const runButton = screen.getByRole('button', { name: /Run Checks/i });
      await user.click(runButton);

      await waitFor(() => {
        const notConfiguredElements = screen.getAllByText('Not configured');
        expect(notConfiguredElements.length).toBeGreaterThan(0);
      });
    });

    it('should disable run button while checks are in progress', async () => {
      const user = userEvent.setup();

      // Mock fetch to delay response
      vi.spyOn(global, 'fetch').mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(new Response('', { status: 200 })), 200)
          )
      );

      render(
        <DiagnosticSection
          endpoints={{ graphqlUrl: 'https://api.example.com' }}
        />
      );

      const runButton = screen.getByRole('button', { name: /Run Checks/i });
      await user.click(runButton);

      // Button should be disabled and show "Checking..."
      expect(
        screen.getByRole('button', { name: /Checking.../i })
      ).toBeDisabled();

      // Wait for checks to complete
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Run Checks/i })
        ).not.toBeDisabled();
      });
    });

    it('should prevent multiple concurrent runs', async () => {
      const user = userEvent.setup();
      const fetchSpy = vi
        .spyOn(global, 'fetch')
        .mockImplementation(
          () =>
            new Promise((resolve) =>
              setTimeout(() => resolve(new Response('', { status: 200 })), 100)
            )
        );

      render(
        <DiagnosticSection
          endpoints={{ graphqlUrl: 'https://api.example.com' }}
        />
      );

      const runButton = screen.getByRole('button', { name: /Run Checks/i });

      // Click multiple times rapidly
      await user.click(runButton);
      await user.click(runButton);
      await user.click(runButton);

      // Should only have made one set of fetch calls (one per configured endpoint)
      // GraphQL is configured, others are not, so only 1 fetch call expected
      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('copy report behavior', () => {
    const originalClipboard = navigator.clipboard;

    beforeEach(() => {
      vi.restoreAllMocks();
    });

    afterEach(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        writable: true,
        configurable: true,
      });
    });

    const mockClipboard = (writeTextMock: ReturnType<typeof vi.fn>) => {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        writable: true,
        configurable: true,
      });
    };

    it('should show success message when copy succeeds', async () => {
      const user = userEvent.setup();
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      mockClipboard(writeTextMock);

      render(<DiagnosticSection />);

      const copyButton = screen.getByRole('button', { name: /Copy Report/i });
      await user.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });

      expect(writeTextMock).toHaveBeenCalledWith(
        expect.stringContaining('RiskSmart Diagnostic Report')
      );
    });

    it('should show error message when copy fails', async () => {
      const user = userEvent.setup();
      const writeTextMock = vi.fn().mockRejectedValue(new Error('Copy failed'));
      mockClipboard(writeTextMock);

      render(<DiagnosticSection />);

      const copyButton = screen.getByRole('button', { name: /Copy Report/i });
      await user.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText('Copy failed')).toBeInTheDocument();
      });
    });

    it('should include endpoint status in copied report', async () => {
      const user = userEvent.setup();
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      mockClipboard(writeTextMock);

      render(
        <DiagnosticSection
          endpoints={{ graphqlUrl: 'https://api.example.com' }}
        />
      );

      const copyButton = screen.getByRole('button', { name: /Copy Report/i });
      await user.click(copyButton);

      await waitFor(() => {
        expect(writeTextMock).toHaveBeenCalledWith(
          expect.stringContaining('GraphQL API')
        );
        expect(writeTextMock).toHaveBeenCalledWith(
          expect.stringContaining('Endpoint Status:')
        );
      });
    });
  });
});

describe('maskUrl', () => {
  it('should return empty string for undefined input', () => {
    expect(maskUrl(undefined)).toBe('');
  });

  it('should return short hostnames unchanged', () => {
    expect(maskUrl('https://api.test.com')).toBe('api.test.com');
  });

  it('should mask long hostnames', () => {
    expect(maskUrl('https://very-long-subdomain.example.risksmart.com')).toBe(
      'very-long-...rt.com'
    );
  });

  it('should handle invalid URLs gracefully', () => {
    expect(maskUrl('not-a-url')).toBe('not-a-url');
  });

  it('should truncate long non-URL strings', () => {
    expect(maskUrl('this-is-a-very-long-string-that-is-not-a-url')).toBe(
      'this-is-a-very-...'
    );
  });
});
