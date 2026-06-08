import type { ReactNode } from 'react';
import { Suspense } from 'react';
import type { FieldValues } from 'react-hook-form';

import { FormInner } from './FormInner';
import { ModalProvider } from './modal-provider/ModalProvider';
import ModalFooter from './ModalFooter';
import styles from './style.module.scss';
import type { FormTemplateProps } from './types';

type ModalBodyProps = {
  footerDetails?: ReactNode;
  testId?: string;
};

/**
 * Created to overcome issues with a Modals forms buttons living in a different
 * location to the form content. Use this inside a modal with the following
 * Modal settings: disableContentPaddings true footer undefined
 *
 * @param props
 * @returns
 */
export const ModalBodyWrapper = <TFieldValues extends FieldValues>(
  props: FormTemplateProps<TFieldValues> & ModalBodyProps
) => {
  const {
    children,
    actions,
    formId,
    readOnly,
    parentType,
    footerDetails,
    aside,
  } = props;

  return (
    <ModalProvider>
      <form id={formId} name={formId} onSubmit={(e) => e.preventDefault()}>
        <div className={'p-5'}>
          <Suspense>
            <FormInner>
              <div className={'flex gap-5'}>
                <div className={'flex-1'}>{children}</div>
                {aside ? (
                  <div className={styles.formSidebar}>{aside}</div>
                ) : null}
              </div>
            </FormInner>
          </Suspense>
        </div>
        <div
          className={
            'bottom-0 sticky p-5 bg-white rounded-b-[10px] border-grey200  border-x-0 border-b-0 border-t-[2px] border-solid'
          }
        >
          <ModalFooter
            actions={actions}
            footerDetails={footerDetails}
            readOnly={readOnly}
            parentType={parentType}
          />
        </div>
      </form>
    </ModalProvider>
  );
};
