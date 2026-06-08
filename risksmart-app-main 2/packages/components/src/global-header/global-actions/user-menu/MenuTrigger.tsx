import type { FC, ReactNode } from 'react';

interface MenuTriggerProps {
  onClick: () => void;
  children: ReactNode;
}

export const MenuTrigger: FC<MenuTriggerProps> = ({ onClick, children }) => {
  return (
    <div
      onClick={onClick}
      className={
        'flex w-full flex-grow items-center justify-between cursor-pointer select-none rounded transition opacity-80 hover:opacity-100 pl-6 pr-7'
      }
    >
      {children}
    </div>
  );
};
