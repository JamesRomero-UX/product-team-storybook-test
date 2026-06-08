import type { ComponentProps } from 'react';

import { cn } from '../../lib/utils';

function Container({ children, className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'bg-neutral rounded-xl p-6 shadow-sm border border-muted',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Container };
