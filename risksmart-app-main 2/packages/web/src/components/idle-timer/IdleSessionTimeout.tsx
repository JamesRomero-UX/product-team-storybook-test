import { useAuth0 } from '@auth0/auth0-react';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import Modal from '@risksmart-app/components/src/modal';
import { useCallback, useEffect, useState } from 'react';
import { useIdleTimer } from 'react-idle-timer';

const PROMPT_DURATION_MS = 60 * 1000; // 1 minute

const IdleSessionTimeout = () => {
  const { user, logout, getAccessTokenSilently } = useAuth0();
  const [isWarningVisible, setWarningVisible] = useState(false);
  const [timeoutDuration, setTimeoutDuration] = useState(14400 * 1000); // Default: 4 hours
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const getTimeoutFromClaims = async () => {
      const idleTimeoutSeconds = user?.claims_organization_idle_timeout;
      if (idleTimeoutSeconds && typeof idleTimeoutSeconds === 'string') {
        const timeoutMs = parseInt(idleTimeoutSeconds, 10) * 1000;
        // Ensure timeout is greater than the prompt time
        if (timeoutMs > PROMPT_DURATION_MS) {
          setTimeoutDuration(timeoutMs);

          console.info(
            `IdleSessionTimeout: Setting timeout duration to ${idleTimeoutSeconds} secs based on user claims`
          );
        }
      }
    };

    void getTimeoutFromClaims();
  }, [user]);

  const handleOnIdle = useCallback(() => {
    setWarningVisible(false);
    logout({ logoutParams: { returnTo: window.location.origin } });
  }, [logout]);

  const handleOnActive = () => setWarningVisible(false);
  const handleOnPrompt = () => setWarningVisible(true);

  const { getRemainingTime, activate } = useIdleTimer({
    onIdle: handleOnIdle,
    onActive: handleOnActive,
    onPrompt: handleOnPrompt,
    timeout: timeoutDuration,
    promptBeforeIdle: PROMPT_DURATION_MS,
    throttle: 500,
    crossTab: true,
    syncTimers: 500,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (isWarningVisible) {
        setRemaining(Math.ceil(getRemainingTime() / 1000));
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isWarningVisible, getRemainingTime]);

  const handleStayLoggedIn = async () => {
    try {
      await getAccessTokenSilently();
      activate();
      setWarningVisible(false);
    } catch (error) {
      console.error('Failed to refresh session, logging out:', error);
      handleLogout();
    }
  };

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <Modal
      visible={isWarningVisible}
      header={'Session Timeout Warning'}
      onDismiss={handleStayLoggedIn}
    >
      <p>
        {
          'You have been inactive. For your security, you will be logged out automatically.'
        }
      </p>
      <p>
        {'Time remaining: '}
        <strong>
          {remaining}
          {' seconds'}
        </strong>
      </p>
      <div
        className={
          'mt-6 items-end flex justify-end border-y-1 border-slate-400'
        }
      >
        <SpaceBetween size={'s'} direction={'horizontal'}>
          <Button variant={'primary'} onClick={handleStayLoggedIn}>
            {'Stay Logged In'}
          </Button>
          <Button onClick={handleLogout}>{'Log Out'}</Button>
        </SpaceBetween>
      </div>
    </Modal>
  );
};

export default IdleSessionTimeout;
