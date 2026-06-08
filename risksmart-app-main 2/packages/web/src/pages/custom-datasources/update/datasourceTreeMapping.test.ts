import { getFlattenedDataSources } from './datasourceTreeMapping';

describe('datasourceTreeMapping', () => {
  describe('getFlattenedDataSources', () => {
    it('Single data source', () => {
      const result = getFlattenedDataSources({
        type: 'risks',
        fields: [],
        children: [],
      });
      expect(result).toEqual([
        {
          parentIndex: undefined,
          type: 'risks',
          fields: [],
          latest: false,
        },
      ]);
    });

    it('Single child data source', () => {
      const result = getFlattenedDataSources({
        type: 'risks',
        fields: [],
        children: [{ type: 'controls', fields: [], children: [] }],
      });
      expect(result).toEqual([
        { type: 'risks', parentIndex: undefined, fields: [], latest: false },
        { type: 'controls', parentIndex: 0, fields: [], latest: false },
      ]);
    });

    it('Nested child data sources', () => {
      const result = getFlattenedDataSources({
        type: 'risks',
        fields: [],
        children: [
          {
            type: 'controls',
            fields: [],
            children: [{ type: 'issues', fields: [], children: [] }],
          },
        ],
      });

      expect(result).toEqual([
        { type: 'risks', parentIndex: undefined, fields: [], latest: false },
        { type: 'controls', parentIndex: 0, fields: [], latest: false },
        { type: 'issues', parentIndex: 1, fields: [], latest: false },
      ]);
    });

    it('Nested multiple child data sources', () => {
      const result = getFlattenedDataSources({
        type: 'risks',
        fields: [],
        children: [
          { type: 'controls', fields: [], children: [] },
          {
            type: 'controls',
            fields: [],
            children: [{ type: 'issues', fields: [], children: [] }],
          },
        ],
      });
      expect(result).toEqual([
        { type: 'risks', parentIndex: undefined, fields: [], latest: false },
        { type: 'controls', parentIndex: 0, fields: [], latest: false },
        { type: 'controls', parentIndex: 0, fields: [], latest: false },
        { type: 'issues', parentIndex: 2, fields: [], latest: false },
      ]);
    });

    it('Nested data source parent indexes are correct', () => {
      const result = getFlattenedDataSources({
        type: 'risks',
        fields: [],
        children: [
          { type: 'riskAssessmentResults', fields: [], children: [] },
          {
            type: 'controls',
            fields: [],
            children: [{ type: 'testResults', fields: [], children: [] }],
          },
        ],
      });
      expect(result).toEqual([
        { type: 'risks', parentIndex: undefined, fields: [], latest: false },
        {
          type: 'riskAssessmentResults',
          parentIndex: 0,
          fields: [],
          latest: false,
        },
        { type: 'controls', parentIndex: 0, fields: [], latest: false },
        { type: 'testResults', parentIndex: 2, fields: [], latest: false },
      ]);
    });
  });
});
