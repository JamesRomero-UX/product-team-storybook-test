import _ from 'lodash';
import type { FieldValues } from 'react-hook-form';

import { EditableFormProvider } from './customisable-form/EditableFormProvider';
import { CustomisableFormDataProvider } from './customisable-form-data/CustomisableFormDataProvider';
import { FormContext } from './FormContext';
import type { FormContextProps } from './types';

/**
 * Customisable form
 * Updated forms default values based on saved form customisations.
 */
export const CustomisableForm = <TFieldValues extends FieldValues>(
  props: FormContextProps<TFieldValues>
) => {
  return (
    <CustomisableFormDataProvider
      parentType={props.parentType}
      possibleParentTypes={props.possibleParentTypes}
    >
      <FormContext
        {...props}
        renderTemplate={(innerProps) => (
          <EditableFormProvider>
            {props.renderTemplate(innerProps)}
          </EditableFormProvider>
        )}
      />
    </CustomisableFormDataProvider>
  );
};
