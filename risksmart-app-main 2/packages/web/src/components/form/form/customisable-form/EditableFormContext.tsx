import { createContext, useContext } from 'react';

import type { EditFieldModalProps } from '../../edit-field-modal/EditFieldModalProps';

type EditableFormContextContextState = {
  showEditModal: (props: Omit<EditFieldModalProps, 'onDismiss'>) => void;
};

export const EditableFormContext =
  createContext<EditableFormContextContextState>({
    showEditModal: () => null,
  });

export const useEditableFormContext = () => {
  const context = useContext(EditableFormContext);
  if (!context) {
    throw new Error(
      'useEditableFormContext must be used within a EditableFormProvider'
    );
  }

  return context;
};
