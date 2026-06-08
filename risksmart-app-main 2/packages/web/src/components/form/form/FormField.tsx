import type { FormFieldProps } from '@risk-smart/themed-cloudscape-components/form-field';
import CFFormField from '@risk-smart/themed-cloudscape-components/form-field';
import { CustomAttributeFieldType } from '@risksmart-app/form-configuration/src/field-types/types';
import _ from 'lodash';
import type { ReactNode } from 'react';
import { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsConditionalFieldVisible } from 'src/components/form/form/conditional-fields-provider/ConditionalFieldsContext';
import { contentToHtml } from 'src/components/help-panel/convertHtmlContentToHtml';
import HelpLink from 'src/components/help-panel/HelpLink';

import type { Content } from '../../help-panel/useHelpStore';
import { CustomFieldContext } from '../custom-attributes/context/CustomFieldContext';
import type { FieldFormFields } from '../custom-attributes/edit-fields/fieldSchema';
import { EditMode } from '../edit-field-modal/types';
import { ControlledFieldContext } from '../field-controller/ControlledFieldContext';
import { ChangesPopover } from './changes-popover/ChangesPopover';
import { useEditableFormContext } from './customisable-form/EditableFormContext';
import FormEditButton from './customisable-form/FormEditButton';
import { useRiskSmartForm } from './customisable-form/RiskSmartFormContext';
import { useCustomisableFormDataContext } from './customisable-form-data/CustomisableFormDataContext';

type Props = Omit<FormFieldProps, 'id' | 'label'> & {
  id?: string;
  disableBottomPadding?: boolean;
  actions?: ReactNode;
  label?: string;
  testId?: string;
  stretch?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  previewChangesFormatter?: (value: any) => string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hasFieldChanged?: (value: any) => boolean;
  guidance?: Content | undefined;
};

/**
 * Guidance is currently stored in 3 locations, historically in i18n, where it can be stored as a string or an array of headers and content,
 * in the json forms schema for custom attributes, where it is always a string, but can contains links, and finally in the form cfield configuration,
 * which is where all new guidance is stored as html.
 * This function smooths out the differences between these locations.
 * @param formConfigurationDescription
 * @param customAttributeDescription
 * @param i18nDescription
 * @returns
 */
const getGuidanceHtml = (
  formConfigurationDescription: string | null | undefined,
  customAttributeDescription: string | null | undefined,
  i18nDescription: Content | null | undefined
) => {
  if (formConfigurationDescription) {
    return formConfigurationDescription;
  }

  const guidance = customAttributeDescription ?? i18nDescription;

  return guidance ? contentToHtml(guidance) : undefined;
};

export const FormField = ({
  testId,
  disableBottomPadding,
  actions,
  previewChangesFormatter,
  hasFieldChanged,
  stretch = false,
  ...props
}: Props) => {
  const customField = useContext(CustomFieldContext);

  const controlledField = useContext(ControlledFieldContext);
  const { parentType, editMode, previewChanges } = useRiskSmartForm();
  const { showEditModal } = useEditableFormContext();
  const { label, children, secondaryControl, ...formFieldProps } = props;
  const { t } = useTranslation(['common']);
  const { formFieldConfigurations } = useCustomisableFormDataContext();

  const field = useMemo(() => {
    if (!formFieldConfigurations || !controlledField) {
      return undefined;
    }

    const fieldId = controlledField?.field.name;

    const field = formFieldConfigurations.find((f) => f.FieldId === fieldId);

    return field;
  }, [formFieldConfigurations, controlledField]);

  const conditionallyVisible = useIsConditionalFieldVisible(
    field?.FieldId ?? ''
  );
  const visible = !field?.Hidden && conditionallyVisible;
  // Historically, customised labels we set in UiScheam, however now we need to support for standard fields as well, so both will save to form_field_configuration so
  // should try to use that initially
  const customisedLabel =
    field?.Label ?? customField?.currentField.Label ?? label ?? '';

  const hasCustomLabel = !!field?.Label || !!customField?.currentField.Label;

  const required =
    !formFieldConfigurations || !controlledField
      ? true
      : (field?.Required ?? !!controlledField?.defaultRequired);

  const guidance = getGuidanceHtml(
    field?.Description,
    customField?.currentField.Description,
    props.guidance
  );

  const defaultValue = field?.DefaultValue;

  const changes = _.get(previewChanges, controlledField?.field.name);

  const fieldChanged = !!(
    previewChanges && (hasFieldChanged ? hasFieldChanged(changes) : changes)
  );

  const mappedValues = useMemo<FieldFormFields | undefined>(() => {
    return customField?.currentField
      ? {
          ...customField?.currentField,
          IsCustomField: true,
          CustomFieldLabel: customisedLabel ?? '',
          CustomFieldOptions: customField.currentField.Options?.map((o) => ({
            Value: o.Value,
            AltValue: o._tag === 'AltValueOption' ? o.AltValue : undefined,
            GeneratedId: crypto.randomUUID(),
            Persisted: true,
          })),
          Conditions: field?.Conditions,
          DefaultValue: defaultValue,
          EnableCustomLabel: true,
          CustomFieldAltLabel: customField?.currentField.AltLabel ?? undefined,
          CustomFieldType: customField?.currentField
            .Type as CustomAttributeFieldType,
          CustomFieldShowAltValues: customField?.currentField.ShowAltValues,
        }
      : {
          IsCustomField: false,
          Label: customisedLabel ?? '',
          Required: !!required,
          Type: CustomAttributeFieldType.Text,
          Hidden: !!field?.Hidden,
          ReadOnly: !!field?.ReadOnly,
          Conditions: field?.Conditions,
          Description: guidance,
          DefaultValue: defaultValue,
          EnableCustomLabel: hasCustomLabel,
        };
  }, [
    customField?.currentField,
    customisedLabel,
    required,
    field,
    guidance,
    defaultValue,
    hasCustomLabel,
  ]);

  if (!editMode && !visible) {
    return null;
  }

  const fieldChanges = fieldChanged
    ? previewChanges[controlledField?.field.name]
    : undefined;

  let secondaryControlElement: ReactNode | undefined = secondaryControl;
  if (fieldChanged) {
    secondaryControlElement = (
      <>
        {secondaryControl}
        <ChangesPopover
          originalValue={
            previewChangesFormatter?.(fieldChanges?.from) ??
            String(fieldChanges?.from)
          }
          newValue={
            previewChangesFormatter?.(fieldChanges?.to) ??
            String(fieldChanges?.to)
          }
        />
      </>
    );
  }
  const info = props.info ? (
    props.info
  ) : guidance ? (
    <HelpLink
      title={customisedLabel ?? ''}
      content={guidance}
      id={label ?? ''}
    />
  ) : undefined;

  return (
    <div className={`${editMode && !visible ? 'opacity-50' : ''}`}>
      <div
        className={
          visible ? (editMode || disableBottomPadding ? 'p-0' : 'pb-6') : ''
        }
      >
        <CFFormField
          {...formFieldProps}
          data-testid={`form-field-${testId}`}
          secondaryControl={secondaryControlElement}
          info={info}
          label={
            <div className={'inline-flex items-center justify-between'}>
              <div className={'flex gap-2 items-center'}>
                <div>
                  {customisedLabel}{' '}
                  {controlledField?.forceRequired || required
                    ? t('form.fieldRequiredPostfix')
                    : t('form.fieldOptionalPostfix')}
                </div>
                {editMode && (customField || controlledField) ? (
                  <FormEditButton
                    onClick={() =>
                      parentType &&
                      showEditModal({
                        parentType: parentType,
                        fieldId: controlledField?.field.name,
                        values: mappedValues,
                        fieldPath: customField?.fieldPath,
                        editMode: EditMode.Update,
                        defaultRequired: controlledField?.defaultRequired,
                        defaultValueOptions:
                          controlledField?.defaultValueOptions ?? [],
                        allowDefaultValue: controlledField?.allowDefaultValue,
                        forceRequired: controlledField?.forceRequired,
                      })
                    }
                  />
                ) : null}
              </div>
              {actions}
            </div>
          }
          stretch={stretch}
        >
          <div>
            <div
              className={
                fieldChanged ? `outline outline-2 outline-[orange] rounded` : ''
              }
            >
              {children}
            </div>
          </div>
        </CFFormField>
      </div>
    </div>
  );
};
