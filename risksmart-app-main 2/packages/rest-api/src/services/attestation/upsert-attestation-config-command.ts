import type {
  AttestationConfigBoolExp,
  AttestationConfigPartsFragment,
} from '../../../generated/graphql';
import type {
  CreateInput,
  UpdateInput,
} from '../../repositories/attestation/attestation-config.repository';
import { AttestationConfigRepository } from '../../repositories/attestation/attestation-config.repository';
import type { ServiceOptions } from '../types';

interface Dependencies {
  findWhere: (
    where: AttestationConfigBoolExp
  ) => Promise<AttestationConfigPartsFragment[]>;
  create: (objects: CreateInput) => Promise<AttestationConfigPartsFragment[]>;
  update: (object: UpdateInput) => Promise<{ ParentId: string }>;
}

export const UpsertAttestationConfigCommand = ({
  findWhere,
  create,
  update,
}: Dependencies) => ({
  async upsert(config: {
    ParentId: string;
    RequireGlobalAttestation: boolean;
    AttestationGroupIds: string[];
    AttestationPromptText?: string;
    AttestationTimeLimit?: string;
  }) {
    const existing = await findWhere({
      ParentId: { _eq: config.ParentId },
    });

    if (!existing || existing.length === 0) {
      await create({
        ...config,
        groups: {
          data: config.AttestationGroupIds.map((g) => ({ GroupId: g })),
        },
      });

      return;
    }

    const mapGroups = () => {
      if (config.RequireGlobalAttestation) {
        return [];
      }

      return config.AttestationGroupIds.map((g) => ({
        GroupId: g,
      }));
    };

    await update({
      ...config,
      AttestationGroups: mapGroups(),
    });
  },
});

export const BuildUpsertAttestationConfigCommand = (opts: ServiceOptions) => {
  const repo = AttestationConfigRepository(opts);

  return UpsertAttestationConfigCommand({
    findWhere: repo.findWhere,
    create: repo.create,
    update: repo.update,
  });
};
