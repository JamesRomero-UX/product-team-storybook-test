import { ParentTypes } from '@risksmart-app/domain/src/types/consts';
import { ApprovalStatus } from '@risksmart-app/domain/src/types/consts/approval-status';
import {
  buildAssessment,
  buildChangeRequest,
  buildChangeRequestContributor,
  insertAssessment,
  insertChangeRequest,
  insertChangeRequestContributor,
} from '@risksmart-app/test-data';
import { createTestContext } from 'src/utils/test-context';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

describe('change-request', () => {
  let context: Awaited<ReturnType<typeof createTestContext>>;
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  beforeEach(async () => {
    context = await createTestContext();
    contexts.push(context);
  });

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  it('pendingChangeRequests query should return change requests with pending status', async () => {
    const { orgKey, userId, trpcClient, insertedUser } = context;

    // Create a parent assessment for the change request
    const parentAssessment = buildAssessment(orgKey, userId);
    const insertedParentAssessment = await insertAssessment(parentAssessment);

    if (!insertedParentAssessment) {
      throw new Error('Failed to insert parent assessment');
    }

    // Create pending change request
    const pendingChangeRequest = buildChangeRequest(orgKey, userId, {
      ParentId: insertedParentAssessment.Id,
      ChangeRequestStatus: ApprovalStatus.Pending,
    });

    const insertedPendingRequest =
      await insertChangeRequest(pendingChangeRequest);

    if (!insertedPendingRequest) {
      throw new Error('Failed to insert pending change request');
    }

    // Create an approved change request (should not appear in results)
    const approvedChangeRequest = buildChangeRequest(orgKey, userId, {
      ParentId: insertedParentAssessment.Id,
      ChangeRequestStatus: ApprovalStatus.Approved,
    });

    await insertChangeRequest(approvedChangeRequest);

    // Create a change request contributor
    const changeRequestContributor = buildChangeRequestContributor({
      orgKey,
      changeRequestId: insertedPendingRequest.Id,
      userId,
      createdByUser: userId,
    });

    const insertedContributor = await insertChangeRequestContributor(
      changeRequestContributor
    );

    if (!insertedContributor) {
      throw new Error('Failed to insert change request contributor');
    }

    const response =
      await trpcClient.frontend.changeRequest.pendingChangeRequests.query({
        parentId: insertedParentAssessment.Id,
      });

    expect(response.length).toEqual(1);
    expect(response[0]).toEqual({
      CreatedAtTimestamp: insertedPendingRequest.CreatedAtTimestamp,
      ModifiedAtTimestamp: insertedPendingRequest.ModifiedAtTimestamp,
      OverriddenAtTimestamp: insertedPendingRequest.OverriddenAtTimestamp,
      OverriddenByUser: insertedPendingRequest.OverriddenByUser,
      RequestedChanges: insertedPendingRequest.RequestedChanges,
      Id: insertedPendingRequest.Id,
      ParentId: insertedParentAssessment.Id,
      ChangeRequestStatus: ApprovalStatus.Pending,
      Comment: 'Test change request comment',
      Type: 'update',
      contributors: [
        {
          user: {
            Id: insertedContributor.UserId,
            Email: insertedUser?.Email || null,
            FriendlyName: insertedUser?.FriendlyName || null,
          },
        },
      ],
      createdBy: {
        Id: insertedContributor.UserId,
        Email: insertedUser?.Email || null,
        FriendlyName: insertedUser?.FriendlyName || null,
      },
      requestedFileChanges: [],
      responses: [],
      parent: {
        Id: insertedParentAssessment.Id,
        SequentialId: insertedParentAssessment.SequentialId,
        ObjectType: ParentTypes.Assessment,
        acceptance: null,
        action: null,
        ancestorContributors: [],
        control: null,
        documentFile: null,
        issue_assessment: null,
        risk: null,
      },

      SequentialId: insertedPendingRequest.SequentialId,
    });
  });

  it('pendingChangeRequests query should return empty array when no pending requests exist', async () => {
    const { orgKey, userId, trpcClient } = context;

    // Create a parent assessment for the change request
    const parentAssessment = buildAssessment(orgKey, userId);
    const insertedParentAssessment = await insertAssessment(parentAssessment);

    if (!insertedParentAssessment) {
      throw new Error('Failed to insert parent assessment');
    }

    // Create only approved change requests (should not appear in results)
    const approvedChangeRequest = buildChangeRequest(orgKey, userId, {
      ParentId: insertedParentAssessment.Id,
      ChangeRequestStatus: ApprovalStatus.Approved,
    });

    await insertChangeRequest(approvedChangeRequest);

    const response =
      await trpcClient.frontend.changeRequest.pendingChangeRequests.query({
        parentId: insertedParentAssessment.Id,
      });

    expect(response.length).toEqual(0);
  });

  it('pendingChangeRequests query should filter by parent ID correctly', async () => {
    const { orgKey, userId, trpcClient } = context;

    // Create two parent assessments
    const parentAssessment1 = buildAssessment(orgKey, userId);
    const insertedParentAssessment1 = await insertAssessment(parentAssessment1);

    const parentAssessment2 = buildAssessment(orgKey, userId);
    const insertedParentAssessment2 = await insertAssessment(parentAssessment2);

    if (!insertedParentAssessment1 || !insertedParentAssessment2) {
      throw new Error('Failed to insert parent assessments');
    }

    // Create pending change requests for both parents
    const changeRequest1 = buildChangeRequest(orgKey, userId, {
      ParentId: insertedParentAssessment1.Id,
      ChangeRequestStatus: ApprovalStatus.Pending,
    });

    const changeRequest2 = buildChangeRequest(orgKey, userId, {
      ParentId: insertedParentAssessment2.Id,
      ChangeRequestStatus: ApprovalStatus.Pending,
    });

    const insertedRequest1 = await insertChangeRequest(changeRequest1);
    const insertedRequest2 = await insertChangeRequest(changeRequest2);

    if (!insertedRequest1) {
      throw new Error('Failed to insert change request 1');
    }

    if (!insertedRequest2) {
      throw new Error('Failed to insert change request 1');
    }

    // Query for change requests for parent 1 only
    const response =
      await trpcClient.frontend.changeRequest.pendingChangeRequests.query({
        parentId: insertedParentAssessment1.Id,
      });

    expect(response.length).toEqual(1);
    expect(response[0]).toEqual(
      expect.objectContaining({
        Id: insertedRequest1.Id,
        ParentId: insertedParentAssessment1.Id,
      })
    );

    const response2 =
      await trpcClient.frontend.changeRequest.pendingChangeRequests.query({
        parentId: insertedParentAssessment2.Id,
      });

    expect(response2.length).toEqual(1);
    expect(response2[0]).toEqual(
      expect.objectContaining({
        Id: insertedRequest2.Id,
        ParentId: insertedParentAssessment2.Id,
      })
    );
  });
});
