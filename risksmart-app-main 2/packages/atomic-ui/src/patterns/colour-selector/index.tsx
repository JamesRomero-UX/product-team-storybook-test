import { Toggle as TogglePrimitive } from '@base-ui/react/toggle';
import { ToggleGroup as ToggleGroupPrimitive } from '@base-ui/react/toggle-group';

import { cn } from '../../lib/utils';

function ColourSelector({ className, ...props }: ToggleGroupPrimitive.Props) {
  return (
    <ToggleGroupPrimitive
      data-slot={'colour-selector'}
      className={cn('flex gap-2 items-center w-fit', className)}
      {...props}
    />
  );
}

type ColourSelectorItemProps = Omit<TogglePrimitive.Props, 'aria-label'> & {
  color: string;
  label: string;
};

function ColourSelectorItem({
  color,
  label,
  className,
  style,
  ...props
}: ColourSelectorItemProps) {
  return (
    <TogglePrimitive
      data-slot={'colour-selector-item'}
      aria-label={label}
      className={cn(
        'size-10 rounded-sm border-2 border-neutral-border cursor-pointer transition-all shrink-0',
        'data-[pressed]:border-primary data-[pressed]:scale-[1.05]',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      style={{ backgroundColor: color, ...style }}
      {...props}
    />
  );
}

interface ColourSelectorCustomProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

function ColourSelectorCustom({
  value,
  onChange,
  label = 'Custom colour',
  className,
}: ColourSelectorCustomProps) {
  return (
    <div
      data-slot={'colour-selector-custom'}
      className={cn('flex items-center gap-3', className)}
    >
      <label
        className={
          'relative block h-[40px] w-[80px] rounded-lg overflow-hidden cursor-pointer shrink-0'
        }
        style={{ backgroundColor: value }}
      >
        <input
          type={'color'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={'opacity-0 absolute inset-0 w-full h-full cursor-pointer'}
        />
      </label>
      <span className={'text-lg text-primary-hover'}>
        {label}
        {': '}
        {value}
      </span>
    </div>
  );
}

export { ColourSelector, ColourSelectorCustom, ColourSelectorItem };
