import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { insertApproval } from '../clients/approvalClient';
import {
  getAllChangeRequests,
  getChangeRequestById,
  getChangeRequests,
  insertChangeRequests,
} from '../clients/changeRequestClient';
import { getDefaultOrgId } from '../clients/defaults';
import { insertDocument } from '../clients/documentClient';
import {
  getDocumentFileById,
  updateDocumentVersion,
} from '../clients/documentFileClient';
import { enableEventsForOrg } from '../clients/utils';
import { buildApprovalWorkflow } from '../data/approval';
import { buildChangeRequest } from '../data/changeRequest';
import { buildDocument } from '../data/document';
import { buildDocumentFile } from '../data/documentFile';
import { buildUpdateDocumentVersion } from '../data/documentVersion';
import { buildOwner } from '../data/owner';
import { buildRisk } from '../data/risk';
import type { DocumentFileInsertInput } from '../generated/graphql';
import {
  ApprovalStatusEnum,
  DocumentFileTypeEnum,
  VersionStatusEnum,
} from '../generated/graphql';
import {
  approvalWorkflow,
  internalAuditUser1,
  readOnlyUser1,
  riskManagerUser1,
  setup,
  standardEnhancedUser1,
  standardUser1,
  teardown,
} from '../initialData';

const mockedDefaults = vi.hoisted(() => {
  return {
    getDefaultOrgId: vi.fn(),
    getAnotherOrgId: vi.fn(),
    getDefaultUserId: vi.fn(),
  };
});

vi.mock('../clients/defaults', () => mockedDefaults);

describe('changeRequest', () => {
  let documentFileDefaults: DocumentFileInsertInput;
  let documentFileId = '';

  beforeEach(async () => {
    await setup(mockedDefaults);

    //
    // Create an approval process with two levels for documents:
    //    - level1: Risk Manager 1
    //    - level2: Owner Approver
    //
    await insertApproval(
      buildApprovalWorkflow(approvalWorkflow, [
        [{ UserId: riskManagerUser1.Id }],
        [{ OwnerApprover: true }],
      ])
    );

    // Create a document with readOnlyUser1 user as the owner
    const documentFile = buildDocumentFile({});
    await insertDocument(
      buildDocument({
        owners: {
          data: [buildOwner({ UserId: standardUser1.Id })],
        },
        documentFiles: {
          data: [documentFile],
        },
      })
    );

    documentFileId = documentFile.Id ?? '';
    documentFileDefaults = documentFile;
  });
  afterEach(async () => {
    await teardown();
  });

  describe('query', () => {
    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 0 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords change requests where they are not the Owner or contributor',
      async ({ expectedRecords, ...user }) => {
        const risk = buildRisk({});
        await apiClient.insertRisk({ objects: risk });
        const changeRequest = buildChangeRequest({ ParentId: risk.Id });
        await insertChangeRequests({ objects: [changeRequest] });

        const changeRequests = await getChangeRequests({
          user,
        });
        expect(changeRequests.length).toEqual(expectedRecords);
      }
    );

    it.each([
      { ...riskManagerUser1, expectedRecords: 1 },
      { ...standardUser1, expectedRecords: 1 },
      { ...readOnlyUser1, expectedRecords: 1 },
      { ...standardEnhancedUser1, expectedRecords: 1 },
      { ...internalAuditUser1, expectedRecords: 1 },
    ])(
      '$RoleKey should see $expectedRecords change requests where they are the Owner',
      async ({ expectedRecords, ...user }) => {
        const risk = buildRisk({
          owners: {
            data: [buildOwner({ UserId: user.Id })],
          },
        });
        await apiClient.insertRisk({ objects: risk });
        const changeRequest = buildChangeRequest({
          ParentId: risk.Id,
        });
        await insertChangeRequests({ objects: [changeRequest] });

        const changeRequests = await getChangeRequests({
          user,
        });
        expect(changeRequests.length).toEqual(expectedRecords);
      }
    );
  });

  describe('Updating a document with an approval process assigned', () => {
    it.each([standardUser1, riskManagerUser1])(
      "Should be successful for $RoleKey user if the protected field isn't changed",
      async (user) => {
        const documentFile = buildUpdateDocumentVersion({
          Id: documentFileId,
          Content: 'bing bong this should update!!',
          Type: DocumentFileTypeEnum.Html,
          LatestModifiedAtTimestamp:
            documentFileDefaults.ModifiedAtTimestamp ?? '',
          Status: documentFileDefaults.Status ?? VersionStatusEnum.Draft,
        });
        const { data } = await updateDocumentVersion(documentFile, { user });
        expect(data?.updateDocumentVersion?.affected_rows).toEqual(1);
      }
    );

    it.each([riskManagerUser1])(
      'Should fail for $RoleKey user if the protected field is changed',
      async (user) => {
        const documentFile = buildUpdateDocumentVersion({
          Id: documentFileId,
          Content: 'bing bong this should update!!',
          Type: DocumentFileTypeEnum.Html,
          Status: VersionStatusEnum.Published,
          LatestModifiedAtTimestamp:
            documentFileDefaults.ModifiedAtTimestamp ?? '',
        });
        await expect(
          updateDocumentVersion(documentFile, { user })
        ).rejects.toThrow(
          'You need to create a change request to perform this action.'
        );
      }
    );

    it('Should create a change request if the protected field is changed WITH a confirmation', async () => {
      const originalDocument = await getDocumentFileById({
        Id: documentFileId,
      });

      const documentFile = buildUpdateDocumentVersion({
        Id: documentFileId,
        Content: 'bing bong this should update!!',
        Type: DocumentFileTypeEnum.Html,
        Status: VersionStatusEnum.Published,
        LatestModifiedAtTimestamp:
          documentFileDefaults.ModifiedAtTimestamp ?? '',
      });
      const { data } = await updateDocumentVersion(documentFile, {
        user: riskManagerUser1,
        confirmChangeRequest: true,
      });

      // graphql query was successful
      expect(data?.updateDocumentVersion?.affected_rows).toEqual(1);

      // check that the document file was not updated
      const updatedDocumentFile = await getDocumentFileById({
        Id: documentFileId,
      });
      expect(updatedDocumentFile!.Content).toEqual(originalDocument!.Content);
      expect(updatedDocumentFile!.Type).toEqual(originalDocument!.Type);
      expect(updatedDocumentFile!.Status).toEqual(originalDocument!.Status);

      // check that the change request was created
      const requests = await getAllChangeRequests();
      const changeRequest = requests.find(
        (r) =>
          r.ParentId === documentFileId &&
          r.ChangeRequestStatus === ApprovalStatusEnum.Pending &&
          r.CreatedByUser === riskManagerUser1.Id
      );
      expect(changeRequest).toBeTruthy();
      expect(changeRequest?.RequestedChanges).toEqual(
        expect.objectContaining({
          Content: 'bing bong this should update!!',
          Status: VersionStatusEnum.Published,
          Type: DocumentFileTypeEnum.Html,
        })
      );
    });
  });

  describe('Approving a change request', () => {
    let changeRequest: Awaited<ReturnType<typeof getAllChangeRequests>>[0];

    /*
     * Initialise each step by triggering the creation of a change request.
     */
    beforeEach(async () => {
      const documentFile = buildUpdateDocumentVersion({
        Id: documentFileId,
        Content: 'bing bong this should update!!',
        Type: DocumentFileTypeEnum.Html,
        Status: VersionStatusEnum.Published,
        LatestModifiedAtTimestamp:
          documentFileDefaults.ModifiedAtTimestamp ?? '',
      });
      await updateDocumentVersion(documentFile, {
        user: riskManagerUser1,
        confirmChangeRequest: true,
      });

      const requests = await getAllChangeRequests();
      const cr = requests.find(
        (r) =>
          r.ParentId === documentFileId &&
          r.ChangeRequestStatus === ApprovalStatusEnum.Pending &&
          r.CreatedByUser === riskManagerUser1.Id
      );
      // eslint-disable-next-line vitest/no-standalone-expect
      expect(cr).toBeTruthy();
      // eslint-disable-next-line vitest/no-standalone-expect
      expect(cr?.RequestedChanges).toEqual(
        expect.objectContaining({
          Content: 'bing bong this should update!!',
          Status: VersionStatusEnum.Published,
          Type: DocumentFileTypeEnum.Html,
        })
      );

      if (!cr) {
        throw new Error('Test failed to create a change request');
      }
      changeRequest = cr;
    });

    // Flakey. Ignoring until we can figure out why it fails
    it.skip('Should allow an approver to update their own response', async () => {
      await enableEventsForOrg(getDefaultOrgId());
      const levelId = changeRequest.responses
        .filter((c) => c.approver.UserId === riskManagerUser1.Id)
        .map((c) => c.approver.LevelId)[0];
      console.log(
        `Approving first change request level ${changeRequest.Id} for levelId: ${levelId}`
      );
      const { updateApproverResponses } =
        await apiClient.updateRestAPIApproverResponses(
          {
            input: {
              ChangeRequestId: changeRequest.Id,
              Response: true,
              Comment: 'My comment',
              OverrideLevel: false,
              LevelId: levelId,
            },
          },
          { user: riskManagerUser1 }
        );

      const updatedId = updateApproverResponses?.Id;

      if (!updatedId) {
        throw new Error('No responses returned');
      }

      expect(updatedId).toEqual(changeRequest.Id);

      const updatedChangeRequest = await getChangeRequestById({
        Id: changeRequest.Id,
      });

      expect(
        updatedChangeRequest?.responses.filter((r) => r.Approved === true)
          .length
      ).toEqual(1);

      const secondLevelId = changeRequest.responses
        .filter((c) => c.approver.OwnerApprover)
        .map((c) => c.approver.LevelId)[0];
      const updateRestAPIApproverResponses =
        await apiClient.updateRestAPIApproverResponses(
          {
            input: {
              ChangeRequestId: changeRequest.Id,
              Response: true,
              Comment: 'My other comment',
              OverrideLevel: false,
              LevelId: secondLevelId,
            },
          },
          { user: standardUser1 }
        );
      console.log(
        `Approving second change request level ${changeRequest.Id} for levelId: ${secondLevelId}`
      );
      expect(
        updateRestAPIApproverResponses.updateApproverResponses?.Id
      ).toEqual(changeRequest.Id);

      const furtherUpdatedChangeRequest = await getChangeRequestById({
        Id: changeRequest.Id,
      });

      expect(
        furtherUpdatedChangeRequest?.responses.filter(
          (r) => r.Approved === true
        ).length
      ).toEqual(2);

      console.log(`Polling for documentFileId ${documentFileId} to be updated`);
      const content = await vi.waitUntil(
        async () => {
          const updatedDocumentVersion = await getDocumentFileById({
            Id: documentFileId,
          });

          return updatedDocumentVersion?.Content;
        },
        {
          timeout: 35000,
          interval: 200,
        }
      );

      expect(content).toEqual('bing bong this should update!!');
    }, 45000);
  });
});
