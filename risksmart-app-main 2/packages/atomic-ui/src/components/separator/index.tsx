import { Separator as SeparatorPrimitive } from '@base-ui/react/separator';

import { cn } from '../../lib/utils';

function Separator({
  className,
  orientation = 'horizontal',
  ...props
}: SeparatorPrimitive.Props) {
  return (
    <SeparatorPrimitive
      data-slot={'separator'}
      orientation={orientation}
      className={cn(
        'bg-muted shrink-0 data-[orientation=horizontal]:h-[2px] data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch',
        className
      )}
      {...props}
    />
  );
}

export { Separator };
