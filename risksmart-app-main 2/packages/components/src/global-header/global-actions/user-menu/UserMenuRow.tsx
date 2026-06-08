import clsx from 'clsx';
import type { FC, ReactNode } from 'react';

interface UserMenuRowProps {
  children: ReactNode;
  showSeparator: boolean;
  className?: string;
}

const UserMenuRow: FC<UserMenuRowProps> = ({
  children,
  showSeparator,
  className,
}) => {
  return (
    <div
      className={clsx(
        'border-0 border-solid p-4',
        `${showSeparator ? 'border-b border-navy_light' : ''}`,
        className
      )}
    >
      {children}
    </div>
  );
};

export default UserMenuRow;
