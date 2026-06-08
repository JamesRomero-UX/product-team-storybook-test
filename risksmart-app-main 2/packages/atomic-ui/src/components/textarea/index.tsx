import type { ComponentProps } from 'react';

import { cn } from '../../lib/utils';

const Textarea = ({
  className,
  'aria-invalid': ariaInvalid,
  ...props
}: ComponentProps<'textarea'>) => {
  const isInvalid = ariaInvalid === true || ariaInvalid === 'true';

  return (
    <div className={cn('relative')}>
      {isInvalid && (
        <div
          className={cn(
            'overflow-hidden absolute inset-y-0 left-0 w-[9px] rounded-l-lg bg-destructive'
          )}
        />
      )}
      <textarea
        data-slot={'textarea'}
        aria-invalid={ariaInvalid}
        className={cn(
          'flex min-h-[80px] w-full rounded-lg border border-neutral-border bg-primary-foreground px-3 py-2 text-lg text-primary placeholder:text-neutral-active outline-none resize-y',
          'focus-visible:border-secondary',
          isInvalid &&
            'border-destructive text-destructive pl-[calc(0.75rem+4px)] focus-visible:ring-2 focus-visible:ring-secondary focus-visible:border-destructive',
          'disabled:pointer-events-none disabled:bg-muted disabled:text-muted-foreground disabled:border-muted',
          className
        )}
        {...props}
      />
    </div>
  );
};

export { Textarea };
