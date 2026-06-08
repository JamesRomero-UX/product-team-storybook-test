import { getReportDataSql } from './sqlQueryBuilder';

describe('sqlQueryBuilder - third parties and questionnaires', () => {
  it('should join responses -> third parties via ThirdPartyId', async () => {
    const result = await getReportDataSql({
      dataSources: [
        { type: 'thirdParties' },
        {
          type: 'responses',
          parentIndex: 0,
          relationshipToParentIndex: 'child',
        },
      ],
      fields: [
        { fieldId: 'title', dataSourceIndex: 0 },
        { fieldId: 'status', dataSourceIndex: 1 },
      ],
      customAttributeSchemaLookup: {},
    });

    expect(result.sql).toEqual(`select
  "t0"."Title" as "f0",
  "t1"."Status" as "f1"
from
  "risksmart"."third_party" as "t0"
  inner join "risksmart"."responses_view" as "t1" on "t1"."ThirdPartyId" = "t0"."Id"`);
  });

  it('should join responses -> questionnaires via QuestionnaireTemplateVersionId', async () => {
    const result = await getReportDataSql({
      dataSources: [
        { type: 'questionnaires' },
        {
          type: 'responses',
          parentIndex: 0,
          relationshipToParentIndex: 'child',
        },
      ],
      fields: [
        { fieldId: 'version', dataSourceIndex: 0 },
        { fieldId: 'status', dataSourceIndex: 1 },
      ],
      customAttributeSchemaLookup: {},
    });

    expect(result.sql).toEqual(`select
  "t0"."Version" as "f0",
  "t1"."Status" as "f1"
from
  "risksmart"."questionnaires_view" as "t0"
  inner join "risksmart"."responses_view" as "t1" on "t1"."QuestionnaireTemplateVersionId" = "t0"."Id"`);
  });

  it('should join thirdParties -> responses -> questionnaires', async () => {
    const result = await getReportDataSql({
      dataSources: [
        { type: 'thirdParties' },
        {
          type: 'responses',
          parentIndex: 0,
          relationshipToParentIndex: 'child',
        },
        {
          type: 'questionnaires',
          parentIndex: 1,
          relationshipToParentIndex: 'parent',
        },
      ],
      fields: [
        { fieldId: 'title', dataSourceIndex: 0 },
        { fieldId: 'status', dataSourceIndex: 1 },
        { fieldId: 'userEmail', dataSourceIndex: 1 },
        { fieldId: 'title', dataSourceIndex: 2 },
        { fieldId: 'version', dataSourceIndex: 2 },
      ],
      customAttributeSchemaLookup: {},
    });

    expect(result.sql).toEqual(`select
  "t0"."Title" as "f0",
  "t1"."Status" as "f1",
  "t1"."UserEmail" as "f2",
  "t2"."Title" as "f3",
  "t2"."Version" as "f4"
from
  "risksmart"."third_party" as "t0"
  inner join "risksmart"."responses_view" as "t1" on "t1"."ThirdPartyId" = "t0"."Id"
  inner join "risksmart"."questionnaires_view" as "t2" on "t1"."QuestionnaireTemplateVersionId" = "t2"."Id"`);
  });

  it('should join questionnaire template tags (inlineArrayJoin with idColumn) via TemplateId', async () => {
    const result = await getReportDataSql({
      dataSources: [{ type: 'questionnaires' }],
      fields: [
        { fieldId: 'id', dataSourceIndex: 0 },
        { fieldId: 'tags', dataSourceIndex: 0 },
      ],
      customAttributeSchemaLookup: {},
    });

    expect(result.sql).toEqual(`select
  "t0"."TemplateId" as "f0",
  "t0-tags"."Name" as "f1"
from
  "risksmart"."questionnaires_view" as "t0"
  left join lateral (
    select
      coalesce(json_agg("tt"."Name"), '[]') as "Name"
    from
      "risksmart"."tag_type" as "tt"
      inner join "risksmart"."tag" as "t" on "t"."TagTypeId" = "tt"."Id"
    where
      "t"."ParentId" = "t0"."TemplateId"
  ) as "t0-tags" on true`);
  });

  it('should join questionnaire template owners (inlineArrayJoinFunction with idColumn) via TemplateId', async () => {
    const result = await getReportDataSql({
      dataSources: [{ type: 'questionnaires' }],
      fields: [
        { fieldId: 'id', dataSourceIndex: 0 },
        { fieldId: 'owners', dataSourceIndex: 0 },
      ],
      customAttributeSchemaLookup: {},
    });

    expect(result.sql).toEqual(`select
  "t0"."TemplateId" as "f0",
  "t0-ownerUsersAndGroups"."Name" as "f1"
from
  "risksmart"."questionnaires_view" as "t0"
  left join lateral (
    select
      coalesce(json_agg("tt"."Name"), '[]') as "Name"
    from
      "risksmart"."get_owners_and_owner_groups" ("t0"."TemplateId") as "tt"
  ) as "t0-ownerUsersAndGroups" on true`);
  });

  it('should query custom attributes from questionnaires_view', async () => {
    const result = await getReportDataSql({
      dataSources: [{ type: 'questionnaires' }],
      fields: [
        { fieldId: 'id', dataSourceIndex: 0 },
        { fieldId: 'custom/1234_text', dataSourceIndex: 0 },
      ],
      customAttributeSchemaLookup: {
        questionnaire_template: {
          properties: {
            '1234_text': { type: 'string' },
          },
        },
      },
    });

    expect(result.sql).toEqual(`select
  "t0"."TemplateId" as "f0",
  "t0"."CustomAttributeData" ->> '1234_text' as "f1"
from
  "risksmart"."questionnaires_view" as "t0"`);
  });
});
