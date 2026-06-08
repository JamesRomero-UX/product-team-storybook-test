import { BadRequest } from 'http-errors';
import { ModifiedSinceLastViewError } from 'src/errors/ModifiedSinceLastViewError';

import type { IssueAssessmentInsertInput } from '../../../generated/graphql';
import { ParentTypeEnum } from '../../../generated/graphql';
import type { UpdateInput } from '../../repositories/issue-assessment/issue-assessment.repository';
import { IssueAssessmentRepository } from '../../repositories/issue-assessment/issue-assessment.repository';
import { NodeService } from '../node/node.service';
import type { ServiceOptions } from '../types';

export const IssueAssessmentService = (opts: ServiceOptions) => {
  const issueAssessmentRepo = IssueAssessmentRepository(opts);
  const nodeService = NodeService(opts);
  const allowedParentTypes: ParentTypeEnum[] = [ParentTypeEnum.Issue];

  return {
    async findById(id: string) {
      const issueAssessments = await issueAssessmentRepo.findWhere(
        {
          Id: { _eq: id },
        },
        { limit: 1 }
      );
      if (!issueAssessments[0]) {
        throw new BadRequest('IssueAssessment not found');
      }

      return issueAssessments[0];
    },

    async create(parentId: string, data: IssueAssessmentInsertInput) {
      const { ObjectType } = await nodeService.findById(parentId);
      if (!allowedParentTypes.includes(ObjectType)) {
        throw new Error(`Invalid parent type: ${ObjectType}`);
      }

      const result = await issueAssessmentRepo.create([data]);

      if (!result[0]) {
        throw new Error('IssueAssessment not created');
      }

      return result[0];
    },

    async update(id: string, userId: string, data: UpdateInput) {
      const issueAssessment = await this.findById(id);
      if (
        new Date(issueAssessment.ModifiedAtTimestamp).valueOf() !==
        new Date(data.OriginalTimestamp).valueOf()
      ) {
        throw new ModifiedSinceLastViewError();
      }
      const result = await issueAssessmentRepo.update(data);
      // 0 records being updated is most likely a permission issue which we need to resolve,
      // or the issue assessment has been deleted in the small time window between getting it above, and performing the update
      if (!result) {
        throw new Error('Failed to update issue assessment');
      }

      return result;
    },

    async delete(id: string | string[]) {
      return issueAssessmentRepo.delete(id);
    },
  };
};
