import { mockGetOrgMetaDataQuery, mockGetUsersQuery } from 'generated/graphql';
import { HttpResponse } from 'msw';
import { server } from 'src/testing/mocks/server';
import { vi, vitest } from 'vitest';

import { CUSTOMER_SUPPORT_ROLE } from '../../repositories/types';
import { AttestationConfigService } from './attestation-config.service';

vitest.mock('sst/node/config');

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

describe('AttestationConfigService', () => {
  const orgKey = 'orgId';
  const attestationConfigService = AttestationConfigService({
    tenant: 'tenant',
    userId: 'userId',
    orgKey,
    userRole: CUSTOMER_SUPPORT_ROLE,
  });

  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('THIRD_PARTY_CONNECTION_NAME', 'third_party_connection');
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  describe('getAttestationUsers', () => {
    beforeEach(() => {
      // Setup default mocks
      const mockGetOrgMeta = mockGetOrgMetaDataQuery(() => {
        return HttpResponse.json({
          data: {
            auth_organisation_by_pk: {
              OrgKey: orgKey,
              Name: 'Org 1',
            },
          },
        });
      });
      const mockGetUsers = mockGetUsersQuery(() => {
        return HttpResponse.json({
          data: {
            user: [],
          },
        });
      });
      server.use(mockGetOrgMeta, mockGetUsers);
    });

    it('should return an empty array if no users exist for the org', async () => {
      const result = await attestationConfigService.getAttestationUsers({
        RequireGlobalAttestation: true,
        groups: [],
      });

      expect(result).toEqual([]);
    });

    it('should return all users when RequireGlobalAttestation=true', async () => {
      const mockGetUsers = mockGetUsersQuery(() => {
        return HttpResponse.json({
          data: {
            user: [
              {
                Id: '1',
                UserName: 'User1',
                Email: 'email1@risksmart.com',
                IsCustomerSupport: false,
              },
              {
                Id: '2',
                UserName: 'User2',
                Email: 'email1@risksmart.com',
                IsCustomerSupport: false,
              },
            ],
          },
        });
      });
      server.use(mockGetUsers);

      const result = await attestationConfigService.getAttestationUsers({
        RequireGlobalAttestation: true,
        groups: [],
      });

      expect(result.length).toEqual(2);
      expect(result).toEqual([
        {
          Id: '1',
          UserName: 'User1',
          Email: 'email1@risksmart.com',
          IsCustomerSupport: false,
        },
        {
          Id: '2',
          UserName: 'User2',
          Email: 'email1@risksmart.com',
          IsCustomerSupport: false,
        },
      ]);
    });

    it('should exclude support users', async () => {
      const mockGetUsers = mockGetUsersQuery(() => {
        return HttpResponse.json({
          data: {
            user: [
              {
                Id: '1',
                UserName: 'User1',
                Email: 'email1@risksmart.com',
                IsCustomerSupport: false,
              },
              {
                Id: '2',
                UserName: 'User2',
                Email: 'email1@risksmart.com',
                IsCustomerSupport: true,
              },
            ],
          },
        });
      });
      server.use(mockGetUsers);

      const result = await attestationConfigService.getAttestationUsers({
        RequireGlobalAttestation: true,
        groups: [],
      });

      expect(result.length).toEqual(1);
      expect(result).toEqual([
        {
          Id: '1',
          UserName: 'User1',
          Email: 'email1@risksmart.com',
          IsCustomerSupport: false,
        },
      ]);
    });

    it('should exclude third party users', async () => {
      const mockGetUsers = mockGetUsersQuery(() => {
        return HttpResponse.json({
          data: {
            user: [
              {
                Id: '1',
                UserName: 'User1',
                Email: 'email1@risksmart.com',
                IsCustomerSupport: false,
              },
              {
                Id: '2',
                UserName: 'User2',
                Email: 'email1@risksmart.com',
                IsCustomerSupport: false,
                AuthConnection: 'third_party_connection',
              },
              {
                Id: '3',
                UserName: 'User3',
                Email: 'email3@risksmart.com',
                IsCustomerSupport: false,
                RoleKey: 'ThirdPartyRespondent',
              },
            ],
          },
        });
      });
      server.use(mockGetUsers);

      const result = await attestationConfigService.getAttestationUsers({
        RequireGlobalAttestation: true,
        groups: [],
      });

      expect(result.length).toEqual(1);
      expect(result).toEqual([
        {
          Id: '1',
          UserName: 'User1',
          Email: 'email1@risksmart.com',
          IsCustomerSupport: false,
        },
      ]);
    });

    it('should exclude archived users', async () => {
      const mockGetUsers = mockGetUsersQuery(() => {
        return HttpResponse.json({
          data: {
            user: [
              {
                Id: '1',
                UserName: 'User1',
                Email: 'email1@risksmart.com',
                IsCustomerSupport: false,
              },
              {
                Id: '2',
                UserName: 'User2',
                Email: 'email1@risksmart.com',
                IsCustomerSupport: true,
                Status: 'archived',
              },
            ],
          },
        });
      });
      server.use(mockGetUsers);

      const result = await attestationConfigService.getAttestationUsers({
        RequireGlobalAttestation: true,
        groups: [],
      });

      expect(result.length).toEqual(1);
      expect(result).toEqual([
        {
          Id: '1',
          UserName: 'User1',
          Email: 'email1@risksmart.com',
          IsCustomerSupport: false,
        },
      ]);
    });

    it('should include support users if org is a isRisksmartOrg org', async () => {
      const mockGetOrgMeta = mockGetOrgMetaDataQuery(() => {
        return HttpResponse.json({
          data: {
            auth_organisation_by_pk: {
              OrgKey: orgKey,
              Name: 'Org 1',
              Meta: { isRisksmartOrg: 'true' },
            },
          },
        });
      });
      const mockGetUsers = mockGetUsersQuery(() => {
        return HttpResponse.json({
          data: {
            user: [
              {
                Id: '1',
                UserName: 'User1',
                Email: 'email1@risksmart.com',
                IsCustomerSupport: true,
              },
            ],
          },
        });
      });
      server.use(mockGetOrgMeta, mockGetUsers);

      const result = await attestationConfigService.getAttestationUsers({
        RequireGlobalAttestation: true,
        groups: [],
      });

      expect(result.length).toEqual(1);
      expect(result).toEqual([
        {
          Id: '1',
          UserName: 'User1',
          Email: 'email1@risksmart.com',
          IsCustomerSupport: true,
        },
      ]);
    });
  });
});
