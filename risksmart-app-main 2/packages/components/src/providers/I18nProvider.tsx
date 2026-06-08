import i18n, { init } from '@risksmart-app/i18n/src/i18n';
import type { FC, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';

import Loading from '../loading';

const I18NProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    init().then(() => {
      setLoading(false);
    });
  }, []);
  if (loading) {
    return <Loading />;
  }

  return (
    <I18nextProvider i18n={i18n} defaultNS={'common'}>
      {children}
    </I18nextProvider>
  );
};

export default I18NProvider;
