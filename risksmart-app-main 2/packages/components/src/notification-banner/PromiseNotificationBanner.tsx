import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import type { Toast } from 'react-hot-toast';

import { NotificationBanner } from './NotificationBanner';

export interface PromiseNotificationBannerProps {
  type: 'promise';
  promise: Promise<unknown>;
  successMessage: ReactNode;
  errorMessage: ReactNode;
  loadingMessage?: ReactNode;
  toast: Toast;
}

export const PromiseNotificationBanner = (
  props: PromiseNotificationBannerProps
) => {
  const [state, setState] = useState<'error' | 'loading' | 'success'>(
    'loading'
  );

  useEffect(() => {
    setState('loading');
    props.promise
      .then(() => {
        setState('success');
      })
      .catch(() => {
        setState('error');
      });
  }, [props.promise]);

  const content = useMemo(() => {
    switch (state) {
      case 'loading':
        return props.loadingMessage ?? 'Saving changes...';
      case 'success':
        return props.successMessage;
      case 'error':
        return props.errorMessage;
    }
  }, [state, props.errorMessage, props.successMessage, props.loadingMessage]);

  return (
    <NotificationBanner
      toast={props.toast}
      type={state}
      content={content}
      durationMs={state === 'success' ? 3500 : Infinity}
      dismissable={state === 'error'}
    />
  );
};
