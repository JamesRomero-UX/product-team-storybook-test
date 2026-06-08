import { VersionStatus } from '@risksmart-app/domain/src/types/consts/version-status';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { getAssessmentResultParentWithDocumentResultsQueryConfig } from '@risksmart-app/drizzle/src/queries/assessment-result.query';
import { getAttestationCycleQueryConfig } from '@risksmart-app/drizzle/src/queries/attestation-cycle.query';
import {
  getAttestationRecordQueryConfig,
  getAttestationStatusQueryConfig,
} from '@risksmart-app/drizzle/src/queries/attestation-record.query';
import {
  getDocumentByIdQueryConfig,
  getDocumentListSimpleQueryConfig,
  getDocumentRegisterQueryConfig,
} from '@risksmart-app/drizzle/src/queries/document.query';
import {
  getDocumentFileByIdQueryConfig,
  getDocumentFilesByDocumentIdQueryConfig,
  getLatestDocumentFileQueryConfig,
  getPublicDocumentFilesQueryConfig,
} from '@risksmart-app/drizzle/src/queries/document-file.query';
import { attestationParts } from '@risksmart-app/drizzle/src/queries/utils';
import { bulkCheck, filter } from '@risksmart-app/permitio/src/permit';

import type {
  AttestationStatusResponseRow,
  DocumentFilesByDocumentIdResponseRow,
  DocumentListSimpleResponseRow,
  LatestDocumentFileResponseRow,
  PublicDocumentFilesResponseRow,
} from '../../types/index';
import { attachChangeRequests } from '../../utils/change-requests';
import { RATING_TYPE_ASSESSMENT } from '../../utils/consts';
import type { PolicyService, ServiceContext } from '../service.types';

export class PolicyServiceImpl implements PolicyService {
  async getDocumentById(ctx: ServiceContext, documentId: string) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) =>
      tx.query.document.findMany({
        where: { Id: documentId },
        ...getDocumentByIdQueryConfig,
      })
    );

    const filtered = await filter<(typeof data)[0]>(
      data,
      'rs_node',
      (entity) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return filtered;
  }

  async getLatestPublicDocumentFileByDocumentId(
    ctx: ServiceContext,
    documentId: string
  ) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) =>
      tx.query.document_file.findFirst({
        where: {
          ParentDocumentId: documentId,
          Status: VersionStatus.Published,
        },
        orderBy: (t, { desc }) => [desc(t.PublishedDate)],
      })
    );

    return data;
  }

  async getDocumentsRegister(ctx: ServiceContext) {
    const db = await createDrizzleClient(ctx);

    // Query documents with comprehensive relationships
    const data = await db.org((tx) => {
      return tx.query.document.findMany({
        ...getDocumentRegisterQueryConfig,
      });
    });

    // Get assessment results for documents
    const assessmentResults = await db.org((tx) => {
      return tx.query.assessment_result_parent.findMany({
        where: {
          documentAssessmentResult: {
            RatingType: { in: RATING_TYPE_ASSESSMENT },
          },
        },
        ...getAssessmentResultParentWithDocumentResultsQueryConfig,
        orderBy: (t, { desc }) => [desc(t.ParentId)],
      });
    });

    // Sort the assessment results by TestDate then CreatedAtTimestamp on the documentAssessmentResult
    assessmentResults.sort((a, b) => {
      const aTestDate = a.documentAssessmentResult?.TestDate;
      const bTestDate = b.documentAssessmentResult?.TestDate;
      const aCreatedAt = a.documentAssessmentResult?.CreatedAtTimestamp;
      const bCreatedAt = b.documentAssessmentResult?.CreatedAtTimestamp;

      // First sort by TestDate (descending - most recent first)
      if (aTestDate && bTestDate) {
        const testDateCompare =
          new Date(bTestDate).getTime() - new Date(aTestDate).getTime();
        if (testDateCompare !== 0) {
          return testDateCompare;
        }
      } else if (aTestDate && !bTestDate) {
        return -1; // a has TestDate, b doesn't - a comes first
      } else if (!aTestDate && bTestDate) {
        return 1; // b has TestDate, a doesn't - b comes first
      }

      // If TestDate is the same or both are null, sort by CreatedAtTimestamp (descending)
      if (aCreatedAt && bCreatedAt) {
        return new Date(bCreatedAt).getTime() - new Date(aCreatedAt).getTime();
      } else if (aCreatedAt && !bCreatedAt) {
        return -1;
      } else if (!aCreatedAt && bCreatedAt) {
        return 1;
      }

      return 0; // Both are equal
    });

    const filteredDocuments = await filter<(typeof data)[0]>(
      data,
      'rs_node',
      (entity: (typeof data)[0]) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    const filteredAssessmentResults = await filter<
      (typeof assessmentResults)[0]
    >(
      assessmentResults,
      'rs_node',
      (entity: (typeof assessmentResults)[0]) => entity.ParentId,
      ctx.userId,
      ctx.orgId
    );

    return {
      document: filteredDocuments,
      assessment_result_parent: filteredAssessmentResults,
    };
  }

  async getAttestationsRegister(ctx: ServiceContext, userId?: string) {
    const db = await createDrizzleClient(ctx);

    // Get attestation_record data to match getPolicyAttestationRecords GraphQL query
    const attestationRecords = await db.org((tx) => {
      return tx.query.attestation_record.findMany({
        where: userId ? { UserId: userId } : undefined,
        orderBy: (t, { desc, asc }) => [
          desc(t.Active),
          desc(t.NodeId),
          asc(t.ExpiresAt),
        ],
        ...getAttestationRecordQueryConfig,
      });
    });

    const filteredAttestationRecords = await filter<
      (typeof attestationRecords)[0]
    >(
      attestationRecords,
      'rs_node',
      (entity: (typeof attestationRecords)[0]) => entity.NodeId,
      ctx.userId,
      ctx.orgId
    );

    return {
      attestation_record: filteredAttestationRecords,
    };
  }

  async getAttestationCyclesRegister(ctx: ServiceContext) {
    const db = await createDrizzleClient(ctx);

    const attestationCycles = await db.org((tx) => {
      return tx.query.attestation_cycle.findMany({
        orderBy: (t, { desc }) => [desc(t.CreatedAtTimestamp)],
        ...getAttestationCycleQueryConfig,
      });
    });

    const filtered = await filter<(typeof attestationCycles)[0]>(
      attestationCycles,
      'rs_node',
      (entity: (typeof attestationCycles)[0]) => entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return {
      attestation_cycle: filtered,
    };
  }

  async getAttestationCyclesByDocumentId(
    ctx: ServiceContext,
    documentId: string
  ) {
    const db = await createDrizzleClient(ctx);

    const attestationCycles = await db.org((tx) => {
      return tx.query.attestation_cycle.findMany({
        where: { document_file: { ParentDocumentId: documentId } },
        orderBy: (t, { desc }) => [desc(t.CreatedAtTimestamp)],
        ...getAttestationCycleQueryConfig,
      });
    });

    return await filter<(typeof attestationCycles)[0]>(
      attestationCycles,
      'rs_node',
      (entity: (typeof attestationCycles)[0]) => entity.Id,
      ctx.userId,
      ctx.orgId
    );
  }

  async getDocumentFileById(ctx: ServiceContext, documentFileId: string) {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) =>
      tx.query.document_file.findMany({
        where: { Id: documentFileId },
        ...getDocumentFileByIdQueryConfig,
      })
    );

    const processedData = await attachChangeRequests(db, data);

    // Check if user has read access to public_policies (allows viewing published files)
    const publicPoliciesCheck = await bulkCheck(
      [{ resourceName: 'public_policies', action: 'read' }],
      ctx.userId,
      ctx.orgId
    );

    // If user has no public policies access, return empty
    if (!publicPoliciesCheck || publicPoliciesCheck.length === 0) {
      return await filter<(typeof processedData)[0]>(
        processedData,
        'rs_node',
        (entity) => entity.parent?.Id ?? entity.Id,
        ctx.userId,
        ctx.orgId
      );
    }

    // If user has no public policies access, return empty
    // Separate published and non-published files
    const publishedFiles = processedData.filter(
      (file) => file.Status === VersionStatus.Published
    );
    const nonPublishedFiles = processedData.filter(
      (file) => file.Status !== VersionStatus.Published
    );

    // Non-published files: always filter via permit
    const allowedNonPublishedFiles = await filter<(typeof processedData)[0]>(
      nonPublishedFiles,
      'rs_node',
      (entity) => entity.parent?.Id ?? entity.Id,
      ctx.userId,
      ctx.orgId
    );

    return [...publishedFiles, ...allowedNonPublishedFiles];
  }

  async getDocumentFilesByDocumentId(
    ctx: ServiceContext,
    documentId: string
  ): Promise<DocumentFilesByDocumentIdResponseRow[]> {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) =>
      tx.query.document_file.findMany({
        where: { ParentDocumentId: documentId },
        ...getDocumentFilesByDocumentIdQueryConfig,
      })
    );

    const processedData = await attachChangeRequests(db, data);

    // Filter via permit - document files inherit permissions from their parent document
    return await filter<DocumentFilesByDocumentIdResponseRow>(
      processedData,
      'rs_node',
      (entity) => entity.ParentDocumentId,
      ctx.userId,
      ctx.orgId
    );
  }

  async getLatestDocumentFile(
    ctx: ServiceContext,
    parentDocumentId: string,
    fileId?: string,
    status?: VersionStatus
  ): Promise<LatestDocumentFileResponseRow[]> {
    const db = await createDrizzleClient(ctx);

    // Build where clause based on parameters
    const whereClause: Record<string, unknown> = {
      ParentDocumentId: parentDocumentId,
    };

    // Add fileId filter if provided and not 'latest'
    if (fileId && fileId !== 'latest') {
      whereClause.Id = fileId;
    }

    // Add status filter if provided
    if (status) {
      whereClause.Status = status;
    }

    const data = await db.org((tx) =>
      tx.query.document_file.findFirst({
        where: whereClause,
        orderBy: (t, { desc }) => [desc(t.CreatedAtTimestamp)],
        ...getLatestDocumentFileQueryConfig,
      })
    );

    // If no data found, return empty array
    if (!data) {
      return [];
    }

    // Check if user has read access to public_policies (allows viewing published files)
    const publicPoliciesCheck = await bulkCheck(
      [{ resourceName: 'public_policies', action: 'read' }],
      ctx.userId,
      ctx.orgId
    );

    // If file is published and user has public_policies access, allow direct access
    if (
      data.Status === VersionStatus.Published &&
      publicPoliciesCheck &&
      publicPoliciesCheck.length > 0
    ) {
      return [data];
    }

    // For non-published files or users without public_policies access, check via permit
    return await filter<LatestDocumentFileResponseRow>(
      [data],
      'rs_node',
      (entity) => (entity.parent?.Title ? parentDocumentId : entity.Id),
      ctx.userId,
      ctx.orgId
    );
  }

  async getPublicDocumentFiles(
    ctx: ServiceContext,
    userId: string
  ): Promise<PublicDocumentFilesResponseRow[]> {
    // Check if user has read access to public_policies
    const publicPoliciesCheck = await bulkCheck(
      [{ resourceName: 'public_policies', action: 'read' }],
      ctx.userId,
      ctx.orgId
    );

    // If user has no public policies access, return empty
    if (!publicPoliciesCheck || publicPoliciesCheck.length === 0) {
      return [];
    }

    const db = await createDrizzleClient(ctx);

    // Query all published document files
    const data = await db.org((tx) =>
      tx.query.document_file.findMany({
        where: { Status: VersionStatus.Published },
        orderBy: (t, { desc }) => [desc(t.CreatedAtTimestamp)],
        ...getPublicDocumentFilesQueryConfig,
      })
    );

    // For each file, fetch attestations separately filtered by userId
    const filesWithAttestations = await Promise.all(
      data.map(async (file) => {
        const attestations = await db.org((tx) =>
          tx.query.attestation_record.findMany({
            where: {
              NodeId: file.Id,
              UserId: userId,
            },
            orderBy: (t, { desc }) => [desc(t.CreatedAtTimestamp)],
            columns: {
              ...attestationParts,
            },
            limit: 1,
          })
        );

        return {
          ...file,
          attestations: attestations,
        };
      })
    );

    return filesWithAttestations;
  }

  async getAttestationStatus(
    ctx: ServiceContext,
    parentId: string,
    userId: string
  ): Promise<AttestationStatusResponseRow[]> {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) =>
      tx.query.attestation_record.findFirst({
        where: { NodeId: parentId, UserId: userId },
        orderBy: (t, { desc }) => [desc(t.CreatedAtTimestamp)],
        ...getAttestationStatusQueryConfig,
      })
    );

    if (!data) {
      return [];
    }

    // Filter via permit - attestation records inherit permissions from their node
    return await filter<AttestationStatusResponseRow>(
      [data],
      'rs_node',
      (entity) => entity.NodeId,
      ctx.userId,
      ctx.orgId
    );
  }

  async getDocumentListSimple(
    ctx: ServiceContext
  ): Promise<DocumentListSimpleResponseRow[]> {
    const db = await createDrizzleClient(ctx);

    const data = await db.org((tx) =>
      tx.query.document.findMany({
        orderBy: (t, { asc }) => [asc(t.Title)],
        ...getDocumentListSimpleQueryConfig,
      })
    );

    return await filter<DocumentListSimpleResponseRow>(
      data,
      'rs_node',
      (entity) => entity.Id,
      ctx.userId,
      ctx.orgId
    );
  }
}
