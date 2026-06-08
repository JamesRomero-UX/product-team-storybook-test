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
    async function loadAce() {
      const ace = await import('ace-builds');

      await import('ace-builds/esm-resolver');
      ace.config.set('useStrictCSP', true);

      const jsonWorkerUrl =
        await import('ace-builds/src-noconflict/worker-json?url');
      ace.config.setModuleUrl('ace/mode/json_worker', jsonWorkerUrl.default);

      return ace;
    }

    loadAce()
      .then((ace) => setAce(ace))
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
