import { attestationConfigIdSchema } from '../attestation-config';
import { documentFileIdSchema } from '../document-file';
import type { CreateAttestationCycleCommand } from './create-attestation-cycle-command-handler';
import { createAttestationCycleCommandHandler } from './create-attestation-cycle-command-handler';

describe('create attestation cycle command handler', () => {
  it('should create new attestation cycle', async () => {
    const writerResult = attestationConfigIdSchema.parse(
      '123e4567-e89b-12d3-a456-426614174999'
    );

    const documentFileId = documentFileIdSchema.parse(
      '123e4567-e89b-12d3-a456-426614174100'
    );
    const mockWriter = vi.fn().mockReturnValue(writerResult);
    const mockReader = vi.fn().mockReturnValue({
      id: documentFileId,
    });

    const handler = createAttestationCycleCommandHandler({
      attestationCycleWriter: mockWriter,
      documentFileReader: mockReader,
    });

    const command: CreateAttestationCycleCommand = {
      documentId: '123e4567-e89b-12d3-a456-426614174000',
      allowCarryForward: true,
    };

    const actual = await handler.execute(command);

    expect(mockWriter).toHaveBeenCalledWith(
      expect.objectContaining({
        parentId: documentFileId,
        allowCarryForward: command.allowCarryForward,
        status: 'active',
      })
    );

    expect(actual).toEqual(writerResult);
  });
});
