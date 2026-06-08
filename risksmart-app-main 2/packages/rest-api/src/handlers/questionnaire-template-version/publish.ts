import {
  AccessTypeEnum,
  ParentTypeEnum,
  QuestionnaireTemplateVersionStatusEnum,
} from '../../../generated/graphql';
import { backendRouteHandler } from '../../backendActionApiHandler';
import { CUSTOMER_SUPPORT_ROLE } from '../../repositories/types';
import { QuestionnaireTemplateVersionService } from '../../services/questionnaire-template-version/questionnaire-template-version.service';
import { checkPermission } from '../../services/role-access/roleAccessService';
import { getSessionData } from '../../session';
import { PublishSchema } from './schema';

export const handler = backendRouteHandler(PublishSchema, async (request) => {
  const { tenant, orgKey, userId } = getSessionData(request.session_variables);

  const { QuestionnaireTemplateId, QuestionnaireTemplateVersionId } =
    request.input;

  await checkPermission(
    request,
    ParentTypeEnum.QuestionnaireTemplateVersion,
    AccessTypeEnum.Update,
    QuestionnaireTemplateId
  );

  const service = QuestionnaireTemplateVersionService({
    tenant,
    orgKey,
    userId,
    userRole: CUSTOMER_SUPPORT_ROLE,
  });

  const current = await service.findById(QuestionnaireTemplateVersionId);

  if (current.Status !== QuestionnaireTemplateVersionStatusEnum.Published) {
    await service.archivePublish(QuestionnaireTemplateVersionId, {
      questionnaireTemplateId: QuestionnaireTemplateId,
      questionnaireTemplateVersionId: QuestionnaireTemplateVersionId,
      questionnaireTemplateVersionCreationTimestamp: current.CreatedAtTimestamp,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ affected_rows: 1 }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ affected_rows: 0 }),
  };
});
