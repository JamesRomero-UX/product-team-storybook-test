import {
  firstDefined,
  idToResourceReference,
  nodeObjectTypeToResourceType,
  pathResourceReference,
} from '../../utils/transforms';

// Common interface for base entity data from tRPC responses
export interface BaseEntityInput {
  Id: string;
  SequentialId: number | null;
  Title: string;
  Description?: string | null;
  CreatedAtTimestamp: string;
  ModifiedAtTimestamp?: string | null;
  CreatedByUser: string | null;
  ModifiedByUser?: string | null;
  owners: Array<{ UserId: string }>;
  contributors: Array<{ UserId: string }>;
  tags?: Array<{
    type: { Name: string; Description: string | null } | null;
  }> | null;
}

// Common interface for parent references in list responses
export interface ParentInput {
  parent?: {
    Id: string;
    ObjectType: string | null;
  } | null;
}

// Transform user references (createdBy, updatedBy)
export function transformUserReferences(
  data: BaseEntityInput,
  basePath: string
) {
  const createdBy = data.CreatedByUser
    ? idToResourceReference(data.CreatedByUser, 'user', `${basePath}/users`)
    : null;

  const updatedBy = data.ModifiedByUser
    ? idToResourceReference(data.ModifiedByUser, 'user', `${basePath}/users`)
    : createdBy;

  return { createdBy, updatedBy };
}

// Transform owners and contributors arrays
export function transformOwnersAndContributors(
  data: BaseEntityInput,
  basePath: string
) {
  const ownerData = (data.owners || []).map(({ UserId: id }) => ({
    id,
    reference: idToResourceReference(id, 'user', `${basePath}/users`),
  }));

  const contributorData = (data.contributors || []).map(({ UserId: id }) => ({
    id,
    reference: idToResourceReference(id, 'user', `${basePath}/users`),
  }));

  return { ownerData, contributorData };
}

// Transform tags array
export function transformTags(data: BaseEntityInput) {
  return (data.tags ?? [])
    .filter(({ type }) => type !== null)
    .map(({ type }) => ({
      name: type?.Name || '',
      description: type?.Description || '',
    }));
}

// Build base entity fields (common to all resources)
export function buildBaseEntityFields(data: BaseEntityInput) {
  const updatedAt = firstDefined(
    data.ModifiedAtTimestamp,
    data.CreatedAtTimestamp
  );

  return {
    id: data.Id,
    sequentialId: data.SequentialId,
    title: data.Title.trim(),
    description: (data.Description || '').trim() || null,
    createdAt: data.CreatedAtTimestamp,
    updatedAt: updatedAt ?? data.CreatedAtTimestamp,
    createdBy: data.CreatedByUser,
    updatedBy: data.ModifiedByUser || data.CreatedByUser,
  };
}

// Build base links structure (without parents)
export function buildBaseLinks(
  resourcePath: string,
  resourceId: string,
  userRefs: ReturnType<typeof transformUserReferences>,
  ownersAndContributors: ReturnType<typeof transformOwnersAndContributors>
) {
  const { createdBy, updatedBy } = userRefs;
  const { ownerData, contributorData } = ownersAndContributors;

  return {
    self: { href: `${resourcePath}/${resourceId}` },
    createdBy,
    updatedBy,
    owners: ownerData.map(({ reference }) => reference),
    contributors: contributorData.map(({ reference }) => reference),
  };
}

// Transform parents array for list responses
export function transformParents(
  parents: ParentInput[],
  basePath: string
): Array<{ type: string; id: string; href: string } | null> {
  return parents
    .map(({ parent }) => {
      const { type = '', path = '' } =
        nodeObjectTypeToResourceType(parent?.ObjectType || '') || {};
      if (!parent || !type || !path) {
        return null;
      }

      return idToResourceReference(parent.Id, type, `${basePath}/${path}`);
    })
    .filter((item) => item !== null);
}

// Complete base entity transformation combining all common steps
export function transformBaseEntity<T extends BaseEntityInput>(
  data: T,
  basePath: string,
  resourceType: string
) {
  const userRefs = transformUserReferences(data, basePath);
  const ownersAndContributors = transformOwnersAndContributors(data, basePath);
  const tags = transformTags(data);
  const baseFields = buildBaseEntityFields(data);
  const resourcePath = `${basePath}/${resourceType}`;
  const baseData = {
    ...baseFields,
    owners: ownersAndContributors.ownerData.map(({ id }) => id),
    contributors: ownersAndContributors.contributorData.map(({ id }) => id),
    tags,
  };
  const linkedItems = {
    linkedItems: pathResourceReference(
      'linked-items',
      `${resourcePath}/${data.Id}`
    ),
  };

  const links = {
    ...buildBaseLinks(resourcePath, data.Id, userRefs, ownersAndContributors),
    ...linkedItems,
  };

  return {
    baseData,
    links,
    userRefs,
    ownersAndContributors,
  };
}

// Simplified entity input for nested resources (without owners, contributors, tags, sequentialId)
export interface NestedEntityInput {
  Id: string;
  Title: string;
  Description?: string | null;
  CreatedAtTimestamp: string;
  ModifiedAtTimestamp?: string | null;
  CreatedByUser: string | null;
  ModifiedByUser?: string | null;
}

// Configuration for creating nested entity transformers
export interface NestedEntityConfig<
  TInput extends NestedEntityInput,
  TItemOutput,
  TListOutput,
> {
  parentResourceName: string; // e.g., 'issues'
  childResourceName: string; // e.g., 'causes'
  parentIdField: string; // e.g., 'ParentIssueId'
  parentResourceType: string; // e.g., 'issue'
  itemSchema: { parse: (data: unknown) => TItemOutput };
  listSchema: { parse: (data: unknown) => TListOutput };
  extractItemFields?: (data: TInput) => Record<string, unknown>;
  extractListFields?: (data: TInput) => Record<string, unknown>;
}

// Generic nested entity transformation function for similar structured nested entities (causes, updates, etc)
export function transformNestedEntityBase<T extends NestedEntityInput>(
  data: T,
  options: {
    basePath: string;
    linkId: string;
    parentResourceName: string;
    childResourceName: string;
  }
) {
  const { basePath, linkId, parentResourceName, childResourceName } = options;
  const resourcePath = `${basePath}/${parentResourceName}/${linkId}/${childResourceName}`;
  const updatedAt = firstDefined(
    data.ModifiedAtTimestamp,
    data.CreatedAtTimestamp
  );

  const createdBy = data.CreatedByUser
    ? idToResourceReference(data.CreatedByUser, 'user', `${basePath}/users`)
    : null;
  const updatedBy = data.ModifiedByUser
    ? idToResourceReference(data.ModifiedByUser, 'user', `${basePath}/users`)
    : createdBy;

  const baseData = {
    id: data.Id,
    title: data.Title.trim(),
    description: (data.Description || '').trim() || null,
    createdAt: data.CreatedAtTimestamp,
    updatedAt: updatedAt ?? data.CreatedAtTimestamp,
    createdBy: data.CreatedByUser,
    updatedBy: data.ModifiedByUser || data.CreatedByUser,
  };

  const links = {
    self: { href: `${resourcePath}/${data.Id}` },
    createdBy,
    updatedBy,
  };

  return { baseData, links };
}

// Factory to create transformers.
export function createNestedEntityTransformers<
  TInput extends NestedEntityInput & Record<string, unknown>,
  TItemOutput,
  TListOutput,
>(config: NestedEntityConfig<TInput, TItemOutput, TListOutput>) {
  const {
    parentResourceName,
    childResourceName,
    parentIdField,
    parentResourceType,
    itemSchema,
    listSchema,
    extractItemFields,
    extractListFields,
  } = config;

  const transformItem = (
    data: TInput,
    opts: { basePath: string; linkId?: string }
  ): TItemOutput => {
    const { basePath, linkId } = opts;
    if (!linkId) {
      const singularName = childResourceName.endsWith('s')
        ? childResourceName.slice(0, -1)
        : childResourceName;
      throw new Error(`Link ID required for ${singularName} transforms`);
    }

    const { baseData, links } = transformNestedEntityBase(data, {
      basePath,
      linkId,
      parentResourceName,
      childResourceName,
    });

    const entitySpecificFields = extractItemFields?.(data) || {};

    return itemSchema.parse({
      ...baseData,
      ...entitySpecificFields,
      links,
    });
  };

  const transformList = (
    result: { data: TInput[] },
    opts: { basePath: string; linkId?: string }
  ): TListOutput[] => {
    const { basePath, linkId } = opts;
    if (!linkId) {
      const singularName = childResourceName.endsWith('s')
        ? childResourceName.slice(0, -1)
        : childResourceName;
      throw new Error(`Link ID required for ${singularName} transforms`);
    }

    return result.data.map((item) => {
      const { baseData, links } = transformNestedEntityBase(item, {
        basePath,
        linkId,
        parentResourceName,
        childResourceName,
      });

      // Add parent reference
      const parentId = item[parentIdField] as string;
      const parents = [
        idToResourceReference(
          parentId,
          parentResourceType,
          `${basePath}/${parentResourceName}`
        ),
      ];

      const entitySpecificFields = extractListFields?.(item) || {};

      return listSchema.parse({
        ...baseData,
        ...entitySpecificFields,
        links: {
          ...links,
          parents,
        },
      });
    });
  };

  return {
    transformItem,
    transformList,
  };
}
