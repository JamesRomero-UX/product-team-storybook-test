import { obligationIdSchema } from '@risksmart-app/domain/src/types/obligation';
import { regulatorySourceSchema } from '@risksmart-app/domain/src/types/regulatory-source';

import { createSyncExternalObligations } from './sync-external-obligations';
import type { NewIngestedObligation } from './types';

describe('sync external obligations', () => {
  const obligationId1 = obligationIdSchema.parse(
    '00000000-0000-0000-0000-000000000001'
  );
  const obligationId2 = obligationIdSchema.parse(
    '00000000-0000-0000-0000-000000000002'
  );
  const obligationId3 = obligationIdSchema.parse(
    '00000000-0000-0000-0000-000000000003'
  );

  const mockSaveExternalObligations = vi.fn();
  const mockGetObligationIdsByExternalIds = vi.fn();

  const syncExternalObligations = createSyncExternalObligations({
    saveExternalObligations: mockSaveExternalObligations,
    getObligationIdsByExternalIds: mockGetObligationIdsByExternalIds,
  });

  const regulatorySource = regulatorySourceSchema.parse({
    orgKey: 'org_123',
    createdByUser: 'SYSTEM',
    modifiedByUser: 'SYSTEM',
    createdAtTimestamp: '',
    modifiedAtTimestamp: '',
    externalRegulatorId: 'EXT-REG-1',
    regulatorName: 'Regulator 1',
    providerName: 'Provider A',
    id: '00000000-0000-0000-0000-000000000000',
  });

  beforeEach(() => {
    mockSaveExternalObligations.mockReset();
    mockGetObligationIdsByExternalIds.mockReset();
  });

  describe('processUpdates', () => {
    it('should return empty array when no updates provided', async () => {
      const actual = await syncExternalObligations.processUpdates({
        updates: [],
        orgKey: 'org-123',
        externalSyncedAt: new Date(),
        regulatorySource,
      });

      expect(actual).toEqual([]);
    });

    it('should successfully update obligations that exist', async () => {
      mockSaveExternalObligations.mockResolvedValue([
        { id: obligationId1, externalId: 'EXT-1' },
        { id: obligationId2, externalId: 'EXT-2' },
      ]);

      const parentId1 = obligationIdSchema.parse(
        '00000000-0000-0000-0000-000000000010'
      );
      const parentId2 = obligationIdSchema.parse(
        '00000000-0000-0000-0000-000000000020'
      );

      mockGetObligationIdsByExternalIds.mockResolvedValue(
        new Map([
          ['EXT-1', { obligationId: obligationId1, parentId: parentId1 }],
          ['EXT-2', { obligationId: obligationId2, parentId: parentId2 }],
        ])
      );

      const updates: NewIngestedObligation[] = [
        {
          externalId: 'EXT-1',
          title: 'Updated Obligation 1',
          description: 'Updated description 1',
          contentHash: 'HASH_1',
          externalParentId: 'PARENT-1',
          type: 'chapter',
          regulatorySourceId: regulatorySource.id,
        },
        {
          externalId: 'EXT-2',
          title: 'Updated Obligation 2',
          description: 'Updated description 2',
          contentHash: 'HASH_2',
          externalParentId: 'PARENT-2',
          type: 'chapter',
          regulatorySourceId: regulatorySource.id,
        },
      ];

      await syncExternalObligations.processUpdates({
        updates,
        orgKey: 'org-123',
        externalSyncedAt: new Date('2024-01-01T00:00:00Z'),
        regulatorySource,
      });

      expect(mockSaveExternalObligations).toHaveBeenCalledTimes(1);
      expect(mockSaveExternalObligations).toHaveBeenCalledWith([
        expect.objectContaining({
          externalId: 'EXT-1',
          id: obligationId1,
          parentId: parentId1,
          description: 'Updated description 1',
        }),
        expect.objectContaining({
          externalId: 'EXT-2',
          id: obligationId2,
          parentId: parentId2,
          description: 'Updated description 2',
        }),
      ]);
    });

    it('should throw error when attempting to update obligation that does not exist', async () => {
      mockGetObligationIdsByExternalIds.mockResolvedValue(new Map());

      const updates: NewIngestedObligation[] = [
        {
          externalId: 'NON-EXISTENT',
          title: 'Non-existent Obligation',
          description: 'This obligation does not exist',
          contentHash: 'HASH_X',
          externalParentId: null,
          type: 'standard',
          regulatorySourceId: regulatorySource.id,
        },
      ];

      await expect(
        syncExternalObligations.processUpdates({
          updates,
          orgKey: 'org-123',
          externalSyncedAt: new Date('2024-01-01T00:00:00Z'),
          regulatorySource,
        })
      ).rejects.toThrow(
        'Cannot update obligation that does not exist: NON-EXISTENT'
      );
    });

    it('should apply same externalSyncedAt timestamp to all updated obligations', async () => {
      mockGetObligationIdsByExternalIds.mockResolvedValue(
        new Map([
          ['EXT-1', { obligationId: obligationId1, parentId: null }],
          ['EXT-2', { obligationId: obligationId2, parentId: null }],
        ])
      );

      mockSaveExternalObligations.mockResolvedValue([
        { id: obligationId1, externalId: 'EXT-1' },
        { id: obligationId2, externalId: 'EXT-2' },
      ]);

      const updates: NewIngestedObligation[] = [
        {
          externalId: 'EXT-1',
          title: 'Obligation 1',
          description: 'Description 1',
          contentHash: 'HASH_1',
          externalParentId: null,
          type: 'standard',
          regulatorySourceId: regulatorySource.id,
        },
        {
          externalId: 'EXT-2',
          title: 'Obligation 2',
          description: 'Description 2',
          contentHash: 'HASH_2',
          externalParentId: null,
          type: 'standard',
          regulatorySourceId: regulatorySource.id,
        },
      ];

      const syncDate = new Date('2024-01-01T00:00:00Z');

      await syncExternalObligations.processUpdates({
        updates,
        orgKey: 'org-123',
        externalSyncedAt: syncDate,
        regulatorySource,
      });

      expect(mockSaveExternalObligations).toHaveBeenCalledWith([
        expect.objectContaining({
          externalSyncedAt: syncDate,
        }),
        expect.objectContaining({
          externalSyncedAt: syncDate,
        }),
      ]);
    });

    it('should set system user as modifier for all updates', async () => {
      mockGetObligationIdsByExternalIds.mockResolvedValue(
        new Map([['EXT-1', { obligationId: obligationId1, parentId: null }]])
      );

      mockSaveExternalObligations.mockResolvedValue([
        { id: obligationId1, externalId: 'EXT-1' },
      ]);

      const updates: NewIngestedObligation[] = [
        {
          externalId: 'EXT-1',
          title: 'Obligation 1',
          description: 'Description 1',
          contentHash: 'HASH_1',
          externalParentId: null,
          type: 'standard',
          regulatorySourceId: regulatorySource.id,
        },
      ];

      await syncExternalObligations.processUpdates({
        updates,
        orgKey: 'org-123',
        externalSyncedAt: new Date('2024-01-01T00:00:00Z'),
        regulatorySource,
      });

      expect(mockSaveExternalObligations).toHaveBeenCalledWith([
        expect.objectContaining({
          createdByUser: 'SYSTEM',
          modifiedByUser: 'SYSTEM',
        }),
      ]);
    });

    it('should successfully update tasks with parent linking to rules', async () => {
      const obligationId4 = obligationIdSchema.parse(
        '00000000-0000-0000-0000-000000000004'
      );
      const parentRuleId = obligationIdSchema.parse(
        '00000000-0000-0000-0000-000000000030'
      );

      mockSaveExternalObligations.mockResolvedValue([
        { id: obligationId4, externalId: 'EXT-4' },
      ]);

      mockGetObligationIdsByExternalIds.mockResolvedValue(
        new Map([
          ['EXT-4', { obligationId: obligationId4, parentId: parentRuleId }],
        ])
      );

      const updates: NewIngestedObligation[] = [
        {
          externalId: 'EXT-4',
          title: 'Updated Task',
          description: 'Updated task description',
          contentHash: 'HASH_4_UPDATED',
          externalParentId: 'PARENT-RULE-1',
          type: 'task',
          regulatorySourceId: regulatorySource.id,
        },
      ];

      await syncExternalObligations.processUpdates({
        updates,
        orgKey: 'org-123',
        externalSyncedAt: new Date('2024-01-01T00:00:00Z'),
        regulatorySource,
      });

      expect(mockSaveExternalObligations).toHaveBeenCalledTimes(1);
      expect(mockSaveExternalObligations).toHaveBeenCalledWith([
        expect.objectContaining({
          externalId: 'EXT-4',
          id: obligationId4,
          parentId: parentRuleId,
          description: 'Updated task description',
          type: 'task',
        }),
      ]);
    });

    it('should throw error when attempting to update task that does not exist', async () => {
      mockGetObligationIdsByExternalIds.mockResolvedValue(new Map());

      const updates: NewIngestedObligation[] = [
        {
          externalId: 'NON-EXISTENT-TASK',
          title: 'Non-existent Task',
          description: 'This task does not exist',
          contentHash: 'HASH_X',
          externalParentId: 'PARENT-RULE-1',
          type: 'task',
          regulatorySourceId: regulatorySource.id,
        },
      ];

      await expect(
        syncExternalObligations.processUpdates({
          updates,
          orgKey: 'org-123',
          externalSyncedAt: new Date('2024-01-01T00:00:00Z'),
          regulatorySource,
        })
      ).rejects.toThrow(
        'Cannot update obligation that does not exist: NON-EXISTENT-TASK'
      );
    });
  });

  describe('processAdditions', () => {
    it('should return empty array when no additions provided', async () => {
      const actual = await syncExternalObligations.processAdditions({
        additions: [],
        orgKey: 'org-123',
        externalSyncedAt: new Date(),
        regulatorySource,
      });

      expect(actual).toEqual([]);
    });

    it('should successfully save tasks with proper parent linking to rules', async () => {
      const obligationId4 = obligationIdSchema.parse(
        '00000000-0000-0000-0000-000000000004'
      );

      mockGetObligationIdsByExternalIds.mockResolvedValue(new Map());
      mockSaveExternalObligations
        .mockResolvedValueOnce([{ id: obligationId1, externalId: 'EXT-1' }]) // standard
        .mockResolvedValueOnce([{ id: obligationId2, externalId: 'EXT-2' }]) // chapter
        .mockResolvedValueOnce([{ id: obligationId3, externalId: 'EXT-3' }]) // rule
        .mockResolvedValueOnce([{ id: obligationId4, externalId: 'EXT-4' }]); // task

      const additions: NewIngestedObligation[] = [
        {
          externalId: 'EXT-1',
          title: 'Standard',
          description: 'Standard description',
          contentHash: 'HASH_1',
          externalParentId: null,
          type: 'standard',
          regulatorySourceId: regulatorySource.id,
        },
        {
          externalId: 'EXT-2',
          title: 'Chapter',
          description: 'Chapter description',
          contentHash: 'HASH_2',
          externalParentId: 'EXT-1',
          type: 'chapter',
          regulatorySourceId: regulatorySource.id,
        },
        {
          externalId: 'EXT-3',
          title: 'Rule',
          description: 'Rule description',
          contentHash: 'HASH_3',
          externalParentId: 'EXT-2',
          type: 'rule',
          regulatorySourceId: regulatorySource.id,
        },
        {
          externalId: 'EXT-4',
          title: 'Task',
          description: 'Task description',
          contentHash: 'HASH_4',
          externalParentId: 'EXT-3',
          type: 'task',
          regulatorySourceId: regulatorySource.id,
        },
      ];

      await syncExternalObligations.processAdditions({
        additions,
        orgKey: 'org-123',
        externalSyncedAt: new Date('2024-01-01T00:00:00Z'),
        regulatorySource,
      });

      expect(mockSaveExternalObligations).toHaveBeenCalledTimes(4);
      // standards
      expect(mockSaveExternalObligations).toHaveBeenNthCalledWith(1, [
        expect.objectContaining({
          externalId: 'EXT-1',
          parentId: null,
        }),
      ]);
      // chapters
      expect(mockSaveExternalObligations).toHaveBeenNthCalledWith(2, [
        expect.objectContaining({
          externalId: 'EXT-2',
          parentId: obligationId1,
        }),
      ]);
      // rules
      expect(mockSaveExternalObligations).toHaveBeenNthCalledWith(3, [
        expect.objectContaining({
          externalId: 'EXT-3',
          parentId: obligationId2,
        }),
      ]);
      // tasks
      expect(mockSaveExternalObligations).toHaveBeenNthCalledWith(4, [
        expect.objectContaining({
          externalId: 'EXT-4',
          parentId: obligationId3,
          type: 'task',
        }),
      ]);
    });

    it('should throw error when task references non-existent parent rule', async () => {
      mockGetObligationIdsByExternalIds.mockResolvedValue(new Map());

      const additions: NewIngestedObligation[] = [
        {
          externalId: 'EXT-4',
          title: 'Task without parent',
          description: 'This task references a non-existent rule',
          contentHash: 'HASH_4',
          externalParentId: 'NON-EXISTENT-RULE',
          type: 'task',
          regulatorySourceId: regulatorySource.id,
        },
      ];

      await expect(
        syncExternalObligations.processAdditions({
          additions,
          orgKey: 'org-123',
          externalSyncedAt: new Date('2024-01-01T00:00:00Z'),
          regulatorySource,
        })
      ).rejects.toThrow('Parent not found for task');
    });

    it('should link tasks to existing rules from previous sync', async () => {
      const obligationId4 = obligationIdSchema.parse(
        '00000000-0000-0000-0000-000000000004'
      );

      mockGetObligationIdsByExternalIds.mockResolvedValue(
        new Map([
          ['EXISTING-RULE', { obligationId: obligationId3, parentId: null }],
        ])
      );

      mockSaveExternalObligations
        .mockResolvedValueOnce([]) // standards
        .mockResolvedValueOnce([]) // chapters
        .mockResolvedValueOnce([]) // rules
        .mockResolvedValueOnce([{ id: obligationId4, externalId: 'EXT-4' }]); // tasks

      const additions: NewIngestedObligation[] = [
        {
          externalId: 'EXT-4',
          title: 'New Task',
          description: 'Task linking to existing rule',
          contentHash: 'HASH_4',
          externalParentId: 'EXISTING-RULE',
          type: 'task',
          regulatorySourceId: regulatorySource.id,
        },
      ];

      await syncExternalObligations.processAdditions({
        additions,
        orgKey: 'org-123',
        externalSyncedAt: new Date('2024-01-01T00:00:00Z'),
        regulatorySource,
      });

      expect(mockSaveExternalObligations).toHaveBeenCalledTimes(1);
      expect(mockSaveExternalObligations).toHaveBeenCalledWith([
        expect.objectContaining({
          externalId: 'EXT-4',
          parentId: obligationId3,
          type: 'task',
        }),
      ]);
    });

    it('should successfully save standards without parents', async () => {
      mockGetObligationIdsByExternalIds.mockResolvedValue(new Map());
      mockSaveExternalObligations.mockResolvedValue([
        { id: obligationId1, externalId: 'EXT-1' },
      ]);

      const additions: NewIngestedObligation[] = [
        {
          externalId: 'EXT-1',
          title: 'New Obligation 1',
          description: 'Description for new obligation 1',
          contentHash: 'HASH_1',
          externalParentId: null,
          type: 'standard',
          regulatorySourceId: regulatorySource.id,
        },
      ];

      await syncExternalObligations.processAdditions({
        additions,
        orgKey: 'org-123',
        externalSyncedAt: new Date('2024-01-01T00:00:00Z'),
        regulatorySource,
      });

      expect(mockSaveExternalObligations).toHaveBeenCalledTimes(1);
      // standards
      expect(mockSaveExternalObligations).toHaveBeenNthCalledWith(1, [
        expect.objectContaining({
          externalId: 'EXT-1',
          description: 'Description for new obligation 1',
          parentId: null,
        }),
      ]);
    });

    it('should successfully save full hierarchy (standard → chapter → rule)', async () => {
      mockGetObligationIdsByExternalIds.mockResolvedValue(new Map());
      mockSaveExternalObligations
        .mockResolvedValueOnce([{ id: obligationId1, externalId: 'EXT-1' }])
        .mockResolvedValueOnce([{ id: obligationId2, externalId: 'EXT-2' }])
        .mockResolvedValueOnce([{ id: obligationId3, externalId: 'EXT-3' }]);

      const additions: NewIngestedObligation[] = [
        {
          externalId: 'EXT-1',
          title: 'New Obligation 1',
          description: 'Description for new obligation 1',
          contentHash: 'HASH_1',
          externalParentId: null,
          type: 'standard',
          regulatorySourceId: regulatorySource.id,
        },
        {
          externalId: 'EXT-2',
          title: 'New Obligation 2',
          description: 'Description for new obligation 2',
          contentHash: 'HASH_2',
          externalParentId: 'EXT-1',
          type: 'chapter',
          regulatorySourceId: regulatorySource.id,
        },
        {
          externalId: 'EXT-3',
          title: 'New Obligation 3',
          description: 'Description for new obligation 3',
          contentHash: 'HASH_3',
          externalParentId: 'EXT-2',
          type: 'rule',
          regulatorySourceId: regulatorySource.id,
        },
      ];

      await syncExternalObligations.processAdditions({
        additions,
        orgKey: 'org-123',
        externalSyncedAt: new Date('2024-01-01T00:00:00Z'),
        regulatorySource,
      });

      expect(mockSaveExternalObligations).toHaveBeenCalledTimes(3);
      // standards
      expect(mockSaveExternalObligations).toHaveBeenNthCalledWith(1, [
        expect.objectContaining({
          externalId: 'EXT-1',
          parentId: null,
        }),
      ]);
      // chapters
      expect(mockSaveExternalObligations).toHaveBeenNthCalledWith(2, [
        expect.objectContaining({
          externalId: 'EXT-2',
          parentId: obligationId1,
        }),
      ]);
      // rules
      expect(mockSaveExternalObligations).toHaveBeenNthCalledWith(3, [
        expect.objectContaining({
          externalId: 'EXT-3',
          parentId: obligationId2,
        }),
      ]);
    });

    it('should throw error when chapter references non-existent parent standard', async () => {
      mockGetObligationIdsByExternalIds.mockResolvedValue(new Map());

      const additions: NewIngestedObligation[] = [
        {
          externalId: 'EXT-2',
          title: 'Chapter without parent',
          description: 'This chapter references a non-existent standard',
          contentHash: 'HASH_2',
          externalParentId: 'NON-EXISTENT-STANDARD',
          type: 'chapter',
          regulatorySourceId: regulatorySource.id,
        },
      ];

      await expect(
        syncExternalObligations.processAdditions({
          additions,
          orgKey: 'org-123',
          externalSyncedAt: new Date('2024-01-01T00:00:00Z'),
          regulatorySource,
        })
      ).rejects.toThrow('Parent not found for chapter');
    });

    it('should throw error when rule references non-existent parent chapter', async () => {
      mockGetObligationIdsByExternalIds.mockResolvedValue(new Map());

      const additions: NewIngestedObligation[] = [
        {
          externalId: 'EXT-3',
          title: 'Rule without parent',
          description: 'This rule references a non-existent chapter',
          contentHash: 'HASH_3',
          externalParentId: 'NON-EXISTENT-CHAPTER',
          type: 'rule',
          regulatorySourceId: regulatorySource.id,
        },
      ];

      await expect(
        syncExternalObligations.processAdditions({
          additions,
          orgKey: 'org-123',
          externalSyncedAt: new Date('2024-01-01T00:00:00Z'),
          regulatorySource,
        })
      ).rejects.toThrow('Parent not found for rule');
    });

    it('should link chapters to existing standards from previous sync', async () => {
      mockGetObligationIdsByExternalIds.mockResolvedValue(
        new Map([
          [
            'EXISTING-STANDARD',
            { obligationId: obligationId1, parentId: null },
          ],
        ])
      );

      mockSaveExternalObligations
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ id: obligationId2, externalId: 'EXT-2' }])
        .mockResolvedValueOnce([]);

      const additions: NewIngestedObligation[] = [
        {
          externalId: 'EXT-2',
          title: 'New Chapter',
          description: 'Chapter linking to existing standard',
          contentHash: 'HASH_2',
          externalParentId: 'EXISTING-STANDARD',
          type: 'chapter',
          regulatorySourceId: regulatorySource.id,
        },
      ];

      await syncExternalObligations.processAdditions({
        additions,
        orgKey: 'org-123',
        externalSyncedAt: new Date('2024-01-01T00:00:00Z'),
        regulatorySource,
      });

      expect(mockSaveExternalObligations).toHaveBeenCalledTimes(1);
      expect(mockSaveExternalObligations).toHaveBeenCalledWith([
        expect.objectContaining({
          externalId: 'EXT-2',
          parentId: obligationId1,
        }),
      ]);
    });

    it('should link rules to existing chapters from previous sync', async () => {
      mockGetObligationIdsByExternalIds.mockResolvedValue(
        new Map([
          ['EXISTING-CHAPTER', { obligationId: obligationId2, parentId: null }],
        ])
      );

      mockSaveExternalObligations
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ id: obligationId3, externalId: 'EXT-3' }]);

      const additions: NewIngestedObligation[] = [
        {
          externalId: 'EXT-3',
          title: 'New Rule',
          description: 'Rule linking to existing chapter',
          contentHash: 'HASH_3',
          externalParentId: 'EXISTING-CHAPTER',
          type: 'rule',
          regulatorySourceId: regulatorySource.id,
        },
      ];

      await syncExternalObligations.processAdditions({
        additions,
        orgKey: 'org-123',
        externalSyncedAt: new Date('2024-01-01T00:00:00Z'),
        regulatorySource,
      });

      expect(mockSaveExternalObligations).toHaveBeenCalledTimes(1);
      expect(mockSaveExternalObligations).toHaveBeenCalledWith([
        expect.objectContaining({
          externalId: 'EXT-3',
          parentId: obligationId2,
        }),
      ]);
    });

    it('should apply same externalSyncedAt timestamp to all added obligations', async () => {
      mockGetObligationIdsByExternalIds.mockResolvedValue(new Map());
      mockSaveExternalObligations
        .mockResolvedValueOnce([{ id: obligationId1, externalId: 'EXT-1' }])
        .mockResolvedValueOnce([{ id: obligationId2, externalId: 'EXT-2' }])
        .mockResolvedValueOnce([{ id: obligationId3, externalId: 'EXT-3' }]);

      const additions: NewIngestedObligation[] = [
        {
          externalId: 'EXT-1',
          title: 'Standard',
          description: 'Standard description',
          contentHash: 'HASH_1',
          externalParentId: null,
          type: 'standard',
          regulatorySourceId: regulatorySource.id,
        },
        {
          externalId: 'EXT-2',
          title: 'Chapter',
          description: 'Chapter description',
          contentHash: 'HASH_2',
          externalParentId: 'EXT-1',
          type: 'chapter',
          regulatorySourceId: regulatorySource.id,
        },
        {
          externalId: 'EXT-3',
          title: 'Rule',
          description: 'Rule description',
          contentHash: 'HASH_3',
          externalParentId: 'EXT-2',
          type: 'rule',
          regulatorySourceId: regulatorySource.id,
        },
      ];

      const syncDate = new Date('2024-01-01T00:00:00Z');

      await syncExternalObligations.processAdditions({
        additions,
        orgKey: 'org-123',
        externalSyncedAt: syncDate,
        regulatorySource,
      });

      expect(mockSaveExternalObligations).toHaveBeenNthCalledWith(1, [
        expect.objectContaining({ externalSyncedAt: syncDate }),
      ]);
      expect(mockSaveExternalObligations).toHaveBeenNthCalledWith(2, [
        expect.objectContaining({ externalSyncedAt: syncDate }),
      ]);
      expect(mockSaveExternalObligations).toHaveBeenNthCalledWith(3, [
        expect.objectContaining({ externalSyncedAt: syncDate }),
      ]);
    });

    it('should set system user as creator for all additions', async () => {
      mockGetObligationIdsByExternalIds.mockResolvedValue(new Map());
      mockSaveExternalObligations.mockResolvedValue([
        { id: obligationId1, externalId: 'EXT-1' },
      ]);

      const additions: NewIngestedObligation[] = [
        {
          externalId: 'EXT-1',
          title: 'Standard',
          description: 'Standard description',
          contentHash: 'HASH_1',
          externalParentId: null,
          type: 'standard',
          regulatorySourceId: regulatorySource.id,
        },
      ];

      await syncExternalObligations.processAdditions({
        additions,
        orgKey: 'org-123',
        externalSyncedAt: new Date('2024-01-01T00:00:00Z'),
        regulatorySource,
      });

      expect(mockSaveExternalObligations).toHaveBeenNthCalledWith(1, [
        expect.objectContaining({
          createdByUser: 'SYSTEM',
          modifiedByUser: 'SYSTEM',
        }),
      ]);
    });

    it('should set default adherence to "advised" for all external obligations', async () => {
      mockGetObligationIdsByExternalIds.mockResolvedValue(new Map());
      mockSaveExternalObligations.mockResolvedValue([
        { id: obligationId1, externalId: 'EXT-1' },
      ]);

      const additions: NewIngestedObligation[] = [
        {
          externalId: 'EXT-1',
          title: 'Standard',
          description: 'Standard description',
          contentHash: 'HASH_1',
          externalParentId: null,
          type: 'standard',
          regulatorySourceId: regulatorySource.id,
        },
      ];

      await syncExternalObligations.processAdditions({
        additions,
        orgKey: 'org-123',
        externalSyncedAt: new Date('2024-01-01T00:00:00Z'),
        regulatorySource,
      });

      expect(mockSaveExternalObligations).toHaveBeenNthCalledWith(1, [
        expect.objectContaining({
          adherence: 'advised',
        }),
      ]);
    });
  });
});
