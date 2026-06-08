import dayjs from 'dayjs';
import { getLogger } from 'src/logger';

import type {
  AttestationConfigPartsFragment,
  AttestationRecordBoolExp,
} from '../../../generated/graphql';
import { AttestationRecordStatusEnum } from '../../../generated/graphql';
import type { UpdateInput } from '../../repositories/attestation/attestation-record.repository';
import { AttestationRecordRepository } from '../../repositories/attestation/attestation-record.repository';
import type { ServiceOptions } from '../types';

const logger = getLogger();

export const AttestationRecordService = (opts: ServiceOptions) => {
  const attestationRecordRepo = AttestationRecordRepository(opts);

  return {
    async updateRecords(where: AttestationRecordBoolExp, set: UpdateInput) {
      const affectedCount = await attestationRecordRepo.update(where, set);

      return affectedCount;
    },

    async archiveCurrentAttestations(
      attestationConfigId: string,
      options: { useNotAttestedStatus?: boolean } = {}
    ) {
      // Archive current records that are still pending as not required
      let affectedRows = await attestationRecordRepo.update(
        {
          ConfigId: { _eq: attestationConfigId },
          Active: { _eq: true },
          AttestationStatus: { _neq: AttestationRecordStatusEnum.Attested },
          ExpiresAt: { _gt: dayjs().toISOString() }, // expires at is in the future
        },
        {
          Active: false,
          AttestationStatus: options.useNotAttestedStatus
            ? AttestationRecordStatusEnum.NotAttested
            : AttestationRecordStatusEnum.NotRequired,
        }
      );
      logger.info('archiving unattested attestation records', {
        affectedRows,
      });
      // Archive current records that have expired as permanently expired
      affectedRows = await attestationRecordRepo.update(
        {
          ConfigId: { _eq: attestationConfigId },
          Active: { _eq: true },
          AttestationStatus: { _neq: AttestationRecordStatusEnum.Attested },
          ExpiresAt: { _lte: dayjs().toISOString() }, // expires at is in the past
        },
        {
          Active: false,
          AttestationStatus: options.useNotAttestedStatus
            ? AttestationRecordStatusEnum.NotAttested
            : AttestationRecordStatusEnum.Expired,
        }
      );
      logger.info('archiving expired attestation records', {
        affectedRows,
      });
      // Set current records that are attested as inactive but keep the attestation status
      affectedRows = await attestationRecordRepo.update(
        {
          ConfigId: { _eq: attestationConfigId },
          Active: { _eq: true },
          AttestationStatus: { _eq: AttestationRecordStatusEnum.Attested },
        },
        {
          Active: false,
        }
      );
      logger.info('archiving attested attestation records', {
        affectedRows,
      });
    },

    /**
     * @deprecated This service is deprecated and will be removed in a later release.
     * This function should not be executed if attestation cycles are enabled.
     * Please use the attestation cycles feature instead.
     */
    async refreshRequiredUsersForNode({
      config,
      nodeId,
      userIds,
      refreshExpiry,
    }: {
      config: AttestationConfigPartsFragment;
      nodeId: string;
      userIds: string[];
      refreshExpiry?: boolean;
      cycleId?: string;
    }) {
      // Update all records for the parent that are active and not in the list of userIds
      // to be not required
      let affectedRows = await attestationRecordRepo.update(
        {
          NodeId: { _eq: nodeId },
          Active: { _eq: true },
          UserId: { _nin: userIds },
        },
        {
          AttestationStatus: AttestationRecordStatusEnum.NotRequired,
          Active: false,
        }
      );
      logger.info(
        'Archiving attestation records for users that no longer require then',
        { affectedRows }
      );

      // Create records for all userIds that are not already in the list
      const records = await attestationRecordRepo.findWhere({
        NodeId: { _eq: nodeId },
        Active: { _eq: true },
      });
      const newUsers = userIds.filter(
        (id) => !records.some((r) => r.UserId === id)
      );

      logger.info('Creating attestation records for new users', { newUsers });

      const expirationDate = config.timeLimitMs
        ? dayjs().add(config.timeLimitMs, 'ms').toISOString()
        : null;

      if (refreshExpiry) {
        affectedRows = await attestationRecordRepo.update(
          {
            NodeId: { _eq: nodeId },
            Active: { _eq: true },
          },
          {
            ExpiresAt: expirationDate,
          }
        );
        logger.info(
          'Updating expiration date on existing attestation records',
          { affectedRows }
        );
      }
      if (newUsers.length > 0) {
        const mapped = newUsers.map((userId) => ({
          nodeId,
          userId,
          configId: config.ParentId,
          status: AttestationRecordStatusEnum.Pending,
          active: true,
          expirationDate,
          cycleId: null,
        }));

        await this.createAttestationRecord(mapped);
      }
    },

    async createAttestationRecord(
      records: {
        userId: string;
        nodeId: string;
        configId?: string | undefined;
        status: AttestationRecordStatusEnum;
        active: boolean;
        expirationDate: string | null;
        cycleId: string | null;
        attestedAt?: string | null;
        carriedForwardFromRecordId?: string | null;
      }[]
    ): Promise<{ createdRecords: string[] }> {
      const createResults = await attestationRecordRepo.create(
        records.map((record) => ({
          NodeId: record.nodeId,
          UserId: record.userId,
          ConfigId: record.configId,
          AttestationStatus: record.status,
          Active: record.active,
          ExpiresAt: record.expirationDate,
          CycleId: record.cycleId || null,
          AttestedAt: record.attestedAt || null,
          CarriedForwardFromRecordId: record.carriedForwardFromRecordId || null,
        }))
      );
      logger.info('Creating new attestation records', {
        affectedRows: createResults.length,
      });

      return { createdRecords: createResults.map((r) => r.Id) };
    },

    async attestRecord(id: string, userId: string) {
      const affected = await attestationRecordRepo.update(
        {
          Id: { _eq: id },
          UserId: { _eq: userId },
        },
        {
          AttestationStatus: AttestationRecordStatusEnum.Attested,
          AttestedAt: dayjs().toISOString(),
        }
      );
      if (affected === 0) {
        throw new Error('Record not found');
      }
    },

    async getAttestationRecords(where: AttestationRecordBoolExp) {
      return await attestationRecordRepo.findWhere(where);
    },
  };
};
