import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import { useEffect } from 'react';
import type { QueryHookError } from 'src/utils';

export function useErrorNotification(error: QueryHookError, enabled: boolean) {
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (enabled && error) {
      addNotification({
        type: 'error',
        content: <>{error.message}</>,
      });
    }
  }, [enabled, error, addNotification]);
}
