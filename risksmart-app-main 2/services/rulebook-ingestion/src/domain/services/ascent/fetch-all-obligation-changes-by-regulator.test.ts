import { randomUUID } from 'node:crypto';

import { regulatorIdSchema } from 'src/domain/types';
import {
  type NewRawExternalObligationChange,
  newRawExternalObligationChangeSchema,
} from 'src/domain/types/obligation-change';

import { createFetchAllObligationChangesByRegulator } from './fetch-all-obligation-changes-by-regulator';

const buildObligationChange = (overrides?: {
  externalId?: string;
  externalParentId?: string;
}): NewRawExternalObligationChange =>
  newRawExternalObligationChangeSchema.parse({
    externalId: overrides?.externalId ?? randomUUID(),
    externalParentId: overrides?.externalParentId ?? randomUUID(),
    type: 'obligation_change',
    json: JSON.stringify({ id: overrides?.externalId ?? randomUUID() }),
  });

describe('Fetch all obligation changes by regulator', () => {
  it('should return an empty map when there are no obligation changes to fetch', async () => {
    const mockGetObligationChanges = vi.fn().mockResolvedValue(null);

    const service = createFetchAllObligationChangesByRegulator({
      getObligationChanges: mockGetObligationChanges,
    });

    const result = await service(new Map());

    expect(result.size).toBe(0);
    expect(mockGetObligationChanges).toHaveBeenCalledTimes(1);
    expect(mockGetObligationChanges).toHaveBeenCalledWith(1);
  });

  it('should fetch all obligation changes across pages and return them grouped by regulator', async () => {
    const taskId1 = randomUUID();
    const taskId2 = randomUUID();

    const page1: NewRawExternalObligationChange[] = [
      buildObligationChange({ externalId: 'tv-1', externalParentId: taskId1 }),
      buildObligationChange({ externalId: 'tv-2', externalParentId: taskId2 }),
    ];

    const page2: NewRawExternalObligationChange[] = [
      buildObligationChange({ externalId: 'tv-3', externalParentId: taskId1 }),
    ];

    const mockGetObligationChanges = vi
      .fn()
      .mockResolvedValueOnce(page1)
      .mockResolvedValueOnce(page2)
      .mockResolvedValueOnce(null);

    const service = createFetchAllObligationChangesByRegulator({
      getObligationChanges: mockGetObligationChanges,
    });

    const taskRegulatorIdMap = new Map([
      [taskId1, regulatorIdSchema.parse('regulator-1')],
      [taskId2, regulatorIdSchema.parse('regulator-2')],
    ]);

    const result = await service(taskRegulatorIdMap);

    // two regulators: regulator-1 with tv-1 and tv-3, regulator-2 with tv-2
    expect(result.size).toBe(2);

    expect(result.get(regulatorIdSchema.parse('regulator-1'))).toEqual([
      page1[0],
      ...page2,
    ]);

    expect(result.get(regulatorIdSchema.parse('regulator-2'))).toEqual([
      page1[1],
    ]);
  });

  it('should skip obligation changes whose parent task is not in the map', async () => {
    const knownTaskId = randomUUID();

    const page1: NewRawExternalObligationChange[] = [
      buildObligationChange({
        externalId: 'tv-1',
        externalParentId: knownTaskId,
      }),
      buildObligationChange({
        externalId: 'tv-2',
        externalParentId: 'unknown-task-id',
      }),
    ];

    const mockGetObligationChanges = vi
      .fn()
      .mockResolvedValueOnce(page1)
      .mockResolvedValueOnce(null);

    const service = createFetchAllObligationChangesByRegulator({
      getObligationChanges: mockGetObligationChanges,
    });

    const taskRegulatorIdMap = new Map([
      [knownTaskId, regulatorIdSchema.parse('regulator-1')],
    ]);

    const result = await service(taskRegulatorIdMap);

    expect(result.size).toBe(1);
    expect(result.get(regulatorIdSchema.parse('regulator-1'))).toHaveLength(1);
    expect(
      result.get(regulatorIdSchema.parse('regulator-1'))?.[0]?.externalId
    ).toBe('tv-1');
  });
});
