import { useMutation, useQuery } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import {
  GetDepartmentTypeByIdDocument,
  GetDepartmentTypeGroupsDocument,
  InsertDepartmentTypeGroupByNameDocument,
  InsertDepartmentTypeWithGroupNameDocument,
  InsertDepartmentTypeWithOptionalGroupIdDocument,
  UpdateDepartmentTypeDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalForm } from 'src/components/form/form/ModalForm';

import DepartmentTypeForm from './forms/DepartmentTypeForm';
import type { DepartmentTypeFormFields } from './forms/departmentTypeSchema';
import {
  defaultValues,
  useDepartmentTypeSchema,
} from './forms/departmentTypeSchema';

type Props = {
  onDismiss: (saved: boolean) => void;
  id?: string;
};

const DepartmentTypeModal: FC<Props> = ({ onDismiss, id }) => {
  const { addNotification } = useNotifications();
  const DepartmentTypeSchema = useDepartmentTypeSchema(id);
  const { t } = useTranslation();
  const [insert] = useMutation(InsertDepartmentTypeWithGroupNameDocument);
  const [insertWithoutGroup] = useMutation(
    InsertDepartmentTypeWithOptionalGroupIdDocument
  );
  const [update] = useMutation(UpdateDepartmentTypeDocument);
  const [insertDepartmentTypeGroup] = useMutation(
    InsertDepartmentTypeGroupByNameDocument
  );

  const { data: departmentTypeResponse, loading: loadingDepartmentType } =
    useQuery(GetDepartmentTypeByIdDocument, {
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
    });

  const {
    data: departmentTypeGroupsResponse,
    loading: loadingGroups,
    refetch,
  } = useQuery(GetDepartmentTypeGroupsDocument, {
    onError: (error) => {
      addNotification({
        type: 'error',
        content: <>{error.message}</>,
      });
    },
  });

  const departmentType = departmentTypeResponse?.department_type[0];
  const departmentTypeValues = departmentTypeResponse?.department_type.map(
    (dt) => ({
      Id: dt.DepartmentTypeId,
      Name: dt.Name ?? undefined,
      Description: dt.Description ?? undefined,
      DepartmentGrpupId: dt.DepartmentTypeGroupId,
      DepartmentGroupName: dt.department_type_group?.Name,
    })
  )[0];

  const departmentGroupOptions =
    departmentTypeGroupsResponse?.department_type_group.map((dtg) => ({
      id: dtg.Id,
      value: dtg.Name,
    })) || [];

  const onSave = async (data: DepartmentTypeFormFields) => {
    if (departmentType) {
      let departmentTypeGroupId: string | undefined;
      if (data.DepartmentGroupName) {
        const existingDepartmentGroup = departmentGroupOptions.find(
          (x) => x.value === data.DepartmentGroupName
        );
        if (!existingDepartmentGroup) {
          const groupInsertResult = await insertDepartmentTypeGroup({
            variables: {
              Name: data.DepartmentGroupName,
            },
          });
          departmentTypeGroupId =
            groupInsertResult.data?.insert_department_type_group_one?.Id;
        } else {
          departmentTypeGroupId = existingDepartmentGroup.id;
        }
      }
      const updateResult = await update({
        variables: {
          OriginalTimestamp: departmentType.ModifiedAtTimestamp,
          DepartmentTypeId: departmentType.DepartmentTypeId,
          Name: data.Name,
          Description: data.Description,
          DepartmentTypeGroupId: departmentTypeGroupId,
        },
      });
      if (updateResult.data?.update_department_type?.affected_rows !== 1) {
        throw new Error(
          'Records not updated. Record may have been updated by another user'
        );
      }
    } else {
      const result = data.DepartmentGroupName
        ? await insert({
            variables: data,
          })
        : await insertWithoutGroup({
            variables: data,
          });
      const departmentTypeId =
        result.data?.insert_department_type_one?.DepartmentTypeId;
      if (!departmentTypeId) {
        throw new Error('Id not found');
      }
    }
    refetch();
  };

  if (loadingDepartmentType || loadingGroups) {
    return null;
  }

  const formId = 'department-type-form';

  return (
    <ModalForm
      values={departmentTypeValues}
      defaultValues={defaultValues}
      schema={DepartmentTypeSchema}
      i18n={t('departments')}
      onSave={onSave}
      onDismiss={onDismiss}
      formId={formId}
      visible={true}
    >
      <DepartmentTypeForm departmentGroupOptions={departmentGroupOptions} />
    </ModalForm>
  );
};

export default DepartmentTypeModal;
