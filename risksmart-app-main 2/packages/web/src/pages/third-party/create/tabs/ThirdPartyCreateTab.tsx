import { useMutation } from '@apollo/client';
import { useMultiParentFileUpdate } from '@risksmart-app/components/src/file/useFileUpdate';
import {
  CreateThirdPartyDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { ownerAndContributorIds } from 'src/components/form';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';

import { evictField } from '@/utils/graphqlUtils';
import { thirdPartyDetailsUrl } from '@/utils/urls';

import { ThirdPartyForm } from '../../forms/ThirdPartyForm';
import type { ThirdPartyFormData } from '../../forms/thirdPartySchema';

const ThirdPartyCreateTab: FC = () => {
  useI18NSummaryHelpContent('third_party.help');
  const navigate = useNavigate();
  const [mutate] = useMutation(CreateThirdPartyDocument, {
    update: (cache) => {
      evictField(cache, 'third_party');
    },
  });
  const { updateFiles } = useMultiParentFileUpdate();

  const onSave = async (data: ThirdPartyFormData) => {
    const { files } = data;
    const { data: result } = await mutate({
      variables: {
        object: {
          Title: data.title,
          Description: data.description,
          CompanyName: data.companyName,
          CompaniesHouseNumber: data.companiesHouseNumber,
          Address: data.address,
          CityTown: data.cityTown,
          Postcode: data.postcode,
          Country: data.country,
          PrimaryContactName: data.primaryContactName,
          ContactName: data.contactName,
          ContactEmail: data.contactEmail,
          CompanyDomain: data.companyDomain,
          Type: data.type,
          Status: data.status,
          Criticality: data.criticality,
          CustomAttributeData: data.CustomAttributeData,
          TagTypeIds: data.tags?.map((t) => t.TagTypeId) || [],
          DepartmentTypeIds:
            data.departments?.map((d) => d.DepartmentTypeId) || [],
          ...ownerAndContributorIds(data),
        },
      },
    });
    const thirdPartyId = result?.insertThirdPartyApi?.Id;
    if (thirdPartyId) {
      await updateFiles({
        parentType: Parent_Type_Enum.ThirdParty,
        parentIds: [thirdPartyId],
        originalFiles: [],
        selectedFiles: files,
      });
      navigate(thirdPartyDetailsUrl(thirdPartyId), {
        replace: true,
      });
    }
  };

  const onDismiss = (saved?: boolean) => {
    if (!saved) {
      navigate(-1);
    }
  };

  return <ThirdPartyForm onSave={onSave} onDismiss={onDismiss} />;
};

export default ThirdPartyCreateTab;
