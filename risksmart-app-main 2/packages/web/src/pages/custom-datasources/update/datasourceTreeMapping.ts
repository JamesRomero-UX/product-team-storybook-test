import _ from 'lodash';

import type { TypedCustomDatasource } from '../types';
import type { TreeDataSource } from './customDatasourceSchema';
import type { RelatedDataSourceWithFields } from './types';

/**
 * Converts a tree of data sources into a list, with joins based on parent index
 * @param root
 * @returns
 */
export const getFlattenedDataSources = (
  root: TreeDataSource
): RelatedDataSourceWithFields[] => {
  const dataSources: RelatedDataSourceWithFields[] = [];
  const flattenDataSourceTree = (
    datasource: TreeDataSource,
    parentIndex: number | undefined
  ) => {
    if (!datasource.type) {
      return;
    }
    dataSources.push({
      type: datasource.type,
      parentIndex,
      joinType: datasource.joinType,
      fields: datasource.fields,
      relationshipToParentIndex: datasource.relationshipToParentIndex,
      latest: !!datasource.latest,
    });
    const currentIndex = dataSources.length - 1;
    datasource.children.forEach((childDataSource) => {
      flattenDataSourceTree(childDataSource, currentIndex);
    });
  };
  flattenDataSourceTree(root, undefined);

  return dataSources;
};

/**
 * Converts a list of data sources into a tree as required by the data source component
 * @param dataSources
 * @returns
 */
export const getTreeDataSources = ({
  Datasources,
  Fields,
}: TypedCustomDatasource): TreeDataSource => {
  const dsIndexes = Datasources.map((ds, index) => ({ ds, index }));

  const mapToTreeDataSource = (dsIndex: number | undefined) => {
    const matchingDs = dsIndexes.find(({ index }) => index === dsIndex);
    if (!matchingDs) {
      throw new Error(`Missing datasource at index ${dsIndex}`);
    }

    const children = dsIndexes.filter(
      ({ ds: childDs }) => childDs.parentIndex === matchingDs.index
    );

    const hasParent = !_.isNil(matchingDs.ds.parentIndex);
    const treeItem: TreeDataSource = {
      type: matchingDs.ds.type,
      joinType: matchingDs.ds.joinType ?? 'inner',
      children: children.map(({ index }) => mapToTreeDataSource(index)),
      fields: Fields?.filter((f) => f.dataSourceIndex === dsIndex) ?? [],
      relationshipToParentIndex: hasParent
        ? (matchingDs.ds.relationshipToParentIndex ?? 'child')
        : null,
      latest: matchingDs.ds.latest ?? false,
    };

    return treeItem;
  };

  return mapToTreeDataSource(0);
};
