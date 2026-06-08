import crypto from 'crypto';
import {
  AccessTypeEnum,
  AppetiteTypeEnum,
  ParentTypeEnum,
} from 'generated/graphql';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getBackendRestApiClient } from 'src/repositories/getBackendRestApiClient';
import { checkPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import { PostSchema } from './schema';

export const handler = backendRouteHandler(PostSchema, async (body) => {
  const sessionData = await getSessionData(body.session_variables);
  const riskSmartApiClient = getBackendRestApiClient(sessionData);

  const input = body.input;

  await checkPermission(
    body,
    ParentTypeEnum.Appetite,
    AccessTypeEnum.Insert,
    input.ParentIds
  );

  const Id = crypto.randomUUID();

  const { insert_appetite_one } = await riskSmartApiClient.insertAppetite({
    Id,
    parents: input.ParentIds.map((pId) => ({ Id, ParentId: pId })),
    LowerAppetite:
      input.AppetiteType === AppetiteTypeEnum.Risk ? input.LowerAppetite : null,
    Statement: input.Statement,
    UpperAppetite:
      input.AppetiteType === AppetiteTypeEnum.Risk ? input.UpperAppetite : null,
    EffectiveDate: input.EffectiveDate,
    AppetiteType: input.AppetiteType,
    ImpactAppetite:
      input.AppetiteType === AppetiteTypeEnum.Impact
        ? input.ImpactAppetite
        : null,
    LikelihoodAppetite:
      input.AppetiteType === AppetiteTypeEnum.Likelihood
        ? input.LikelihoodAppetite
        : null,
    CustomAttributeData: input.CustomAttributeData,
    ImpactId:
      input.AppetiteType === AppetiteTypeEnum.Impact ? input.ImpactId : null,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      Id: insert_appetite_one?.Id,
    }),
  };
});
