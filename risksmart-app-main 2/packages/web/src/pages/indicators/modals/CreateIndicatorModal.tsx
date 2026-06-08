import type { FC } from 'react';
import { ModalWrapper } from 'src/components/form/form/ModalWrapper';
import type { IndicatorFormDataFields } from 'src/pages/indicators/forms/indicatorSchema';

import IndicatorsDetailsForm from '../forms/IndicatorDetailsForm';

type Props = {
  onDismiss: () => void;
  onSave: (control: IndicatorFormDataFields) => Promise<void>;
};

const CreateIndicatorModal: FC<Props> = ({ onDismiss, onSave }) => {
  return (
    <IndicatorsDetailsForm
      onSave={onSave}
      onDismiss={onDismiss}
      renderTemplate={(renderProps) => (
        <ModalWrapper
          {...renderProps}
          visible={true}
          testId={'indicator-modal'}
        />
      )}
    />
  );
};

export default CreateIndicatorModal;
