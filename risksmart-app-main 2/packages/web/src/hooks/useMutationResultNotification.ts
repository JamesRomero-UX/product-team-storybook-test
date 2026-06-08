import type { NotificationDetail } from '@risksmart-app/components/src/notifications/types';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import i18next from '@risksmart-app/i18n/src/i18n';

type Options<T> = {
  asyncAction: (data: T) => Promise<boolean>;
  failureAction?: () => void;
  entityName: string;
  /**
   * Set to true to avoid a notification popup
   */
  disableNotification?: boolean;
};

type NoParaOptions = {
  asyncAction: () => Promise<boolean>;
  failureAction?: () => void;
  entityName: string;
};

type OptionsWithMessageKey<T> = Options<T> & {
  successMessageKey:
    | 'create_success_message'
    | 'delete_success_message'
    | 'remove_success_message'
    | 'update_success_message';
};

export const mutationResultNotification = <T>({
  asyncAction,
  failureAction,
  successMessageKey,
  entityName,
  addNotification,
  disableNotification,
}: OptionsWithMessageKey<T> & {
  addNotification: (notification: NotificationDetail) => void;
}) => {
  return async (data: T) => {
    const promise = asyncAction(data);
    if (disableNotification) {
      return promise;
    }

    addNotification({
      type: 'promise',
      promise: promise.then((result) => {
        if (!result) {
          failureAction?.();
          throw new Error('Unexpected error');
        }
      }),
      successMessage: i18next.t(successMessageKey, {
        entity: entityName || 'Item',
      }),
      // TODO: translation
      errorMessage: 'Failed to save changes',
    });

    return promise;
  };
};

const useMutationResultNotification = <T>(
  options: OptionsWithMessageKey<T>
) => {
  const { addNotification } = useNotifications();

  return mutationResultNotification({
    ...options,
    addNotification,
  });
};

export const useRemoveResultNotification = ({
  asyncAction,
  failureAction,
  entityName: entityLabel,
}: NoParaOptions) => {
  const hook = useMutationResultNotification({
    asyncAction,
    failureAction,
    entityName: entityLabel,
    successMessageKey: 'remove_success_message',
  });

  return () => hook({});
};

export const useDeleteResultNotification = ({
  asyncAction,
  failureAction,
  entityName: entityLabel,
}: NoParaOptions) => {
  const hook = useMutationResultNotification({
    asyncAction,
    failureAction,
    entityName: entityLabel,
    successMessageKey: 'delete_success_message',
  });

  return () => hook({});
};

export const useUpdateResultNotification = <T>({
  asyncAction,
  failureAction,
  entityName: entityLabel,
}: Options<T>) => {
  return useMutationResultNotification({
    asyncAction,
    failureAction,
    entityName: entityLabel,
    successMessageKey: 'update_success_message',
  });
};

export const useCreateResultNotification = <T>({
  asyncAction,
  failureAction,
  entityName: entityLabel,
}: Options<T>) => {
  return useMutationResultNotification({
    asyncAction,
    failureAction,
    entityName: entityLabel,
    successMessageKey: 'create_success_message',
  });
};
