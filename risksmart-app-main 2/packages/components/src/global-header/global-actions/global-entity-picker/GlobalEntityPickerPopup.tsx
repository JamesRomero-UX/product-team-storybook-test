import type { FC } from 'react';

import { useEntityFilter } from '../../../contexts/entityFilterContext';
import { PopupContainer } from '../PopupContainer';
import type { EntityNode } from './EntityNode';
import { EntityTreeList } from './EntityTreeList';

// ─── Tree helpers ──────────────────────────────────────────────────────────────

/** Find a node anywhere in the tree. Returns null if not found. */
const findNodeInTree = (
  id: string | undefined,
  nodes: EntityNode[],
): EntityNode | null => {
  if (id === undefined) return null;
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeInTree(id, node.children);
      if (found) return found;
    }
  }
  return null;
};

/**
 * Collect the selected node's ID plus every descendant ID at any depth.
 * Used to build the entityIds array for the filter context so that
 * `useEntityWhereFilter`'s `_in: entityIds` query returns combined data
 * from the selected entity and all entities beneath it.
 */
const collectEntityIds = (node: EntityNode): string[] => {
  const ids: string[] = [node.id];
  if (node.children) {
    for (const child of node.children) {
      ids.push(...collectEntityIds(child));
    }
  }
  return ids;
};

/**
 * Compute ancestor ids on the path root → targetId.
 * Used to auto-expand ancestors of the selected node when the popup opens.
 */
const findAncestorIds = (
  targetId: string,
  nodes: EntityNode[],
  ancestors: string[] = [],
): string[] | null => {
  for (const node of nodes) {
    if (node.id === targetId) return ancestors;
    if (node.children) {
      const found = findAncestorIds(targetId, node.children, [
        ...ancestors,
        node.id,
      ]);
      if (found !== null) return found;
    }
  }
  return null;
};

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void;
  entityNodes?: EntityNode[];
  setSelectedEntityLabel: (value: string | undefined) => void;
}

export const GlobalEntityPickerPopup: FC<Props> = ({
  onClose,
  entityNodes = [],
  setSelectedEntityLabel,
}) => {
  const { entityIds, setEntityIds } = useEntityFilter();

  // The "selected" entity is the first id stored — when a parent is selected
  // the context holds [parentId, child1Id, child2Id, ...], so the trigger
  // label and tree highlight use only the first element.
  const selectedId = entityIds?.[0];

  // Auto-expand ancestors of the currently selected node so it's visible on open
  const initialExpandedIds =
    selectedId !== undefined
      ? (findAncestorIds(selectedId, entityNodes) ?? [])
      : [];

  const handleEntitySelect = (id: string | undefined) => {
    if (id === undefined) {
      // "Global" selected — clear filter
      setEntityIds([]);
      setSelectedEntityLabel(undefined);
    } else {
      const node = findNodeInTree(id, entityNodes);
      if (node) {
        // Store the selected node's ID plus all descendant IDs.
        // useEntityWhereFilter uses `_in: entityIds` so the query returns
        // combined data from every entity in the set.
        setEntityIds(collectEntityIds(node));
      } else {
        setEntityIds([id]);
      }
      setSelectedEntityLabel(node?.name);
    }

    onClose();
  };

  return (
    <PopupContainer>
      <EntityTreeList
        nodes={entityNodes}
        selectedId={selectedId}
        initialExpandedIds={initialExpandedIds}
        onSelect={handleEntitySelect}
      />
    </PopupContainer>
  );
};
