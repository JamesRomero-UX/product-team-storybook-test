import type { GetNodesQuery } from '../../generated/graphql';
import { getNodes } from '../graphqlClient';
import type { NodeLookup } from '../sheets/types';
import { ParentTypePlus } from '../sheets/types';

export const createNodeLookupByOrgKey = async (orgKey: string) => {
  const nodes = await getNodes({
    orgKey,
  });

  return createNodeLookup(nodes.data);
};

export const createNodeLookup = async (data: GetNodesQuery) => {
  const userLookup = data.user.reduce<NodeLookup>((previous, current) => {
    previous[current.Id!] = ParentTypePlus.User;

    return previous;
  }, {});
  const userGroupLookup = data.user_group.reduce<NodeLookup>(
    (previous, current) => {
      previous[current.Id!] = ParentTypePlus.UserGroup;

      return previous;
    },
    {}
  );

  const tagTypeLookup = data.tag_type.reduce<NodeLookup>(
    (previous, current) => {
      previous[current.TagTypeId!] = ParentTypePlus.TagType;

      return previous;
    },
    {}
  );

  const departmentTypeLookup = data.department_type.reduce<NodeLookup>(
    (previous, current) => {
      previous[current.DepartmentTypeId!] = ParentTypePlus.DepartmentType;

      return previous;
    },
    {}
  );

  const nodeLookup = data.node.reduce<NodeLookup>((previous, current) => {
    previous[current.Id] = current.ObjectType;

    return previous;
  }, {});

  return {
    ...nodeLookup,
    ...userLookup,
    ...userGroupLookup,
    ...tagTypeLookup,
    ...departmentTypeLookup,
  };
};
