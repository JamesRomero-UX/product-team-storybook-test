import type {
  DepartmentPartsFragment,
  GetTestResultsQuery,
  TagPartsFragment,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import type { CollectionData } from '@/utils/collectionUtils';

export type ControlTestFields = CollectionData<
  GetTestResultsQuery['test_result'][number]
>;

export type ControlTestTableFields = Omit<ControlTestFields, 'SequentialId'> & {
  TestTypeLabelled: string;
  SubmitterNameLabelled: null | string;
  DesignEffectivenessLabelled: null | string;
  PerformanceEffectivenessLabelled: null | string;
  OverallEffectivenessLabelled: null | string;
  ParentTitle: null | string;
  CreatedByUserName: null | string;
  ControlSequentialId: string;
  tags: TagPartsFragment[];
  departments: DepartmentPartsFragment[];
  SequentialId: string;
};
