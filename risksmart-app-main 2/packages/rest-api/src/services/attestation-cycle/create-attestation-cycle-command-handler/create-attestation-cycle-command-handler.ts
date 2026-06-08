import z from 'zod';

import type { CreateAttestationCycle } from '../attestation-cycle';
import { createAttestationCycleSchema } from '../attestation-cycle';
import type { DocumentFileId } from '../document-file';
import type { AttestationCycleId } from '../types';

const _createAttestationCycleCommandSchema = z.object({
  documentId: z.string().uuid(),
  allowCarryForward: z.boolean(),
});

export type CreateAttestationCycleCommand = Readonly<
  z.infer<typeof _createAttestationCycleCommandSchema>
>;

interface CreateAttestationCycleCommandHandler {
  execute(command: CreateAttestationCycleCommand): Promise<AttestationCycleId>;
}

interface Dependencies {
  attestationCycleWriter: (
    createAttestationCycle: CreateAttestationCycle
  ) => Promise<AttestationCycleId>;

  documentFileReader: (
    documentId: string
  ) => Promise<{ id: DocumentFileId } | null>;
}

export const createAttestationCycleCommandHandler = ({
  attestationCycleWriter,
  documentFileReader,
}: Dependencies): CreateAttestationCycleCommandHandler => ({
  execute: async (
    command: CreateAttestationCycleCommand
  ): Promise<AttestationCycleId> => {
    const activeDocumentFile = await documentFileReader(command.documentId);

    if (!activeDocumentFile) {
      throw new Error(
        `No published document file found for document ID ${command.documentId}`
      );
    }

    const createAttestationCycle = createAttestationCycleSchema.parse({
      status: 'active',
      parentId: activeDocumentFile.id,
      allowCarryForward: command.allowCarryForward,
    });

    const result = await attestationCycleWriter(createAttestationCycle);

    return result;
  },
});
