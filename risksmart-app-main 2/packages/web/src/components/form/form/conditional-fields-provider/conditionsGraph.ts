import type { OrgFeature } from '@risksmart-app/modules/src/index';
import {
  type FormId,
  getFormConfigRegistry,
} from '@risksmart-app/shared/forms/formConfigRegistry';
import type { VertexBody } from 'digraph-js';
import { DiGraph } from 'digraph-js';
import _ from 'lodash';
import type { FieldValues } from 'react-hook-form';
import type { Helpers } from 'src/pages/custom-datasources/update/display-types/types';

import { processItems } from '../../../../../node_modules/@cloudscape-design/collection-hooks/mjs/operations';
import { getConditionalPropertyFilterProps } from '../../edit-field-modal/formRegistryService';
import type {
  CustomisableFormDataContextState,
  TypedFormFieldConfiguration,
} from '../customisable-form-data/CustomisableFormDataContext';

export type ConditionGraph = DiGraph<{
  id: string;
  body: VertexBody;
  adjacentTo: string[];
}>;

export type ConditionalField = Pick<
  TypedFormFieldConfiguration,
  'FieldId' | 'Conditions'
>;

export type ConditionalFields = ConditionalField[];

/**
 * Builds a directed graph from field conditions.
 * The function creates a graph where each node represents a field and edges represent
 * conditional dependencies between fields.
 *
 * @returns DiGraph - Graph of all fields and their dependencies
 */
export const buildFieldConditionGraph = (
  fields: ConditionalField[]
): ConditionGraph => {
  // Build adjacency list representation of the dependency graph
  const graph = new DiGraph();

  fields.forEach((field) => {
    graph.addVertices({ id: field.FieldId, adjacentTo: [], body: {} });
  });

  fields.forEach((field) => {
    (field.Conditions?.tokenGroups || []).forEach((tokenGroup) => {
      if ('tokens' in tokenGroup) {
        tokenGroup.tokens.forEach((token) => {
          graph.addEdge({ from: token.propertyKey || '', to: field.FieldId });
        });
      } else {
        graph.addEdge({
          from: tokenGroup.propertyKey || '',
          to: field.FieldId,
        });
      }
    });
  });

  return graph;
};

/**
 * Returns the passed fieldId, and all of its ancestors
 */
export const getAncestorsAndSelf = (
  fieldGraph: ConditionGraph,
  fieldId: string
): string[] => [fieldId, ...Array.from(fieldGraph.getDeepParents(fieldId))];

/**
 * Retrieves a set of field ids that are conditionally hidden based on the current form values and
 * the visibility of any ancestor fields.
 * @param options - Configuration options for determining hidden fields
 * @returns
 */
export const getHiddenFields = (options: {
  formId: FormId;
  customisableData: CustomisableFormDataContextState;
  fieldConditionGraph: ConditionGraph;

  currentValues: FieldValues;
  helpers: Helpers;
  enabledFeatures: OrgFeature[];
}): Set<string> => {
  const {
    formId,
    customisableData,
    fieldConditionGraph,
    currentValues,
    helpers,
    enabledFeatures,
  } = options;
  const { formFieldConfigurations, customAttributeSchema } = customisableData;
  const formConfigRegistry = getFormConfigRegistry(enabledFeatures);
  const formConfig = formConfigRegistry[formId];

  const fieldsWithConditions =
    formFieldConfigurations?.filter(
      (ff) => ff.Conditions && ff.Conditions.tokenGroups.length > 0
    ) ?? [];

  const filteringProps = getConditionalPropertyFilterProps({
    formId,
    schema: customAttributeSchema?.Schema,
    uiSchema: customAttributeSchema?.UiSchema,
    data: { departmentTypes: [], users: [], tagTypes: [], userGroups: [] }, // No data needed for visibility evaluation,
    enabledFeatures,
    helpers,
    getStandardFieldLabel: () => '', // No data needed for visibility evaluation,
  });

  // Store IDs of any fields that are hidden because their form sections are hidden
  const hiddenSectionFieldIds = new Set<string>();
  for (const fieldConfig of Object.values(formConfig)) {
    if (
      fieldConfig.visibilityControlledByFieldId &&
      !currentValues[fieldConfig.visibilityControlledByFieldId]
    ) {
      hiddenSectionFieldIds.add(fieldConfig.fieldId);
    }
  }

  // Copy field values and flatten custom attribute data for condition evaluation
  const visibleFieldValues: FieldValues = {
    ...currentValues,
    ...(!currentValues.CustomAttributeData
      ? {}
      : Object.entries(currentValues.CustomAttributeData).reduce(
          (acc, [key, value]) => ({
            ...acc,
            [`CustomAttributeData.${key}`]: value,
          }),
          {}
        )),
  };

  // Only evaluate conditions for fields whose sections are visible
  for (const hiddenFieldId of Array.from(hiddenSectionFieldIds)) {
    delete visibleFieldValues[hiddenFieldId];
  }

  const directConditionIsFieldVisible: Record<string, boolean> = {};
  for (const fieldWithCondition of fieldsWithConditions) {
    const filteredItems = processItems(
      [visibleFieldValues],
      {
        propertyFilteringQuery: fieldWithCondition.Conditions ?? undefined,
      },
      {
        propertyFiltering: {
          filteringProperties: filteringProps.filteringProperties,
          defaultQuery: fieldWithCondition.Conditions ?? undefined,
        },
      }
    );

    directConditionIsFieldVisible[fieldWithCondition.FieldId] =
      !!filteredItems.items.length;
  }

  const hiddenBySelfOrAncestors = new Set<string>();

  for (const fieldId of Object.keys(directConditionIsFieldVisible)) {
    const ancestors = getAncestorsAndSelf(fieldConditionGraph, fieldId);
    const anyAncestorsHidden = ancestors.some(
      (ancestor) => directConditionIsFieldVisible[ancestor] === false
    );
    if (anyAncestorsHidden) {
      hiddenBySelfOrAncestors.add(fieldId);
    }
  }

  return hiddenBySelfOrAncestors;
};
