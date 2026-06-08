import { type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';
import { spinnerVariants } from './variants';

export const Spinner = ({
  className,
  size = 'md',
  ...props
}: React.ComponentProps<'svg'> & VariantProps<typeof spinnerVariants>) => {
  return (
    <svg
      xmlns={'http://www.w3.org/2000/svg'}
      viewBox={'0 0 24 24'}
      fill={'none'}
      stroke={'currentColor'}
      strokeWidth={'2'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      role={'status'}
      aria-label={'Loading'}
      aria-live={'polite'}
      className={cn(spinnerVariants({ size, className }))}
      {...props}
    >
      <path d={'M21 12a9 9 0 1 1-6.219-8.56'} />
    </svg>
  );
};
