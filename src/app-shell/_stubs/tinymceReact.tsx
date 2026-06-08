// Stub for `@tinymce/tinymce-react`. The real Editor is a heavy WYSIWYG
// (~500 KB) that we don't want loaded for a Storybook prototype. Most
// uses in the dev repo are *read-only inline* mode — the editor receives
// `initialValue: htmlString` and `disabled: true`, then renders the HTML
// untouched. We mimic that behavior by inlining the html content
// directly via dangerouslySetInnerHTML, which is enough for HelpSection
// and similar consumers to render the help content correctly.
import type { FC } from 'react';

type EditorProps = {
  initialValue?: string;
  inline?: boolean;
  disabled?: boolean;
  // The rest of the API surface (init, apiKey, setup, onEditorChange, …)
  // is intentionally ignored — none of those affect read-only rendering.
  [key: string]: unknown;
};

export const Editor: FC<EditorProps> = ({ initialValue }) => (
  <div
    data-testid={'tinymce-stub'}
    dangerouslySetInnerHTML={{ __html: initialValue ?? '' }}
  />
);

export default Editor;
