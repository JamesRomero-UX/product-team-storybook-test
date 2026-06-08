import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';
import { type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';
import { checkboxIndicatorVariants, checkboxVariants } from './variants';

const CheckIcon = () => (
  <svg
    xmlns={'http://www.w3.org/2000/svg'}
    viewBox={'0 0 24 24'}
    fill={'none'}
    stroke={'currentColor'}
    strokeWidth={3}
    strokeLinecap={'round'}
    strokeLinejoin={'round'}
  >
    <polyline points={'20 6 9 17 4 12'} />
  </svg>
);

const Checkbox = ({
  className,
  size = 'md',
  ...props
}: CheckboxPrimitive.Root.Props & VariantProps<typeof checkboxVariants>) => (
  <CheckboxPrimitive.Root
    data-slot={'checkbox'}
    data-size={size}
    className={cn(checkboxVariants({ size, className }))}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      data-slot={'checkbox-indicator'}
      className={checkboxIndicatorVariants({ size })}
    >
      <CheckIcon />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
);

export { Checkbox };
