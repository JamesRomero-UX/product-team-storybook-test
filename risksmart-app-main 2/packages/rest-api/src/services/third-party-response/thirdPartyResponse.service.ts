import type {
  ThirdPartyResponseBoolExp,
  ThirdPartyResponseInsertInput,
} from 'generated/graphql';
import { BadRequest } from 'http-errors';
import type { SetInput } from 'src/repositories/third-party-response/thirdPartyResponse.repository';
import { ThirdPartyResponseRepository } from 'src/repositories/third-party-response/thirdPartyResponse.repository';

import type { ServiceOptions } from '../types';

export const ThirdPartyResponseService = (opts: ServiceOptions) => {
  const thirdPartyResponseRepo = ThirdPartyResponseRepository(opts);

  return {
    async findById(id: string) {
      const thirdPartyResponse = await thirdPartyResponseRepo.findWhere(
        {
          Id: { _eq: id },
        },
        { limit: 1 }
      );

      if (!thirdPartyResponse[0]) {
        throw new BadRequest('Third-party response not found');
      }

      return thirdPartyResponse[0];
    },

    async create(data: ThirdPartyResponseInsertInput) {
      const result = await thirdPartyResponseRepo.create([data]);

      if (!result[0]) {
        throw new Error('Third-party Response not created');
      }

      return result[0];
    },

    async update(id: string, data: SetInput) {
      const result = await thirdPartyResponseRepo.updateWhere(
        { Id: { _eq: id } },
        data
      );

      return result;
    },

    async updateWhere(where: ThirdPartyResponseBoolExp, data: SetInput) {
      const result = await thirdPartyResponseRepo.updateWhere(where, data);

      return result;
    },
  };
};
