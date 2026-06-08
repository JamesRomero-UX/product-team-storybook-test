import toast from 'react-hot-toast';

import { NotificationBanner } from '../notification-banner/NotificationBanner';
import { PromiseNotificationBanner } from '../notification-banner/PromiseNotificationBanner';
import type { NotificationDetail } from './types';

export const useNotifications = () => {
  const addNotification = (notification: NotificationDetail) => {
    switch (notification.type) {
      case 'success':
        toast.custom(
          (t) => (
            <NotificationBanner {...notification} toast={t} durationMs={3500} />
          ),
          {
            duration: Infinity,
          }
        );
        break;
      case 'error':
        toast.custom(
          (t) => (
            <NotificationBanner
              {...notification}
              toast={t}
              durationMs={Infinity}
              dismissable={true}
            />
          ),
          {
            duration: Infinity,
          }
        );
        break;
      case 'promise':
        toast.custom(
          (t) => <PromiseNotificationBanner {...notification} toast={t} />,
          {
            duration: Infinity,
          }
        );
        break;
      default:
        toast(
          (t) => (
            <NotificationBanner {...notification} toast={t} durationMs={3500} />
          ),
          {
            duration: Infinity,
          }
        );
    }
  };

  return { addNotification };
};
