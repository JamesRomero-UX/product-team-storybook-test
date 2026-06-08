import { getEnv } from 'src/environment';

import type { AttestationConfigBoolExp } from '../../../generated/graphql';
import { AttestationConfigRepository } from '../../repositories/attestation/attestation-config.repository';
import { getOrgMeta } from '../orgUtilities';
import type { ServiceOptions } from '../types';
import { UserService } from '../user/user.service';

const THIRD_PARTY_RESPONDENT_ROLE = 'ThirdPartyRespondent';

export const AttestationConfigService = (opts: ServiceOptions) => {
  const attestationConfigRepo = AttestationConfigRepository(opts);
  const userService = UserService(opts);

  return {
    async findWhere(where: AttestationConfigBoolExp) {
      return attestationConfigRepo.findWhere(where);
    },

    async findAll() {
      return attestationConfigRepo.findWhere({});
    },

    async getAttestationUsers(config: {
      RequireGlobalAttestation: boolean;
      groups: { GroupId: string }[];
    }) {
      if (config.RequireGlobalAttestation) {
        const orgMeta = await getOrgMeta({
          orgKey: opts.orgKey,
          tenant: opts.tenant,
        });
        const isRisksmartOrg = orgMeta.isRisksmartOrg === 'true';
        const allUsers = await userService.findAll();

        return allUsers.filter(
          (u) =>
            (!u.IsCustomerSupport || isRisksmartOrg) &&
            u.Status !== 'archived' &&
            u.AuthConnection !==
              getEnv(
                'THIRD_PARTY_CONNECTION_NAME',
                'Username-Password-ThirdParty'
              ) &&
            u.RoleKey !== THIRD_PARTY_RESPONDENT_ROLE
        );
      }
      const groups = config.groups.map((g) => g.GroupId);

      return userService.findByGroupIds(groups);
    },

    async getGlobalAttestationUsers() {
      const orgMeta = await getOrgMeta({
        orgKey: opts.orgKey,
        tenant: opts.tenant,
      });
      const isRisksmartOrg = orgMeta.isRisksmartOrg === 'true';
      const allUsers = await userService.findAll();

      return allUsers.filter(
        (u) =>
          (!u.IsCustomerSupport || isRisksmartOrg) &&
          u.Status !== 'archived' &&
          u.AuthConnection !==
            getEnv(
              'THIRD_PARTY_CONNECTION_NAME',
              'Username-Password-ThirdParty'
            ) &&
          u.RoleKey !== THIRD_PARTY_RESPONDENT_ROLE
      );
    },
  };
};
