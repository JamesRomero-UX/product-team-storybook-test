import i18n from '@risksmart-app/i18n/src/i18n';
import type { FC, ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router';

import { NotificationProvider } from '../notifications/NotificationProvider';

export type Providers = 'formBuilder' | 'i18n' | 'notification' | 'router';

export const getWrapper = (...providers: Providers[]) => {
  const Wrapper: FC<{ children: ReactNode }> = ({ children }) => {
    let content = children;

    if (providers.includes('notification')) {
      content = <NotificationProvider>{content}</NotificationProvider>;
    }

    if (providers.includes('i18n')) {
      content = (
        <I18nextProvider i18n={i18n} defaultNS={'common'}>
          {content}
        </I18nextProvider>
      );
    }

    if (providers.includes('router')) {
      content = <MemoryRouter>{content}</MemoryRouter>;
    }

    return content;
  };

  return Wrapper;
};
