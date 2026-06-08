import type { FC, ReactNode } from 'react';

export const Circle: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div
      className={
        'border-teal border-solid rounded-full border-[2px] h-[29px] w-[29px] flex items-center justify-center'
      }
    >
      {children}
    </div>
  );
};
