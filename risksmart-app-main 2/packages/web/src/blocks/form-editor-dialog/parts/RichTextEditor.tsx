import { getEnv } from '@risksmart-app/components/src/utils/environment';
import { Editor } from '@tinymce/tinymce-react';

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  height?: number;
  disabled?: boolean;
  className?: string;
}

export const RichTextEditor = ({
  value,
  onChange,
  placeholder,
  height = 300,
  disabled,
  className,
}: RichTextEditorProps) => (
  <div className={className}>
    <Editor
      value={value}
      onEditorChange={onChange}
      disabled={disabled}
      apiKey={getEnv('REACT_APP_TINY_API_KEY')}
      init={{
        height,
        placeholder,
        branding: false,
        menubar: false,
        toolbar:
          'undo redo | blocks | bold italic | bullist numlist | removeformat',
        plugins: ['lists', 'wordcount'],
      }}
    />
  </div>
);
