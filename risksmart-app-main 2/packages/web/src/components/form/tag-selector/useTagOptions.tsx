import type { SelectProps } from '@risk-smart/themed-cloudscape-components/select';
import type { GetTagsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';

import { useGetTags } from '@/hooks/queries';
import type { TagType } from '@/types/types';

import type { StatusType } from '../controlled-select/ControlledSelect';
import { sortByLabel } from '../form-utils';

const cleanRawTagTypes = (rawTags?: GetTagsQuery): Array<TagType> => {
  return (rawTags?.tag_type || []).map(
    ({ Name, Description, TagTypeId, tag_type_group }) => ({
      Name: Name,
      Description: Description || '',
      TagTypeId: TagTypeId,
      TagTypeGroupName: tag_type_group?.Name,
    })
  );
};

const tagsToGroupDefinition = (groupedTags: { [key: string]: TagType[] }) =>
  Object.keys(groupedTags)
    .sort()
    .map<SelectProps.OptionGroup>((groupName) => ({
      label: groupName,
      options: groupedTags[groupName]
        .map((tag) => ({
          value: tag.TagTypeId,
          label: tag.Name || '',
          description: tag.Description || '',
        }))
        .sort(sortByLabel),
    }));

export const useTagOptions = () => {
  const { data, loading, error } = useGetTags({ queryArgs: {} });
  const tags = cleanRawTagTypes(data);

  const optionItems = useMemo<
    (SelectProps.Option | SelectProps.OptionGroup)[]
  >(() => {
    const noGroup = 'No group';
    const groupedTags = tags.reduce<{ [key: string]: TagType[] }>(
      (acc, obj) => {
        const groupName = obj.TagTypeGroupName ?? noGroup;
        acc[groupName] = acc[groupName] || [];
        acc[groupName].push(obj);

        return acc;
      },
      {}
    );

    const tagOptions = tagsToGroupDefinition(groupedTags);

    const groupedTagOptions = tagOptions.filter((x) => x.label !== noGroup);
    const ungroupedTagOptions = tagOptions.filter((x) => x.label === noGroup);

    if (groupedTagOptions.length <= 0 && ungroupedTagOptions.length > 0) {
      return ungroupedTagOptions[0].options as SelectProps.Option[];
    }

    return [...groupedTagOptions, ...ungroupedTagOptions];
  }, [tags]);

  let statusType: StatusType | undefined = undefined;
  if (loading) {
    statusType = 'loading';
  } else if (error) {
    statusType = 'error';
  }

  return { tags, optionItems, statusType };
};
