import type { PropsWithChildren } from 'react';
import { Toaster } from 'react-hot-toast';

export const NotificationProvider = (props: PropsWithChildren) => {
  return (
    <div>
      <Toaster />
      {props.children}
    </div>
  );
};
