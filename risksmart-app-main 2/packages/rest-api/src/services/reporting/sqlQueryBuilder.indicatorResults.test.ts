import { getReportDataSql } from './sqlQueryBuilder';

describe('sqlQueryBuilder - indicator results', () => {
  it('can query indicator results', async () => {
    const result = await getReportDataSql({
      dataSources: [
        { type: 'indicators' },
        { type: 'indicatorResults', parentIndex: 0 },
      ],
      fields: [
        { fieldId: 'name', dataSourceIndex: 0 },
        { fieldId: 'date', dataSourceIndex: 1 },
        { fieldId: 'textValue', dataSourceIndex: 1 },
      ],
      customAttributeSchemaLookup: {},
    });
    expect(result.sql).toEqual(`select
  "t0"."Title" as "f0",
  "t1"."ResultDate" as "f1",
  "t1"."TargetValueTxt" as "f2"
from
  "risksmart"."indicator" as "t0"
  inner join "risksmart"."indicator_result" as "t1" on "t1"."IndicatorId" = "t0"."Id"`);
  });

  it('can query latest indicator results', async () => {
    const result = await getReportDataSql({
      dataSources: [
        { type: 'indicators' },
        { type: 'indicatorResults', latest: true, parentIndex: 0 },
      ],
      fields: [
        { fieldId: 'name', dataSourceIndex: 0 },
        { fieldId: 'date', dataSourceIndex: 1 },
        { fieldId: 'textValue', dataSourceIndex: 1 },
      ],
      customAttributeSchemaLookup: {},
    });
    expect(result.sql).toEqual(`select
  "t0"."Title" as "f0",
  "t1"."ResultDate" as "f1",
  "t1"."TargetValueTxt" as "f2"
from
  "risksmart"."indicator" as "t0"
  inner join "risksmart"."latest_indicator_result_view" as "t1" on "t1"."IndicatorId" = "t0"."Id"`);
  });
});
