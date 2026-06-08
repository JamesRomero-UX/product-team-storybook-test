import {
  GetAttestationCyclesDocument,
  InsertAttestationCycleDocument,
  UpdateAttestationCycleDocument,
} from 'generated/graphql';
import { getHasuraBackendClient } from 'src/backendGraphqlClient';
import { getLogger } from 'src/logger';
import type { ServiceOptions } from 'src/services/types';

import type {
  AttestationCycle,
  CreateAttestationCycle,
} from '../attestation-cycle';
import type { DocumentId } from '../document';
import type { AttestationCycleId } from '../types';
import { attestationCycleIdSchema } from '../types';
import { transformAttestationCycleFromData } from './transform';

const logger = getLogger();

export const AttestationCycleDataAdaptor = (opts: ServiceOptions) => {
  const client = getHasuraBackendClient(
    opts.tenant,
    opts.orgKey,
    opts.userId,
    opts.userRole
  );

  return {
    getById: async (id: AttestationCycleId): Promise<AttestationCycle> => {
      const attestationCycles = await client.query({
        query: GetAttestationCyclesDocument,
        variables: {
          where: {
            Id: { _eq: id },
          },
          limit: 1,
        },
      });

      if (!attestationCycles.data?.attestation_cycle[0]) {
        throw new Error(`Failed to retrieve attestation cycle by ID: ${id}`);
      }

      return transformAttestationCycleFromData(
        attestationCycles.data.attestation_cycle[0]
      );
    },

    getMostRecentByDocumentId: async (
      documentId: DocumentId,
      excludeCycle?: AttestationCycle
    ): Promise<AttestationCycle | null> => {
      const { data, errors } = await client.query({
        query: GetAttestationCyclesDocument,
        variables: {
          where: {
            parent: {
              ParentDocumentId: { _eq: documentId },
            },
            Id: { _neq: excludeCycle?.id },
          },
          orderBy: { CreatedAtTimestamp: 'desc' },
          limit: 1,
        },
      });

      if (errors) {
        throw new Error(
          `Failed to fetch previous attestation cycle: ${errors.map((e) => e.message).join(', ')}`
        );
      }

      if (!data?.attestation_cycle[0]) {
        return null;
      }

      return transformAttestationCycleFromData(data.attestation_cycle[0]);
    },

    getAllActive: async (): Promise<AttestationCycle[]> => {
      const attestationCycles = await client.query({
        query: GetAttestationCyclesDocument,
        variables: {
          where: { Status: { _eq: 'active' } },
        },
      });

      return (
        attestationCycles.data.attestation_cycle?.map(
          transformAttestationCycleFromData
        ) ?? []
      );
    },

    getAllActiveGlobal: async (): Promise<AttestationCycle[]> => {
      const attestationCycles = await client.query({
        query: GetAttestationCyclesDocument,
        variables: {
          where: {
            Status: { _eq: 'active' },
            parent: {
              parent: {
                attestationConfig: {
                  RequireGlobalAttestation: { _eq: true },
                },
              },
            },
          },
        },
      });

      return (
        attestationCycles.data.attestation_cycle?.map(
          transformAttestationCycleFromData
        ) ?? []
      );
    },

    getByUserGroup: async (
      userGroups: string[]
    ): Promise<AttestationCycle[]> => {
      const attestationCycles = await client.query({
        query: GetAttestationCyclesDocument,
        variables: {
          where: {
            Status: { _eq: 'active' },
            parent: {
              parent: {
                attestationConfig: {
                  groups: {
                    group: {
                      Id: { _in: userGroups },
                    },
                  },
                },
              },
            },
          },
        },
      });

      return (
        attestationCycles.data.attestation_cycle.map(
          transformAttestationCycleFromData
        ) ?? []
      );
    },

    create: async (
      createAttesationCycle: CreateAttestationCycle
    ): Promise<AttestationCycleId> => {
      const { data, errors } = await client.mutate({
        mutation: InsertAttestationCycleDocument,
        variables: {
          object: {
            ParentId: createAttesationCycle.parentId,
            AllowCarryForward: createAttesationCycle.allowCarryForward,
            Status: createAttesationCycle.status,
          },
        },
      });

      if (!data?.insert_attestation_cycle_one || errors) {
        throw new Error(
          `Failed to create attestation cycle: ${errors?.map((e) => e.message).join(', ')}`
        );
      }

      return attestationCycleIdSchema.parse(
        data.insert_attestation_cycle_one.Id
      );
    },

    batchUpdateActiveCycleStatusByIds: async (
      attestationCycleIds: AttestationCycleId[],
      patch:
        | { status: 'overdue' | 'active' }
        | { status: 'concluded'; concludedAtTimestamp: string }
    ): Promise<{ updatedCycleIds: AttestationCycleId[] }> => {
      logger.info('Updating status of active attestation cycles', {
        attestationCycleIds,
        patch,
      });

      const result = await client.mutate({
        mutation: UpdateAttestationCycleDocument,
        variables: {
          where: {
            Id: { _in: attestationCycleIds },
            Status: { _eq: 'active' },
          },
          set: {
            Status: patch.status,
            ConcludedAtTimestamp:
              patch.status === 'concluded'
                ? patch.concludedAtTimestamp
                : undefined,
          },
        },
      });

      if (result.errors) {
        throw new Error(
          `Failed to update attestation cycle statuses: ${result.errors
            .map((e) => e.message)
            .join(', ')}`
        );
      }

      const updatedCycleIds =
        result.data?.update_attestation_cycle?.returning.map((c) =>
          attestationCycleIdSchema.parse(c.Id)
        ) ?? [];

      return { updatedCycleIds };
    },
  };
};
