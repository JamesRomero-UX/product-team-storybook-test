import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';
import { buttonVariants } from './variants';

export const Button = ({
  variant = 'default',
  style = 'default',
  radius = 'full',
  size = 'md',
  elevated = false,
  className,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) => {
  return (
    <ButtonPrimitive
      data-slot={'button'}
      className={cn(
        buttonVariants({ variant, style, radius, size, elevated }),
        className
      )}
      {...props}
    >
      {props.children}
    </ButtonPrimitive>
  );
};
