import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import {
  deleteLinkedItems,
  getLinkedItems,
} from 'src/services/linked-item/linkedItemService';
import { getNode } from 'src/services/node/nodeService';

import { deleteParentChildLink } from './linkInserter';
import type { UnlinkPostSchemaType } from './schema';
import { UnlinkPostSchema } from './schema';

export const handler = backendRouteHandler<UnlinkPostSchemaType>(
  UnlinkPostSchema,
  async (body) => {
    const hasuraClient = getHasuraBackendClientForAction(body);
    const { input } = body;

    const linkedItems = await getLinkedItems(hasuraClient, { Ids: input.Ids });

    const siblings =
      linkedItems
        ?.filter((li) => li.RelationshipType === 'sibling')
        .map((li) => li.Id) ?? [];
    const parentChildLinks =
      linkedItems?.filter(
        (li) =>
          li.RelationshipType === 'parent_child' ||
          li.RelationshipType === 'child_parent'
      ) ?? [];

    const enrichedParentChildLinks = await Promise.all(
      parentChildLinks.map(async (li) => {
        const isChildParent = li.RelationshipType === 'child_parent';

        return {
          parent: await getNode(
            hasuraClient,
            isChildParent ? li.Target : li.Source
          ),
          child: await getNode(
            hasuraClient,
            isChildParent ? li.Source : li.Target
          ),
        };
      })
    );

    try {
      await Promise.all(
        enrichedParentChildLinks.map(async (li) => {
          if (!li.parent || !li.child) {
            throw new Error(
              `parent (${li.parent}) or child (${li.child}) is undefined`
            );
          }

          await deleteParentChildLink(hasuraClient, li.parent, li.child);
        })
      );
    } catch (e) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: (e as Error).message,
        }),
      };
    }

    await deleteLinkedItems(hasuraClient, { Ids: siblings });

    return {
      statusCode: 200,
      body: JSON.stringify(input),
    };
  }
);
