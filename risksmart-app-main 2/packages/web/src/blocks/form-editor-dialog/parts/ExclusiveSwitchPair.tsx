import { cn, Switch } from '@risksmart-app/atomic-ui';
import { Controller, useFormContext } from 'react-hook-form';

export const ExclusiveSwitchPair = ({
  name,
  label,
  otherName,
}: {
  name: string;
  label: string;
  otherName: string;
}) => {
  const { control, setValue } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <label className={cn('flex items-center gap-2 text-sm cursor-pointer')}>
          {label}
          <Switch
            size={'sm'}
            checked={!!field.value}
            onCheckedChange={(checked) => {
              field.onChange(checked);
              if (checked) {
                setValue(otherName, false);
              }
            }}
          />
        </label>
      )}
    />
  );
};
