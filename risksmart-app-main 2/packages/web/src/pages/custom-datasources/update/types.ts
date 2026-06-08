import type { DatasourceRelationshipType } from '@risksmart-app/shared/reporting/api/schema';
import type {
  DataSourceType,
  JoinType,
} from '@risksmart-app/shared/reporting/schema';
import type { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { CustomAttributeSchema } from 'src/components/form/custom-attributes/CustomAttributeSchema';

import type { SelectedField } from './field-selection/fieldSelectionSchema';

export type CustomAttributeSchemaLookup = {
  [parentType in Parent_Type_Enum]?: CustomAttributeSchema;
};

export type RelatedDataSource = {
  type: DataSourceType;
  parentIndex?: number;
  joinType?: JoinType | null;
  relationshipToParentIndex?: DatasourceRelationshipType | null;
  latest?: boolean;
};

export type RelatedDataSourceWithFields = RelatedDataSource & {
  fields: SelectedField[];
};
