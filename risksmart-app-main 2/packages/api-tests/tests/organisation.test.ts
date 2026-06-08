import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getOrganisations } from '../clients/organisationClient';
import {
  internalAuditUser1,
  readOnlyUser1,
  riskManagerUser1,
  setup,
  standardEnhancedUser1,
  standardUser1,
  teardown,
} from '../initialData';

const mockedDefaults = vi.hoisted(() => {
  return {
    getDefaultOrgId: vi.fn(),
    getAnotherOrgId: vi.fn(),
    getDefaultUserId: vi.fn(),
  };
});

vi.mock('../clients/defaults', () => mockedDefaults);

describe('organisation', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('query', () => {
    it.each([
      { ...riskManagerUser1 },
      { ...standardUser1 },
      { ...readOnlyUser1 },
      { ...standardEnhancedUser1 },
      { ...internalAuditUser1 },
    ])(
      '$RoleKey can view the meta of there own organisation',
      async ({ ...user }) => {
        const orgs = await getOrganisations({
          user,
        });
        expect(orgs.data.auth_organisation.length).toEqual(1);
        expect(orgs.data.auth_organisation[0].Meta).toBeDefined();
      }
    );
  });
});
