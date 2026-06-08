import type { FC, ReactNode } from 'react';

const PageFilterContainer: FC<{ children: ReactNode }> = ({ children }) => (
  <div
    className={
      'bg-white p-6 rounded-xl border-grey250 border-solid border-[1px]'
    }
  >
    {children}
  </div>
);

export default PageFilterContainer;
