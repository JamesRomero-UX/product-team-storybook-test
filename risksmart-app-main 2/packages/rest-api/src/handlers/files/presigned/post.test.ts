import { allowedFileExtensions } from '@risksmart-app/shared/allowedFileExtensions';
import type {
  APIGatewayEventRequestContextV2WithAuthorizer,
  APIGatewayProxyEventV2,
  Context,
} from 'aws-lambda';
import { ParentTypeEnum } from 'generated/graphql';
import type { RecursivePartial } from 'src/testing/stub';
import { stub } from 'src/testing/stub';
import { vi } from 'vitest';

import { handler } from './post';

const requestBody = {};
const invalidFile = 'file.exe';
const fileNames = ['file1.txt'];
const parentIds = ['parent-id'];
const invalidParentType = 'parent-type';
const validParentType = 'acceptance';
const parentType = invalidParentType;

const validRequestBody = {
  ...requestBody,
  fileNames,
  parentIds,
  parentType: validParentType,
};

const requestContext: RecursivePartial<
  APIGatewayEventRequestContextV2WithAuthorizer<unknown>
> = {
  authorizer: {
    jwt: {
      claims: {
        aud: '[http://localhost:8080 https://dev-t8t3iey3b54zkh7i.uk.auth0.com/userinfo]',
        azp: 'eZx05JQcFBZNWXBKwEk7VvCfq4kqhKTG',
        claims_roles: '[RiskManager]',
        exp: '1706283864',
        //hasura.io/jwt/claims:
        https:
          'map[x-hasura-allowed-departments:{00000000-0000-0000-0000-000000000000} x-hasura-allowed-roles:[RiskManager] x-hasura-default-role:RiskManager x-hasura-logo:default x-hasura-org-id:org_Qshp7tYsxxAWwhVa x-hasura-tenant-name:OctoEnergy x-hasura-user-id:auth0|644151efc3a961d2784456d9]',
        iat: '1706197464',
        iss: 'https://dev-t8t3iey3b54zkh7i.uk.auth0.com/',
        org_id: 'org_Qshp7tYsxxAWwhVa',
        scope: 'openid',
        sub: 'auth0|644151efc3a961d2784456d9',
      },
    },
  },
};

// TODO: Replace this mock with S3 sdk mock instead
vi.mock('src/s3Services', async () => ({
  getS3PresignedUrlForUpload: vi.fn(() => ({
    key: 'some-key',
    signedUrl: 'some-signed-url',
  })),
}));

describe('file presigned upload post', () => {
  it.each([
    { ...requestBody, expectedStatusCode: 400 },
    { ...requestBody, fileNames, expectedStatusCode: 400 },
    { ...requestBody, fileNames, parentIds, expectedStatusCode: 400 },
    {
      ...requestBody,
      fileNames,
      parentIds,
      parentType,
      expectedStatusCode: 400,
    },
    {
      ...requestBody,
      fileNames: [invalidFile],
      parentIds,
      parentType,
      expectedStatusCode: 400,
    },
    {
      ...requestBody,
      fileNames,
      parentIds,
      parentType: validParentType,
      expectedStatusCode: 200,
    },
  ])(
    'should validate post body and return status code $expectedStatusCode',
    async ({ expectedStatusCode, ...requestBody }) => {
      const result = await handler(
        stub<APIGatewayProxyEventV2>({
          body: JSON.stringify(requestBody),
          requestContext,
        }),
        stub<Context>({})
      );
      expect(result.statusCode).toEqual(expectedStatusCode);
    }
  );
  it.each([
    ...Object.entries(ParentTypeEnum).map(([, value]) => ({
      ...validRequestBody,
      parentType: value,
      expectedStatusCode: 200,
    })),
    {
      ...validRequestBody,
      parentType: 'invalid-parent-type',
      expectedStatusCode: 400,
    },
    {
      ...validRequestBody,
      parentType: '',
      expectedStatusCode: 400,
    },
    {
      ...validRequestBody,
      parentType: 12345 as unknown as string,
      expectedStatusCode: 400,
    },
  ])(
    'should validate parent type $parentType and return status code $expectedStatusCode',
    async ({ expectedStatusCode, ...requestBody }) => {
      const result = await handler(
        stub<APIGatewayProxyEventV2>({
          body: JSON.stringify(requestBody),
          requestContext,
        }),
        stub<Context>({})
      );
      expect(result.statusCode).toEqual(expectedStatusCode);
    }
  );
  it.each([
    ...allowedFileExtensions.map((extension) => ({
      ...validRequestBody,
      fileNames: [`file${extension}`],
      expectedStatusCode: 200,
    })),
    ...allowedFileExtensions.map((extension) => ({
      ...validRequestBody,
      fileNames: [`file${extension.toUpperCase()}`],
      expectedStatusCode: 200,
    })),
    {
      ...validRequestBody,
      fileNames: [`file.exe`],
      expectedStatusCode: 400,
    },
    {
      ...validRequestBody,
      fileNames: [`file.sadsadas`],
      expectedStatusCode: 400,
    },
    {
      ...validRequestBody,
      fileNames: ['file.pdf', 'file.exe'],
      expectedStatusCode: 400,
    },
    {
      ...validRequestBody,
      fileNames: ['file.pdf', 'file.doc'],
      expectedStatusCode: 200,
    },
  ])(
    'should validate file type $parentType and return status code $expectedStatusCode',
    async ({ expectedStatusCode, ...requestBody }) => {
      const result = await handler(
        stub<APIGatewayProxyEventV2>({
          body: JSON.stringify(requestBody),
          requestContext,
        }),
        stub<Context>({})
      );
      expect(result.statusCode).toEqual(expectedStatusCode);
    }
  );
});
