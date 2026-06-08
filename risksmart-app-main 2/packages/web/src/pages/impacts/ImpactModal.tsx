import type { FC } from 'react';
import { ModalWrapper } from 'src/components/form/form/ModalWrapper';

import ImpactForm from './update/forms/ImpactForm';
import type { ImpactFormFieldData } from './update/forms/impactFormSchema';

type Props = {
  onDismiss: () => void;
  onSaving: (action: ImpactFormFieldData) => Promise<void>;
};

const ImpactModal: FC<Props> = ({ onDismiss, onSaving }) => (
  <ImpactForm
    onSave={onSaving}
    onDismiss={onDismiss}
    renderTemplate={(renderProps) => (
      <ModalWrapper {...renderProps} visible={true} size={'large'} />
    )}
  />
);

export default ImpactModal;
