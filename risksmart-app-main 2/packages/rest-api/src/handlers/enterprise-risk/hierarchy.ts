import type { RiskInsertInput } from 'generated/graphql';

export interface TreeNode {
  Id: string;
  children: TreeNode[];
  instances: Array<{ EntityId: string; RiskId: string }>;
}

export interface InverseTreeNode {
  Id: string;
  parent: InverseTreeNode | null;
  instances: Array<{ EntityId: string; RiskId: string }>;
}

const findNode = (root: TreeNode, id: string): TreeNode | null => {
  if (root.Id === id) {
    return root;
  }

  for (const child of root.children) {
    const found = findNode(child, id);
    if (found) {
      return found;
    }
  }

  return null;
};

const merge = (parent: TreeNode, child: TreeNode): TreeNode => {
  const existingNode = findNode(parent, child.Id);

  if (existingNode) {
    const childMap = new Map<string, TreeNode>();

    for (const c of existingNode.children) {
      childMap.set(c.Id, c);
    }
    for (const c of child.children) {
      childMap.set(
        c.Id,
        childMap.has(c.Id) ? merge(childMap.get(c.Id)!, c) : c
      );
    }

    existingNode.children = Array.from(childMap.values());

    return parent;
  }

  parent.children.push(child);

  return parent;
};

// When the customer selects two tier 3 enterprise risks of the same tier 2 enterprise risk to instantiate,
// we only want to a single copy of the tier 1 and tier 2 enterprise risks in the hierarchy.
// This function merges the two enterprise risks into a single hierarchy.
// If they don't share the same parent / hierarchy, it returns null.
export const mergeHierarchies = (
  obj1: TreeNode | null,
  obj2: TreeNode | null
): TreeNode | null => {
  if (!obj1 || !obj2) {
    return null;
  }

  const nodeInObj1 = findNode(obj1, obj2.Id);
  const nodeInObj2 = findNode(obj2, obj1.Id);

  if (nodeInObj1) {
    return merge(obj1, obj2);
  }
  if (nodeInObj2) {
    return merge(obj2, obj1);
  }

  return null; // No common IDs found
};

// Convert a child-parent relationship to parent-child one.
export const reverse = (node: InverseTreeNode): TreeNode | null => {
  const map = new Map<string, TreeNode>();
  let root: TreeNode | null = null;

  // Traverse the tree upwards to find the root
  let current: InverseTreeNode | null = node;
  while (current) {
    map.set(current.Id, { ...current, children: [] });
    root = map.get(current.Id)!;
    current = current.parent;
  }

  // Build the new tree by linking children
  current = node;
  while (current && current.parent) {
    const parentB = map.get(current.parent.Id)!;
    const childB = map.get(current.Id)!;
    parentB.children.push(childB);
    current = current.parent;
  }

  return root;
};

export const mergeListOfHierarchies = (hierarchies: TreeNode[]): TreeNode[] => {
  const mergedHierarchies: TreeNode[] = [];

  for (const hierarchy of hierarchies) {
    let merged = false;

    for (let i = 0; i < mergedHierarchies.length; i++) {
      const result = mergeHierarchies(
        mergedHierarchies[i] as TreeNode,
        hierarchy
      );
      if (result) {
        mergedHierarchies[i] = result;
        merged = true;
        break;
      }
    }

    if (!merged) {
      mergedHierarchies.push(hierarchy);
    }
  }

  return mergedHierarchies;
};

// This function hurt just as much to write as it does for you to read.
// This function takes a enterprise risk hierarchy and checks if the instance of the enterprise risk already exists for the given entity.
// If it does, it removes the risk and unwraps its children and inserts a reference to the parent risk ID. We need to repeat this step "recursively"
// until we reach the leaf nodes of the hierarchy.
export const filterOutDuplicateRisks = (
  risks: RiskInsertInput[],
  hierarchy: TreeNode | undefined,
  entity: { Id: string } | null
) => {
  // Clone input array
  let filtered = [...risks];

  const tier1RiskAlreadyExists = hierarchy?.instances.find(
    (i) => i.EntityId === entity?.Id
  )?.RiskId;

  if (tier1RiskAlreadyExists) {
    filtered = risks[0]?.childRisks?.data || [];

    filtered = filtered
      // If the tier 1 risk already exists, we need to add its ID to its new children
      .map((r) => ({ ...r, ParentRiskId: tier1RiskAlreadyExists }))
      .flatMap((r) => {
        // Sift through all children and to see if they already exist
        const tier2RiskAlreadyExists = hierarchy?.children
          .find(
            (c) =>
              c.Id === r.enterpriseRiskInstance?.data.EnterpriseRiskId &&
              c.instances.find((i) => i.EntityId === entity?.Id)
          )
          ?.instances.find((i) => i.EntityId === entity?.Id)?.RiskId;

        if (tier2RiskAlreadyExists) {
          const grandChildEnterpriseRisks = hierarchy?.children.find(
            (c) => c.Id === r.enterpriseRiskInstance?.data.EnterpriseRiskId
          )?.children;

          return (
            // If the tier 2 risk already exists, we need to add its ID to its new children
            (
              r.childRisks?.data.map((gcr) => ({
                ...gcr,
                ParentRiskId: tier2RiskAlreadyExists,
              })) ?? []
            ).filter((gcr) =>
              grandChildEnterpriseRisks?.find(
                (c) =>
                  c.instances.find((i) => i.EntityId === entity?.Id)?.RiskId ===
                  gcr.enterpriseRiskInstance?.data.RiskId
              )
            )
          );
        }

        return [r];
      });
  }

  return filtered;
};
