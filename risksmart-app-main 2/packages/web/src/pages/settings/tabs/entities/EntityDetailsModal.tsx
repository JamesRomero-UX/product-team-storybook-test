import { useMutation } from '@apollo/client';
import {
  InsertEntityDocument,
  UpdateEntityDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { type FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalForm } from 'src/components/form/form/ModalForm';
import { useGetEntities } from 'src/hooks/queries/entity/useGetEntities';
import { useGetEntityById } from 'src/hooks/queries/entity/useGetEntityById';
import { getOwners } from 'src/rbac/contributorHelper';
import { UserOrGroupsSchema } from 'src/schemas/global';
import { z } from 'zod';

import { evictField } from '@/utils/graphqlUtils';

import EntityFormFields from './EntityFormFields';

interface Props {
  Id?: string;
  isVisible: boolean;
  onDismiss: () => void;
}

const schema = z.object({
  Name: z.string(),
  ParentId: z.string().nullish(),
  Description: z.string().nullish(),
  Weight: z.coerce.number().positive().default(1.0),
  Owners: UserOrGroupsSchema.min(1, { message: 'Required' }),
});

type SchemaFields = z.infer<typeof schema>;

const defaultValues = {
  Name: '',
  Description: '',
  ParentId: null,
  Weight: 1.0,
  Owners: [],
};

const EntityDetailsModal: FC<Props> = ({ onDismiss, Id, isVisible }) => {
  const { t } = useTranslation(['common']);

  const { data } = useGetEntityById({
    queryArgs: { id: Id },
    shouldSkip: !Id,
  });
  const {
    data: entitiesData,
    loading: entitiesLoading,
    refetch: entitiesRefetch,
  } = useGetEntities({ queryArgs: {} });

  const parentOptions = useMemo(
    () =>
      entitiesData?.entity
        .filter((entity) => entity.Id !== Id)
        .map((entity) => ({
          value: entity.Id,
          label: entity.Name,
        })),
    [entitiesData, Id]
  );

  const [insert] = useMutation(InsertEntityDocument, {
    update: (cache) => {
      evictField(cache, 'entity');
      evictField(cache, 'entity_by_pk');
    },
  });
  const [update] = useMutation(UpdateEntityDocument, {
    update: (cache) => {
      evictField(cache, 'entity');
      evictField(cache, 'entity_by_pk');
    },
  });

  const onSave = async (data: SchemaFields) => {
    if (Id) {
      await update({
        variables: {
          Id,
          ...data,
          owners: data.Owners.filter((c) => c.type === 'user').map(
            (c) => c.value
          ),
          ownerGroups: data.Owners.filter((c) => c.type === 'userGroup').map(
            (c) => c.value
          ),
        },
      });
    } else {
      await insert({
        variables: {
          ...data,
          owners: data.Owners.filter((c) => c.type === 'user').map(
            (c) => c.value
          ),
          ownerGroups: data.Owners.filter((c) => c.type === 'userGroup').map(
            (c) => c.value
          ),
        },
      });
    }
    await entitiesRefetch();
    onDismiss();
  };

  if (entitiesLoading) {
    return <div>{'Loading...'}</div>;
  }

  return (
    <ModalForm<SchemaFields>
      onDismiss={onDismiss}
      visible={isVisible}
      defaultValues={defaultValues}
      values={
        data?.entity_by_pk
          ? {
              ...data.entity_by_pk,
              Owners: getOwners(data.entity_by_pk),
            }
          : defaultValues
      }
      formId={'entityDetailsForm'}
      schema={schema}
      onSave={onSave}
      i18n={t('entity')}
    >
      <EntityFormFields entities={parentOptions} />
    </ModalForm>
  );
};

export default EntityDetailsModal;
