import { gql } from '@apollo/client';
import type { EnterpriseRisk } from 'generated/graphql';
import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import type { RiskInsertInput } from 'generated/graphql2';
import { Forbidden } from 'http-errors';
import _ from 'lodash';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { getLogger } from 'src/logger';
import { getBackendRestApiClient } from 'src/repositories/getBackendRestApiClient';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import {
  filterOutDuplicateRisks,
  mergeListOfHierarchies,
  reverse,
} from './hierarchy';
import { InstantiateSchema } from './schema';

const logger = getLogger();

export const handler = backendRouteHandler(
  InstantiateSchema,
  async (request) => {
    const hasuraClient = getHasuraBackendClientForAction(request);
    const sessionData = getSessionData(request.session_variables);
    const apiClient = getBackendRestApiClient(sessionData);

    const permissionGranted = await hasPermission(hasuraClient, {
      userId: sessionData.userId,
      objectType: ParentTypeEnum.Risk,
      accessType: AccessTypeEnum.Insert,
    });

    if (!permissionGranted) {
      throw new Forbidden('Access denied');
    }

    const { data: enterpriseRisks } = await hasuraClient.query({
      query: gql`
        query getEnterpriseRiskById($Ids: [uuid!]!) {
          enterprise_risk(where: { Id: { _in: $Ids } }) {
            Id
            Title
            Description
            Treatment
            Tier

            instances {
              EntityId
              RiskId
            }

            parent {
              Id
              Title
              Description
              Treatment
              Tier

              instances {
                EntityId
                RiskId
              }

              parent {
                Id
                Title
                Description
                Treatment
                Tier

                instances {
                  EntityId
                  RiskId
                }
              }
            }
          }
        }
      `,
      variables: {
        Ids: request.input.object.EnterpriseRiskIds,
      },
    });

    // Reverse the hierarchy so that the parent is the root node
    const reversedEnterpriseRisks =
      enterpriseRisks.enterprise_risk.map(reverse);

    // Try to merge the hierarchies into a single hierarchy if possible.
    // We need to do this to prevent duplicate enterprise risks in higher tiers.
    const merged = mergeListOfHierarchies(reversedEnterpriseRisks);

    const { entity: entities } = await apiClient.getEntities({
      where: { Id: { _in: request.input.object.Entities } },
    });

    // Concatenate the owners of the entity and its descendants, then filter out duplicates
    const ownerIds = entities.map((entity) => {
      // Handle the case where the selected entity is already a "leaf"
      if (entity.descendants?.length === 0) {
        return entity.owners.map((owner) => owner.user?.Id);
      }

      return _.uniq(
        entity.descendants?.reduce(
          (acc, descendant) => {
            if (descendant.descendants?.length === 0) {
              return acc;
            }

            return [
              ...acc,
              ...descendant.owners.map((owner) => owner.user?.Id),
            ];
          },
          entity.owners.map((owner) => owner.user?.Id)
        )
      );
    });

    // The descendant field returns a flattened array of all descendants of an entity.
    // To find the "leaf nodes" of the hierarchy we can filter the entities that have no descendants.
    // We only want to instantiate enterprise risks for the leaf nodes.
    const entitiesWithNoDescendants = entities.flatMap((entity, idx) => {
      // Handle the case where the selected entity is already a "leaf".
      if (entity.descendants?.length === 0) {
        return { Id: entity.Id, owners: ownerIds[idx] as string[] };
      }

      return entity.descendants
        ?.filter((d) => d.descendants?.length === 0)
        .flatMap((d) => ({
          Id: d.Id,
          owners: _.uniq([
            ...d.owners.map((owner) => owner.user?.Id),
            ...(ownerIds[idx] as string[]),
          ]),
        }));
    });

    // For each "leaf" entity, build a risk hiearchy from the selected enterprise risks
    const risks = entitiesWithNoDescendants.flatMap((entity) => {
      if (!entity) {
        logger.warn(`Entity not found`, { request: request.input.object });

        return {};
      }

      return merged.flatMap((enterpriseRisk) => {
        const risks: RiskInsertInput[] = [
          {
            Title: (enterpriseRisk as EnterpriseRisk).Title,
            Description: (enterpriseRisk as EnterpriseRisk).Description,
            Tier: (enterpriseRisk as EnterpriseRisk).Tier,
            Treatment: (enterpriseRisk as EnterpriseRisk).Treatment,

            enterpriseRiskInstance: {
              data: {
                EnterpriseRiskId: enterpriseRisk.Id,
                EntityId: entity?.Id,
              },
            },
            childRisks: {
              data: enterpriseRisk.children.map((child) => {
                return {
                  Title: (child as EnterpriseRisk).Title,
                  Description: (child as EnterpriseRisk).Description,
                  Tier: (child as EnterpriseRisk).Tier,
                  Treatment: (child as EnterpriseRisk).Treatment,

                  enterpriseRiskInstance: {
                    data: {
                      EnterpriseRiskId: child.Id,
                      EntityId: entity?.Id,
                    },
                  },

                  childRisks: {
                    data: child.children.map((grandChild) => {
                      return {
                        Title: (grandChild as EnterpriseRisk).Title,
                        Description: (grandChild as EnterpriseRisk).Description,
                        Tier: (grandChild as EnterpriseRisk).Tier,
                        Treatment: (grandChild as EnterpriseRisk).Treatment,

                        enterpriseRiskInstance: {
                          data: {
                            EnterpriseRiskId: grandChild.Id,
                            EntityId: entity?.Id,
                          },
                        },
                      };
                    }),
                  },
                };
              }),
            },
            owners: {
              data: entity?.owners?.map((owner) => ({
                UserId: owner,
              })),
            },
          } as RiskInsertInput,
        ];

        return filterOutDuplicateRisks(risks, enterpriseRisk, entity);
      });
    });

    const result = await apiClient.insertRisk({
      objects: risks as RiskInsertInput[],
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        affected_rows: result.insert_risk?.returning.length,
      }),
    };
  }
);
