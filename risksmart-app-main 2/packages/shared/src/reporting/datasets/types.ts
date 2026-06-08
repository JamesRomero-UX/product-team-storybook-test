import type { ParentType } from '@risksmart-app/domain/src/types/consts';
import type { ModuleKey } from '@risksmart-app/modules/src/index';

import type { FieldRegistryLookup } from '../../forms/formConfigRegistry';
import type { DataSourceType } from '../../reporting/schema';
import type { DatasourceRelationshipType } from '../api/schema';
import type { FieldTypeDefinition } from '../display-types';

export type DataType =
  | 'bool'
  | 'date'
  | 'guid'
  | 'number'
  | 'text'
  | 'textArray';

export type DatasetRelationships = {
  [datasourceType in DataSourceType]?: DatasourceRelationshipType[];
};

/**
 * Dataset info shared between front end and backend.
 * This avoids database implementation details existing on the front end,
 * and avoids needing i18n on the backend (for now!)
 */
export interface SharedDataset {
  /* If true, this dataset supports getting the latest record for each parent.
   */
  supportedLatest?: boolean;

  /**
   * Returns true if the user has access to this data source based on module enablement
   * @param isModuleEnabled
   * @returns
   */
  hasAccess: (isModuleEnabled: (moduleKey: ModuleKey) => boolean) => boolean;
  /**
   * Basically this is the value saved in the risksmart.node table for this type of entity.
   * It's important to set this to allow for correct filtering on the risksmart.linked_item table
   */
  objectType?: ParentType;
  label: string /**
   * Don't show data source to end users
   */;
  disabled?: boolean;

  /**
   * Some relationships aren't correctly automatically detected.
   * Can override specific relationships here.
   * Cases such a risk being a parent and child of another risk
   */
  datasetRelationshipOverrides?: DatasetRelationships;

  /**
   * Data source fields (does not include custom attributes)
   */
  fields: SharedFields;

  /**
   * When specified, retrieves custom attributes fields
   */
  customAttributeFormConfigurationParentTypes?: ParentType[];
}

export type DisplayType = FieldTypeDefinition['displayType'];

export type DefaultLabelOrFormConfig =
  | {
      /**
       * System defined label. Can be overridden by user
       */
      defaultLabel: string;
    }
  | {
      /**
       * Link this field to a form element, so if the form field is renamed, the default label reflects this
       */
      formConfig: FieldRegistryLookup;
    };
export type FieldDefinition = DefaultLabelOrFormConfig & {
  /**
   * Only show this field if the data source is a child of another data set.
   * This is useful for columns that exist on a join table between two data sources
   * e.g. appetite status only has context when it's a child of a risk
   */
  onlyShowIfChild?: boolean;
  /**
   * How the data is stored/queried.
   * This value determines what sort of aggregation is possible etc
   */
  dataType: DataType;
} & FieldTypeDefinition;

export interface SharedFields {
  [fieldId: string]: FieldDefinition;
}

export type SharedDatasets = { [datasource in DataSourceType]: SharedDataset };
