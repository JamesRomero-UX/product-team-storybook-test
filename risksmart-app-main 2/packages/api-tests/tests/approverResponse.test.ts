import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { buildApprovalWorkflow } from '../data/approval';
import { buildDocument } from '../data/document';
import { buildDocumentFile } from '../data/documentFile';
import { buildUpdateDocumentVersion } from '../data/documentVersion';
import { buildOwner } from '../data/owner';
import { buildUserGroup } from '../data/userGroup';
import { buildUserGroupUser } from '../data/userGroupUser';
import {
  ApprovalStatusEnum,
  DocumentFileTypeEnum,
  VersionStatusEnum,
} from '../generated/graphql';
import {
  riskManagerUser1,
  setup,
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

describe('approverResponse', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  });
  afterEach(async () => {
    await teardown();
  });

  describe('update', () => {
    it('should allow a Standard approver to update document version when they are the owner of the document', async () => {
      await apiClient.insertApprovals({
        objects: [
          buildApprovalWorkflow('publish-document-version', [
            [{ OwnerApprover: true }],
          ]),
        ],
      });

      const documentFile = buildDocumentFile({
        Status: VersionStatusEnum.Draft,
      });
      const document = buildDocument({
        owners: {
          data: [buildOwner({ UserId: standardUser1.Id })],
        },
        documentFiles: {
          data: [documentFile],
        },
      });

      await apiClient.insertDocument({ objects: [document] });

      const documentFileUpdateRequest = buildUpdateDocumentVersion({
        Id: documentFile.Id!,
        Content: 'Test',
        Type: DocumentFileTypeEnum.Html,
        Status: VersionStatusEnum.Published,
        LatestModifiedAtTimestamp: documentFile.ModifiedAtTimestamp!,
      });
      await apiClient.updateDocumentVersion(documentFileUpdateRequest, {
        user: riskManagerUser1,
        confirmChangeRequest: true,
      });
      const requests = await apiClient.getAllChangeRequests();
      const cr = requests.change_request.find(
        (r) =>
          r.ParentId === documentFile.Id! &&
          r.ChangeRequestStatus === ApprovalStatusEnum.Pending
      );
      expect(cr).toBeTruthy();
      expect(cr?.RequestedChanges).toEqual(
        expect.objectContaining({
          Content: documentFileUpdateRequest.Content,
          Status: VersionStatusEnum.Published,
          Type: DocumentFileTypeEnum.Html,
        })
      );

      const { updateApproverResponses } =
        await apiClient.updateRestAPIApproverResponses(
          {
            input: {
              ChangeRequestId: cr!.Id,
              Response: true,
              Comment: 'My comment',
              OverrideLevel: false,
              LevelId: cr!.responses[0].approver.LevelId,
            },
          },
          { user: standardUser1 }
        );

      expect(updateApproverResponses?.Id).toEqual(cr!.Id);
      const { change_request_by_pk } = await apiClient.getChangeRequest({
        Id: cr!.Id,
      });
      const approverResponse = change_request_by_pk?.responses[0];
      expect(approverResponse?.Approved).toEqual(true);
      expect(approverResponse?.Comment).toEqual('My comment');
    }, 30000);

    it('should allow a Standard approver to update document version when they are the owner of the document and are in an approval group, one level at a time', async () => {
      const userGroup = buildUserGroup({
        users: {
          data: [
            buildUserGroupUser({
              UserId: standardUser1.Id,
            }),
            buildUserGroupUser({
              UserId: riskManagerUser1.Id,
            }),
          ],
        },
      });

      await apiClient.insertUserGroups({
        objects: [userGroup],
      });

      await apiClient.insertApprovals({
        objects: [
          buildApprovalWorkflow('publish-document-version', [
            [{ OwnerApprover: true }],
            [{ UserGroupId: userGroup.Id }],
          ]),
        ],
      });

      const documentFile = buildDocumentFile({
        Status: VersionStatusEnum.Draft,
      });
      const document = buildDocument({
        owners: {
          data: [buildOwner({ UserId: standardUser1.Id })],
        },
        documentFiles: {
          data: [documentFile],
        },
      });

      await apiClient.insertDocument({ objects: [document] });

      const documentFileUpdateRequest = buildUpdateDocumentVersion({
        Id: documentFile.Id!,
        Content: 'Test',
        Type: DocumentFileTypeEnum.Html,
        Status: VersionStatusEnum.Published,
        LatestModifiedAtTimestamp: documentFile.ModifiedAtTimestamp!,
      });
      await apiClient.updateDocumentVersion(documentFileUpdateRequest, {
        user: riskManagerUser1,
        confirmChangeRequest: true,
      });

      const requests = await apiClient.getAllChangeRequests();
      const cr = requests.change_request.find(
        (r) =>
          r.ParentId === documentFile.Id! &&
          r.ChangeRequestStatus === ApprovalStatusEnum.Pending
      );
      expect(cr).toBeTruthy();
      expect(cr?.RequestedChanges).toEqual(
        expect.objectContaining({
          Content: documentFileUpdateRequest.Content,
          Status: VersionStatusEnum.Published,
          Type: DocumentFileTypeEnum.Html,
        })
      );

      const levelIds = cr?.responses.map((c) => c.approver.LevelId) ?? [];

      const { updateApproverResponses } =
        await apiClient.updateRestAPIApproverResponses(
          {
            input: {
              ChangeRequestId: cr!.Id,
              Response: true,
              Comment: 'My comment',
              OverrideLevel: false,
              LevelId: levelIds[0],
            },
          },
          { user: standardUser1 }
        );
      expect(updateApproverResponses?.Id).toEqual(cr!.Id);
      const { change_request_by_pk } = await apiClient.getChangeRequest({
        Id: cr!.Id,
      });
      const firstApproverResponseLevel = change_request_by_pk?.responses.find(
        (c) => c.approver.LevelId === levelIds[0]
      );
      expect(firstApproverResponseLevel?.Approved).toEqual(true);
      expect(firstApproverResponseLevel?.Comment).toEqual('My comment');
      const secondApproverResponseLevel = change_request_by_pk?.responses.find(
        (c) => c.approver.LevelId === levelIds[1]
      );
      expect(secondApproverResponseLevel?.Approved).toBeNull();
      expect(secondApproverResponseLevel?.Comment).toEqual('');
      const { updateApproverResponses: secondApproverResponse } =
        await apiClient.updateRestAPIApproverResponses(
          {
            input: {
              ChangeRequestId: cr!.Id,
              Response: true,
              Comment: 'My other comment',
              OverrideLevel: false,
              LevelId: levelIds[1],
            },
          },
          { user: standardUser1 }
        );
      expect(secondApproverResponse?.Id).toEqual(cr!.Id);
      const { change_request_by_pk: secondChangeRequestResponse } =
        await apiClient.getChangeRequest({
          Id: cr!.Id,
        });
      const firstApproverResponseLevelStep2 =
        secondChangeRequestResponse?.responses.find(
          (c) => c.approver.LevelId === levelIds[0]
        );
      expect(firstApproverResponseLevelStep2?.Approved).toEqual(true);
      expect(firstApproverResponseLevelStep2?.Comment).toEqual('My comment');
      const secondApproverResponseLevelStep2 =
        secondChangeRequestResponse?.responses.find(
          (c) => c.approver.LevelId === levelIds[1]
        );
      expect(secondApproverResponseLevelStep2?.Approved).toEqual(true);
      expect(secondApproverResponseLevelStep2?.Comment).toEqual(
        'My other comment'
      );
    }, 30000);

    it('should allow a RiskManager approver to update document version when they are the owner of the document, are in an approval group and a manual approver, one level at a time', async () => {
      const userGroup = buildUserGroup({
        users: {
          data: [
            buildUserGroupUser({
              UserId: standardUser1.Id,
            }),
            buildUserGroupUser({
              UserId: riskManagerUser1.Id,
            }),
          ],
        },
      });

      await apiClient.insertUserGroups({
        objects: [userGroup],
      });

      await apiClient.insertApprovals({
        objects: [
          buildApprovalWorkflow('publish-document-version', [
            [{ OwnerApprover: true }],
            [{ UserGroupId: userGroup.Id }],
            [{ UserId: riskManagerUser1.Id }],
          ]),
        ],
      });

      const documentFile = buildDocumentFile({
        Status: VersionStatusEnum.Draft,
      });
      const document = buildDocument({
        owners: {
          data: [
            buildOwner({ UserId: riskManagerUser1.Id }),
            buildOwner({ UserId: standardUser1.Id }),
          ],
        },
        documentFiles: {
          data: [documentFile],
        },
      });

      await apiClient.insertDocument({ objects: [document] });

      const documentFileUpdateRequest = buildUpdateDocumentVersion({
        Id: documentFile.Id!,
        Content: 'Test',
        Type: DocumentFileTypeEnum.Html,
        Status: VersionStatusEnum.Published,
        LatestModifiedAtTimestamp: documentFile.ModifiedAtTimestamp!,
      });
      await apiClient.updateDocumentVersion(documentFileUpdateRequest, {
        user: standardUser1,
        confirmChangeRequest: true,
      });

      const requests = await apiClient.getAllChangeRequests();
      const cr = requests.change_request.find(
        (r) =>
          r.ParentId === documentFile.Id! &&
          r.ChangeRequestStatus === ApprovalStatusEnum.Pending
      );
      expect(cr).toBeTruthy();
      expect(cr?.RequestedChanges).toEqual(
        expect.objectContaining({
          Content: documentFileUpdateRequest.Content,
          Status: VersionStatusEnum.Published,
          Type: DocumentFileTypeEnum.Html,
        })
      );
      expect(cr?.responses.length).toEqual(3);
      expect(cr?.responses.filter((c) => c.Approved === null).length).toEqual(
        3
      );
      const levelIds = cr?.responses.map((c) => c.approver.LevelId) ?? [];
      const { updateApproverResponses } =
        await apiClient.updateRestAPIApproverResponses(
          {
            input: {
              ChangeRequestId: cr!.Id,
              Response: true,
              Comment: 'My comment',
              OverrideLevel: false,
              LevelId: levelIds[0],
            },
          },
          { user: riskManagerUser1 }
        );
      expect(updateApproverResponses?.Id).toEqual(cr!.Id);
      const { change_request_by_pk: levelZeroChangeRequest } =
        await apiClient.getChangeRequest({
          Id: cr!.Id,
        });
      const approverLevelZeroResponse = levelZeroChangeRequest?.responses.find(
        (c) => c.approver.LevelId === levelIds[0]
      );
      expect(approverLevelZeroResponse?.Approved).toEqual(true);
      expect(approverLevelZeroResponse?.Comment).toEqual('My comment');
      const approverGroupLevelZeroResponse =
        levelZeroChangeRequest?.responses.find(
          (c) => c.approver.LevelId === levelIds[1]
        );
      expect(approverGroupLevelZeroResponse?.Approved).toBeNull();
      expect(approverGroupLevelZeroResponse?.Comment).toEqual('');
      const approverStepLevelZeroResponse =
        levelZeroChangeRequest?.responses.find(
          (c) => c.approver.LevelId === levelIds[2]
        );
      expect(approverStepLevelZeroResponse?.Approved).toBeNull();
      expect(approverStepLevelZeroResponse?.Comment).toEqual('');
      await apiClient.updateRestAPIApproverResponses(
        {
          input: {
            ChangeRequestId: cr!.Id,
            Response: true,
            Comment: 'My second comment',
            OverrideLevel: false,
            LevelId: levelIds[1],
          },
        },
        { user: riskManagerUser1 }
      );
      const { change_request_by_pk: levelOneChangeRequest } =
        await apiClient.getChangeRequest({
          Id: cr!.Id,
        });
      const approverLevelOneResponse = levelOneChangeRequest?.responses.find(
        (c) => c.approver.LevelId === levelIds[0]
      );
      expect(approverLevelOneResponse?.Approved).toEqual(true);
      expect(approverLevelOneResponse?.Comment).toEqual('My comment');
      const approverGroupLevelOneResponse =
        levelOneChangeRequest?.responses.find(
          (c) => c.approver.LevelId === levelIds[1]
        );
      expect(approverGroupLevelOneResponse?.Approved).toEqual(true);
      expect(approverGroupLevelOneResponse?.Comment).toEqual(
        'My second comment'
      );
      const approverStepLevelOneResponse =
        levelOneChangeRequest?.responses.find(
          (c) => c.approver.LevelId === levelIds[2]
        );
      expect(approverStepLevelOneResponse?.Approved).toBeNull();
      expect(approverStepLevelOneResponse?.Comment).toEqual('');

      await apiClient.updateRestAPIApproverResponses(
        {
          input: {
            ChangeRequestId: cr!.Id,
            Response: true,
            Comment: 'My third comment',
            OverrideLevel: false,
            LevelId: levelIds[2],
          },
        },
        { user: riskManagerUser1 }
      );
      const { change_request_by_pk } = await apiClient.getChangeRequest({
        Id: cr!.Id,
      });
      const approverResponse = change_request_by_pk?.responses.find(
        (c) => c.approver.LevelId === levelIds[0]
      );
      expect(approverResponse?.Approved).toEqual(true);
      expect(approverResponse?.Comment).toEqual('My comment');
      const approverGroupResponse = change_request_by_pk?.responses.find(
        (c) => c.approver.LevelId === levelIds[1]
      );
      expect(approverGroupResponse?.Approved).toEqual(true);
      expect(approverGroupResponse?.Comment).toEqual('My second comment');
      const approverStepResponse = change_request_by_pk?.responses.find(
        (c) => c.approver.LevelId === levelIds[2]
      );
      expect(approverStepResponse?.Approved).toEqual(true);
      expect(approverStepResponse?.Comment).toEqual('My third comment');
    }, 30000);

    it('should not allow a Standard approver to update document version when they are the not the owner of the document', async () => {
      await apiClient.insertApprovals({
        objects: [
          buildApprovalWorkflow('publish-document-version', [
            [{ OwnerApprover: true }],
          ]),
        ],
      });

      const documentFile = buildDocumentFile({
        Status: VersionStatusEnum.Draft,
      });
      const document = buildDocument({
        owners: {
          data: [buildOwner({ UserId: riskManagerUser1.Id })],
        },
        documentFiles: {
          data: [documentFile],
        },
      });

      await apiClient.insertDocument({ objects: [document] });

      const documentFileUpdateRequest = buildUpdateDocumentVersion({
        Id: documentFile.Id!,
        Content: 'Test',
        Type: DocumentFileTypeEnum.Html,
        Status: VersionStatusEnum.Published,
        LatestModifiedAtTimestamp: documentFile.ModifiedAtTimestamp!,
      });
      await apiClient.updateDocumentVersion(documentFileUpdateRequest, {
        user: riskManagerUser1,
        confirmChangeRequest: true,
      });

      const requests = await apiClient.getAllChangeRequests();
      const cr = requests.change_request.find(
        (r) =>
          r.ParentId === documentFile.Id! &&
          r.ChangeRequestStatus === ApprovalStatusEnum.Pending
      );
      expect(cr).toBeTruthy();
      expect(cr?.RequestedChanges).toEqual(
        expect.objectContaining({
          Content: documentFileUpdateRequest.Content,
          Status: VersionStatusEnum.Published,
          Type: DocumentFileTypeEnum.Html,
        })
      );

      const { updateApproverResponses } =
        await apiClient.updateRestAPIApproverResponses(
          {
            input: {
              ChangeRequestId: cr!.Id,
              Response: true,
              Comment: 'My comment',
              OverrideLevel: false,
              LevelId: cr!.responses[0].approver.LevelId,
            },
          },
          { user: standardUser1 }
        );
      expect(updateApproverResponses?.Id).toEqual(cr!.Id);
      const { change_request_by_pk } = await apiClient.getChangeRequest({
        Id: cr!.Id,
      });
      const approverResponse = change_request_by_pk?.responses[0];
      expect(approverResponse?.Approved).toEqual(null);
      expect(approverResponse?.Comment).toEqual('');
    }, 30000);

    it('should not allow a RiskManager approver to update document version when they are not the owner of the document without overrides', async () => {
      await apiClient.insertApprovals({
        objects: [
          buildApprovalWorkflow('publish-document-version', [
            [{ OwnerApprover: true }],
          ]),
        ],
      });

      const documentFile = buildDocumentFile({
        Status: VersionStatusEnum.Draft,
      });
      const document = buildDocument({
        owners: {
          data: [buildOwner({ UserId: standardUser1.Id })],
        },
        documentFiles: {
          data: [documentFile],
        },
      });

      await apiClient.insertDocument({ objects: [document] });

      const documentFileUpdateRequest = buildUpdateDocumentVersion({
        Id: documentFile.Id!,
        Content: 'Test',
        Type: DocumentFileTypeEnum.Html,
        Status: VersionStatusEnum.Published,
        LatestModifiedAtTimestamp: documentFile.ModifiedAtTimestamp!,
      });
      await apiClient.updateDocumentVersion(documentFileUpdateRequest, {
        user: standardUser1,
        confirmChangeRequest: true,
      });

      const requests = await apiClient.getAllChangeRequests();
      const cr = requests.change_request.find(
        (r) =>
          r.ParentId === documentFile.Id! &&
          r.ChangeRequestStatus === ApprovalStatusEnum.Pending
      );
      expect(cr).toBeTruthy();
      expect(cr?.RequestedChanges).toEqual(
        expect.objectContaining({
          Content: documentFileUpdateRequest.Content,
          Status: VersionStatusEnum.Published,
          Type: DocumentFileTypeEnum.Html,
        })
      );

      const { updateApproverResponses } =
        await apiClient.updateRestAPIApproverResponses(
          {
            input: {
              ChangeRequestId: cr!.Id,
              Response: true,
              Comment: 'My comment',
              OverrideLevel: false,
              LevelId: cr!.responses[0].approver.LevelId,
            },
          },
          { user: riskManagerUser1 }
        );
      expect(updateApproverResponses?.Id).toEqual(cr!.Id);
      const { change_request_by_pk } = await apiClient.getChangeRequest({
        Id: cr!.Id,
      });
      const approverResponse = change_request_by_pk?.responses[0];
      expect(approverResponse?.Approved).toEqual(null);
      expect(approverResponse?.Comment).toEqual('');
    }, 30000);

    it('should allow a RiskManager approver to update document version when they are not the owner of the document with overrides', async () => {
      await apiClient.insertApprovals({
        objects: [
          buildApprovalWorkflow('publish-document-version', [
            [{ OwnerApprover: true }],
          ]),
        ],
      });

      const documentFile = buildDocumentFile({
        Status: VersionStatusEnum.Draft,
      });
      const document = buildDocument({
        owners: {
          data: [buildOwner({ UserId: standardUser1.Id })],
        },
        documentFiles: {
          data: [documentFile],
        },
      });

      await apiClient.insertDocument({ objects: [document] });

      const documentFileUpdateRequest = buildUpdateDocumentVersion({
        Id: documentFile.Id!,
        Content: 'Test',
        Type: DocumentFileTypeEnum.Html,
        Status: VersionStatusEnum.Published,
        LatestModifiedAtTimestamp: documentFile.ModifiedAtTimestamp!,
      });
      await apiClient.updateDocumentVersion(documentFileUpdateRequest, {
        user: standardUser1,
        confirmChangeRequest: true,
      });

      const requests = await apiClient.getAllChangeRequests();
      const cr = requests.change_request.find(
        (r) =>
          r.ParentId === documentFile.Id! &&
          r.ChangeRequestStatus === ApprovalStatusEnum.Pending
      );
      expect(cr).toBeTruthy();
      expect(cr?.RequestedChanges).toEqual(
        expect.objectContaining({
          Content: documentFileUpdateRequest.Content,
          Status: VersionStatusEnum.Published,
          Type: DocumentFileTypeEnum.Html,
        })
      );

      const { updateApproverResponses } =
        await apiClient.updateRestAPIApproverResponses(
          {
            input: {
              ChangeRequestId: cr!.Id,
              Response: true,
              Comment: 'My override comment',
              OverrideLevel: true,
              LevelId: cr!.responses[0].approver.LevelId,
            },
          },
          { user: riskManagerUser1 }
        );
      expect(updateApproverResponses?.Id).toEqual(cr!.Id);
      const { change_request_by_pk } = await apiClient.getChangeRequest({
        Id: cr!.Id,
      });
      const approverResponse = change_request_by_pk?.responses[0];
      expect(approverResponse?.Approved).toEqual(true);
      expect(approverResponse?.Comment).toEqual('My override comment');
    }, 30000);

    it('should not allow a Standard approver to update document version when they are not the owner of the document with overrides', async () => {
      await apiClient.insertApprovals({
        objects: [
          buildApprovalWorkflow('publish-document-version', [
            [{ OwnerApprover: true }],
          ]),
        ],
      });

      const documentFile = buildDocumentFile({
        Status: VersionStatusEnum.Draft,
      });
      const document = buildDocument({
        owners: {
          data: [buildOwner({ UserId: riskManagerUser1.Id })],
        },
        documentFiles: {
          data: [documentFile],
        },
      });

      await apiClient.insertDocument({ objects: [document] });

      const documentFileUpdateRequest = buildUpdateDocumentVersion({
        Id: documentFile.Id!,
        Content: 'Test',
        Type: DocumentFileTypeEnum.Html,
        Status: VersionStatusEnum.Published,
        LatestModifiedAtTimestamp: documentFile.ModifiedAtTimestamp!,
      });
      await apiClient.updateDocumentVersion(documentFileUpdateRequest, {
        user: riskManagerUser1,
        confirmChangeRequest: true,
      });

      const requests = await apiClient.getAllChangeRequests();
      const cr = requests.change_request.find(
        (r) =>
          r.ParentId === documentFile.Id! &&
          r.ChangeRequestStatus === ApprovalStatusEnum.Pending
      );
      expect(cr).toBeTruthy();
      expect(cr?.RequestedChanges).toEqual(
        expect.objectContaining({
          Content: documentFileUpdateRequest.Content,
          Status: VersionStatusEnum.Published,
          Type: DocumentFileTypeEnum.Html,
        })
      );

      await expect(
        apiClient.updateRestAPIApproverResponses(
          {
            input: {
              ChangeRequestId: cr!.Id,
              Response: true,
              Comment: 'My override comment',
              OverrideLevel: true,
              LevelId: cr!.responses[0].approver.LevelId,
            },
          },
          { user: standardUser1 }
        )
      ).rejects.toThrow('Access denied');
      const { change_request_by_pk } = await apiClient.getChangeRequest({
        Id: cr!.Id,
      });
      const approverResponse = change_request_by_pk?.responses[0];
      expect(approverResponse?.Approved).toEqual(null);
      expect(approverResponse?.Comment).toEqual('');
    }, 30000);

    it('should not allow a Standard approver to update document version when they are the owner of the document with overrides', async () => {
      await apiClient.insertApprovals({
        objects: [
          buildApprovalWorkflow('publish-document-version', [
            [{ OwnerApprover: true }],
          ]),
        ],
      });

      const documentFile = buildDocumentFile({
        Status: VersionStatusEnum.Draft,
      });
      const document = buildDocument({
        owners: {
          data: [buildOwner({ UserId: standardUser1.Id })],
        },
        documentFiles: {
          data: [documentFile],
        },
      });

      await apiClient.insertDocument({ objects: [document] });

      const documentFileUpdateRequest = buildUpdateDocumentVersion({
        Id: documentFile.Id!,
        Content: 'Test',
        Type: DocumentFileTypeEnum.Html,
        Status: VersionStatusEnum.Published,
        LatestModifiedAtTimestamp: documentFile.ModifiedAtTimestamp!,
      });
      await apiClient.updateDocumentVersion(documentFileUpdateRequest, {
        user: standardUser1,
        confirmChangeRequest: true,
      });

      const requests = await apiClient.getAllChangeRequests();
      const cr = requests.change_request.find(
        (r) =>
          r.ParentId === documentFile.Id! &&
          r.ChangeRequestStatus === ApprovalStatusEnum.Pending
      );
      expect(cr).toBeTruthy();
      expect(cr?.RequestedChanges).toEqual(
        expect.objectContaining({
          Content: documentFileUpdateRequest.Content,
          Status: VersionStatusEnum.Published,
          Type: DocumentFileTypeEnum.Html,
        })
      );

      await expect(
        apiClient.updateRestAPIApproverResponses(
          {
            input: {
              ChangeRequestId: cr!.Id,
              Response: true,
              Comment: 'My override comment',
              OverrideLevel: true,
              LevelId: cr!.responses[0].approver.LevelId,
            },
          },
          { user: standardUser1 }
        )
      ).rejects.toThrow('Access denied');
      const { change_request_by_pk } = await apiClient.getChangeRequest({
        Id: cr!.Id,
      });
      const approverResponse = change_request_by_pk?.responses[0];
      expect(approverResponse?.Approved).toEqual(null);
      expect(approverResponse?.Comment).toEqual('');
    }, 30000);
  });
});
