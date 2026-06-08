import Form from '@risk-smart/themed-cloudscape-components/form';
import { Suspense } from 'react';
import type { FieldValues } from 'react-hook-form';
import TabHeader from 'src/components/tab-header';

import { FormInner } from './FormInner';
import { FormMenu } from './FormMenu';
import styles from './style.module.scss';
import type { FormTemplateProps } from './types';

export const PageWrapper = <TFieldValues extends FieldValues>(
  props: FormTemplateProps<TFieldValues>
) => {
  const { formId, children, actions, readOnly, parentType } = props;

  const header =
    typeof props.header === 'string' ? (
      <TabHeader
        actions={
          !readOnly && parentType ? <FormMenu parentType={parentType} /> : <></>
        }
      >
        {props.header}
      </TabHeader>
    ) : (
      props.header
    );

  return (
    <form
      data-testid={props.testId}
      onSubmit={(e) => e.preventDefault()}
      id={formId}
      name={formId}
      className={styles.noFieldsetBorder}
    >
      <Suspense>
        <Form actions={<></>} header={header} secondaryActions={actions}>
          <FormInner>
            <div className={'flex gap-5 justify-between'}>
              <div className={'flex-1'}>{children}</div>
              {props.aside ? (
                <div className={styles.formSidebar}>{props.aside}</div>
              ) : null}
            </div>
          </FormInner>
        </Form>
      </Suspense>
    </form>
  );
};
