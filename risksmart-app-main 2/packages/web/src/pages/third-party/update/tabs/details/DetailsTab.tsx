import { useMutation } from '@apollo/client';
import { useMultiParentFileUpdate } from '@risksmart-app/components/src/file/useFileUpdate';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import {
  Parent_Type_Enum,
  UpdateThirdPartyDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { ownerAndContributorIds } from 'src/components/form';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import { useGetThirdPartyById } from 'src/hooks/queries/third-party/useGetThirdPartyById';
import { getContributors, getOwners } from 'src/rbac/contributorHelper';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { evictField } from '@/utils/graphqlUtils';

import { ThirdPartyForm } from '../../../forms/ThirdPartyForm';
import type { ThirdPartyFormData } from '../../../forms/thirdPartySchema';
import { defaultValues } from '../../../forms/thirdPartySchema';

const DetailsTab: FC = () => {
  useI18NSummaryHelpContent('third_party.help');

  const navigate = useNavigate();

  const thirdPartyId = useGetGuidParam('id');
  const { data, loading: loadingThirdParty } = useGetThirdPartyById({
    queryArgs: { thirdPartyId },
  });

  const thirdParty = data?.third_party;

  const { hasPermission: canEdit, loading: canEditLoading } =
    useHasPermissionQuery('update:third_party', thirdParty);

  const [mutate] = useMutation(UpdateThirdPartyDocument, {
    update: (cache) => {
      evictField(cache, 'third_party');
      evictField(cache, 'third_party_by_pk');
    },
  });
  const { updateFiles } = useMultiParentFileUpdate();

  const onSave = async (formData: ThirdPartyFormData) => {
    if (!data?.third_party?.Id) {
      return;
    }
    const { files } = formData;

    await mutate({
      variables: {
        object: {
          Id: data.third_party.Id,
          Title: formData.title,
          Description: formData.description,
          CompanyName: formData.companyName,
          CompaniesHouseNumber: formData.companiesHouseNumber,
          Address: formData.address,
          CityTown: formData.cityTown,
          Postcode: formData.postcode,
          Country: formData.country,
          PrimaryContactName: formData.primaryContactName,
          ContactName: formData.contactName,
          ContactEmail: formData.contactEmail,
          CompanyDomain: formData.companyDomain,
          Type: formData.type,
          Status: formData.status,
          Criticality: formData.criticality,
          CustomAttributeData: formData.CustomAttributeData,
          TagTypeIds: formData.tags?.map((t) => t.TagTypeId) || [],
          DepartmentTypeIds:
            formData.departments?.map((d) => d.DepartmentTypeId) || [],
          ...ownerAndContributorIds(formData),
        },
      },
    });
    await updateFiles({
      parentType: Parent_Type_Enum.ThirdParty,
      parentIds: [data.third_party.Id],
      originalFiles: data?.third_party?.files.map((f) => f.file) ?? [],
      selectedFiles: files,
    });
  };

  const onDismiss = () => {
    navigate(-1);
  };

  if (!thirdParty) {
    return null;
  }

  return (
    <ThirdPartyForm
      readOnly={!canEdit || canEditLoading || loadingThirdParty}
      values={{
        ...defaultValues,
        title: thirdParty.Title,
        description: thirdParty.Description,
        companyName: thirdParty.CompanyName,
        companiesHouseNumber: thirdParty.CompaniesHouseNumber,
        address: thirdParty.Address,
        cityTown: thirdParty.CityTown,
        postcode: thirdParty.Postcode,
        country: thirdParty.Country,
        primaryContactName: thirdParty.PrimaryContactName,
        contactName: thirdParty.ContactName,
        contactEmail: thirdParty.ContactEmail,
        companyDomain: thirdParty.CompanyDomain,
        type: thirdParty.Type,
        status: thirdParty.Status,
        criticality: String(thirdParty.Criticality) as unknown as number,
        Owners: getOwners(thirdParty),
        Contributors: getContributors(thirdParty),
        ancestorContributors: thirdParty.ancestorContributors,
        tags: thirdParty.tags,
        departments: thirdParty.departments,
        CustomAttributeData: thirdParty.CustomAttributeData,
        files: thirdParty.files.map((f) => f.file),
      }}
      onSave={onSave}
      onDismiss={onDismiss}
    />
  );
};

export default DetailsTab;
