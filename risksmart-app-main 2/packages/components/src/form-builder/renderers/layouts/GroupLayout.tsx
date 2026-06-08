import type {
  JsonFormsCellRendererRegistryEntry,
  JsonFormsRendererRegistryEntry,
  JsonSchema,
} from '@jsonforms/core';
import { useJsonForms } from '@jsonforms/react';
import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import Header from '@risk-smart/themed-cloudscape-components/header';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import type { FC } from 'react';
import { useShallow } from 'zustand/react/shallow';

import FormEditButton from '../../../form-edit-button/FormEditButton';
import { FormBuilderAddField } from '../../FormBuilderAddField';
import { useFormBuilderSectionStore } from '../../store/useFormBuilderSectionStore';
import { useFormBuilderStore } from '../../store/useFormBuilderStore';
import type { CustomUISchemaElement } from '../../types';
import { FormBuilderAction } from '../../types';
import { isElementHidden } from '../../utils';
import { RenderChildren } from './layoutUtils';

interface GroupLayoutRendererProps {
  schema: JsonSchema;
  uischema: CustomUISchemaElement;
  path: string;
  renderers: JsonFormsRendererRegistryEntry[];
  cells: JsonFormsCellRendererRegistryEntry[] | undefined;
  enabled: boolean;
}

export const GroupLayoutRenderer: FC<GroupLayoutRendererProps> = ({
  schema,
  uischema, // uischema is only a partial ui schema for this specific group
  path,
  renderers,
  cells,
  enabled,
}) => {
  const label = uischema?.label ? uischema.label : '';
  const initialSectionData = {
    sectionTitle: label,
  };

  const { isFormCustomisable, isPreviewingForm } = useFormBuilderStore();

  const {
    setIsEditingSection,
    setFormSectionModalAction,
    setSectionData,
    setCurrentSectionId,
  } = useFormBuilderSectionStore(
    useShallow((state) => ({
      setIsEditingSection: state.setIsEditingSection,
      setFormSectionModalAction: state.setFormSectionModalAction,
      setSectionData: state.setSectionData,
      setCurrentSectionId: state.setCurrentSectionId,
    }))
  );

  // Compute title visibility based on the visibility of any child element
  const { core } = useJsonForms();
  const isSectionHidden = (uischema.elements || []).every((element) =>
    isElementHidden(element, core?.data)
  );

  const isCustomisable = isFormCustomisable && !isPreviewingForm && enabled;
  const conditionalStyling = isCustomisable
    ? 'md:basis-2/3 border border-solid border-grey px-4 py-3'
    : '';

  return (
    <>
      {isSectionHidden ? null : (
        <div className={'w-full mb-5'}>
          <div className={'w-full justify-start'}>
            <FormField stretch={!(isFormCustomisable && !isPreviewingForm)}>
              <div
                data-testid={'group-layout-control-parent'}
                className={
                  'flex flex-col grow rounded-md ' + conditionalStyling
                }
              >
                <div className={'flex items-start pb-4'}>
                  <SpaceBetween direction={'horizontal'} size={'xs'}>
                    <Header variant={'h2'}>{label}</Header>
                    {isCustomisable ? (
                      <FormEditButton
                        onClick={() => {
                          setFormSectionModalAction(FormBuilderAction.Edit);
                          setIsEditingSection(true);
                          setSectionData(initialSectionData);
                          setCurrentSectionId(uischema.id);
                        }}
                      />
                    ) : null}
                  </SpaceBetween>
                </div>

                <RenderChildren
                  layout={uischema}
                  schema={schema}
                  path={path}
                  renderers={renderers}
                  cells={cells}
                  enabled={enabled}
                />

                {isCustomisable ? (
                  <FormBuilderAddField parentId={uischema.id} />
                ) : null}
              </div>
            </FormField>
          </div>
        </div>
      )}
    </>
  );
};
