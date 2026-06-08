import type { ModalProps as CFModalProps } from '@risk-smart/themed-cloudscape-components/modal';
import Modal from '@risksmart-app/components/src/modal';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import type { FieldValues } from 'react-hook-form';

import { FormInner } from './FormInner';
import { ModalProvider } from './modal-provider/ModalProvider';
import ModalFooter from './ModalFooter';
import styles from './style.module.scss';
import type { FormTemplateProps } from './types';

export type ModalProps = {
  visible: boolean;
  size?: CFModalProps.Size;
  footerDetails?: ReactNode;
  i18n: {
    edit_modal_title?: string;
    create_modal_title?: string;
  };
};

export const ModalWrapper = <TFieldValues extends FieldValues>({
  children,
  actions,
  visible,
  formId,
  onDismiss,
  readOnly,
  parentType,
  size,
  footerDetails,
  aside,
  header,
  values,
  i18n,
  testId,
}: FormTemplateProps<TFieldValues> & ModalProps) => (
  <ModalProvider>
    <Modal
      data-testid={testId}
      size={size}
      header={
        header || values
          ? (i18n.edit_modal_title ?? 'Edit')
          : (i18n.create_modal_title ?? 'Create')
      }
      visible={visible}
      footer={
        <ModalFooter
          actions={actions}
          footerDetails={footerDetails}
          readOnly={readOnly}
          parentType={parentType}
        />
      }
      onDismiss={(event) => {
        // don't close modal on overlay click
        if (event.detail.reason === 'overlay') {
          return;
        }
        onDismiss?.(false);
      }}
    >
      <form id={formId} name={formId} onSubmit={(e) => e.preventDefault()}>
        <Suspense>
          <FormInner>
            <div className={'flex gap-5'}>
              <div className={'flex-1'}>{children}</div>
              {aside ? <div className={styles.formSidebar}>{aside}</div> : null}
            </div>
          </FormInner>
        </Suspense>
      </form>
    </Modal>
  </ModalProvider>
);
