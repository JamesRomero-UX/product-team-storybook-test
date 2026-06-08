import { getEnv } from '@risksmart-app/components/src/utils/environment';
import { Editor } from '@tinymce/tinymce-react';
import clsx from 'clsx';
import type { MutableRefObject } from 'react';
import { useState } from 'react';
import type { FieldValues } from 'react-hook-form';
import { useController } from 'react-hook-form';
import { FormField } from 'src/components/form/form/FormField';
import type { Editor as TinyEditor } from 'tinymce';

import type { ControlledBaseProps } from '../types';
import { useComments } from './useComments';

interface Props<T extends FieldValues> extends ControlledBaseProps<T> {
  disabled?: boolean;
  editorRef?: MutableRefObject<null | TinyEditor>;
  enableComments?: boolean;
  removeInitialComments?: boolean;
  parentId?: string;
  height?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initOverrides?: any;
}

const DocumentEditor = <T extends FieldValues>({
  disabled,
  editorRef,
  enableComments,
  removeInitialComments,
  name,
  control,
  label,
  parentId,
  initOverrides,
  height = 750,
  testId,
}: Props<T>) => {
  const commentProps = useComments(editorRef, { ParentId: parentId });
  // prevent Tiny mce from showing a text area before it has loaded
  const [editorLoaded, setEditorLoaded] = useState(false);
  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  // Partially controlled component.
  // Updates are recorded in react hook form, but changes in value
  // won't be reflected in editor.
  const [initialValue] = useState(() => value);

  return (
    <div className={clsx({ disabled: !editorLoaded })}>
      <FormField
        label={label}
        errorText={error?.message}
        stretch={true}
        testId={testId}
      >
        <Editor
          onEditorChange={onChange}
          onInit={(_evt, editor) => {
            if (editorRef) {
              editorRef.current = editor;
            }
            setEditorLoaded(true);

            // Enable comments on load
            editor.on('SkinLoaded', function () {
              editor.execCommand('ToggleSidebar', false, 'showcomments', {
                skip_focus: true,
              });

              if (removeInitialComments) {
                // Need to use setTimeout for annotator to be ready to strip comments.
                // Maybe there is another event we could use to avoid this?
                setTimeout(() => {
                  editor.annotator.removeAll('tinycomments');
                }, 0);
              }
            });
          }}
          initialValue={initialValue ?? undefined}
          disabled={disabled}
          apiKey={getEnv('REACT_APP_TINY_API_KEY')}
          init={{
            // Custom branding
            skin_url: '/tinymce/skin',
            height,
            // Hide tiny logo
            branding: false,
            toolbar:
              'undo redo | blocks | ' +
              'bold italic backcolor | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist outdent indent | ' +
              'removeformat | addcomment showcomments',
            menubar: 'file edit view insert format tc',
            menu: {
              file: {
                title: 'File',
                items: 'print',
              },
              view: {
                title: 'View',
                items: 'showcomments',
              },
              tc: {
                title: 'Comments',
                items: 'addcomment showcomments deleteallconversations',
              },
            },

            plugins: [
              ...(enableComments ? ['tinycomments'] : []),
              'table',
              'wordcount',
              'lists',
              'powerpaste',
            ],
            powerpaste_word_import: 'prompt',
            powerpaste_html_import: 'prompt',
            ...commentProps,
            ...initOverrides,
          }}
        />
      </FormField>
    </div>
  );
};

export default DocumentEditor;
