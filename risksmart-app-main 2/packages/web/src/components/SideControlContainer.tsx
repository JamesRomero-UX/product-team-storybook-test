import type { ReactNode } from 'react';

export const SideControlContainer: React.FC<{
  children: ReactNode;
  sideControl: ReactNode;
}> = ({ children, sideControl }) => {
  return (
    <div className={'flex flex-row'}>
      <div className={'flex-grow'}>{children}</div>
      {sideControl}
    </div>
  );
};
