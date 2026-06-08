import { vi } from 'vitest';

import { UpsertAttestationConfigCommand } from './upsert-attestation-config-command';

describe('upsert', () => {
  it('should create a new config if one does not exist', async () => {
    const mockFindWhere = vi.fn();
    const mockCreate = vi.fn();
    const mockUpdate = vi.fn();

    const command = UpsertAttestationConfigCommand({
      findWhere: mockFindWhere,
      create: mockCreate,
      update: mockUpdate,
    });

    const payload = {
      ParentId: crypto.randomUUID(),
      RequireGlobalAttestation: false,
      AttestationGroupIds: ['group1', 'group2'],
      AttestationPromptText: 'Please attest',
      AttestationTimeLimit: '2024-12-31T23:59:59Z',
    };

    await command.upsert(payload);

    expect(mockFindWhere).toHaveBeenCalledWith({
      ParentId: { _eq: payload.ParentId },
    });

    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('should update an existing config if one exists', async () => {
    const mockFindWhere = vi.fn().mockResolvedValue([
      {
        ParentId: 'existing-parent-id',
        RequireGlobalAttestation: true,
        groups: [{ GroupId: 'old-group' }],
      },
    ]);
    const mockCreate = vi.fn();
    const mockUpdate = vi.fn();

    const command = UpsertAttestationConfigCommand({
      findWhere: mockFindWhere,
      create: mockCreate,
      update: mockUpdate,
    });

    const payload = {
      ParentId: 'existing-parent-id',
      RequireGlobalAttestation: false,
      AttestationGroupIds: ['new-group1', 'new-group2'],
      AttestationPromptText: 'Please attest again',
      AttestationTimeLimit: '2025-12-31T23:59:59Z',
    };

    await command.upsert(payload);

    expect(mockFindWhere).toHaveBeenCalledWith({
      ParentId: { _eq: payload.ParentId },
    });

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
