import type { FC } from 'react';
import { useCallback, useId, useMemo, useRef, useState } from 'react';

import styles from './DiagnosticSection.module.scss';
import { maskUrl } from './diagnosticUtils';

export interface DiagnosticSectionProps {
  endpoints?: {
    graphqlUrl?: string;
    restUrl?: string;
    trpcUrl?: string;
    externalUrl?: string;
    auth0Domain?: string;
  };
}

interface EndpointResult {
  status: 'pending' | 'checking' | 'ok' | 'warn' | 'error' | 'skip';
  message: string;
}

interface EndpointConfig {
  name: string;
  url: string;
  path: string;
}

const getBrowserInfo = (): string => {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  let os = 'Unknown';

  if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1) {
    browser = 'Chrome';
  } else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
    browser = 'Safari';
  } else if (ua.indexOf('Firefox') > -1) {
    browser = 'Firefox';
  } else if (ua.indexOf('Edg') > -1) {
    browser = 'Edge';
  }

  if (ua.indexOf('Windows') > -1) {
    os = 'Windows';
  } else if (ua.indexOf('Mac') > -1) {
    os = 'macOS';
  } else if (ua.indexOf('Linux') > -1) {
    os = 'Linux';
  } else if (ua.indexOf('Android') > -1) {
    os = 'Android';
  } else if (ua.indexOf('iOS') > -1 || ua.indexOf('iPhone') > -1) {
    os = 'iOS';
  }

  return `${browser} (${os})`;
};

const buildUrl = (baseUrl: string, path: string): string => {
  try {
    const url = new URL(path, baseUrl);

    return url.toString();
  } catch {
    // Fallback for invalid URLs
    const cleanBase = baseUrl.replace(/\/+$/, '');
    const cleanPath = path.replace(/^\/+/, '');

    return cleanPath ? `${cleanBase}/${cleanPath}` : cleanBase;
  }
};

const checkEndpoint = async (
  url: string,
  path: string,
  timeout: number
): Promise<EndpointResult> => {
  if (!url) {
    return { status: 'skip', message: 'Not configured' };
  }

  const fullUrl = buildUrl(url, path);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(fullUrl, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      return { status: 'ok', message: `OK (${response.status})` };
    } else if (response.status >= 400 && response.status < 500) {
      return { status: 'warn', message: `Client error (${response.status})` };
    } else {
      return { status: 'error', message: `Server error (${response.status})` };
    }
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        return { status: 'error', message: 'Timeout (5s)' };
      } else if (err.message?.indexOf('CORS') > -1) {
        return { status: 'warn', message: 'CORS blocked' };
      }
    }

    return { status: 'error', message: 'Network error' };
  }
};

const statusIcons: Record<EndpointResult['status'], string> = {
  pending: '-',
  checking: '...',
  ok: '\u2713',
  warn: '!',
  error: '\u2717',
  skip: '-',
};

const statusStyles: Record<EndpointResult['status'], string> = {
  pending: styles.statusPending,
  checking: styles.statusChecking,
  ok: styles.statusOk,
  warn: styles.statusWarn,
  error: styles.statusError,
  skip: styles.statusSkip,
};

const DiagnosticSection: FC<DiagnosticSectionProps> = ({ endpoints = {} }) => {
  const containerId = useId().replace(/:/g, '-') + '-diagnostics';
  const [expanded, setExpanded] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<'success' | 'error' | null>(
    null
  );
  const [results, setResults] = useState<EndpointResult[]>([]);
  const isRunningRef = useRef(false);

  const endpointConfigs = useMemo<EndpointConfig[]>(
    () => [
      {
        name: 'GraphQL API',
        url: endpoints.graphqlUrl || '',
        path: '/healthz',
      },
      { name: 'REST API', url: endpoints.restUrl || '', path: '' },
      { name: 'tRPC API', url: endpoints.trpcUrl || '', path: '/healthz' },
      {
        name: 'External API',
        url: endpoints.externalUrl || '',
        path: '/healthz',
      },
      {
        name: 'Auth0',
        url: endpoints.auth0Domain ? `https://${endpoints.auth0Domain}` : '',
        path: '/.well-known/openid-configuration',
      },
    ],
    [
      endpoints.graphqlUrl,
      endpoints.restUrl,
      endpoints.trpcUrl,
      endpoints.externalUrl,
      endpoints.auth0Domain,
    ]
  );

  const runChecks = useCallback(async () => {
    // Use ref for synchronous re-entrancy guard (prevents race condition on rapid clicks)
    if (isRunningRef.current) {
      return;
    }
    isRunningRef.current = true;
    setIsRunning(true);

    // Set all to checking
    setResults(
      endpointConfigs.map(() => ({
        status: 'checking',
        message: 'Checking...',
      }))
    );

    // Run checks in parallel, updating results as they complete
    const newResults: EndpointResult[] = [...endpointConfigs].map(() => ({
      status: 'checking' as const,
      message: 'Checking...',
    }));

    await Promise.all(
      endpointConfigs.map(async (ep, i) => {
        const result = await checkEndpoint(ep.url, ep.path, 5000);
        newResults[i] = result;
        setResults([...newResults]);
      })
    );

    isRunningRef.current = false;
    setIsRunning(false);
  }, [endpointConfigs]);

  const generateReport = useCallback((): string => {
    const lines = [
      '=== RiskSmart Diagnostic Report ===',
      `Generated: ${new Date().toISOString()}`,
      '',
      `Browser: ${navigator.userAgent}`,
      `Page URL: ${window.location.href}`,
      '',
      'Endpoint Status:',
    ];

    endpointConfigs.forEach((ep, i) => {
      const result = results[i] || {
        status: 'pending',
        message: 'Not checked',
      };
      const url = ep.url || 'Not configured';
      lines.push(`- ${ep.name}: ${result.message} (${url})`);
    });

    lines.push('');
    lines.push('===================================');

    return lines.join('\n');
  }, [endpointConfigs, results]);

  const copyReport = useCallback(async () => {
    const report = generateReport();
    try {
      await navigator.clipboard.writeText(report);
      setCopyFeedback('success');
    } catch {
      setCopyFeedback('error');
    }
    setTimeout(() => setCopyFeedback(null), 2000);
  }, [generateReport]);

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  return (
    <div id={containerId} className={styles.diagnostics}>
      <button
        type={'button'}
        className={styles.toggle}
        onClick={toggleExpanded}
      >
        <span
          className={`${styles.toggleIcon} ${expanded ? styles.toggleIconExpanded : ''}`}
        >
          &#9654;
        </span>
        <span>{'Connection Diagnostics'}</span>
      </button>

      <div
        className={`${styles.content} ${expanded ? styles.contentExpanded : ''}`}
      >
        <div className={styles.info}>
          <div>
            <strong>{'Browser:'}</strong> {getBrowserInfo()}
          </div>
          <div>
            <strong>{'Time:'}</strong> {new Date().toISOString()}
          </div>
        </div>

        <div className={styles.buttons}>
          <button
            type={'button'}
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={runChecks}
            disabled={isRunning}
          >
            {isRunning ? 'Checking...' : 'Run Checks'}
          </button>
          <button
            type={'button'}
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={copyReport}
          >
            {'Copy Report'}
          </button>
          {copyFeedback === 'success' && (
            <span className={styles.copied}>{'Copied!'}</span>
          )}
          {copyFeedback === 'error' && (
            <span className={styles.copyError}>{'Copy failed'}</span>
          )}
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>{'Service'}</th>
              <th>{'Endpoint'}</th>
              <th>{'Status'}</th>
            </tr>
          </thead>
          <tbody>
            {endpointConfigs.map((ep, i) => {
              const result = results[i] || {
                status: 'pending' as const,
                message: 'Not checked',
              };

              return (
                <tr key={ep.name}>
                  <td>{ep.name}</td>
                  <td>{maskUrl(ep.url) || '-'}</td>
                  <td>
                    <div className={styles.status}>
                      <span
                        className={`${styles.statusIcon} ${statusStyles[result.status]}`}
                      >
                        {statusIcons[result.status]}
                      </span>
                      <span>{result.message}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DiagnosticSection;
