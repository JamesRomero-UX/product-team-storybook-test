import { Controller, useFormContext } from 'react-hook-form';

import { RichTextEditor } from './RichTextEditor';

export const GuidanceField = ({ placeholder }: { placeholder?: string }) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={'guidance'}
      render={({ field }) => (
        <RichTextEditor
          value={field.value ?? ''}
          onChange={field.onChange}
          placeholder={placeholder ?? 'Add guidance text...'}
        />
      )}
    />
  );
};
