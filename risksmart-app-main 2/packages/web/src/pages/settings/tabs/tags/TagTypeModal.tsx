import { useMutation, useQuery } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import {
  GetTagTypeByIdDocument,
  GetTagTypeGroupsDocument,
  InsertTagTypeGroupByNameDocument,
  InsertTagTypeWithGroupNameDocument,
  InsertTagTypeWithOptionalGroupIdDocument,
  UpdateTagTypeDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalForm } from 'src/components/form/form/ModalForm';
import { evictField } from 'src/utils';

import TagTypeForm from './forms/TagTypeForm';
import type { TagTypeFormFields } from './forms/tagTypeSchema';
import { defaultValues, useTagTypeSchema } from './forms/tagTypeSchema';

type Props = {
  onDismiss: (saved: boolean) => void;
  id?: string;
};

const TagTypeModal: FC<Props> = ({ onDismiss, id }) => {
  const { addNotification } = useNotifications();
  const { t } = useTranslation();
  const [insert] = useMutation(InsertTagTypeWithGroupNameDocument, {
    update: (cache) => {
      evictField(cache, 'tag_type');
    },
  });
  const [insertWithoutGroup] = useMutation(
    InsertTagTypeWithOptionalGroupIdDocument,
    {
      update: (cache) => {
        evictField(cache, 'tag_type');
      },
    }
  );
  const [update] = useMutation(UpdateTagTypeDocument);
  const [insertTagTypeGroup] = useMutation(InsertTagTypeGroupByNameDocument);
  const TagTypeSchema = useTagTypeSchema(id);
  const { data: tagTypeResponse, loading: loadingTagType } = useQuery(
    GetTagTypeByIdDocument,
    {
      variables: {
        Id: id,
      },
      skip: !id,
      fetchPolicy: 'no-cache',
      onError: (error) => {
        addNotification({
          type: 'error',
          content: <>{error.message}</>,
        });
      },
    }
  );

  const {
    data: tagTypeGroupsResponse,
    loading: loadingGroups,
    refetch,
  } = useQuery(GetTagTypeGroupsDocument, {
    onError: (error) => {
      addNotification({
        type: 'error',
        content: <>{error.message}</>,
      });
    },
  });

  const tagType = tagTypeResponse?.tag_type[0];
  const tagTypeValues = tagTypeResponse?.tag_type.map((tt) => ({
    Id: tt.TagTypeId,
    Name: tt.Name ?? undefined,
    Description: tt.Description ?? undefined,
    TagGroupId: tt.TagTypeGroupId,
    TagGroupName: tt.tag_type_group?.Name,
  }))[0];

  const tagGroupOptions =
    tagTypeGroupsResponse?.tag_type_group.map((ttg) => ({
      id: ttg.Id,
      value: ttg.Name,
    })) || [];

  const onSave = async (data: TagTypeFormFields) => {
    if (tagType) {
      let tagTypeGroupId: string | undefined;
      if (data.TagGroupName) {
        const existingTagGroup = tagGroupOptions.find(
          (x) => x.value === data.TagGroupName
        );
        if (!existingTagGroup) {
          const groupInsertResult = await insertTagTypeGroup({
            variables: {
              Name: data.TagGroupName,
            },
          });
          tagTypeGroupId =
            groupInsertResult.data?.insert_tag_type_group_one?.Id;
        } else {
          tagTypeGroupId = existingTagGroup.id;
        }
      }
      const updateResult = await update({
        variables: {
          OriginalTimestamp: tagType.ModifiedAtTimestamp,
          TagTypeId: tagType.TagTypeId,
          Name: data.Name,
          Description: data.Description,
          TagTypeGroupId: tagTypeGroupId,
        },
      });
      if (updateResult.data?.update_tag_type?.affected_rows !== 1) {
        throw new Error(
          'Records not updated. Record may have been updated by another user'
        );
      }
    } else {
      const result = data.TagGroupName
        ? await insert({
            variables: data,
          })
        : await insertWithoutGroup({
            variables: data,
          });
      const tagTypeId = result.data?.insert_tag_type_one?.TagTypeId;
      if (!tagTypeId) {
        throw new Error('Id not found');
      }
    }
    refetch();
  };

  if (loadingTagType || loadingGroups) {
    return null;
  }

  const formId = 'tag-type-form';

  return (
    <ModalForm
      i18n={t('tags')}
      values={tagTypeValues}
      defaultValues={defaultValues}
      schema={TagTypeSchema}
      onSave={onSave}
      onDismiss={onDismiss}
      formId={formId}
      visible={true}
    >
      <TagTypeForm tagGroupOptions={tagGroupOptions} />
    </ModalForm>
  );
};

export default TagTypeModal;
