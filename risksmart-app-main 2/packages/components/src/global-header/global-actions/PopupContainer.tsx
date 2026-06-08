import type { FC, ReactNode } from 'react';

interface PopupContainerProps {
  children: ReactNode;
}

export const PopupContainer: FC<PopupContainerProps> = ({ children }) => {
  return (
    <div
      className={`bg-navy_mid text-white shadow-lg flex flex-col rounded-b-md w-full font-sans`}
    >
      {children}
    </div>
  );
};
