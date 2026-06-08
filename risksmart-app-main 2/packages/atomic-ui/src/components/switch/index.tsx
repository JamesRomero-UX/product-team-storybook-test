import { Switch as SwitchPrimitive } from '@base-ui/react/switch';
import { type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';
import { switchThumbVariants, switchVariants } from './variants';

function Switch({
  className,
  size = 'md',
  ...props
}: SwitchPrimitive.Root.Props & VariantProps<typeof switchVariants>) {
  return (
    <SwitchPrimitive.Root
      data-slot={'switch'}
      data-size={size}
      className={cn(switchVariants({ size, className }))}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot={'switch-thumb'}
        className={switchThumbVariants({ size })}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
