import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';
import type { VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';
import {
  radioGroupVariants,
  radioIndicatorVariants,
  radioVariants,
} from './variants';

type RadioSize = VariantProps<typeof radioVariants>['size'];
type RadioGroupOrientation = VariantProps<
  typeof radioGroupVariants
>['orientation'];

const RadioGroup = ({
  className,
  orientation = 'vertical',
  ...props
}: RadioGroupPrimitive.Props & VariantProps<typeof radioGroupVariants>) => (
  <RadioGroupPrimitive
    data-slot={'radio-group'}
    className={cn(radioGroupVariants({ orientation }), className)}
    {...props}
  />
);

const RadioItem = ({
  className,
  size = 'md',
  ...props
}: RadioPrimitive.Root.Props & VariantProps<typeof radioVariants>) => (
  <RadioPrimitive.Root
    data-slot={'radio'}
    data-size={size}
    className={cn(radioVariants({ size }), className)}
    {...props}
  >
    <RadioPrimitive.Indicator
      data-slot={'radio-indicator'}
      keepMounted={false}
      className={radioIndicatorVariants({ size })}
    />
  </RadioPrimitive.Root>
);

RadioGroup.Item = RadioItem;

export { RadioGroup, RadioItem };
export type { RadioGroupOrientation, RadioSize };
