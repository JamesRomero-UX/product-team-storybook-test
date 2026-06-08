import type {
  AggregateType,
  DataSourceType,
} from '@risksmart-app/shared/reporting/schema';
import { ParentTypeEnum } from 'generated/graphql';

import { getReportDataSql } from './sqlQueryBuilder';

describe('sqlQueryBuilder', () => {
  describe('test results', () => {
    it('can query test results', async () => {
      const result = await getReportDataSql({
        dataSources: [{ type: 'testResults' }],
        fields: [{ fieldId: 'title', dataSourceIndex: 0 }],
        customAttributeSchemaLookup: {},
      });
      expect(result.sql).toEqual(`select
  "t0"."Title" as "f0"
from
  "risksmart"."test_result" as "t0"`);
    }); /**
     * Latest datasets rely on views which show the latest records for each parent.
     * If the dataset can be joined to multiple parent (many to many), then the user would see duplicate results
     * if there was no parent specified.
     */
    it('cannot query latest test results without a parent', async () => {
      await expect(
        getReportDataSql({
          dataSources: [{ type: 'testResults', latest: true }],
          fields: [{ fieldId: 'title', dataSourceIndex: 0 }],
          customAttributeSchemaLookup: {},
        })
      ).rejects.toThrow('Cannot query latest testResults without a parent');
    });

    it('can query latest test results of a control', async () => {
      const result = await getReportDataSql({
        dataSources: [
          { type: 'controls' },
          { type: 'testResults', latest: true, parentIndex: 0 },
        ],
        fields: [
          { fieldId: 'title', dataSourceIndex: 0 },
          { fieldId: 'title', dataSourceIndex: 1 },
        ],
        customAttributeSchemaLookup: {},
      });
      expect(result.sql).toEqual(`select
  "t0"."Title" as "f0",
  "t1"."Title" as "f1"
from
  "risksmart"."control" as "t0"
  inner join "risksmart"."latest_test_result_view" as "t1" on "t1"."ParentId" = "t0"."Id"`);
    });
  });

  describe('risk assessment results', () => {
    it('can query risk assessment results', async () => {
      const result = await getReportDataSql({
        dataSources: [{ type: 'riskAssessmentResults' }],
        fields: [{ fieldId: 'id', dataSourceIndex: 0 }],
        customAttributeSchemaLookup: {},
      });
      expect(result.sql).toEqual(`select
  "t0"."Id" as "f0"
from
  "risksmart"."risk_assessment_result" as "t0"`);
    }); /**
     * Latest datasets rely on views which show the latest records for each parent.
     * If the dataset can be joined to multiple parent (many to many), then the user would see duplicate results
     * if there was no parent specified.
     */
    it('cannot query latest risk assessment results without a parent', async () => {
      await expect(
        getReportDataSql({
          dataSources: [{ type: 'riskAssessmentResults', latest: true }],
          fields: [{ fieldId: 'id', dataSourceIndex: 0 }],
          customAttributeSchemaLookup: {},
        })
      ).rejects.toThrow(
        'Cannot query latest riskAssessmentResults without a parent'
      );
    });

    it('can query latest risk assessment results of a control', async () => {
      const result = await getReportDataSql({
        dataSources: [
          { type: 'risks' },
          { type: 'riskAssessmentResults', latest: true, parentIndex: 0 },
        ],
        fields: [
          { fieldId: 'title', dataSourceIndex: 0 },
          { fieldId: 'id', dataSourceIndex: 1 },
        ],
        customAttributeSchemaLookup: {},
      });
      expect(result.sql).toEqual(`select
  "t0"."Title" as "f0",
  "t1"."Id" as "f1"
from
  "risksmart"."risk" as "t0"
  inner join "risksmart"."latest_risk_assessment_result_view" as "t1" on "t1"."ParentId" = "t0"."Id"`);
    });
  });

  it('should throw an error if no data sources are specified', async () => {
    await expect(
      getReportDataSql({
        dataSources: [],
        fields: [],
        customAttributeSchemaLookup: {},
      })
    ).rejects.toThrow('At least 1 datasource is required');
  });

  it('should throw an error if there is not a datasource without parents', async () => {
    await expect(
      getReportDataSql({
        dataSources: [
          { type: 'risks', parentIndex: 1 },
          { type: 'risks', parentIndex: 0 },
        ],
        fields: [],
        customAttributeSchemaLookup: {},
      })
    ).rejects.toThrow('At least 1 datasource must have no parents');
  });

  it('should throw an error if specifying an unknown datasource', async () => {
    await expect(
      getReportDataSql({
        dataSources: [{ type: 'wrong' as unknown as DataSourceType }],
        fields: [],
        customAttributeSchemaLookup: {},
      })
    ).rejects.toThrow('Datasource not found for "wrong"');
  });

  it('should throw an error if no fields are specified', async () => {
    await expect(
      getReportDataSql({
        dataSources: [{ type: 'risks' }],
        fields: [],
        customAttributeSchemaLookup: {},
      })
    ).rejects.toThrow('At least 1 field is required');
  });

  it('should throw an error if a specified field datasource does not exist', async () => {
    await expect(
      getReportDataSql({
        dataSources: [{ type: 'risks' }],
        fields: [{ dataSourceIndex: 1, fieldId: 'wrong' }],
        customAttributeSchemaLookup: {},
      })
    ).rejects.toThrow('Datasource at index 1 which does not exist');
  });

  it('should throw an error if a specified field does not exist on the datasource', async () => {
    await expect(
      getReportDataSql({
        dataSources: [{ type: 'risks' }],
        fields: [{ dataSourceIndex: 0, fieldId: 'wrong' }],
        customAttributeSchemaLookup: {},
      })
    ).rejects.toThrow('Field "wrong" does not exist on datasource "risks"');
  });

  it('can generate a query for a single table', async () => {
    const result = await getReportDataSql({
      dataSources: [{ type: 'risks' }],
      fields: [{ fieldId: 'title', dataSourceIndex: 0 }],
      customAttributeSchemaLookup: {},
    });
    expect(result.sql).toEqual(`select
  "t0"."Title" as "f0"
from
  "risksmart"."risk" as "t0"`);
  });

  it('can return distinct results', async () => {
    const result = await getReportDataSql({
      dataSources: [{ type: 'risks' }],
      fields: [{ fieldId: 'title', dataSourceIndex: 0 }],
      customAttributeSchemaLookup: {},
      distinct: true,
    });
    expect(result.sql).toEqual(`select distinct
  "t0"."Title" as "f0"
from
  "risksmart"."risk" as "t0"`);
  });

  it('can offset results', async () => {
    const result = await getReportDataSql({
      dataSources: [{ type: 'risks' }],
      fields: [{ fieldId: 'title', dataSourceIndex: 0 }],
      offset: 20,
      customAttributeSchemaLookup: {},
    });
    expect(result.sql).toEqual(`select
  "t0"."Title" as "f0"
from
  "risksmart"."risk" as "t0"
offset
  $1`);
  });

  it('can limit results', async () => {
    const result = await getReportDataSql({
      dataSources: [{ type: 'risks' }],
      fields: [{ fieldId: 'title', dataSourceIndex: 0 }],
      limit: 20,
      customAttributeSchemaLookup: {},
    });
    expect(result.sql).toEqual(`select
  "t0"."Title" as "f0"
from
  "risksmart"."risk" as "t0"
limit
  $1`);
  });

  it('supports multiple datasources of the same type being joined together', async () => {
    const result = await getReportDataSql({
      dataSources: [{ type: 'risks' }, { type: 'risks', parentIndex: 0 }],
      fields: [
        { fieldId: 'title', dataSourceIndex: 0 },
        { fieldId: 'title', dataSourceIndex: 1 },
      ],
      customAttributeSchemaLookup: {},
    });

    expect(result.sql).toEqual(`select
  "t0"."Title" as "f0",
  "t1"."Title" as "f1"
from
  "risksmart"."risk" as "t0"
  inner join "risksmart"."risk" as "t1" on "t1"."ParentRiskId" = "t0"."Id"`);
  });

  it('supports multiple datasources of the same type being left joined together', async () => {
    const result = await getReportDataSql({
      dataSources: [
        { type: 'risks' },
        { type: 'risks', parentIndex: 0, joinType: 'left' },
      ],
      fields: [
        { fieldId: 'title', dataSourceIndex: 0 },
        { fieldId: 'title', dataSourceIndex: 1 },
      ],
      customAttributeSchemaLookup: {},
    });
    expect(result.sql).toEqual(`select
  "t0"."Title" as "f0",
  "t1"."Title" as "f1"
from
  "risksmart"."risk" as "t0"
  left join "risksmart"."risk" as "t1" on "t1"."ParentRiskId" = "t0"."Id"`);
  });

  it('can join items with sibling associations (i.e. linked items) - controls to acceptances', async () => {
    const result = await getReportDataSql({
      dataSources: [
        { type: 'controls' },
        {
          type: 'acceptances',
          parentIndex: 0,
          relationshipToParentIndex: 'sibling',
        },
      ],
      fields: [
        { fieldId: 'title', dataSourceIndex: 0 },
        { fieldId: 'title', dataSourceIndex: 1 },
      ],
      customAttributeSchemaLookup: {},
    });

    expect(result.sql).toEqual(`select
  "t0"."Title" as "f0",
  "t1"."Title" as "f1"
from
  "risksmart"."control" as "t0"
  inner join "risksmart"."linked_item" as "t1-join" on "t1-join"."Source" = "t0"."Id"
  and "t1-join"."TargetType" = 'acceptance'
  and "t1-join"."SourceType" = 'control'
  inner join "risksmart"."acceptance" as "t1" on "t1"."Id" = "t1-join"."Target"`);
  });

  it('can join items with sibling associations (i.e. linked items)  - acceptances to controls', async () => {
    const result = await getReportDataSql({
      dataSources: [
        { type: 'acceptances' },
        {
          type: 'controls',
          parentIndex: 0,
          relationshipToParentIndex: 'sibling',
        },
      ],
      fields: [
        { fieldId: 'title', dataSourceIndex: 0 },
        { fieldId: 'title', dataSourceIndex: 1 },
      ],
      customAttributeSchemaLookup: {},
    });
    expect(result.sql).toEqual(`select
  "t0"."Title" as "f0",
  "t1"."Title" as "f1"
from
  "risksmart"."acceptance" as "t0"
  inner join "risksmart"."linked_item" as "t1-join" on "t1-join"."Source" = "t0"."Id"
  and "t1-join"."TargetType" = 'control'
  and "t1-join"."SourceType" = 'acceptance'
  inner join "risksmart"."control" as "t1" on "t1"."Id" = "t1-join"."Target"`);
  });

  it('risks can join to parent risk', async () => {
    const result = await getReportDataSql({
      dataSources: [
        { type: 'risks' },
        { type: 'risks', parentIndex: 0, relationshipToParentIndex: 'parent' },
      ],
      fields: [
        { fieldId: 'tier', dataSourceIndex: 0 },
        { fieldId: 'tier', dataSourceIndex: 1 },
      ],
      customAttributeSchemaLookup: {},
    });

    expect(result.sql).toEqual(`select
  "t0"."Tier" as "f0",
  "t1"."Tier" as "f1"
from
  "risksmart"."risk" as "t0"
  inner join "risksmart"."risk" as "t1" on "t0"."ParentRiskId" = "t1"."Id"`);
  });

  it('risks can join to child risk', async () => {
    const result = await getReportDataSql({
      dataSources: [
        { type: 'risks' },
        { type: 'risks', parentIndex: 0, relationshipToParentIndex: 'child' },
      ],
      fields: [
        { fieldId: 'tier', dataSourceIndex: 0 },
        { fieldId: 'tier', dataSourceIndex: 1 },
      ],
      customAttributeSchemaLookup: {},
    });
    expect(result.sql).toEqual(`select
  "t0"."Tier" as "f0",
  "t1"."Tier" as "f1"
from
  "risksmart"."risk" as "t0"
  inner join "risksmart"."risk" as "t1" on "t1"."ParentRiskId" = "t0"."Id"`);
  });

  it('can join child to parent with a many to many relationship', async () => {
    const result = await getReportDataSql({
      dataSources: [
        { type: 'riskAssessmentResults' },
        { type: 'risks', parentIndex: 0, relationshipToParentIndex: 'parent' },
      ],
      fields: [
        { fieldId: 'controlType', dataSourceIndex: 0 },
        { fieldId: 'title', dataSourceIndex: 1 },
      ],
      customAttributeSchemaLookup: {},
    });

    expect(result.sql).toEqual(`select
  "t0"."ControlType" as "f0",
  "t1"."Title" as "f1"
from
  "risksmart"."risk_assessment_result" as "t0"
  inner join "risksmart"."assessment_result_parent" as "t1-join" on "t1-join"."Id" = "t0"."Id"
  inner join "risksmart"."risk" as "t1" on "t1"."Id" = "t1-join"."ParentId"`);
  });

  it('throws an error when attempted to do an unsupported join between two data sources', async () => {
    await expect(
      getReportDataSql({
        dataSources: [
          { type: 'risks' },
          {
            type: 'risks',
            parentIndex: 0,
            relationshipToParentIndex: 'sibling',
          },
        ],
        fields: [{ fieldId: 'title', dataSourceIndex: 0 }],
        customAttributeSchemaLookup: {},
      })
    ).rejects.toThrow(`Unsupported "sibling" join between "risks" and "risks"`);
  });

  it('supports joining two datasources with many to many join', async () => {
    const result = await getReportDataSql({
      dataSources: [{ type: 'risks' }, { type: 'controls', parentIndex: 0 }],
      fields: [{ fieldId: 'title', dataSourceIndex: 0 }],
      customAttributeSchemaLookup: {},
    });
    expect(result.sql).toEqual(`select
  "t0"."Title" as "f0"
from
  "risksmart"."risk" as "t0"
  inner join "risksmart"."control_parent" as "t1-join" on "t1-join"."ParentId" = "t0"."Id"
  inner join "risksmart"."control" as "t1" on "t1"."Id" = "t1-join"."ControlId"`);
  });

  it('supports selecting from multiple tables in a many to many join', async () => {
    const result = await getReportDataSql({
      dataSources: [{ type: 'risks' }, { type: 'controls', parentIndex: 0 }],
      fields: [
        { fieldId: 'title', dataSourceIndex: 0 },
        { fieldId: 'title', dataSourceIndex: 1 },
      ],
      customAttributeSchemaLookup: {},
    });
    expect(result.sql).toEqual(`select
  "t0"."Title" as "f0",
  "t1"."Title" as "f1"
from
  "risksmart"."risk" as "t0"
  inner join "risksmart"."control_parent" as "t1-join" on "t1-join"."ParentId" = "t0"."Id"
  inner join "risksmart"."control" as "t1" on "t1"."Id" = "t1-join"."ControlId"`);
  });

  it('supports left joins between datasources with a many to many join', async () => {
    const result = await getReportDataSql({
      dataSources: [
        { type: 'risks' },
        { type: 'controls', parentIndex: 0, joinType: 'left' },
      ],
      fields: [
        { fieldId: 'title', dataSourceIndex: 0 },
        { fieldId: 'title', dataSourceIndex: 1 },
      ],
      customAttributeSchemaLookup: {},
    });
    expect(result.sql).toEqual(`select
  "t0"."Title" as "f0",
  "t1"."Title" as "f1"
from
  "risksmart"."risk" as "t0"
  left join "risksmart"."control_parent" as "t1-join" on "t1-join"."ParentId" = "t0"."Id"
  left join "risksmart"."control" as "t1" on "t1"."Id" = "t1-join"."ControlId"`);
  });

  describe('aggregation', () => {
    it('can get count without grouping', async () => {
      const result = await getReportDataSql({
        dataSources: [{ type: 'risks' }],
        aggregateType: 'count',
        groupBy: undefined,
        customAttributeSchemaLookup: {},
      });
      expect(result.sql).toEqual(`select
  count(*) as "f0"
from
  "risksmart"."risk" as "t0"`);
    });

    it('can count on aggregate field', async () => {
      const result = await getReportDataSql({
        dataSources: [{ type: 'risks' }],
        aggregateType: 'count',
        aggregateField: { fieldId: 'id', dataSourceIndex: 0 },
        groupBy: undefined,
        customAttributeSchemaLookup: {},
      });
      expect(result.sql).toEqual(`select
  count("t0"."Id") as "f0"
from
  "risksmart"."risk" as "t0"`);
    });

    it('can distinct count on aggregate field', async () => {
      const result = await getReportDataSql({
        dataSources: [{ type: 'risks' }],
        aggregateType: 'distinctCount',
        aggregateField: { fieldId: 'id', dataSourceIndex: 0 },
        groupBy: undefined,
        customAttributeSchemaLookup: {},
      });
      expect(result.sql).toEqual(`select
  count(distinct "t0"."Id") as "f0"
from
  "risksmart"."risk" as "t0"`);
    });

    it('can group on single table', async () => {
      const result = await getReportDataSql({
        dataSources: [{ type: 'risks' }],
        aggregateType: 'count',
        groupBy: [{ field: { dataSourceIndex: 0, fieldId: 'tier' } }],
        customAttributeSchemaLookup: {},
      });
      expect(result.sql).toEqual(`select
  "t0"."Tier" as "f0",
  count(*) as "f1"
from
  "risksmart"."risk" as "t0"
group by
  1`);
    });

    it('can group on custom attribute', async () => {
      const result = await getReportDataSql({
        dataSources: [{ type: 'risks' }],
        aggregateType: 'count',
        groupBy: [
          { field: { dataSourceIndex: 0, fieldId: 'custom/1234_text' } },
        ],
        customAttributeSchemaLookup: {
          [ParentTypeEnum.Risk]: {
            properties: { '1234_text': {} },
          },
        },
      });
      expect(result.sql).toEqual(`select
  "t0"."CustomAttributeData" ->> '1234_text' as "f0",
  count(*) as "f1"
from
  "risksmart"."risk" as "t0"
group by
  1`);
    });

    it('aggregateField adds required joins for lazy fields', async () => {
      const result = await getReportDataSql({
        dataSources: [{ type: 'controls' }],
        fields: [],
        groupBy: [
          { field: { fieldId: 'modifiedByFriendlyName', dataSourceIndex: 0 } },
        ],
        aggregateField: {
          fieldId: 'createdByFriendlyName',
          dataSourceIndex: 0,
        },
        customAttributeSchemaLookup: {},
        aggregateType: 'max',
      });

      expect(result.sql).toEqual(`select
  "t0-modifiedBy"."FriendlyName" as "f0",
  max("t0-createdBy"."FriendlyName") as "f1"
from
  "risksmart"."control" as "t0"
  left join "risksmart"."user_view_active" as "t0-createdBy" on "t0"."CreatedByUser" = "t0-createdBy"."Id"
  left join "risksmart"."user_view_active" as "t0-modifiedBy" on "t0"."ModifiedByUser" = "t0-modifiedBy"."Id"
group by
  1`);
    });

    it('can group on tags field with tag filter', async () => {
      const result = await getReportDataSql({
        dataSources: [{ type: 'risks' }],
        aggregateType: 'count',
        groupBy: [{ field: { dataSourceIndex: 0, fieldId: 'tags' } }],
        customAttributeSchemaLookup: {},
        filters: {
          operation: 'and',
          filters: [
            {
              field: { fieldId: 'tags', dataSourceIndex: 0 },
              value: 'Tag one',
              operator: '=',
            },
          ],
        },
      });
      expect(result.sql).toEqual(`select
  "t0-tags"."Name" as "f0",
  count(*) as "f1"
from
  "risksmart"."risk" as "t0"
  left join lateral (
    select
      "tt"."Name"
    from
      "risksmart"."tag_type" as "tt"
      inner join "risksmart"."tag" as "t" on "t"."TagTypeId" = "tt"."Id"
    where
      "t"."ParentId" = "t0"."Id"
  ) as "t0-tags" on true
where
  "t0-tags"."Name" = $1
group by
  1`);
    });

    it('can group by tags', async () => {
      const result = await getReportDataSql({
        dataSources: [{ type: 'risks' }],
        aggregateType: 'count',
        groupBy: [
          {
            field: { dataSourceIndex: 0, fieldId: 'tags' },
          },
        ],
        customAttributeSchemaLookup: {},
      });
      expect(result.sql).toEqual(`select
  "t0-tags"."Name" as "f0",
  count(*) as "f1"
from
  "risksmart"."risk" as "t0"
  left join lateral (
    select
      "tt"."Name"
    from
      "risksmart"."tag_type" as "tt"
      inner join "risksmart"."tag" as "t" on "t"."TagTypeId" = "tt"."Id"
    where
      "t"."ParentId" = "t0"."Id"
  ) as "t0-tags" on true
group by
  1`);
    });

    it('can group by departments', async () => {
      const result = await getReportDataSql({
        dataSources: [{ type: 'risks' }],
        aggregateType: 'count',
        groupBy: [
          {
            field: { dataSourceIndex: 0, fieldId: 'departments' },
          },
        ],
        customAttributeSchemaLookup: {},
      });
      expect(result.sql).toEqual(`select
  "t0-departments"."Name" as "f0",
  count(*) as "f1"
from
  "risksmart"."risk" as "t0"
  left join lateral (
    select
      "tt"."Name"
    from
      "risksmart"."department_type" as "tt"
      inner join "risksmart"."department" as "t" on "t"."DepartmentTypeId" = "tt"."Id"
    where
      "t"."ParentId" = "t0"."Id"
  ) as "t0-departments" on true
group by
  1`);
    });

    it('can group on two fields on a single table', async () => {
      const result = await getReportDataSql({
        dataSources: [{ type: 'risks' }],
        aggregateType: 'count',
        groupBy: [
          {
            field: { dataSourceIndex: 0, fieldId: 'tier' },
          },
          { field: { dataSourceIndex: 0, fieldId: 'status' } },
        ],
        customAttributeSchemaLookup: {},
      });
      expect(result.sql).toEqual(`select
  "t0"."Tier" as "f0",
  "t0"."Status" as "f1",
  count(*) as "f2"
from
  "risksmart"."risk" as "t0"
group by
  1,
  2`);
    });

    it('can group on fields with meta data (all meta fields included in group by)', async () => {
      const result = await getReportDataSql({
        dataSources: [{ type: 'riskAssessmentResults' }],
        aggregateType: 'count',
        groupBy: [{ field: { fieldId: 'rating', dataSourceIndex: 0 } }],
        customAttributeSchemaLookup: {},
      });
      expect(result.sql).toEqual(`select
  "t0-riskRatingDefinition"."Label" as "f0",
  "t0-riskRatingDefinition"."Color" as "f1",
  "t0-riskRatingDefinition"."Value" as "f2",
  "t0"."Likelihood" as "f3",
  "t0"."Impact" as "f4",
  count(*) as "f5"
from
  "risksmart"."risk_assessment_result" as "t0"
  left join "risksmart"."risk_rating_definition" as "t0-riskRatingDefinition" on "t0"."Rating" = "t0-riskRatingDefinition"."Value"
  and "t0"."ControlType" = "t0-riskRatingDefinition"."ControlType"
group by
  1,
  2,
  3,
  4,
  5`);
    });

    it('throws an error when both fields and groupBy are supplied', async () => {
      await expect(
        getReportDataSql({
          dataSources: [{ type: 'risks' }],
          aggregateType: 'count',
          fields: [{ dataSourceIndex: 0, fieldId: 'tier' }],
          groupBy: [{ field: { dataSourceIndex: 0, fieldId: 'tier' } }],
          customAttributeSchemaLookup: {},
        })
      ).rejects.toThrow('Cannot specified both fields and groupBy');
    });

    it.each<{ aggregateType: AggregateType }>([
      { aggregateType: 'min' },
      { aggregateType: 'max' },
      { aggregateType: 'avg' },
    ])(
      'throw an error when attempting to aggregate with type $aggregateType when no aggregateField is specified',
      async ({ aggregateType }) => {
        await expect(
          getReportDataSql({
            dataSources: [{ type: 'risks' }],
            groupBy: [{ field: { dataSourceIndex: 0, fieldId: 'tier' } }],
            aggregateType,
            customAttributeSchemaLookup: {},
          })
        ).rejects.toThrow(
          `Aggregate field required for aggregate type ${aggregateType}`
        );
      }
    );

    it('can query avg on a number field', async () => {
      const result = await getReportDataSql({
        dataSources: [{ type: 'risks' }],
        aggregateType: 'avg',
        aggregateField: { dataSourceIndex: 0, fieldId: 'sequentialId' },
        groupBy: [{ field: { dataSourceIndex: 0, fieldId: 'tier' } }],
        customAttributeSchemaLookup: {},
      });
      expect(result.sql).toEqual(`select
  "t0"."Tier" as "f0",
  avg("t0"."SequentialId") as "f1"
from
  "risksmart"."risk" as "t0"
group by
  1`);
    });

    it('throws an error when attempting to avg a text field', async () => {
      await expect(
        getReportDataSql({
          dataSources: [{ type: 'risks' }],
          aggregateType: 'avg',
          aggregateField: { dataSourceIndex: 0, fieldId: 'title' },
          groupBy: [{ field: { dataSourceIndex: 0, fieldId: 'tier' } }],
          customAttributeSchemaLookup: {},
        })
      ).rejects.toThrow(
        'Aggregate type avg does not support aggregation field data type text'
      );
    });

    it('can average on a number field', async () => {
      const result = await getReportDataSql({
        dataSources: [{ type: 'risks' }],
        aggregateType: 'avg',
        aggregateField: { dataSourceIndex: 0, fieldId: 'sequentialId' },
        groupBy: [{ field: { dataSourceIndex: 0, fieldId: 'tier' } }],
        customAttributeSchemaLookup: {},
      });

      expect(result.sql).toEqual(`select
  "t0"."Tier" as "f0",
  avg("t0"."SequentialId") as "f1"
from
  "risksmart"."risk" as "t0"
group by
  1`);
    });

    it('can groupBy with day precision', async () => {
      const result = await getReportDataSql({
        dataSources: [{ type: 'risks' }],
        aggregateType: 'count',
        groupBy: [
          {
            field: { dataSourceIndex: 0, fieldId: 'createdAtTimestamp' },
            datePrecision: 'day',
          },
        ],
        customAttributeSchemaLookup: {},
      });

      expect(result.sql).toEqual(`select
  date_trunc('day', "t0"."CreatedAtTimestamp") as "f0",
  count(*) as "f1"
from
  "risksmart"."risk" as "t0"
group by
  1`);
    });

    it('can groupBy with year precision', async () => {
      const result = await getReportDataSql({
        dataSources: [{ type: 'risks' }],
        aggregateType: 'count',
        groupBy: [
          {
            field: { dataSourceIndex: 0, fieldId: 'createdAtTimestamp' },
            datePrecision: 'year',
          },
        ],
        customAttributeSchemaLookup: {},
      });

      expect(result.sql).toEqual(`select
  date_trunc('year', "t0"."CreatedAtTimestamp") as "f0",
  count(*) as "f1"
from
  "risksmart"."risk" as "t0"
group by
  1`);
    });

    it('cannot groupBy with date precision on a non date field', async () => {
      await expect(
        getReportDataSql({
          dataSources: [{ type: 'risks' }],
          aggregateType: 'count',
          groupBy: [
            {
              field: { dataSourceIndex: 0, fieldId: 'title' },
              datePrecision: 'year',
            },
          ],
          customAttributeSchemaLookup: {},
        })
      ).rejects.toThrow('Cannot use datePrecision on a non-date field');
    });
  });

  describe('filtering', () => {
    describe('rating fields', () => {
      it('can filter rating field using exact match with equality operator', async () => {
        const result = await getReportDataSql({
          dataSources: [{ type: 'issues' }],
          filters: {
            operation: 'and',
            filters: [
              {
                field: { fieldId: 'severity', dataSourceIndex: 0 },
                value: 'High',
                operator: '=',
              },
            ],
          },
          fields: [{ fieldId: 'id', dataSourceIndex: 0 }],
          customAttributeSchemaLookup: {},
        });

        expect(result.sql).toContain(`where
  "t0-issueAssessment"."Severity" = $1`);

        expect(result.parameters).toEqual(['High']);
      });

      it('can filter rating field using exact match with not equals operator', async () => {
        const result = await getReportDataSql({
          dataSources: [{ type: 'issues' }],
          filters: {
            operation: 'and',
            filters: [
              {
                field: { fieldId: 'severity', dataSourceIndex: 0 },
                value: 'High',
                operator: '!=',
              },
            ],
          },
          fields: [{ fieldId: 'id', dataSourceIndex: 0 }],
          customAttributeSchemaLookup: {},
        });

        expect(result.sql).toContain(`where
  "t0-issueAssessment"."Severity" != $1`);

        expect(result.parameters).toEqual(['High']);
      });
    });

    describe('text fields', () => {
      it('can filter text field using exact match with equality operator', async () => {
        const result = await getReportDataSql({
          dataSources: [{ type: 'issues' }],
          filters: {
            operation: 'and',
            filters: [
              {
                field: { fieldId: 'title', dataSourceIndex: 0 },
                value: 'Issue 1',
                operator: '=',
              },
            ],
          },
          fields: [{ fieldId: 'id', dataSourceIndex: 0 }],
          customAttributeSchemaLookup: {},
        });

        expect(result.sql).toContain(`where
  "t0"."Title" = $1`);

        expect(result.parameters).toEqual(['Issue 1']);
      });

      it('can filter text field using exact match with not equals operator', async () => {
        const result = await getReportDataSql({
          dataSources: [{ type: 'issues' }],
          filters: {
            operation: 'and',
            filters: [
              {
                field: { fieldId: 'title', dataSourceIndex: 0 },
                value: 'Issue 1',
                operator: '!=',
              },
            ],
          },
          fields: [{ fieldId: 'id', dataSourceIndex: 0 }],
          customAttributeSchemaLookup: {},
        });

        expect(result.sql).toContain(`where
  "t0"."Title" != $1`);

        expect(result.parameters).toEqual(['Issue 1']);
      });

      it('can filter text field using contains operator', async () => {
        const result = await getReportDataSql({
          dataSources: [{ type: 'issues' }],
          filters: {
            operation: 'and',
            filters: [
              {
                field: { fieldId: 'title', dataSourceIndex: 0 },
                value: 'Issue 1',
                operator: ':',
              },
            ],
          },
          fields: [{ fieldId: 'id', dataSourceIndex: 0 }],
          customAttributeSchemaLookup: {},
        });

        expect(result.sql).toContain(`where
  "t0"."Title" ilike $1`);

        expect(result.parameters).toEqual(['%Issue 1%']);
      });

      it('can filter text field using not contains operator', async () => {
        const result = await getReportDataSql({
          dataSources: [{ type: 'issues' }],
          filters: {
            operation: 'and',
            filters: [
              {
                field: { fieldId: 'title', dataSourceIndex: 0 },
                value: 'Issue 1',
                operator: '!:',
              },
            ],
          },
          fields: [{ fieldId: 'id', dataSourceIndex: 0 }],
          customAttributeSchemaLookup: {},
        });

        expect(result.sql).toContain(`where
  "t0"."Title" not ilike $1`);

        expect(result.parameters).toEqual(['%Issue 1%']);
      });
    });

    describe('array fields', () => {
      it('can filter array field using contains operator', async () => {
        const result = await getReportDataSql({
          dataSources: [{ type: 'risks' }],
          filters: {
            operation: 'and',
            filters: [
              {
                field: { fieldId: 'departments', dataSourceIndex: 0 },
                value: 'Department One',
                operator: ':',
              },
            ],
          },
          fields: [{ fieldId: 'id', dataSourceIndex: 0 }],
          customAttributeSchemaLookup: {},
        });
        expect(result.sql).toContain(`where
  exists (
    select
      1 as "match"
    from
      jsonb_array_elements_text(
        coalesce(
          cast("t0-departments"."Name" as jsonb),
          '[]'::jsonb
        )
      ) as "items"
    where
      "items" ilike $1
  )`);

        expect(result.parameters).toEqual(['%Department One%']);
      });

      it('can filter array field using not contains operator', async () => {
        const result = await getReportDataSql({
          dataSources: [{ type: 'risks' }],
          filters: {
            operation: 'and',
            filters: [
              {
                field: { fieldId: 'departments', dataSourceIndex: 0 },
                value: 'Department One',
                operator: '!:',
              },
            ],
          },
          fields: [{ fieldId: 'id', dataSourceIndex: 0 }],
          customAttributeSchemaLookup: {},
        });
        expect(result.sql).toContain(`where
  (
    not exists (
      select
        1 as "match"
      from
        jsonb_array_elements_text(
          coalesce(
            cast("t0-departments"."Name" as jsonb),
            '[]'::jsonb
          )
        ) as "items"
      where
        "items" ilike $1
    )
    or jsonb_array_length(
      coalesce(
        cast("t0-departments"."Name" as jsonb),
        '[]'::jsonb
      )
    ) = $2
  )`);
        expect(result.parameters).toEqual(['%Department One%', 0]);
      });

      it('can filter array field using exact match with equality operator', async () => {
        const result = await getReportDataSql({
          dataSources: [{ type: 'risks' }],
          filters: {
            operation: 'and',
            filters: [
              {
                field: { fieldId: 'departments', dataSourceIndex: 0 },
                value: 'Department One',
                operator: '=',
              },
            ],
          },
          fields: [{ fieldId: 'id', dataSourceIndex: 0 }],
          customAttributeSchemaLookup: {},
        });
        expect(result.sql).toContain(`where
  exists (
    select
      1 as "match"
    from
      jsonb_array_elements_text(
        coalesce(
          cast("t0-departments"."Name" as jsonb),
          '[]'::jsonb
        )
      ) as "items"
    where
      "items" = $1
  )`);
        expect(result.parameters).toEqual(['Department One']);
      });

      it('can filter array field using exact match with not equals operator', async () => {
        const result = await getReportDataSql({
          dataSources: [{ type: 'risks' }],
          filters: {
            operation: 'and',
            filters: [
              {
                field: { fieldId: 'departments', dataSourceIndex: 0 },
                value: 'Department One',
                operator: '!=',
              },
            ],
          },
          fields: [{ fieldId: 'id', dataSourceIndex: 0 }],
          customAttributeSchemaLookup: {},
        });
        expect(result.sql).toContain(`where
  (
    not exists (
      select
        1 as "match"
      from
        jsonb_array_elements_text(
          coalesce(
            cast("t0-departments"."Name" as jsonb),
            '[]'::jsonb
          )
        ) as "items"
      where
        "items" = $1
    )
    or jsonb_array_length(
      coalesce(
        cast("t0-departments"."Name" as jsonb),
        '[]'::jsonb
      )
    ) = $2
  )`);
        expect(result.parameters).toEqual(['Department One', 0]);
      });
    });
  });

  it('can generate a query with where clauses for a single table', async () => {
    const result = await getReportDataSql({
      dataSources: [{ type: 'risks' }],
      filters: {
        operation: 'and',
        filters: [
          {
            operation: 'and',
            filters: [
              {
                field: { fieldId: 'title', dataSourceIndex: 0 },
                value: 'Risk1',
                operator: '=',
              },
            ],
          },
        ],
      },
      customAttributeSchemaLookup: {},
      fields: [{ fieldId: 'title', dataSourceIndex: 0 }],
    });
    expect(result.sql).toEqual(`select
  "t0"."Title" as "f0"
from
  "risksmart"."risk" as "t0"
where
  "t0"."Title" = $1`);
    expect(result.parameters).toEqual(['Risk1']);
  });

  it('can generate a query with a "!=" where clauses for a single table', async () => {
    const result = await getReportDataSql({
      dataSources: [{ type: 'risks' }],
      filters: {
        operation: 'and',
        filters: [
          {
            operation: 'and',
            filters: [
              {
                field: { fieldId: 'title', dataSourceIndex: 0 },
                value: 'Risk1',
                operator: '!=',
              },
            ],
          },
        ],
      },
      customAttributeSchemaLookup: {},
      fields: [{ fieldId: 'title', dataSourceIndex: 0 }],
    });
    expect(result.sql).toEqual(`select
  "t0"."Title" as "f0"
from
  "risksmart"."risk" as "t0"
where
  "t0"."Title" != $1`);
    expect(result.parameters).toEqual(['Risk1']);
  });

  it('removes empty filter groups 2', async () => {
    const result = await getReportDataSql({
      dataSources: [{ type: 'risks' }],
      filters: {
        operation: 'and',
        filters: [
          {
            filters: [],
            operation: 'or',
          },
          {
            operation: 'and',
            filters: [
              {
                operation: 'and',
                filters: [],
              },
            ],
          },
        ],
      },
      customAttributeSchemaLookup: {},
      fields: [{ fieldId: 'title', dataSourceIndex: 0 }],
    });

    expect(result.sql).toEqual(`select
  "t0"."Title" as "f0"
from
  "risksmart"."risk" as "t0"
where
  1 = 1`);
  });

  it('removes empty filter groups', async () => {
    const result = await getReportDataSql({
      dataSources: [{ type: 'risks' }],
      filters: {
        operation: 'and',
        filters: [
          {
            filters: [],
            operation: 'or',
          },
          {
            operation: 'and',
            filters: [
              {
                operation: 'and',
                filters: [
                  {
                    value: 'Test Department 3',
                    operator: '=',
                    field: {
                      dataSourceIndex: 0,
                      fieldId: 'departments',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      customAttributeSchemaLookup: {},
      fields: [{ fieldId: 'title', dataSourceIndex: 0 }],
    });

    expect(result.sql).toEqual(`select
  "t0"."Title" as "f0"
from
  "risksmart"."risk" as "t0"
  left join lateral (
    select
      coalesce(json_agg("tt"."Name"), '[]') as "Name"
    from
      "risksmart"."department_type" as "tt"
      inner join "risksmart"."department" as "t" on "t"."DepartmentTypeId" = "tt"."Id"
    where
      "t"."ParentId" = "t0"."Id"
  ) as "t0-departments" on true
where
  exists (
    select
      1 as "match"
    from
      jsonb_array_elements_text(
        coalesce(
          cast("t0-departments"."Name" as jsonb),
          '[]'::jsonb
        )
      ) as "items"
    where
      "items" = $1
  )`);
    expect(result.parameters).toEqual(['Test Department 3']);
  });

  it("performs is null check when using equality on '='", async () => {
    const result = await getReportDataSql({
      dataSources: [{ type: 'risks' }],
      filters: {
        operation: 'or',
        filters: [
          {
            field: { fieldId: 'title', dataSourceIndex: 0 },
            value: null,
            operator: '=',
          },
        ],
      },
      customAttributeSchemaLookup: {},
      fields: [{ fieldId: 'title', dataSourceIndex: 0 }],
    });

    expect(result.sql).toEqual(`select
  "t0"."Title" as "f0"
from
  "risksmart"."risk" as "t0"
where
  "t0"."Title" is null`);
  });

  it("performs is null check when using equality on '!='", async () => {
    const result = await getReportDataSql({
      dataSources: [{ type: 'risks' }],
      filters: {
        operation: 'or',
        filters: [
          {
            field: { fieldId: 'title', dataSourceIndex: 0 },
            value: null,
            operator: '!=',
          },
        ],
      },
      customAttributeSchemaLookup: {},
      fields: [{ fieldId: 'title', dataSourceIndex: 0 }],
    });

    expect(result.sql).toEqual(`select
  "t0"."Title" as "f0"
from
  "risksmart"."risk" as "t0"
where
  "t0"."Title" is not null`);
  });

  it('supports multiple levels of filter groups', async () => {
    const result = await getReportDataSql({
      dataSources: [{ type: 'risks' }],
      filters: {
        operation: 'or',
        filters: [
          {
            field: { fieldId: 'title', dataSourceIndex: 0 },
            value: 'RiskA',
            operator: '=',
          },
          {
            operation: 'and',
            filters: [
              {
                field: { fieldId: 'title', dataSourceIndex: 0 },
                value: 'RiskB',
                operator: '=',
              },
              {
                operation: 'or',
                filters: [
                  {
                    field: { fieldId: 'title', dataSourceIndex: 0 },
                    value: 'RiskC',
                    operator: '=',
                  },
                  {
                    field: { fieldId: 'title', dataSourceIndex: 0 },
                    value: 'RiskD',
                    operator: '=',
                  },
                ],
              },
            ],
          },
        ],
      },
      customAttributeSchemaLookup: {},
      fields: [{ fieldId: 'title', dataSourceIndex: 0 }],
    });

    expect(result.sql).toEqual(`select
  "t0"."Title" as "f0"
from
  "risksmart"."risk" as "t0"
where
  (
    "t0"."Title" = $1
    or (
      "t0"."Title" = $2
      and (
        "t0"."Title" = $3
        or "t0"."Title" = $4
      )
    )
  )`);
    expect(result.parameters).toEqual(['RiskA', 'RiskB', 'RiskC', 'RiskD']);
  });

  it('can generate a query with an ilike on a string', async () => {
    const result = await getReportDataSql({
      dataSources: [{ type: 'risks' }],
      filters: {
        operation: 'and',
        filters: [
          {
            operation: 'and',
            filters: [
              {
                field: { fieldId: 'title', dataSourceIndex: 0 },
                value: 'Risk1',
                operator: ':',
              },
            ],
          },
        ],
      },
      customAttributeSchemaLookup: {},
      fields: [{ fieldId: 'title', dataSourceIndex: 0 }],
    });
    expect(result.sql).toEqual(`select
  "t0"."Title" as "f0"
from
  "risksmart"."risk" as "t0"
where
  "t0"."Title" ilike $1`);
    expect(result.parameters).toEqual(['%Risk1%']);
  });

  it('can include a mix of "and" and "or" operators', async () => {
    const result = await getReportDataSql({
      dataSources: [{ type: 'risks' }, { type: 'actions', parentIndex: 0 }],
      filters: {
        operation: 'and',
        filters: [
          {
            operation: 'or',
            filters: [
              {
                field: { fieldId: 'title', dataSourceIndex: 0 },
                value: 'Risk1',
                operator: '=',
              },
              {
                field: { fieldId: 'title', dataSourceIndex: 1 },
                value: 'Action1',
                operator: '=',
              },
            ],
          },
          {
            operation: 'or',
            filters: [
              {
                field: { fieldId: 'tier', dataSourceIndex: 0 },
                value: '1',
                operator: '=',
              },
              {
                field: { fieldId: 'tier', dataSourceIndex: 0 },
                value: '2',
                operator: '=',
              },
            ],
          },
        ],
      },

      customAttributeSchemaLookup: {},
      fields: [{ fieldId: 'title', dataSourceIndex: 0 }],
    });

    expect(result.sql).toEqual(`select
  "t0"."Title" as "f0"
from
  "risksmart"."risk" as "t0"
  inner join "risksmart"."action_parent" as "t1-join" on "t1-join"."ParentId" = "t0"."Id"
  inner join "risksmart"."action" as "t1" on "t1"."Id" = "t1-join"."ActionId"
where
  (
    (
      "t0"."Title" = $1
      or "t1"."Title" = $2
    )
    and (
      "t0"."Tier" = $3
      or "t0"."Tier" = $4
    )
  )`);
    expect(result.parameters).toEqual(['Risk1', 'Action1', '1', '2']);
  });

  it('can generate a query with where clauses for a multiple tables', async () => {
    const result = await getReportDataSql({
      dataSources: [{ type: 'risks' }, { type: 'actions', parentIndex: 0 }],
      filters: {
        operation: 'and',
        filters: [
          {
            operation: 'and',
            filters: [
              {
                field: { fieldId: 'title', dataSourceIndex: 0 },
                value: 'Risk1',
                operator: '=',
              },
              {
                field: { fieldId: 'title', dataSourceIndex: 1 },
                value: 'Action1',
                operator: '=',
              },
            ],
          },
        ],
      },

      customAttributeSchemaLookup: {},
      fields: [{ fieldId: 'title', dataSourceIndex: 0 }],
    });

    expect(result.sql).toEqual(`select
  "t0"."Title" as "f0"
from
  "risksmart"."risk" as "t0"
  inner join "risksmart"."action_parent" as "t1-join" on "t1-join"."ParentId" = "t0"."Id"
  inner join "risksmart"."action" as "t1" on "t1"."Id" = "t1-join"."ActionId"
where
  (
    "t0"."Title" = $1
    and "t1"."Title" = $2
  )`);
    expect(result.parameters).toEqual(['Risk1', 'Action1']);
  });

  it('can query owners and owner groups', async () => {
    const result = await getReportDataSql({
      dataSources: [{ type: 'risks' }],
      filters: {
        operation: 'and',
        filters: [],
      },

      customAttributeSchemaLookup: {},
      fields: [{ fieldId: 'owners', dataSourceIndex: 0 }],
    });
    expect(result.sql).toEqual(`select
  "t0-ownerUsersAndGroups"."Name" as "f0"
from
  "risksmart"."risk" as "t0"
  left join lateral (
    select
      coalesce(json_agg("tt"."Name"), '[]') as "Name"
    from
      "risksmart"."get_owners_and_owner_groups" ("t0"."Id") as "tt"
  ) as "t0-ownerUsersAndGroups" on true`);
  });

  it('throws an error when referencing a filter field that does not exist', async () => {
    await expect(
      getReportDataSql({
        dataSources: [{ type: 'risks' }],
        filters: {
          operation: 'and',
          filters: [
            {
              operation: 'and',
              filters: [
                {
                  field: { fieldId: 'wrong', dataSourceIndex: 0 },
                  value: 'Risk1',
                  operator: '=',
                },
              ],
            },
          ],
        },
        fields: [{ fieldId: 'title', dataSourceIndex: 0 }],
        customAttributeSchemaLookup: {},
      })
    ).rejects.toThrow(`Field "wrong" does not exist on datasource "risks"`);
  });

  it('throws an error when referencing a filter data source that does not exist', async () => {
    await expect(
      getReportDataSql({
        dataSources: [{ type: 'risks' }],
        filters: {
          operation: 'and',
          filters: [
            {
              operation: 'and',
              filters: [
                {
                  field: { fieldId: 'title', dataSourceIndex: 1 },
                  value: 'Risk1',
                  operator: '=',
                },
              ],
            },
          ],
        },
        fields: [{ fieldId: 'title', dataSourceIndex: 0 }],
        customAttributeSchemaLookup: {},
      })
    ).rejects.toThrow('Datasource at index 1 which does not exist');
  });

  it('can return risks with departments', async () => {
    const result = await getReportDataSql({
      dataSources: [{ type: 'risks' }],
      fields: [
        { fieldId: 'id', dataSourceIndex: 0 },
        { fieldId: 'departments', dataSourceIndex: 0 },
      ],
      customAttributeSchemaLookup: {},
    });
    expect(result.sql).toEqual(`select
  "t0"."Id" as "f0",
  "t0-departments"."Name" as "f1"
from
  "risksmart"."risk" as "t0"
  left join lateral (
    select
      coalesce(json_agg("tt"."Name"), '[]') as "Name"
    from
      "risksmart"."department_type" as "tt"
      inner join "risksmart"."department" as "t" on "t"."DepartmentTypeId" = "tt"."Id"
    where
      "t"."ParentId" = "t0"."Id"
  ) as "t0-departments" on true`);
  });
});

it('can return risks with tags', async () => {
  const result = await getReportDataSql({
    dataSources: [{ type: 'risks' }],
    fields: [
      { fieldId: 'id', dataSourceIndex: 0 },
      { fieldId: 'tags', dataSourceIndex: 0 },
    ],
    customAttributeSchemaLookup: {},
  });

  expect(result.sql).toEqual(`select
  "t0"."Id" as "f0",
  "t0-tags"."Name" as "f1"
from
  "risksmart"."risk" as "t0"
  left join lateral (
    select
      coalesce(json_agg("tt"."Name"), '[]') as "Name"
    from
      "risksmart"."tag_type" as "tt"
      inner join "risksmart"."tag" as "t" on "t"."TagTypeId" = "tt"."Id"
    where
      "t"."ParentId" = "t0"."Id"
  ) as "t0-tags" on true`);
});

it('can return risks with unnested tags', async () => {
  const result = await getReportDataSql({
    unnestInlineArrays: true,
    dataSources: [{ type: 'risks' }],
    fields: [
      { fieldId: 'id', dataSourceIndex: 0 },
      { fieldId: 'tags', dataSourceIndex: 0 },
    ],
    customAttributeSchemaLookup: {},
  });

  expect(result.sql).toEqual(`select
  "t0"."Id" as "f0",
  "t0-tags"."Name" as "f1"
from
  "risksmart"."risk" as "t0"
  inner join "risksmart"."tag" as "t0-tags-m2m" on "t0"."Id" = "t0-tags-m2m"."ParentId"
  inner join "risksmart"."tag_type" as "t0-tags" on "t0-tags-m2m"."TagTypeId" = "t0-tags"."Id"`);
});

it('can return risks with unnested owners', async () => {
  const result = await getReportDataSql({
    unnestInlineArrays: true,
    dataSources: [{ type: 'risks' }],
    fields: [
      { fieldId: 'id', dataSourceIndex: 0 },
      { fieldId: 'owners', dataSourceIndex: 0 },
    ],
    customAttributeSchemaLookup: {},
  });
  expect(result.sql).toEqual(`select
  "t0"."Id" as "f0",
  "t0-ownerUsersAndGroups"."Name" as "f1"
from
  "risksmart"."risk" as "t0"
  left join lateral (
    select
      "tt"."Name"
    from
      "risksmart"."get_owners_and_owner_groups" ("t0"."Id") as "tt"
  ) as "t0-ownerUsersAndGroups" on true`);
});

it('can filter unnested tags', async () => {
  const result = await getReportDataSql({
    unnestInlineArrays: true,
    dataSources: [{ type: 'risks' }],
    fields: [{ fieldId: 'id', dataSourceIndex: 0 }],
    filters: {
      operation: 'and',
      filters: [
        {
          field: { fieldId: 'tags', dataSourceIndex: 0 },
          value: 'test',
          operator: ':',
        },
      ],
    },
    customAttributeSchemaLookup: {},
  });

  expect(result.sql).toEqual(`select
  "t0"."Id" as "f0"
from
  "risksmart"."risk" as "t0"
  inner join "risksmart"."tag" as "t0-tags-m2m" on "t0"."Id" = "t0-tags-m2m"."ParentId"
  inner join "risksmart"."tag_type" as "t0-tags" on "t0-tags-m2m"."TagTypeId" = "t0-tags"."Id"
where
  "t0-tags"."Name" ilike $1`);
});

it('can filter risks by tags', async () => {
  const result = await getReportDataSql({
    dataSources: [{ type: 'risks' }],
    filters: {
      operation: 'and',
      filters: [
        {
          operation: 'and',
          filters: [
            {
              field: { fieldId: 'tags', dataSourceIndex: 0 },
              value: 'Tag One',
              operator: '=',
            },
          ],
        },
      ],
    },
    fields: [{ fieldId: 'id', dataSourceIndex: 0 }],
    customAttributeSchemaLookup: {},
  });
  expect(result.sql).toEqual(`select
  "t0"."Id" as "f0"
from
  "risksmart"."risk" as "t0"
  left join lateral (
    select
      coalesce(json_agg("tt"."Name"), '[]') as "Name"
    from
      "risksmart"."tag_type" as "tt"
      inner join "risksmart"."tag" as "t" on "t"."TagTypeId" = "tt"."Id"
    where
      "t"."ParentId" = "t0"."Id"
  ) as "t0-tags" on true
where
  exists (
    select
      1 as "match"
    from
      jsonb_array_elements_text(
        coalesce(cast("t0-tags"."Name" as jsonb), '[]'::jsonb)
      ) as "items"
    where
      "items" = $1
  )`);
});

it('can filter risks where there are no tags by filtering on null', async () => {
  const result = await getReportDataSql({
    dataSources: [{ type: 'risks' }],
    filters: {
      operation: 'and',
      filters: [
        {
          operation: 'and',
          filters: [
            {
              field: { fieldId: 'tags', dataSourceIndex: 0 },
              value: null,
              operator: '=',
            },
          ],
        },
      ],
    },
    fields: [{ fieldId: 'id', dataSourceIndex: 0 }],
    customAttributeSchemaLookup: {},
  });
  expect(result.sql).toEqual(`select
  "t0"."Id" as "f0"
from
  "risksmart"."risk" as "t0"
  left join lateral (
    select
      coalesce(json_agg("tt"."Name"), '[]') as "Name"
    from
      "risksmart"."tag_type" as "tt"
      inner join "risksmart"."tag" as "t" on "t"."TagTypeId" = "tt"."Id"
    where
      "t"."ParentId" = "t0"."Id"
  ) as "t0-tags" on true
where
  jsonb_array_length(
    coalesce(cast("t0-tags"."Name" as jsonb), '[]'::jsonb)
  ) = $1`);
});

it('can return and filter risks by tags in same query', async () => {
  const result = await getReportDataSql({
    dataSources: [{ type: 'risks' }],
    filters: {
      operation: 'and',
      filters: [
        {
          operation: 'and',
          filters: [
            {
              field: { fieldId: 'tags', dataSourceIndex: 0 },
              value: 'Tag One',
              operator: '=',
            },
          ],
        },
      ],
    },
    fields: [
      { fieldId: 'id', dataSourceIndex: 0 },
      { fieldId: 'tags', dataSourceIndex: 0 },
    ],
    customAttributeSchemaLookup: {},
  });

  expect(result.sql).toEqual(`select
  "t0"."Id" as "f0",
  "t0-tags"."Name" as "f1"
from
  "risksmart"."risk" as "t0"
  left join lateral (
    select
      coalesce(json_agg("tt"."Name"), '[]') as "Name"
    from
      "risksmart"."tag_type" as "tt"
      inner join "risksmart"."tag" as "t" on "t"."TagTypeId" = "tt"."Id"
    where
      "t"."ParentId" = "t0"."Id"
  ) as "t0-tags" on true
where
  exists (
    select
      1 as "match"
    from
      jsonb_array_elements_text(
        coalesce(cast("t0-tags"."Name" as jsonb), '[]'::jsonb)
      ) as "items"
    where
      "items" = $1
  )`);
});

it('can return schedule columns from a risk using a left join', async () => {
  const result = await getReportDataSql({
    dataSources: [{ type: 'risks' }],
    fields: [
      { fieldId: 'id', dataSourceIndex: 0 },
      { fieldId: 'latestRatingDate', dataSourceIndex: 0 },
      { fieldId: 'nextRatingDueDate', dataSourceIndex: 0 },
    ],
    customAttributeSchemaLookup: {},
  });
  expect(result.sql).toEqual(`select
  "t0"."Id" as "f0",
  "t0-scheduleState"."LatestDate" as "f1",
  "t0-scheduleState"."DueDate" as "f2"
from
  "risksmart"."risk" as "t0"
  left join "risksmart"."schedule_state" as "t0-scheduleState" on "t0"."Id" = "t0-scheduleState"."Id"`);
});

it('can return an assessment with risk assessment ratings', async () => {
  const result = await getReportDataSql({
    dataSources: [
      { type: 'assessments' },
      { type: 'riskAssessmentResults', parentIndex: 0 },
    ],
    fields: [
      { fieldId: 'id', dataSourceIndex: 0 },
      { fieldId: 'rating', dataSourceIndex: 1 },
    ],
    customAttributeSchemaLookup: {},
  });

  expect(result.sql).toEqual(`select
  "t0"."Id" as "f0",
  "t1-riskRatingDefinition"."Label" as "f1",
  "t1-riskRatingDefinition"."Color" as "f2",
  "t1-riskRatingDefinition"."Value" as "f3",
  "t1"."Likelihood" as "f4",
  "t1"."Impact" as "f5"
from
  "risksmart"."assessment" as "t0"
  inner join "risksmart"."assessment_result_parent" as "t1-join" on "t1-join"."ParentId" = "t0"."Id"
  inner join "risksmart"."risk_assessment_result" as "t1" on "t1"."Id" = "t1-join"."Id"
  left join "risksmart"."risk_rating_definition" as "t1-riskRatingDefinition" on "t1"."Rating" = "t1-riskRatingDefinition"."Value"
  and "t1"."ControlType" = "t1-riskRatingDefinition"."ControlType"`);
});

it('can return risk assessment rating definition columns using a composite join', async () => {
  const result = await getReportDataSql({
    dataSources: [{ type: 'riskAssessmentResults' }],
    fields: [
      { fieldId: 'id', dataSourceIndex: 0 },
      { fieldId: 'rating', dataSourceIndex: 0 },
    ],
    customAttributeSchemaLookup: {},
  });

  expect(result.sql).toEqual(`select
  "t0"."Id" as "f0",
  "t0-riskRatingDefinition"."Label" as "f1",
  "t0-riskRatingDefinition"."Color" as "f2",
  "t0-riskRatingDefinition"."Value" as "f3",
  "t0"."Likelihood" as "f4",
  "t0"."Impact" as "f5"
from
  "risksmart"."risk_assessment_result" as "t0"
  left join "risksmart"."risk_rating_definition" as "t0-riskRatingDefinition" on "t0"."Rating" = "t0-riskRatingDefinition"."Value"
  and "t0"."ControlType" = "t0-riskRatingDefinition"."ControlType"`);
});

it('can return created by user and modified user by left join', async () => {
  const result = await getReportDataSql({
    dataSources: [{ type: 'risks' }],
    fields: [
      { fieldId: 'id', dataSourceIndex: 0 },
      { fieldId: 'createdByFriendlyName', dataSourceIndex: 0 },
      { fieldId: 'modifiedByFriendlyName', dataSourceIndex: 0 },
    ],
    customAttributeSchemaLookup: {},
  });
  expect(result.sql).toEqual(`select
  "t0"."Id" as "f0",
  "t0-createdBy"."FriendlyName" as "f1",
  "t0-modifiedBy"."FriendlyName" as "f2"
from
  "risksmart"."risk" as "t0"
  left join "risksmart"."user_view_active" as "t0-createdBy" on "t0"."CreatedByUser" = "t0-createdBy"."Id"
  left join "risksmart"."user_view_active" as "t0-modifiedBy" on "t0"."ModifiedByUser" = "t0-modifiedBy"."Id"`);
});

it('can filter on schedule columns from a risk', async () => {
  const result = await getReportDataSql({
    dataSources: [{ type: 'risks' }],
    fields: [{ fieldId: 'id', dataSourceIndex: 0 }],
    filters: {
      operation: 'and',
      filters: [
        {
          field: { fieldId: 'latestRatingDate', dataSourceIndex: 0 },
          operator: '=',
          value: '2021',
        },
      ],
    },
    customAttributeSchemaLookup: {},
  });
  expect(result.sql).toEqual(`select
  "t0"."Id" as "f0"
from
  "risksmart"."risk" as "t0"
  left join "risksmart"."schedule_state" as "t0-scheduleState" on "t0"."Id" = "t0-scheduleState"."Id"
where
  "t0-scheduleState"."LatestDate" = $1`);
});

it('ensures guids are cast as text when using the contains operator on them (avoids sql errors!)', async () => {
  const result = await getReportDataSql({
    dataSources: [{ type: 'risks' }],
    fields: [{ fieldId: 'id', dataSourceIndex: 0 }],
    filters: {
      operation: 'and',
      filters: [
        {
          field: { fieldId: 'id', dataSourceIndex: 0 },
          operator: ':',
          value: 'abc',
        },
      ],
    },
    customAttributeSchemaLookup: {},
  });

  expect(result.sql).toEqual(`select
  "t0"."Id" as "f0"
from
  "risksmart"."risk" as "t0"
where
  "t0"."Id"::text ilike $1`);
});

it('can return a column from a join table (appetite_parent', async () => {
  const result = await getReportDataSql({
    dataSources: [{ type: 'risks' }, { type: 'appetites', parentIndex: 0 }],
    fields: [
      { fieldId: 'id', dataSourceIndex: 0 },
      { fieldId: 'status', dataSourceIndex: 1 },
    ],
    customAttributeSchemaLookup: {},
  });
  expect(result.sql).toEqual(`select
  "t0"."Id" as "f0",
  "t1-join"."Status" as "f1"
from
  "risksmart"."risk" as "t0"
  inner join "risksmart"."appetite_parent" as "t1-join" on "t1-join"."ParentId" = "t0"."Id"
  inner join "risksmart"."appetite" as "t1" on "t1"."Id" = "t1-join"."Id"`);
});

describe('custom attributes', () => {
  it('throws an error when requesting a custom attribute when the field does not exist on the schema', async () => {
    await expect(
      getReportDataSql({
        dataSources: [{ type: 'risks' }],
        fields: [{ fieldId: 'custom/1234_1', dataSourceIndex: 0 }],
        customAttributeSchemaLookup: {
          [ParentTypeEnum.Risk]: { properties: {} },
        },
      })
    ).rejects.toThrow('Custom attribute definition not found for 1234_1');
  });

  it('throws an error on potential sql injection attacks based on custom attribute field names', async () => {
    await expect(
      getReportDataSql({
        dataSources: [{ type: 'risks' }],
        fields: [
          { fieldId: 'custom/delete from risksmart.risk', dataSourceIndex: 0 },
        ],
        customAttributeSchemaLookup: {
          [ParentTypeEnum.Risk]: {
            properties: {
              'delete from risksmart.risk': {},
            },
          },
        },
      })
    ).rejects.toThrow(
      'Invalid custom attribute field id delete from risksmart.risk'
    );
  });

  it('can return a custom attribute column', async () => {
    const result = await getReportDataSql({
      dataSources: [{ type: 'risks' }],
      fields: [{ fieldId: 'custom/1234_text', dataSourceIndex: 0 }],
      customAttributeSchemaLookup: {
        [ParentTypeEnum.Risk]: {
          properties: {
            '1234_text': {},
          },
        },
      },
    });
    expect(result.sql).toEqual(`select
  "t0"."CustomAttributeData" ->> '1234_text' as "f0"
from
  "risksmart"."risk" as "t0"`);
  });

  it('can filter on a custom attribute column', async () => {
    const result = await getReportDataSql({
      dataSources: [{ type: 'risks' }],
      fields: [{ fieldId: 'custom/1234_text', dataSourceIndex: 0 }],
      filters: {
        operation: 'and',
        filters: [
          {
            operation: 'and',
            filters: [
              {
                field: { fieldId: 'custom/1234_text', dataSourceIndex: 0 },
                value: 'My Filter',
                operator: '=',
              },
            ],
          },
        ],
      },
      customAttributeSchemaLookup: {
        [ParentTypeEnum.Risk]: {
          properties: {
            '1234_text': {},
          },
        },
      },
    });
    expect(result.sql).toEqual(`select
  "t0"."CustomAttributeData" ->> '1234_text' as "f0"
from
  "risksmart"."risk" as "t0"
where
  "t0"."CustomAttributeData" ->> '1234_text' = $1`);
  });
});

it('can return unnested user multiselect custom attribute columns', async () => {
  const result = await getReportDataSql({
    dataSources: [{ type: 'risks' }],
    unnestInlineArrays: true,
    fields: [
      { fieldId: 'custom/1752762684920_usermultiselect', dataSourceIndex: 0 },
    ],
    filters: {
      operation: 'and',
      filters: [
        {
          field: {
            fieldId: 'custom/1752762684920_usermultiselect',
            dataSourceIndex: 0,
          },
          operator: ':',
          value: 'myUser',
        },
      ],
    },
    customAttributeSchemaLookup: {
      [ParentTypeEnum.Risk]: {
        properties: {
          '1752762684920_usermultiselect': {
            type: 'string',
            description: 'test',
          },
        },
      },
    },
  });
  expect(result.sql).toEqual(`select
  "t0-1752762684920_usermultiselect"."FriendlyName" as "f0"
from
  "risksmart"."risk" as "t0"
  inner join "risksmart"."user_view_active" as "t0-1752762684920_usermultiselect" on "t0-1752762684920_usermultiselect"."Id" in (
    select
      (
        jsonb_array_elements_text(
          (
            "t0"."CustomAttributeData" ->> '1752762684920_usermultiselect'
          )::jsonb
        )::text
      )
  )
where
  "t0-1752762684920_usermultiselect"."FriendlyName" ilike $1`);
});

it('can return a user multiselect custom attribute column', async () => {
  const result = await getReportDataSql({
    dataSources: [{ type: 'risks' }],
    fields: [
      { fieldId: 'custom/1752762684920_usermultiselect', dataSourceIndex: 0 },
    ],
    customAttributeSchemaLookup: {
      [ParentTypeEnum.Risk]: {
        properties: {
          '1752762684920_usermultiselect': {
            type: 'string',
            description: 'test',
          },
        },
      },
    },
  });

  expect(result.sql).toEqual(`select
  "t0-1752762684920_usermultiselect"."FriendlyName" as "f0"
from
  "risksmart"."risk" as "t0"
  left join lateral (
    select
      coalesce(json_agg("tt"."FriendlyName"), '[]') as "FriendlyName"
    from
      "risksmart"."user_view_active" as "tt"
    where
      "tt"."Id" in (
        select
          (
            jsonb_array_elements_text(
              (
                "t0"."CustomAttributeData" ->> '1752762684920_usermultiselect'
              )::jsonb
            )::text
          )
      )
  ) as "t0-1752762684920_usermultiselect" on true`);
});

it('can return a department multiselect custom attribute column', async () => {
  const result = await getReportDataSql({
    dataSources: [{ type: 'risks' }],
    fields: [
      {
        fieldId: 'custom/1752762684920_departmentmultiselect',
        dataSourceIndex: 0,
      },
    ],
    customAttributeSchemaLookup: {
      [ParentTypeEnum.Risk]: {
        properties: {
          '1752762684920_departmentmultiselect': {
            type: 'string',
            description: 'test',
          },
        },
      },
    },
  });
  expect(result.sql).toEqual(`select
  "t0-1752762684920_departmentmultiselect"."Name" as "f0"
from
  "risksmart"."risk" as "t0"
  left join lateral (
    select
      coalesce(json_agg("tt"."Name"), '[]') as "Name"
    from
      "risksmart"."department_type" as "tt"
    where
      "tt"."Id" in (
        select
          (
            jsonb_array_elements_text(
              (
                "t0"."CustomAttributeData" ->> '1752762684920_departmentmultiselect'
              )::jsonb
            )::uuid
          )
      )
  ) as "t0-1752762684920_departmentmultiselect" on true`);
});

it('can return multselect custom attribute field', async () => {
  const result = await getReportDataSql({
    dataSources: [{ type: 'risks' }],
    fields: [
      { fieldId: 'custom/1752762684920_multiselect', dataSourceIndex: 0 },
    ],

    customAttributeSchemaLookup: {
      [ParentTypeEnum.Risk]: {
        properties: {
          '1752762684920_multiselect': {
            enum: ['A', 'B'],
            type: 'array',
            description: 'test',
            uniqueItems: true,
          },
        },
      },
    },
  });
  expect(result.sql).toEqual(`select
  (
    "t0"."CustomAttributeData" ->> '1752762684920_multiselect'
  )::jsonb as "f0"
from
  "risksmart"."risk" as "t0"`);
});

it('can filter on a multselect custom attribute field', async () => {
  const result = await getReportDataSql({
    dataSources: [{ type: 'risks' }],
    fields: [{ fieldId: 'id', dataSourceIndex: 0 }],
    filters: {
      operation: 'and',
      filters: [
        {
          field: {
            fieldId: 'custom/1752762684920_multiselect',
            dataSourceIndex: 0,
          },
          operator: '=',
          value: 'B',
        },
      ],
    },
    customAttributeSchemaLookup: {
      [ParentTypeEnum.Risk]: {
        properties: {
          '1752762684920_multiselect': {
            enum: ['A', 'B'],
            type: 'array',
            description: 'test',
            uniqueItems: true,
          },
        },
      },
    },
  });
  expect(result.sql).toEqual(`select
  "t0"."Id" as "f0"
from
  "risksmart"."risk" as "t0"
where
  exists (
    select
      1 as "match"
    from
      jsonb_array_elements_text(
        coalesce(
          cast(
            (
              "t0"."CustomAttributeData" ->> '1752762684920_multiselect'
            )::jsonb as jsonb
          ),
          '[]'::jsonb
        )
      ) as "items"
    where
      "items" = $1
  )`);
});
