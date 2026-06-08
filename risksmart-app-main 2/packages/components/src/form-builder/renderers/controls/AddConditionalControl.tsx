import type {
  PropertyFilterOption,
  PropertyFilterProperty,
} from '@cloudscape-design/collection-hooks';
import { getSubErrorsAt } from '@jsonforms/core';
import { useJsonForms, withJsonFormsControlProps } from '@jsonforms/react';
import type { PropertyFilterProps } from '@risk-smart/themed-cloudscape-components/property-filter';
import PropertyFilter from '@risk-smart/themed-cloudscape-components/property-filter';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';

import { defaultPropertyFilterI18nStrings } from '../../../table/propertyFilterI18nStrings';
import { useFormBuilderFieldStore } from '../../store/useFormBuilderFieldStore';
import { useFormBuilderStore } from '../../store/useFormBuilderStore';
import type { ExtendedControlProps } from '../../types';
import { supportsConditionalLogic, usesItemsOneOf } from '../../utils';
import { CustomisableControl } from './CustomisableControl';

const AddConditionalControlUnwrapped: FC<ExtendedControlProps> = ({
  uischema,
  schema,
  errors,
  handleChange,
  data,
  path,
  visible,
  required,
}) => {
  const [nestedErrors, setNestedErrors] = useState<string>('');
  const { schema: globalSchema, flattenedUISchemaElements } =
    useFormBuilderStore(
      useShallow((state) => ({
        schema: state.schema,
        flattenedUISchemaElements: state.flattenedUISchemaElements,
      }))
    );

  const { currentFieldId } = useFormBuilderFieldStore(
    useShallow((state) => ({
      currentFieldId: state.currentFieldId,
    }))
  );

  const { t } = useTranslation(['common'], {
    keyPrefix: 'formBuilder.formField',
  });

  const jsonforms = useJsonForms();

  useEffect(() => {
    const childErrors = getSubErrorsAt(path, schema)({ jsonforms });
    const childErrorsString = childErrors.reduce((acc: string, error) => {
      if (error) {
        return `${acc} ${error.message}`;
      }

      return acc;
    }, '');

    setNestedErrors(childErrorsString);
  }, [path, schema, errors, jsonforms]);

  const [filteringProperties, setFilteringProperties] = useState<
    PropertyFilterProperty[]
  >([]);
  const [filteringOptions, setFilteringOptions] = useState<
    PropertyFilterOption[]
  >([]);

  const i18nStrings = {
    ...defaultPropertyFilterI18nStrings,
    editTokenHeader: t('i18n.editTokenHeader'),
    clearFiltersText: t('i18n.clearFiltersText'),
    tokenEditorTokenRemoveLabel: t('i18n.tokenEditorTokenRemoveLabel'),
    tokenEditorTokenRemoveFromGroupLabel: t(
      'i18n.tokenEditorTokenRemoveFromGroupLabel'
    ),
    tokenEditorAddTokenActionsAriaLabel: t(
      'i18n.tokenEditorAddTokenActionsAriaLabel'
    ),
    tokenEditorAddNewTokenLabel: t('i18n.tokenEditorAddNewTokenLabel'),
    tokenEditorAddExistingTokenLabel: (
      token: PropertyFilterProps.FormattedToken
    ) =>
      `Add rule ${token.propertyLabel} ${token.operator} ${token.value} to group`,
  };

  useEffect(() => {
    // Prevent conditional logic from being added to itself
    const filteredUISchemaElements = flattenedUISchemaElements.filter(
      (element) => {
        return element.id !== currentFieldId;
      }
    );

    const filtering = filteredUISchemaElements.reduce(
      (
        acc: {
          filteringProperties: PropertyFilterProperty[];
          filteringOptions: PropertyFilterOption[];
        },
        element
      ): {
        filteringProperties: PropertyFilterProperty[];
        filteringOptions: PropertyFilterOption[];
      } => {
        if (!globalSchema?.properties) {
          return acc;
        }

        if (!supportsConditionalLogic(element?.options?.fieldType)) {
          return acc;
        }

        const options = usesItemsOneOf(element?.options?.fieldType)
          ? globalSchema?.properties[element.id]?.items?.oneOf
          : globalSchema?.properties[element.id]?.oneOf;

        return {
          filteringProperties: [
            ...acc.filteringProperties,
            {
              key: element.id,
              propertyLabel: element.label ?? '',
              groupValuesLabel: `${element.label} values`,
              operators: ['='].map((operator) => {
                return {
                  operator,
                  tokenType: 'enum',
                  format: (value: string[]) => {
                    const optionTitles = options
                      ?.filter((option) => value.includes(option.const))
                      .map((option) => option.title)
                      .join(', ');

                    return optionTitles ?? '';
                  },
                  match: (value: unknown, tokenValue: string) => {
                    return value === tokenValue;
                  },
                };
              }),
            },
          ],
          filteringOptions: [
            ...acc.filteringOptions,
            ...(options ?? []).map((option) => ({
              propertyKey: element.id,
              value: option.const,
              label: option.title,
            })),
          ],
        };
      },
      { filteringProperties: [], filteringOptions: [] }
    );

    setFilteringOptions(filtering.filteringOptions);
    setFilteringProperties(filtering.filteringProperties);
  }, [flattenedUISchemaElements, globalSchema, currentFieldId, data]);

  return (
    <CustomisableControl
      id={path}
      uischema={uischema}
      errors={nestedErrors ? nestedErrors : errors}
      schema={schema}
      required={required}
      visible={visible}
    >
      <div className={'pb-6'}>
        {filteringProperties?.length === 0 ? (
          <div className={'font-normal italic'}>
            {
              'No valid sources for conditional logic. Create a dropdown or radio field first.'
            }
          </div>
        ) : (
          <PropertyFilter
            query={{ operation: 'and', tokens: data?.tokens ?? [] }}
            onChange={({ detail }) => handleChange(path, detail)}
            hideOperations // TODO: Remove this to re-enable 'OR' filtering
            expandToViewport
            filteringAriaLabel={'Add a rule'}
            filteringPlaceholder={'Add a rule'}
            i18nStrings={i18nStrings}
            filteringOptions={filteringOptions || []}
            filteringProperties={filteringProperties || []}
          />
        )}
      </div>
    </CustomisableControl>
  );
};

export const AddConditionalControl = withJsonFormsControlProps(
  // For more info on why this is ignored, see `Known Issues` in `@risksmart-app/docs/form-builder.md`
  // @ts-ignore
  AddConditionalControlUnwrapped
);
