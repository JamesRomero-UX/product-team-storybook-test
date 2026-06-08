// JSON editor — lifted verbatim from
//   packages/web/src/components/form/controlled-json-editor/JsonEditor.tsx
//
// Cloudscape CodeEditor renders the production status bar at the
// bottom of the editor — including the Preferences (gear) button,
// cursor position, and Errors / Warnings tabs.

import 'ace-builds/css/ace.css';
import 'ace-builds/css/theme/cloud_editor.css';
import 'ace-builds/css/theme/cloud_editor_dark.css';

import CodeEditor from '@risk-smart/themed-cloudscape-components/code-editor';
import type { FC } from 'react';
import { useEffect, useState } from 'react';

const i18nStrings = {
  loadingState: 'Loading code editor',
  errorState: 'There was an error loading the code editor.',
  errorStateRecovery: 'Retry',
  editorGroupAriaLabel: 'Code editor',
  statusBarGroupAriaLabel: 'Status bar',
  cursorPosition: (row: number, column: number) => `Ln ${row}, Col ${column}`,
  errorsTab: 'Errors',
  warningsTab: 'Warnings',
  preferencesButtonAriaLabel: 'Preferences',
  paneCloseButtonAriaLabel: 'Close',
  preferencesModalHeader: 'Preferences',
  preferencesModalCancel: 'Cancel',
  preferencesModalConfirm: 'Confirm',
  preferencesModalWrapLines: 'Wrap lines',
  preferencesModalTheme: 'Theme',
  preferencesModalLightThemes: 'Light themes',
  preferencesModalDarkThemes: 'Dark themes',
};

type CodeEditorProps = Parameters<typeof CodeEditor>[number];
type Preferences = CodeEditorProps['preferences'];
type Ace = CodeEditorProps['ace'];

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

const JsonEditor: FC<Props> = ({ value, onChange, disabled }) => {
  const [preferences, setPreferences] = useState<Preferences>();
  const [loading, setLoading] = useState(true);
  const [ace, setAce] = useState<Ace>();

  useEffect(() => {
    const loadAce = async () => {
      const aceModule = await import('ace-builds');

      try {
        // ESM resolver isn't always present; ignore if it isn't.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await import('ace-builds/esm-resolver' as any);
      } catch {
        /* noop */
      }
      aceModule.config.set('useStrictCSP', true);

      return aceModule;
    };

    loadAce()
      .then((loaded) => setAce(loaded))
      .finally(() => setLoading(false));
  }, []);

  return (
    <CodeEditor
      key={String(disabled)}
      ace={ace}
      value={value}
      language={'json'}
      onDelayedChange={(event) => onChange(event.detail.value)}
      preferences={preferences}
      onPreferencesChange={(event) => setPreferences(event.detail)}
      loading={loading}
      i18nStrings={i18nStrings}
      themes={{ light: ['cloud_editor'], dark: ['cloud_editor_dark'] }}
    />
  );
};

export default JsonEditor;
