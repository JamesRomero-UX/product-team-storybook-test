import { buildIngestionRun } from 'test/builders/ingestion-run-builder';
import {
  buildObligation,
  withContentHash,
  withExternalId,
} from 'test/builders/obligation-builder';

import type { Regulator } from '../types';
import { regulatorIdSchema } from '../types';
import { createChangeDetectionService } from './change-detection-service';

describe('Change detection service', () => {
  it('should detect all obligations as added when there is no previous run', async () => {
    const mockIngestionRun = buildIngestionRun();

    const obligations = [
      buildObligation(withExternalId('external-1')),
      buildObligation(withExternalId('external-2')),
      buildObligation(withExternalId('external-3')),
    ];

    const detectChanges = createChangeDetectionService({
      getHashesForRegulator: vi.fn().mockResolvedValue([]),
      getByRegulator: vi.fn().mockResolvedValue(obligations),
    });

    const regulator: Regulator = {
      id: regulatorIdSchema.parse('regulator-1'),
      name: 'Regulator 1',
    };

    const result = await detectChanges(mockIngestionRun, null, regulator.id);

    expect(result.added).toHaveLength(3);
    expect(result.updated).toHaveLength(0);
    expect(result.removed).toHaveLength(0);
  });

  describe('when there is a previous completed run', () => {
    it('should detect modified obligations when their content hash has changed', async () => {
      const mockIngestionRun = buildIngestionRun();
      const mockPreviousIngestionRun = buildIngestionRun();

      const obligations = [
        buildObligation(
          withExternalId('external-1'),
          withContentHash('new-hash')
        ),
        buildObligation(
          withExternalId('external-2'),
          withContentHash('old-hash')
        ),
        buildObligation(
          withExternalId('external-3'),
          withContentHash('old-hash')
        ),
      ];

      const previousRunObligationHashes = [
        buildObligation(
          withExternalId('external-1'),
          withContentHash('old-hash')
        ),
        buildObligation(
          withExternalId('external-2'),
          withContentHash('old-hash')
        ),
        buildObligation(
          withExternalId('external-3'),
          withContentHash('old-hash')
        ),
      ].map((obligation) => ({
        externalId: obligation.externalId,
        contentHash: obligation.contentHash,
      }));

      const mockGetObligationHashesForRegulator = vi
        .fn()
        .mockResolvedValueOnce(obligations)
        .mockResolvedValueOnce(previousRunObligationHashes);

      const mockGetObligationsByRegulator = vi
        .fn()
        .mockImplementation(
          (
            _ingestionRunId: string,
            _regulatorId: string,
            externalIds: string[]
          ) => {
            return obligations.filter((o) =>
              externalIds.includes(o.externalId)
            );
          }
        );

      const detectChanges = createChangeDetectionService({
        getHashesForRegulator: mockGetObligationHashesForRegulator,
        getByRegulator: mockGetObligationsByRegulator,
      });

      const regulator: Regulator = {
        id: regulatorIdSchema.parse('regulator-1'),
        name: 'Regulator 1',
      };

      const result = await detectChanges(
        mockIngestionRun,
        mockPreviousIngestionRun,
        regulator.id
      );

      expect(result.updated).toHaveLength(1);
      expect(result.added).toHaveLength(0);
      expect(result.removed).toHaveLength(0);
      expect(result.updated[0]!.externalId).toBe('external-1');
    });

    it('should detect new obligations that did not exist in the previous run', async () => {
      const mockIngestionRun = buildIngestionRun();
      const mockPreviousIngestionRun = buildIngestionRun();

      const obligations = [
        buildObligation(
          withExternalId('external-1'),
          withContentHash('hash-1')
        ),
        buildObligation(
          withExternalId('external-2'),
          withContentHash('hash-2')
        ),
        buildObligation(
          withExternalId('external-3'),
          withContentHash('hash-3')
        ),
      ];

      const previousRunObligationHashes = [
        { externalId: 'external-1', contentHash: 'hash-1' },
        { externalId: 'external-2', contentHash: 'hash-2' },
        // external-3 doesn't exist in previous run
      ];

      const mockGetObligationHashesForRegulator = vi
        .fn()
        .mockResolvedValueOnce(obligations)
        .mockResolvedValueOnce(previousRunObligationHashes);

      const mockGetObligationsByRegulator = vi
        .fn()
        .mockImplementation(
          (
            _ingestionRunId: string,
            _regulatorId: string,
            externalIds: string[]
          ) => {
            return obligations.filter((o) =>
              externalIds.includes(o.externalId)
            );
          }
        );

      const detectChanges = createChangeDetectionService({
        getHashesForRegulator: mockGetObligationHashesForRegulator,
        getByRegulator: mockGetObligationsByRegulator,
      });

      const regulator: Regulator = {
        id: regulatorIdSchema.parse('regulator-1'),
        name: 'Regulator 1',
      };

      const result = await detectChanges(
        mockIngestionRun,
        mockPreviousIngestionRun,
        regulator.id
      );

      expect(result.added).toHaveLength(1);
      expect(result.added[0]!.externalId).toBe('external-3');
      expect(result.updated).toHaveLength(0);
      expect(result.removed).toHaveLength(0);
    });

    it('should not include obligations in both added and updated lists', async () => {
      const mockIngestionRun = buildIngestionRun();
      const mockPreviousIngestionRun = buildIngestionRun();

      const obligations = [
        buildObligation(
          withExternalId('external-1'),
          withContentHash('new-hash')
        ),
        buildObligation(
          withExternalId('external-2'),
          withContentHash('hash-2')
        ),
        buildObligation(
          withExternalId('external-3'),
          withContentHash('hash-3')
        ),
      ];

      const previousRunObligationHashes = [
        { externalId: 'external-1', contentHash: 'old-hash' },
        // external-2 and external-3 are new
      ];

      const mockGetObligationHashesForRegulator = vi
        .fn()
        .mockResolvedValueOnce(obligations)
        .mockResolvedValueOnce(previousRunObligationHashes);

      const mockGetObligationsByRegulator = vi
        .fn()
        .mockImplementation(
          (
            _ingestionRunId: string,
            _regulatorId: string,
            externalIds: string[]
          ) => {
            return obligations.filter((o) =>
              externalIds.includes(o.externalId)
            );
          }
        );

      const detectChanges = createChangeDetectionService({
        getHashesForRegulator: mockGetObligationHashesForRegulator,
        getByRegulator: mockGetObligationsByRegulator,
      });

      const regulator: Regulator = {
        id: regulatorIdSchema.parse('regulator-1'),
        name: 'Regulator 1',
      };

      const result = await detectChanges(
        mockIngestionRun,
        mockPreviousIngestionRun,
        regulator.id
      );
      // Verify no obligation appears in both lists
      const addedIds = new Set(result.added.map((o) => o.externalId));
      const updatedIds = new Set(result.updated.map((o) => o.externalId));

      for (const addedId of addedIds) {
        expect(updatedIds.has(addedId)).toBe(false);
      }

      // Verify the correct categorization
      expect(result.updated).toHaveLength(1);
      expect(result.updated[0]!.externalId).toBe('external-1');
      expect(result.added).toHaveLength(2);
      expect(result.added.map((o) => o.externalId)).toEqual(
        expect.arrayContaining(['external-2', 'external-3'])
      );
    });

    it('should detect removed obligations that existed in previous run but not in current run', async () => {
      const mockIngestionRun = buildIngestionRun();
      const mockPreviousIngestionRun = buildIngestionRun();

      const currentObligations = [
        buildObligation(
          withExternalId('external-1'),
          withContentHash('hash-1')
        ),
        buildObligation(
          withExternalId('external-2'),
          withContentHash('hash-2')
        ),
      ];

      const previousObligations = [
        buildObligation(
          withExternalId('external-1'),
          withContentHash('hash-1')
        ),
        buildObligation(
          withExternalId('external-2'),
          withContentHash('hash-2')
        ),
        buildObligation(
          withExternalId('external-3'),
          withContentHash('hash-3')
        ),
        buildObligation(
          withExternalId('external-4'),
          withContentHash('hash-4')
        ),
      ];

      const currentRunObligationHashes = currentObligations.map(
        (obligation) => ({
          externalId: obligation.externalId,
          contentHash: obligation.contentHash,
        })
      );

      const previousRunObligationHashes = previousObligations.map(
        (obligation) => ({
          externalId: obligation.externalId,
          contentHash: obligation.contentHash,
        })
      );

      const mockGetObligationHashesForRegulator = vi
        .fn()
        .mockResolvedValueOnce(currentRunObligationHashes)
        .mockResolvedValueOnce(previousRunObligationHashes);

      const mockGetObligationsByRegulator = vi
        .fn()
        .mockImplementation(
          (
            ingestionRunId: string,
            _regulatorId: string,
            externalIds: string[]
          ) => {
            // Return from previous run if querying previous run ID
            const obligations =
              ingestionRunId === mockPreviousIngestionRun.id
                ? previousObligations
                : currentObligations;

            return obligations.filter((o) =>
              externalIds.includes(o.externalId)
            );
          }
        );

      const detectChanges = createChangeDetectionService({
        getHashesForRegulator: mockGetObligationHashesForRegulator,
        getByRegulator: mockGetObligationsByRegulator,
      });

      const regulator: Regulator = {
        id: regulatorIdSchema.parse('regulator-1'),
        name: 'Regulator 1',
      };

      const result = await detectChanges(
        mockIngestionRun,
        mockPreviousIngestionRun,
        regulator.id
      );

      expect(result.added).toHaveLength(0);
      expect(result.updated).toHaveLength(0);
      expect(result.removed).toHaveLength(2);
      expect(result.removed.map((o) => o.externalId)).toEqual(
        expect.arrayContaining(['external-3', 'external-4'])
      );

      // Verify removed obligations were fetched from previous run
      expect(mockGetObligationsByRegulator).toHaveBeenCalledWith(
        mockPreviousIngestionRun.id,
        regulator.id,
        expect.arrayContaining(['external-3', 'external-4'])
      );
    });

    it('should handle mixed changes: added, updated, and removed obligations', async () => {
      const mockIngestionRun = buildIngestionRun();
      const mockPreviousIngestionRun = buildIngestionRun();

      const currentObligations = [
        buildObligation(
          withExternalId('external-1'),
          withContentHash('new-hash-1')
        ),
        buildObligation(
          withExternalId('external-2'),
          withContentHash('hash-2')
        ),
        buildObligation(
          withExternalId('external-4'),
          withContentHash('hash-4')
        ),
      ];

      const previousObligations = [
        buildObligation(
          withExternalId('external-1'),
          withContentHash('old-hash-1')
        ),
        buildObligation(
          withExternalId('external-2'),
          withContentHash('hash-2')
        ),
        buildObligation(
          withExternalId('external-3'),
          withContentHash('hash-3')
        ),
      ];

      const currentRunObligationHashes = currentObligations.map(
        (obligation) => ({
          externalId: obligation.externalId,
          contentHash: obligation.contentHash,
        })
      );

      const previousRunObligationHashes = previousObligations.map(
        (obligation) => ({
          externalId: obligation.externalId,
          contentHash: obligation.contentHash,
        })
      );

      const mockGetObligationHashesForRegulator = vi
        .fn()
        .mockResolvedValueOnce(currentRunObligationHashes)
        .mockResolvedValueOnce(previousRunObligationHashes);

      const mockGetObligationsByRegulator = vi
        .fn()
        .mockImplementation(
          (
            ingestionRunId: string,
            _regulatorId: string,
            externalIds: string[]
          ) => {
            const obligations =
              ingestionRunId === mockPreviousIngestionRun.id
                ? previousObligations
                : currentObligations;

            return obligations.filter((o) =>
              externalIds.includes(o.externalId)
            );
          }
        );

      const detectChanges = createChangeDetectionService({
        getHashesForRegulator: mockGetObligationHashesForRegulator,
        getByRegulator: mockGetObligationsByRegulator,
      });

      const regulator: Regulator = {
        id: regulatorIdSchema.parse('regulator-1'),
        name: 'Regulator 1',
      };

      const result = await detectChanges(
        mockIngestionRun,
        mockPreviousIngestionRun,
        regulator.id
      );

      expect(result.added).toHaveLength(1);
      expect(result.added[0]!.externalId).toBe('external-4');
      expect(result.updated).toHaveLength(1);
      expect(result.updated[0]!.externalId).toBe('external-1');
      expect(result.removed).toHaveLength(1);
      expect(result.removed[0]!.externalId).toBe('external-3');

      // Verify no overlap between lists
      const addedIds = new Set(result.added.map((o) => o.externalId));
      const updatedIds = new Set(result.updated.map((o) => o.externalId));
      const removedIds = new Set(result.removed.map((o) => o.externalId));

      for (const addedId of addedIds) {
        expect(updatedIds.has(addedId)).toBe(false);
        expect(removedIds.has(addedId)).toBe(false);
      }
      for (const updatedId of updatedIds) {
        expect(removedIds.has(updatedId)).toBe(false);
      }
    });
  });
});
