import { obligationIdSchema } from '@risksmart-app/domain/src/types/obligation';
import { regulatorySourceSchema } from '@risksmart-app/domain/src/types/regulatory-source';

import { createSyncExternalObligationChanges } from './sync-external-obligation-changes';
import type { NewIngestedObligationChange } from './types';

describe('sync external obligation changes', () => {
  const obligationId1 = obligationIdSchema.parse(
    '00000000-0000-0000-0000-000000000001'
  );
  const obligationId2 = obligationIdSchema.parse(
    '00000000-0000-0000-0000-000000000002'
  );

  const mockSaveExternalObligationChanges = vi.fn();
  const mockGetObligationIdsByExternalIds = vi.fn();

  const syncExternalObligationChanges = createSyncExternalObligationChanges({
    saveExternalObligationChanges: mockSaveExternalObligationChanges,
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
    mockSaveExternalObligationChanges.mockReset();
    mockGetObligationIdsByExternalIds.mockReset();
  });

  describe('processChanges', () => {
    it('should return empty array when no changes provided', async () => {
      const actual = await syncExternalObligationChanges.processChanges({
        changes: [],
        orgKey: 'org-123',
        regulatorySource,
      });

      expect(actual).toEqual([]);
      expect(mockGetObligationIdsByExternalIds).not.toHaveBeenCalled();
      expect(mockSaveExternalObligationChanges).not.toHaveBeenCalled();
    });

    it('should resolve parent obligation and save change with all fields mapped', async () => {
      mockGetObligationIdsByExternalIds.mockResolvedValue(
        new Map([['RULE-1', { obligationId: obligationId1, parentId: null }]])
      );
      mockSaveExternalObligationChanges.mockResolvedValue([
        { id: 'change-id-1', externalId: 'CHANGE-1' },
      ]);

      const changes: NewIngestedObligationChange[] = [
        {
          externalId: 'CHANGE-1',
          externalParentId: 'RULE-1',
          description: { before: 'Original text', after: 'Updated text' },
          rationale: 'Regulatory update 2024',
          effectiveDate: '2024-06-01',
          sourceUrl: 'https://example.com/change',
          contentHash: 'HASH_1',
          regulatorySourceId: regulatorySource.id,
        },
      ];

      await syncExternalObligationChanges.processChanges({
        changes,
        orgKey: 'org-123',
        regulatorySource,
      });

      expect(mockSaveExternalObligationChanges).toHaveBeenCalledTimes(1);
      expect(mockSaveExternalObligationChanges).toHaveBeenCalledWith([
        expect.objectContaining({
          externalId: 'CHANGE-1',
          obligationId: obligationId1,
          descriptionBefore: 'Original text',
          descriptionAfter: 'Updated text',
          rationale: 'Regulatory update 2024',
          effectiveDate: new Date('2024-06-01'),
          sourceUrl: 'https://example.com/change',
          contentHash: 'HASH_1',
        }),
      ]);
    });

    it('should set system user as creator and modifier', async () => {
      mockGetObligationIdsByExternalIds.mockResolvedValue(
        new Map([['RULE-1', { obligationId: obligationId1, parentId: null }]])
      );
      mockSaveExternalObligationChanges.mockResolvedValue([]);

      const changes: NewIngestedObligationChange[] = [
        {
          externalId: 'CHANGE-1',
          externalParentId: 'RULE-1',
          description: { before: 'Before', after: 'After' },
          contentHash: 'HASH_1',
          regulatorySourceId: regulatorySource.id,
        },
      ];

      await syncExternalObligationChanges.processChanges({
        changes,
        orgKey: 'org-123',
        regulatorySource,
      });

      expect(mockSaveExternalObligationChanges).toHaveBeenCalledWith([
        expect.objectContaining({
          createdByUser: 'SYSTEM',
          modifiedByUser: 'SYSTEM',
        }),
      ]);
    });

    it('should pass orgKey through to saved changes', async () => {
      mockGetObligationIdsByExternalIds.mockResolvedValue(
        new Map([['RULE-1', { obligationId: obligationId1, parentId: null }]])
      );
      mockSaveExternalObligationChanges.mockResolvedValue([]);

      const changes: NewIngestedObligationChange[] = [
        {
          externalId: 'CHANGE-1',
          externalParentId: 'RULE-1',
          description: { before: 'Before', after: 'After' },
          contentHash: 'HASH_1',
          regulatorySourceId: regulatorySource.id,
        },
      ];

      await syncExternalObligationChanges.processChanges({
        changes,
        orgKey: 'my-org-key',
        regulatorySource,
      });

      expect(mockSaveExternalObligationChanges).toHaveBeenCalledWith([
        expect.objectContaining({ orgKey: 'my-org-key' }),
      ]);
    });

    it('should set null for optional fields when absent', async () => {
      mockGetObligationIdsByExternalIds.mockResolvedValue(
        new Map([['RULE-1', { obligationId: obligationId1, parentId: null }]])
      );
      mockSaveExternalObligationChanges.mockResolvedValue([]);

      const changes: NewIngestedObligationChange[] = [
        {
          externalId: 'CHANGE-1',
          externalParentId: 'RULE-1',
          description: { before: 'Before', after: 'After' },
          contentHash: 'HASH_1',
          regulatorySourceId: regulatorySource.id,
          // rationale, effectiveDate, sourceUrl intentionally omitted
        },
      ];

      await syncExternalObligationChanges.processChanges({
        changes,
        orgKey: 'org-123',
        regulatorySource,
      });

      expect(mockSaveExternalObligationChanges).toHaveBeenCalledWith([
        expect.objectContaining({
          rationale: null,
          effectiveDate: null,
          sourceUrl: null,
        }),
      ]);
    });

    it('should skip change and continue when parent obligation not found', async () => {
      mockGetObligationIdsByExternalIds.mockResolvedValue(new Map());
      mockSaveExternalObligationChanges.mockResolvedValue([]);

      const changes: NewIngestedObligationChange[] = [
        {
          externalId: 'CHANGE-1',
          externalParentId: 'NON-EXISTENT-RULE',
          description: { before: 'Before', after: 'After' },
          contentHash: 'HASH_1',
          regulatorySourceId: regulatorySource.id,
        },
      ];

      const result = await syncExternalObligationChanges.processChanges({
        changes,
        orgKey: 'org-123',
        regulatorySource,
      });

      // skipped change should not be passed to save
      expect(mockSaveExternalObligationChanges).toHaveBeenCalledWith([]);
      expect(result).toEqual([]);
    });

    it('should save only changes whose parent was found, skipping those without', async () => {
      mockGetObligationIdsByExternalIds.mockResolvedValue(
        new Map([
          ['RULE-1', { obligationId: obligationId1, parentId: null }],
          // RULE-2 absent
        ])
      );
      mockSaveExternalObligationChanges.mockResolvedValue([
        { id: 'change-id-1', externalId: 'CHANGE-1' },
      ]);

      const changes: NewIngestedObligationChange[] = [
        {
          externalId: 'CHANGE-1',
          externalParentId: 'RULE-1',
          description: { before: 'Before 1', after: 'After 1' },
          contentHash: 'HASH_1',
          regulatorySourceId: regulatorySource.id,
        },
        {
          externalId: 'CHANGE-2',
          externalParentId: 'RULE-2',
          description: { before: 'Before 2', after: 'After 2' },
          contentHash: 'HASH_2',
          regulatorySourceId: regulatorySource.id,
        },
      ];

      await syncExternalObligationChanges.processChanges({
        changes,
        orgKey: 'org-123',
        regulatorySource,
      });

      expect(mockSaveExternalObligationChanges).toHaveBeenCalledWith([
        expect.objectContaining({ externalId: 'CHANGE-1' }),
      ]);
    });

    it('should deduplicate parent external IDs when calling getObligationIdsByExternalIds', async () => {
      mockGetObligationIdsByExternalIds.mockResolvedValue(
        new Map([['RULE-1', { obligationId: obligationId1, parentId: null }]])
      );
      mockSaveExternalObligationChanges.mockResolvedValue([]);

      const changes: NewIngestedObligationChange[] = [
        {
          externalId: 'CHANGE-1',
          externalParentId: 'RULE-1',
          description: { before: 'Before 1', after: 'After 1' },
          contentHash: 'HASH_1',
          regulatorySourceId: regulatorySource.id,
        },
        {
          externalId: 'CHANGE-2',
          externalParentId: 'RULE-1', // same parent
          description: { before: 'Before 2', after: 'After 2' },
          contentHash: 'HASH_2',
          regulatorySourceId: regulatorySource.id,
        },
      ];

      await syncExternalObligationChanges.processChanges({
        changes,
        orgKey: 'org-123',
        regulatorySource,
      });

      expect(mockGetObligationIdsByExternalIds).toHaveBeenCalledWith(
        ['RULE-1'],
        'org-123',
        regulatorySource.id
      );
    });

    it('should save multiple changes referencing different parents', async () => {
      mockGetObligationIdsByExternalIds.mockResolvedValue(
        new Map([
          ['RULE-1', { obligationId: obligationId1, parentId: null }],
          ['RULE-2', { obligationId: obligationId2, parentId: null }],
        ])
      );
      mockSaveExternalObligationChanges.mockResolvedValue([
        { id: 'change-id-1', externalId: 'CHANGE-1' },
        { id: 'change-id-2', externalId: 'CHANGE-2' },
      ]);

      const changes: NewIngestedObligationChange[] = [
        {
          externalId: 'CHANGE-1',
          externalParentId: 'RULE-1',
          description: { before: 'Before 1', after: 'After 1' },
          contentHash: 'HASH_1',
          regulatorySourceId: regulatorySource.id,
        },
        {
          externalId: 'CHANGE-2',
          externalParentId: 'RULE-2',
          description: { before: 'Before 2', after: 'After 2' },
          contentHash: 'HASH_2',
          regulatorySourceId: regulatorySource.id,
        },
      ];

      await syncExternalObligationChanges.processChanges({
        changes,
        orgKey: 'org-123',
        regulatorySource,
      });

      expect(mockSaveExternalObligationChanges).toHaveBeenCalledTimes(1);
      expect(mockSaveExternalObligationChanges).toHaveBeenCalledWith([
        expect.objectContaining({
          externalId: 'CHANGE-1',
          obligationId: obligationId1,
        }),
        expect.objectContaining({
          externalId: 'CHANGE-2',
          obligationId: obligationId2,
        }),
      ]);
    });

    it('should return the result from saveExternalObligationChanges', async () => {
      mockGetObligationIdsByExternalIds.mockResolvedValue(
        new Map([['RULE-1', { obligationId: obligationId1, parentId: null }]])
      );

      const expected = [{ id: 'change-id-1', externalId: 'CHANGE-1' }];
      mockSaveExternalObligationChanges.mockResolvedValue(expected);

      const changes: NewIngestedObligationChange[] = [
        {
          externalId: 'CHANGE-1',
          externalParentId: 'RULE-1',
          description: { before: 'Before', after: 'After' },
          contentHash: 'HASH_1',
          regulatorySourceId: regulatorySource.id,
        },
      ];

      const result = await syncExternalObligationChanges.processChanges({
        changes,
        orgKey: 'org-123',
        regulatorySource,
      });

      expect(result).toEqual(expected);
    });

    it('should pass regulatorySource.id to getObligationIdsByExternalIds', async () => {
      mockGetObligationIdsByExternalIds.mockResolvedValue(
        new Map([['RULE-1', { obligationId: obligationId1, parentId: null }]])
      );
      mockSaveExternalObligationChanges.mockResolvedValue([]);

      const changes: NewIngestedObligationChange[] = [
        {
          externalId: 'CHANGE-1',
          externalParentId: 'RULE-1',
          description: { before: 'Before', after: 'After' },
          contentHash: 'HASH_1',
          regulatorySourceId: regulatorySource.id,
        },
      ];

      await syncExternalObligationChanges.processChanges({
        changes,
        orgKey: 'org-123',
        regulatorySource,
      });

      expect(mockGetObligationIdsByExternalIds).toHaveBeenCalledWith(
        expect.any(Array),
        'org-123',
        regulatorySource.id
      );
    });
  });
});
