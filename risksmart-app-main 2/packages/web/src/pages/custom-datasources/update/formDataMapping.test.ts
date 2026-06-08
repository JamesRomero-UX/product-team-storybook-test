import type { TypedCustomDatasource } from '../types';
import type { CustomDatasourceFormData } from './customDatasourceSchema';
import {
  mapFromDataToServerVariables,
  mapServerDataToFormData,
} from './formDataMapping';

describe('formDataMapping', () => {
  describe('mapServerDataToFormData', () => {
    const defaultCustomDatasource: TypedCustomDatasource = {
      Title: '',
      Id: '',
      CreatedByUser: '',
      ModifiedByUser: '',
      CreatedAtTimestamp: '',
      ModifiedAtTimestamp: '',
      Datasources: [],
    };

    it('sets relationshipToParentIndex to null when there is no parentIndex (ensures backwards compatibility with datasources pre-dating relationshipToParentIndex)', () => {
      const result = mapServerDataToFormData({
        ...defaultCustomDatasource,
        Datasources: [
          {
            type: 'issues',
          },
        ],
      });
      expect(result.dataSource.relationshipToParentIndex).toEqual(null);
    });

    it('sets relationshipToParentIndex to "child" when there is a parentIndex (ensures backwards compatibility with datasources pre-dating relationshipToParentIndex)', () => {
      const result = mapServerDataToFormData({
        ...defaultCustomDatasource,
        Datasources: [
          {
            type: 'risks',
          },
          {
            type: 'controls',
            parentIndex: 0,
          },
        ],
      });
      expect(result.dataSource.children[0].relationshipToParentIndex).toEqual(
        'child'
      );
    });

    it('sets relationshipToParentIndex', () => {
      const result = mapServerDataToFormData({
        ...defaultCustomDatasource,
        Datasources: [
          {
            type: 'risks',
          },
          {
            type: 'controls',
            parentIndex: 0,
            relationshipToParentIndex: 'parent',
          },
        ],
      });
      expect(result.dataSource.children[0].relationshipToParentIndex).toEqual(
        'parent'
      );
    });

    it('sets the joinType', () => {
      const result = mapServerDataToFormData({
        ...defaultCustomDatasource,
        Datasources: [
          {
            type: 'risks',
          },
          {
            type: 'controls',
            parentIndex: 0,
            relationshipToParentIndex: 'parent',
            joinType: 'left',
          },
        ],
      });
      expect(result.dataSource.children[0].joinType).toEqual('left');
    });

    it('defaults joinType to inner', () => {
      const result = mapServerDataToFormData({
        ...defaultCustomDatasource,
        Datasources: [
          {
            type: 'risks',
          },
          {
            type: 'controls',
            parentIndex: 0,
            relationshipToParentIndex: 'parent',
          },
        ],
      });
      expect(result.dataSource.children[0].joinType).toEqual('inner');
    });

    it('sets latest when provided', () => {
      const result = mapServerDataToFormData({
        ...defaultCustomDatasource,
        Datasources: [
          {
            type: 'risks',
          },
          {
            type: 'testResults',
            parentIndex: 0,
            relationshipToParentIndex: 'child',
            latest: true,
          },
        ],
      });
      expect(result.dataSource.children[0].latest).toEqual(true);
    });

    it('defaults latest to false', () => {
      const result = mapServerDataToFormData({
        ...defaultCustomDatasource,
        Datasources: [
          {
            type: 'risks',
          },
          {
            type: 'testResults',
            parentIndex: 0,
            relationshipToParentIndex: 'child',
          },
        ],
      });
      expect(result.dataSource.children[0].latest).toEqual(false);
    });
  });

  describe('mapFromDataToServerVariables', () => {
    const defaultFormData: CustomDatasourceFormData = {
      title: '',
      filters: { tokens: [], tokenGroups: [], operation: 'and' },
      dataSource: {
        type: 'risks',
        children: [],
        fields: [],
      },
    };

    it('returns fields in same order if fieldValueOrder is undefined', () => {
      const result = mapFromDataToServerVariables(
        {
          ...defaultFormData,
          dataSource: {
            type: 'risks',
            children: [],
            fields: [
              {
                fieldId: 'title',
              },
              {
                fieldId: 'id',
              },
            ],
          },
        },
        { offset: 0, limit: 20 },
        undefined
      );
      expect(result.fields.length).toEqual(2);
      expect(result.fields[0].fieldId).toEqual('title');
      expect(result.fields[1].fieldId).toEqual('id');
    });

    it('returns fields in order of fieldValueOrder', () => {
      const result = mapFromDataToServerVariables(
        {
          ...defaultFormData,
          dataSource: {
            type: 'risks',
            children: [],
            fields: [
              {
                fieldId: 'title',
              },
              {
                fieldId: 'id',
              },
            ],
          },
        },
        { offset: 0, limit: 20 },
        ['0|id', '0|title']
      );
      expect(result.fields.length).toEqual(2);
      expect(result.fields[0].fieldId).toEqual('id');
      expect(result.fields[1].fieldId).toEqual('title');
    });
  });
});
