import { nextFileVersion } from '@risksmart-app/shared/policy/fileVersionUtils';
import { VersionStatusEnum } from 'generated/graphql';
import { singleEventBridgeHandler } from 'src/eventBridgeHandler';

import { getLogger } from '../../logger';
import { CUSTOMER_SUPPORT_ROLE, SYSTEM_USER } from '../../repositories/types';
import { DocumentVersionService } from '../../services/document-version/document-version.service';
import { getOrgFeatures } from '../../services/orgUtilities';
import type { RisksmartDetailType } from '../notifications/eventBridgeUtils';
import type { PolicyDocumentVersionReviewDueEventDetail } from '../notifications/policyDocumentVersionReviewDuePoller';

const logger = getLogger();

export const handler = singleEventBridgeHandler<
  RisksmartDetailType.PolicyDocumentVersionReviewDue,
  PolicyDocumentVersionReviewDueEventDetail,
  void
>(async (e) => {
  logger.appendKeys({
    orgKey: e.detail.data.OrgKey,
    tenant: e.detail.meta.tenant,
  });
  const featureFlags = await getOrgFeatures({
    orgKey: e.detail.data.OrgKey,
    tenant: e.detail.meta.tenant,
  });

  if (!featureFlags.includes('policy_auto_draft')) {
    logger.info(
      `policy_auto_draft feature not enabled for ${e.detail.data.OrgKey}`
    );

    return;
  }

  const service = DocumentVersionService({
    tenant: e.detail.meta.tenant,
    orgKey: e.detail.data.OrgKey,
    userId: SYSTEM_USER,
    userRole: CUSTOMER_SUPPORT_ROLE,
  });

  const documentFile = await service.findById(e.detail.data.Id);
  if (documentFile.parent?.documentFiles?.[0]?.Id !== documentFile.Id) {
    logger.info('Not the most recent version');

    return;
  }

  await service.create({
    Type: documentFile.Type,
    Summary: documentFile.Summary,
    ParentDocumentId: documentFile.ParentDocumentId,
    Content: documentFile.Content,
    Status: VersionStatusEnum.Draft,
    Version: nextFileVersion(documentFile.Version),
  });
});
