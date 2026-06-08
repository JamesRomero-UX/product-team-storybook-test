import type { FC } from 'react';
import { ModalWrapper } from 'src/components/form/form/ModalWrapper';

import ActionForm from './update/forms/ActionForm';
import type { ActionFormFieldData } from './update/forms/actionsSchema';

type Props = {
  onDismiss: () => void;
  onSaving: (action: ActionFormFieldData) => Promise<void>;
};

const ActionModal: FC<Props> = ({ onDismiss, onSaving }) => (
  <ActionForm
    testId={'actionForm'}
    renderTemplate={(renderProps) => (
      <ModalWrapper {...renderProps} visible={true} />
    )}
    onSave={onSaving}
    onDismiss={onDismiss}
  />
);

export default ActionModal;
