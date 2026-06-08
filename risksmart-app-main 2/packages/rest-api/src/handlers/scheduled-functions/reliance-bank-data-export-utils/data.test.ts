import { expectTypeOf } from 'expect-type';
import type { GetNormalisedRelianceBankExportDataQuery } from 'generated/graphql';
import {
  IndicatorTypeEnum,
  RiskStatusTypeEnum,
  RiskTreatmentTypeEnum,
} from 'generated/graphql';
import { describe, test } from 'vitest';

/*
 * This will not fail when running the test suit however the linting and tsc
 * will flag changes in the generated graphql export data type.
 *
 * This is so we don't accidentally break any integrations the client might build
 * on top of the data we give them.
 *
 * If the changes are intentional then please update the expected data and
 * give the client a heads-up before it goes to prod.
 * */
describe('GetNormalisedRelianceBankExportDataQuery', () => {
  test('should not change unexpectedly', () => {
    const expected: GetNormalisedRelianceBankExportDataQuery = {
      risk: [
        {
          Id: 'test',
          CreatedAtTimestamp: 'test',
          CreatedByUser: 'test',
          Description: ' ',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          OrgKey: 'test',
          ParentRiskId: 'test',
          SequentialId: 112,
          Status: RiskStatusTypeEnum.Active,
          Tier: 3,
          Title: 'test',
          Treatment: RiskTreatmentTypeEnum.Terminate,
          CustomAttributeData: {},
        },
      ],
      indicator: [
        {
          CreatedAtTimestamp: 'test',
          CreatedByUser: 'test',
          Description: 'test',
          Id: 'test',
          LowerAppetiteNum: null,
          LowerToleranceNum: null,
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          OrgKey: 'test',
          SequentialId: 66,
          TargetValueTxt: null,
          Title: 'test',
          Type: IndicatorTypeEnum.Number,
          Unit: 'test',
          UpperAppetiteNum: 10,
          UpperToleranceNum: 25,
          CustomAttributeData: {},
        },
      ],
      indicator_result: [
        {
          CreatedAtTimestamp: 'test',
          CreatedByUser: 'test',
          Description: null,
          Id: 'test',
          IndicatorId: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          OrgKey: 'test',
          ResultDate: 'test',
          TargetValueNum: 1,
          TargetValueTxt: null,
          CustomAttributeData: null,
        },
      ],
      owner: [
        {
          CreatedAtTimestamp: 'test',
          CreatedByUser: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          OrgKey: 'test',
          ParentId: 'test',
          UserId: 'test',
        },
      ],
      user: [
        {
          BusinessUnit_Id: null,
          Department: 'test',
          Email: 'test',
          FirstName: 'test',
          FriendlyName: 'test',
          Id: 'test',
          IsCustomerSupport: false,
          JobTitle: 'test',
          LastName: 'test',
          LastSeen: null,
          OrgKey: 'test',
          RoleKey: null,
          Status: 'test',
          UserName: 'test',
          OfficeLocation: null,
        },
      ],
      contributor: [
        {
          CreatedAtTimestamp: 'test',
          CreatedByUser: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          OrgKey: 'test',
          ParentId: 'test',
          UserId: 'test',
        },
      ],
      department: [
        {
          CreatedAtTimestamp: 'test',
          CreatedByUser: 'v',
          DepartmentTypeId: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          OrgKey: 'test',
          ParentId: 'test',
        },
      ],
      department_type: [
        {
          CreatedAtTimestamp: 'test',
          CreatedByUser: 'test',
          DepartmentTypeGroupId: 'test',
          DepartmentTypeId: 'test',
          Description: null,
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          Name: 'test',
          OrgKey: 'test',
        },
      ],
      tag: [
        {
          CreatedAtTimestamp: 'test',
          CreatedByUser: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          OrgKey: 'test',
          ParentId: 'test',
          TagTypeId: 'test',
        },
      ],
      tag_type: [
        {
          CreatedAtTimestamp: 'test',
          CreatedByUser: 'test',
          Description: null,
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          Name: 'test',
          OrgKey: 'test',
          TagTypeGroupId: 'test',
          TagTypeId: 'test',
        },
      ],
      custom_attribute_schema: [
        {
          CreatedAtTimestamp: 'test',
          CreatedByUser: 'test',
          Id: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          OrgKey: 'test',
          Schema: {},
          UiSchema: {},
        },
      ],
      indicator_parent: [
        {
          CreatedAtTimestamp: 'test',
          CreatedByUser: 'test',
          IndicatorId: 'test',
          ModifiedAtTimestamp: 'test',
          ModifiedByUser: 'test',
          OrgKey: 'test',
          ParentId: 'test',
        },
      ],
    };

    expectTypeOf(expected).toHaveProperty('risk');
    expectTypeOf(expected).toHaveProperty('indicator');
    expectTypeOf(expected).toHaveProperty('indicator_result');
    expectTypeOf(expected).toHaveProperty('owner');
    expectTypeOf(expected).toHaveProperty('user');
    expectTypeOf(expected).toHaveProperty('contributor');
    expectTypeOf(expected).toHaveProperty('department');
    expectTypeOf(expected).toHaveProperty('department_type');
    expectTypeOf(expected).toHaveProperty('tag');
    expectTypeOf(expected).toHaveProperty('tag_type');
    expectTypeOf(expected).toHaveProperty('custom_attribute_schema');
    expectTypeOf(expected).toHaveProperty('indicator_parent');
  });
});
