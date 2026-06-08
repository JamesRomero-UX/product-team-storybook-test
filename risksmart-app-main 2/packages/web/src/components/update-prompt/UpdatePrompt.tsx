import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import Modal from '@risksmart-app/components/src/modal';
import { useCallback, useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const ONE_MINUTE = 60 * 1000;
const POLL_RATE = ONE_MINUTE;

// Utility function to determine if the SW should be updated
async function shouldUpdateSW(
  registration: ServiceWorkerRegistration | undefined
): Promise<boolean> {
  if (!registration || registration.installing || !navigator.onLine) {
    return false;
  }

  return true;
}

// Fetch service worker to check if it's available
async function fetchSW(swUrl: string): Promise<boolean> {
  try {
    const response = await fetch(swUrl, {
      method: 'HEAD',
      cache: 'no-store',
      headers: { 'cache-control': 'no-cache' },
    });

    return response.status === 200;
  } catch (error) {
    console.error(`Failed to fetch service worker from ${swUrl}:`, error);

    return false;
  }
}

// Check and update the service worker if conditions are met
async function checkAndUpdateSW(
  registration: ServiceWorkerRegistration | undefined,
  swUrl: string
): Promise<void> {
  try {
    const shouldUpdate = await shouldUpdateSW(registration);
    const isSWAvailable = await fetchSW(swUrl);

    if (registration && shouldUpdate && isSWAvailable) {
      await registration.update();

      console.log('Service worker updated successfully.');
    }
  } catch (error) {
    console.error('Failed to update service worker:', error);
  }
}

// Set up a timer to periodically check and update the service worker
function checkAndUpdateSWTimer(
  registration: ServiceWorkerRegistration | undefined,
  swUrl: string
): void {
  if (!registration) {
    return;
  }

  setInterval(async () => {
    try {
      await checkAndUpdateSW(registration, swUrl);
    } catch (error) {
      console.error('Error during SW update polling:', error);
    }
  }, POLL_RATE);
}
const buildDate = '__DATE__';
const reloadSW = '__RELOAD_SW__';
// The main UpdatePrompt component
export const UpdatePrompt = () => {
  // Use the Vite PWA hook to manage service worker registration
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW: (swUrl, registration) => {
      console.info(`Build date: ${buildDate}`);

      console.info(`Service Worker registered at: ${swUrl}`);

      // https://github.com/vite-pwa/vite-plugin-pwa/issues/366
      // @ts-expect-error just ignore
      if (reloadSW === 'true') {
        // Automatically check and update the service worker if needed
        checkAndUpdateSW(registration, swUrl);
        checkAndUpdateSWTimer(registration, swUrl);
      } else {
        console.info('SW Registered:', registration);
      }
    },
    onRegisterError: (error) => {
      console.error('SW registration error:', error);
    },
  });

  const [loading, setLoading] = useState(false);

  // Callback to handle the service worker update process
  const handleUpdate = useCallback(async () => {
    setLoading(true);
    try {
      await updateServiceWorker(true); // Force service worker update and reload the app

      console.info('Service worker updated and app reloaded.');
    } catch (error) {
      console.error('Failed to update service worker:', error);
    } finally {
      setLoading(false); // Reset loading state
    }
  }, [updateServiceWorker]);

  // Effect to log when the app is ready for offline use
  useEffect(() => {
    if (offlineReady) {
      console.log('App is ready to be used offline.');
    }
  }, [offlineReady]);

  // Handler to dismiss the update prompt
  const handleDismiss = useCallback(
    (event: { detail: { reason: string } }) => {
      if (event.detail.reason === 'overlay') {
        // Prevent dismissing the modal by clicking on the overlay
        return;
      }
      setOfflineReady(false);
      setNeedRefresh(false);
    },
    [setOfflineReady, setNeedRefresh]
  );

  return (
    <Modal
      visible={needRefresh}
      header={'Install Update'}
      onDismiss={handleDismiss}
    >
      {'A new app update is available. Click the button below to install it.'}
      <div
        className={
          'mt-6 items-end flex justify-end border-y-1 border-slate-400'
        }
      >
        <SpaceBetween size={'s'} direction={'horizontal'}>
          <Button variant={'primary'} loading={loading} onClick={handleUpdate}>
            {'Reload'}
          </Button>
          <Button onClick={() => setNeedRefresh(false)}>{'Cancel'}</Button>
        </SpaceBetween>
      </div>
    </Modal>
  );
};

export default UpdatePrompt;
