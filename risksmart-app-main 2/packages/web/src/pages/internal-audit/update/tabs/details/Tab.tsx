import { useMutation } from '@apollo/client';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import { UpdateInternalAuditDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { ownerAndContributorIds } from 'src/components/form';
import {
  useGetBusinessAreas,
  useGetInternalAuditById,
  useGetInternalAuditEntitiesRegister,
} from 'src/hooks/queries';
import { getContributors, getOwners } from 'src/rbac/contributorHelper';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';
import { useGetDetailParentPath } from 'src/routes/useGetDetailParentPath';

import { evictField } from '@/utils/graphqlUtils';

import InternalAuditForm from '../../../forms/InternalAuditForm';
import type { InternalAuditFormDataFields } from '../../../forms/internalAuditSchema';
import { defaultValues } from '../../../forms/internalAuditSchema';

const Tab: FC = () => {
  const internalAuditId = useGetGuidParam('internalAuditId');
  const navigate = useNavigate();

  const {
    data,
    error,
    loading: loadingInternalAudit,
    refetch: refetchInternalAudit,
  } = useGetInternalAuditById({ queryArgs: { internalAuditId } });

  const { refetch: refetchInternalAuditsRegister } =
    useGetInternalAuditEntitiesRegister({ queryArgs: {} });

  if (error) {
    throw error;
  }

  const { data: businessAreasData } = useGetBusinessAreas({ queryArgs: {} });

  const internalAudit = data?.internal_audit_entity[0];
  const { hasPermission: canEdit, loading: canEditLoading } =
    useHasPermissionQuery('update:internal_audit_entity', internalAudit);
  const parentPath = useGetDetailParentPath(internalAuditId);
  const [updateMutation] = useMutation(UpdateInternalAuditDocument, {
    update: (cache) => {
      evictField(cache, 'internal_audit_entity');
      evictField(cache, 'business_area');
    },
  });

  const onSave = async (data: InternalAuditFormDataFields) => {
    if (!internalAudit) {
      throw new Error('Missing internal audit');
    }
    const businessAreaChanged =
      internalAudit.businessArea?.Title !== data.BusinessArea;

    let businessAreaId = internalAudit.businessArea!.Id;
    if (businessAreaChanged) {
      const existingBusinessAreaId = businessAreasData?.business_area?.find(
        (c) => c.Title === data.BusinessArea
      )?.Id;
      if (existingBusinessAreaId) {
        businessAreaId = existingBusinessAreaId;
      } else {
        businessAreaId = crypto.randomUUID();
      }
    }

    await updateMutation({
      variables: {
        Input: {
          Id: internalAudit.Id,
          BusinessArea: data.BusinessArea,
          DepartmentTypeIds:
            data.departments?.map((d) => d.DepartmentTypeId) || [],
          TagTypeIds: data.tags?.map((t) => t.TagTypeId) || [],
          Title: data.Title,
          Description: data.Description,
          CustomAttributeData: data.CustomAttributeData || undefined,
          OriginalTimestamp:
            internalAudit.ModifiedAtTimestamp ??
            internalAudit.CreatedAtTimestamp!,
          BusinessAreaId: businessAreaId,
          ...ownerAndContributorIds(data),
        },
      },
    });
    refetchInternalAuditsRegister();
    refetchInternalAudit();
  };
  const onDismiss = () => navigate(parentPath);

  return (
    <InternalAuditForm
      readOnly={!canEdit || canEditLoading || loadingInternalAudit}
      values={{
        ...defaultValues,
        ...internalAudit,
        Title: internalAudit?.Title ?? '',
        Description: internalAudit?.Description ?? '',
        BusinessArea: internalAudit?.businessArea?.Title ?? '',
        Owners: getOwners(internalAudit),
        Contributors: getContributors(internalAudit),
      }}
      onSave={onSave}
      onDismiss={onDismiss}
    />
  );
};

export default Tab;
