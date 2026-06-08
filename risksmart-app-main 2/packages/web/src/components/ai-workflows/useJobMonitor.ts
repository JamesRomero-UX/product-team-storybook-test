import type { ErrorEvent } from 'eventsource';
import { EventSource } from 'eventsource';
import { useCallback, useRef } from 'react';

import { JobWatchError } from '@/components/ai-workflows/jobWatchError';
import type { AIWorkflowJobResultWithStatus } from '@/components/ai-workflows/useWorkflowRequest';
import { useAIWorkflowFetch } from '@/utils/useAIWorkflowFetch';

export type FailureStatus = 'error' | 'timed-out';

export const useJobMonitor = <TState>(timeout: number) => {
  const { authedAIWorkflowFetch } = useAIWorkflowFetch();

  const es = useRef<EventSource | null>(null);

  const watchJob = useCallback(
    (jobStreamUrl: string): Promise<AIWorkflowJobResultWithStatus<TState>> => {
      return new Promise<AIWorkflowJobResultWithStatus<TState>>(
        (resolve, reject) => {
          let data: AIWorkflowJobResultWithStatus<TState> | null = null;

          const closeEventSource = (): void => {
            if (es.current && es.current.readyState !== EventSource.CLOSED) {
              es.current.close();

              if (onTimeout) {
                clearTimeout(onTimeout);
              }
            }
          };

          const onTimeout = setTimeout(() => {
            if (es.current && es.current.readyState !== EventSource.CLOSED) {
              closeEventSource();
              reject(
                new JobWatchError('timed-out', 'Job monitoring has timed out')
              );
            }
          }, timeout);

          if (es.current) {
            closeEventSource();
          }

          es.current = new EventSource(jobStreamUrl, {
            fetch: authedAIWorkflowFetch,
          });

          // Something has gone wrong on the server after the stream was established. Stop processing and kill the
          // EventSource
          es.current.addEventListener('server-error', (ev: MessageEvent) => {
            if (ev.origin !== window.location.origin) {
              reject(
                new Error(
                  `Invalid origin for event update. Received origin: ${ev.origin}`
                )
              );
            }

            closeEventSource();
            reject(
              new JobWatchError(
                'error',
                'Server encountered an error after the stream was established'
              )
            );
          });

          es.current.addEventListener('update', (ev: MessageEvent) => {
            if (ev.origin !== window.location.origin) {
              reject(
                new Error(
                  `Invalid origin for event update. Received origin: ${ev.origin}`
                )
              );
            }

            try {
              data = JSON.parse(
                ev.data
              ) as AIWorkflowJobResultWithStatus<TState>;
            } catch (err) {
              // If we can't process the data then there is no point in carrying on
              // so close it down.
              closeEventSource();

              reject(
                new JobWatchError(
                  'error',
                  'Job monitoring has encountered an error',
                  {
                    cause: err,
                  }
                )
              );
            }
          });

          es.current.addEventListener('end', (ev: MessageEvent) => {
            if (ev.origin !== window.location.origin) {
              reject(
                new Error(
                  `Invalid origin for event update. Received origin: ${ev.origin}`
                )
              );
            }

            closeEventSource();

            if (data) {
              if (data.status === 'failed') {
                reject(
                  new JobWatchError(
                    'error',
                    data.error ?? 'Received a failure message'
                  )
                );
              } else if (data.status === 'completed') {
                resolve(data);
              } else {
                reject(
                  new JobWatchError(
                    'error',
                    'Received end event but not received failure or completed update'
                  )
                );
              }
            } else {
              reject(
                new JobWatchError(
                  'error',
                  'End received but no data has been provided'
                )
              );
            }
          });

          es.current.onerror = (ev: ErrorEvent) => {
            // Only kill the connection if we receive a status code and it is above 300. We will only receive these
            // if the server encountered an error whilst setting up the stream, we will not receive a code once the
            // stream is flowing. Assume any error without a code is a connection drop so let it reconnect
            if (ev?.code && ev.code >= 300) {
              closeEventSource();
              reject(
                new JobWatchError('error', `EventSource error: ${ev.message}`, {
                  cause: ev,
                })
              );
            }
          };
        }
      );
    },
    [authedAIWorkflowFetch, timeout]
  );

  return {
    watchJob,
  };
};
