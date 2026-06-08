import { useFileUpdate } from '@risksmart-app/components/src/file/useFileUpdate';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';
import type { UserOrGroup } from 'src/schemas/global';

import { useInsertAcceptance, useUpdateAcceptance } from '@/hooks/mutations';
import { useGetAcceptanceById } from '@/hooks/queries';

import AcceptanceForm from '../forms/AcceptanceForm';
import type { AcceptanceFormDataFields } from '../forms/acceptanceSchema';
import { defaultValues } from '../forms/acceptanceSchema';

type Props = {
  Id?: string;
  ParentId?: string;
};

const getUserAndGroup = (field: null | undefined | UserOrGroup) => {
  let user: null | string = null;
  let userGroup: null | string = null;
  if (field) {
    switch (field.type) {
      case 'user':
        user = field.value;
        break;
      case 'userGroup':
        userGroup = field.value;
        break;
      default:
        console.error(`Unsupported type ${field.type}`);
    }
  }

  return { user, userGroup };
};

const getUserOrGroup = (
  user?: null | string,
  userGroup?: null | string
): null | UserOrGroup => {
  if (user) {
    return {
      type: 'user',
      value: user,
    };
  }
  if (userGroup) {
    return {
      type: 'userGroup',
      value: userGroup,
    };
  }

  return null;
};

const Tab: FC<Props> = ({ Id, ParentId }) => {
  const { updateFiles } = useFileUpdate();
  const navigate = useNavigate();

  const onDismiss = () => {
    navigate(-1);
  };

  const { data, loading, error } = useGetAcceptanceById({
    queryArgs: { acceptanceId: Id ?? '' },
    shouldSkip: !Id,
  });
  if (error) {
    throw error;
  }

  const acceptance = data?.acceptance[0];

  const {
    hasPermission: canUpdatedAcceptance,
    loading: isLoadingUpdatedAcceptance,
  } = useHasPermissionQuery('update:acceptance', acceptance);

  const canModify = canUpdatedAcceptance || !acceptance;

  const values = {
    ...defaultValues,
    ...acceptance,
    files: acceptance?.files.map((rf) => rf.file),
  };

  const acceptanceFormFields: AcceptanceFormDataFields | undefined = useMemo<
    AcceptanceFormDataFields | undefined
  >(() => {
    if (!acceptance) {
      return undefined;
    }
    const approvedBy = getUserOrGroup(
      acceptance.ApprovedByUser,
      acceptance.ApprovedByUserGroup
    );
    const requestedBy = getUserOrGroup(
      acceptance.RequestedByUser,
      acceptance.RequestedByUserGroup
    );

    const fields: AcceptanceFormDataFields = {
      ...acceptance,
      files: acceptance?.files.map((rf) => rf.file),
      approvedBy,
      requestedBy,
    };

    return fields;
  }, [acceptance]);

  const { insertAcceptance } = useInsertAcceptance();
  const { updateAcceptance } = useUpdateAcceptance();

  const onSave = async (data: AcceptanceFormDataFields) => {
    const { files, approvedBy, requestedBy, ...rest } = data;
    const { user: approvedByUser, userGroup: approvedByUserGroup } =
      getUserAndGroup(approvedBy);
    const { user: requestedByUser, userGroup: requestedByUserGroup } =
      getUserAndGroup(requestedBy);
    if (acceptance) {
      const result = await updateAcceptance({
        ...rest,
        OriginalTimestamp: acceptance.ModifiedAtTimestamp,
        Id: acceptance.Id,
        ApprovedByUser: approvedByUser,
        ApprovedByUserGroup: approvedByUserGroup,
        RequestedByUser: requestedByUser,
        RequestedByUserGroup: requestedByUserGroup,
        CustomAttributeData: rest.CustomAttributeData || undefined,
      });
      if (result.updateChildAcceptance?.affected_rows !== 1) {
        throw new Error(
          'Records not updated. Record may have been updated by another user'
        );
      }
    } else {
      if (!ParentId) {
        throw new Error('Cannot insert acceptance without a parent');
      }
      const result = await insertAcceptance({
        ...rest,
        ParentId,
        ApprovedByUser: approvedByUser,
        ApprovedByUserGroup: approvedByUserGroup,
        RequestedByUser: requestedByUser,
        RequestedByUserGroup: requestedByUserGroup,
        CustomAttributeData: rest.CustomAttributeData || undefined,
      });
      Id = result.insertChildAcceptance?.Id;
    }
    if (!Id) {
      throw new Error('Id must be set');
    }
    await updateFiles({
      parentType: Parent_Type_Enum.Acceptance,
      parentId: Id,
      originalFiles: values?.files,
      selectedFiles: files,
    });
  };

  if (loading || isLoadingUpdatedAcceptance) {
    return null;
  }

  return (
    <AcceptanceForm
      onSave={onSave}
      readOnly={!canModify}
      values={acceptanceFormFields}
      onDismiss={onDismiss}
      approvalConfig={{ object: acceptance }}
    />
  );
};

export default Tab;
