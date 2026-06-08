import { BadRequest } from 'http-errors';

import { IssueRepository } from '../../repositories/issue/issue.repository';
import type { ServiceOptions } from '../types';

export const IssueService = (opts: ServiceOptions) => {
  const issueRepo = IssueRepository(opts);

  return {
    async delete(id: string | string[]) {
      await issueRepo.delete(id);
    },
    async findById(id: string) {
      const issues = await issueRepo.findWhere(
        {
          Id: { _eq: id },
        },
        { limit: 1 }
      );
      if (!issues[0]) {
        throw new BadRequest('Issue not found');
      }

      return issues[0];
    },
  };
};
