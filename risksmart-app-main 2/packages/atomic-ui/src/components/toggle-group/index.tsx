import { Toggle as TogglePrimitive } from '@base-ui/react/toggle';
import { ToggleGroup as ToggleGroupPrimitive } from '@base-ui/react/toggle-group';

import { cn } from '../../lib/utils';

function ToggleGroup({ className, ...props }: ToggleGroupPrimitive.Props) {
  return (
    <ToggleGroupPrimitive
      data-slot={'toggle-group'}
      className={cn(
        'group flex w-fit data-[disabled]:pointer-events-none',
        className
      )}
      {...props}
    />
  );
}

function ToggleGroupItem({ className, ...props }: TogglePrimitive.Props) {
  return (
    <TogglePrimitive
      data-slot={'toggle-group-item'}
      className={cn(
        'relative flex items-center gap-2 px-5 py-[6px] bg-primary-foreground cursor-pointer select-none text-lg font-semibold text-neutral-foreground transition-colors',
        'border border-neutral-border [&:not(:first-child)]:-ml-px',
        'first:rounded-l-full last:rounded-r-full',
        'hover:z-10 hover:border-secondary hover:text-secondary',
        'data-[pressed]:z-10 data-[pressed]:bg-secondary data-[pressed]:text-primary data-[pressed]:border-secondary',
        'group-data-[disabled]:bg-primary-foreground group-data-[disabled]:text-muted group-data-[disabled]:border-muted',
        className
      )}
      {...props}
    />
  );
}

export { ToggleGroup, ToggleGroupItem };
