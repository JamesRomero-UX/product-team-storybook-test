import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getAllControlGroups,
  insertControlGroup,
} from '../clients/controlGroupClient';
import { buildControlGroup } from '../data/controlGroup';
import {
  customerSupportUser1,
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

describe('controlGroup', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('query', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...customerSupportUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
    ])(
      '$RoleKey should see $expectedRecords control groups',
      async ({ expectedRecords, ...user }) => {
        await insertControlGroup({ objects: [buildControlGroup({})] });
        const controls = await getAllControlGroups({
          user,
        });
        expect(controls.length).toEqual(expectedRecords);
      }
    );
  });
});
