import type { PropsWithChildren } from 'react';
import { useState } from 'react';

import { EditFieldModal } from '../../edit-field-modal/EditFieldModal';
import type { EditFieldModalProps } from '../../edit-field-modal/EditFieldModalProps';
import { EditableFormContext } from './EditableFormContext';

/**
 * Context provider to allow the edit field modal to be opened from any child component
 * @returns
 */
export const EditableFormProvider = ({ children }: PropsWithChildren) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFieldModalProps, setEditFieldModalProps] =
    useState<Omit<EditFieldModalProps, 'onDismiss'>>();

  const showEditModalWithProps = (
    props: Omit<EditFieldModalProps, 'onDismiss'>
  ) => {
    setEditFieldModalProps(props);
    setShowEditModal(true);
  };

  return (
    <EditableFormContext.Provider
      value={{
        showEditModal: showEditModalWithProps,
      }}
    >
      {children}
      {editFieldModalProps && showEditModal && (
        <EditFieldModal
          {...editFieldModalProps}
          onDismiss={() => setShowEditModal(false)}
        />
      )}
    </EditableFormContext.Provider>
  );
};
