import { JsonForms } from '@jsonforms/react';
import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { DraggableFormDesigner } from './drag-and-drop/DraggableFormDesigner';
import { FormBuilderAddSection } from './FormBuilderAddSection';
import { FormFieldModal } from './FormFieldModal';
import { FormPreviewModal } from './FormPreviewModal';
import { FormSectionModal } from './FormSectionModal';
import { migrateStaleSchema } from './migrateStaleSchema';
import { rendererRegistry } from './renderers/registry';
import { useFormBuilderStore } from './store/useFormBuilderStore';
import { designModeUISchema } from './utils';

interface FormBuilderProps {
  hasEditPermission?: boolean;
}

export const FormBuilder = ({
  hasEditPermission = false,
}: FormBuilderProps) => {
  const { schema, uiSchema, isFormCustomisable, isPreviewingForm } =
    useFormBuilderStore(
      useShallow((state) => ({
        schema: state.schema,
        uiSchema: state.uiSchema,
        isFormDirty: state.isFormDirty,
        isFormCustomisable: state.isFormCustomisable,
        isPreviewingForm: state.isPreviewingForm,
      }))
    );

  useEffect(() => {
    migrateStaleSchema(schema, uiSchema);
  }, [schema, uiSchema]);

  return (
    <>
      {isFormCustomisable && hasEditPermission ? (
        <>
          <DraggableFormDesigner />
          <FormBuilderAddSection />
          <FormSectionModal />
          <FormFieldModal />
        </>
      ) : (
        <JsonForms
          readonly={true}
          data={{}}
          schema={schema}
          uischema={designModeUISchema(uiSchema)}
          renderers={rendererRegistry}
          validationMode={'NoValidation'}
        />
      )}

      {isPreviewingForm ? <FormPreviewModal /> : null}
    </>
  );
};
