import Spinner from '@risk-smart/themed-cloudscape-components/spinner';
import TextContent from '@risk-smart/themed-cloudscape-components/text-content';
import { Check, X } from '@untitled-ui/icons-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

import { useSlack } from '@/hooks/useSlack';

import FullscreenLayout from '../../layouts/FullScreenLayout';
import styles from './style.module.scss';

const CallbackPage = () => {
  const { search } = useLocation();
  const { exchangeSlackCode } = useSlack();
  const [successState, setSuccessState] = useState<
    'failure' | 'loading' | 'success'
  >('loading');
  const { t } = useTranslation('common', { keyPrefix: 'slackCallback' });
  const apiCalled = useRef<boolean>(false); // Prevents multiple API calls

  const queryParams = useMemo(() => {
    return new URLSearchParams(search);
  }, [search]);

  useEffect(() => {
    const code = queryParams.get('code');
    const state = queryParams.get('state');

    if (code && state && !apiCalled.current) {
      apiCalled.current = true;
      exchangeSlackCode(code, state).then((isSuccess) => {
        setSuccessState(isSuccess ? 'success' : 'failure');
      });
    }
  }, [queryParams, exchangeSlackCode]);

  useEffect(() => {
    if (successState === 'success') {
      setTimeout(() => {
        window.close();
      }, 3000);
    }
  }, [successState]);

  return (
    <FullscreenLayout>
      <div className={styles.pageWrapper}>
        <div className={styles.pageWrapperCopy}>
          {successState === 'loading' && (
            <TextContent>
              <div className={'flex justify-center mb-4'}>
                <Spinner size={'large'} />
              </div>
              <h3>{t('loadingTitle')}</h3>
              <p>{t('loadingDescription')}</p>
            </TextContent>
          )}
          {successState === 'success' && (
            <TextContent>
              <div className={'flex justify-center mb-4'}>
                <Check viewBox={'0 0 24 24'} width={48} height={48} />
              </div>
              <h3>{t('successTitle')}</h3>
              <p>{t('successDescription')}</p>
            </TextContent>
          )}
          {successState === 'failure' && (
            <TextContent>
              <div className={'flex justify-center mb-4'}>
                <X viewBox={'0 0 24 24'} width={48} height={48} />
              </div>
              <h3>{t('errorTitle')}</h3>
              <p>{t('errorDescription')}</p>
            </TextContent>
          )}
        </div>
      </div>
    </FullscreenLayout>
  );
};

export default CallbackPage;
