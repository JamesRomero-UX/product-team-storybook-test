import { isDescendant } from '@risksmart-app/shared/hierarchy/hierarchy';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import {
  getLinkedItemsBySourceAndTarget,
  insertLinkedItems,
} from 'src/services/linked-item/linkedItemService';
import { getSessionData } from 'src/session';

import type {
  GetLinkedItemsBySourceAndTargetQuery,
  GetNodesQuery,
} from '../../../generated/graphql';
import { getLogger } from '../../logger';
import { NodeService } from '../../services/node/node.service';
import { insertParentChildLink } from './linkInserter';
import type { PostSchemaType } from './schema';
import { PostSchema } from './schema';
const logger = getLogger();

type Node = GetNodesQuery['node'][0];
interface Link {
  SourceNode: Node;
  TargetNode: Node;
  RelationshipType: 'parent_child' | 'sibling';
}

export const handler = backendRouteHandler<PostSchemaType>(
  PostSchema,
  async (body) => {
    const sessionData = getSessionData(body.session_variables);
    const hasuraClient = getHasuraBackendClientForAction(body);
    const { input } = body;

    const nodeService = NodeService({
      tenant: sessionData.tenant,
      orgKey: sessionData.orgKey,
      userId: sessionData.userId,
      userRole: sessionData.userRole,
    });

    const sourceNode = await nodeService.findById(input.Source);
    const targetNodes = await nodeService.findManyByIds(input.Targets);

    if (
      !sourceNode ||
      !targetNodes ||
      targetNodes.length != input.Targets.length
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `either source or targets do not exist`,
        }),
      };
    }

    const existingLinkedItem = await getLinkedItemsBySourceAndTarget(
      hasuraClient,
      { item1: sourceNode.Id, item2: targetNodes.map((c) => c.Id) }
    );

    const linkedNodes = targetNodes.map((c) => processLinkType(sourceNode, c));

    // Process parent child relationships sequentially for now until logic in insertParentChildLink has been
    // refactored to support the creation of multiple links in one transaction. Running this in parallel seems
    // to lead to constraint issues for the node ancestor table
    const parentChildLinks = linkedNodes.filter(
      (c) => c.RelationshipType === 'parent_child'
    );
    if (parentChildLinks.length > 0) {
      for (const parentChildLink of parentChildLinks) {
        if (existingLink(existingLinkedItem, parentChildLink)) {
          logger.info(
            'link already exists, continuing',
            JSON.stringify(parentChildLink)
          );
          continue;
        }
        await insertParentChildLink(
          hasuraClient,
          parentChildLink.SourceNode,
          parentChildLink.TargetNode
        );
      }
    }

    //Process any sibling relationships as one insert
    const siblings = linkedNodes.filter(
      (c) => c.RelationshipType === 'sibling'
    );
    if (siblings.length > 0) {
      await insertLinkedItems(hasuraClient, {
        insertInput: siblings
          .filter((c) => !existingLink(existingLinkedItem, c))
          .map((c) => ({
            Source: c.SourceNode.Id,
            SourceType: c.SourceNode.ObjectType,
            Target: c.TargetNode.Id,
            TargetType: c.TargetNode.ObjectType,
            RelationshipType: c.RelationshipType,
          })),
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        Links: linkedNodes.map((c) => ({
          Source: c.SourceNode.Id,
          Target: c.TargetNode.Id,
          RelationshipType: c.RelationshipType,
        })),
      }),
    };
  }
);

const existingLink = (
  existingLinkedItems:
    | GetLinkedItemsBySourceAndTargetQuery['linked_item']
    | undefined,
  toLink: Link
): boolean => {
  return (
    existingLinkedItems !== undefined &&
    existingLinkedItems.filter(
      (c) =>
        (c.Source === toLink.SourceNode.Id &&
          c.Target === toLink.TargetNode.Id) ||
        (c.Source === toLink.TargetNode.Id && c.Target === toLink.SourceNode.Id)
    ).length > 0
  );
};

const processLinkType = (sourceNode: Node, targetNode: Node): Link => {
  let isParentRelationship = false;
  let isReversed = false;

  isParentRelationship = isDescendant(
    sourceNode.ObjectType,
    targetNode.ObjectType
  );

  // We need to check the hierarchy both ways, e.g. a control might the source
  // of the link and a risk the target.
  if (!isParentRelationship) {
    isParentRelationship = isDescendant(
      targetNode.ObjectType,
      sourceNode.ObjectType
    );
    isReversed = true;
  }

  // We also check whether the source and the target are of the same type. If they are
  // it needs to be a sibling relationship as we don't want to handle tiers here.
  if (isParentRelationship && sourceNode.ObjectType !== targetNode.ObjectType) {
    // Swap source and target if necessary i.e. when the parent is the target, not the source.
    return {
      SourceNode: isReversed ? targetNode : sourceNode,
      TargetNode: isReversed ? sourceNode : targetNode,
      RelationshipType: 'parent_child',
    };
  }

  return {
    SourceNode: sourceNode,
    TargetNode: targetNode,
    RelationshipType: 'sibling',
  };
};
