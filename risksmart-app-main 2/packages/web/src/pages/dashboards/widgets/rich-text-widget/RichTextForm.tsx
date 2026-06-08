import { useFormContext } from 'react-hook-form';
import Editor from 'src/components/form/editor';

import type { WidgetSettings } from './widgetSettingsSchema';

export const RichTextForm = () => {
  const { control } = useFormContext<WidgetSettings>();

  return <Editor control={control} name={'content'} label={'Content'} />;
};
