import { useLazyQuery } from '@apollo/client';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import {
  GetThirdPartyByIdDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useTranslation } from 'react-i18next';
import { useFormCustomisation } from 'src/hooks/forms/useFormCustomisation';

import { getContributorValue } from '@/utils/pdf/contributorValue';
import { getDepartmentsValue } from '@/utils/pdf/departmentValue';
import { createDocument } from '@/utils/pdf/document';
import { download } from '@/utils/pdf/downloader';
import { createField } from '@/utils/pdf/field';
import { createHeading, createSubHeading } from '@/utils/pdf/headings';
import { getOwnerValue } from '@/utils/pdf/ownerValue';
import { optionalTableSection } from '@/utils/pdf/tableSection';
import { getTagsValue } from '@/utils/pdf/tagsValue';
import { twoColumns } from '@/utils/pdf/twoColumns';
import useCustomAttributeDataForExport from '@/utils/pdf/useCustomAttributeDataForExport';

import useActionExportTable from '../../actions/update/useActionExportTable';
import useControlsExportTable from '../../controls/update/useControlsExportTable';
import useIssuesExportTable from '../../issues/update/useIssuesExportTable';

export const useExporter = (thirdPartyId: string) => {
  const { getStandardFieldLabel } = useFormCustomisation([
    'action',
    'control',
    'issue_assessment',
    'issue',
    'third_party',
  ]);
  const [getThirdParty, getThirdPartyResult] = useLazyQuery(
    GetThirdPartyByIdDocument,
    {
      variables: {
        Id: thirdPartyId,
      },
    }
  );
  const [getCustomAttribute, customAttributesLoading] =
    useCustomAttributeDataForExport(Parent_Type_Enum.ThirdParty);
  const [createControlsTable, controlsLoading] = useControlsExportTable(
    thirdPartyId,
    getStandardFieldLabel
  );
  const [createActionTable, actionsLoading] = useActionExportTable(
    thirdPartyId,
    getStandardFieldLabel
  );
  const [createIssuesTable, issuesLoading] = useIssuesExportTable(
    thirdPartyId,
    Parent_Type_Enum.Issue,
    getStandardFieldLabel
  );

  const { t } = useTranslation(['common']);

  const statusRating = useRating('third_party_status');
  const typeRating = useRating('third_party_type');
  const criticalityRating = useRating('third_party_criticality');

  const loading =
    getThirdPartyResult.loading ||
    customAttributesLoading ||
    controlsLoading ||
    actionsLoading ||
    issuesLoading;

  const exportFunc = async () => {
    const { data } = await getThirdParty();

    const thirdParty = data?.third_party;
    if (!thirdParty) {
      return;
    }

    const controlsTable = await createControlsTable();
    const actionsTable = await createActionTable();
    const issuesTable = await createIssuesTable();

    const title = thirdParty?.Title || '';

    const detailFields = [
      createField(
        getStandardFieldLabel('third_party', 'description'),
        thirdParty.Description || '-'
      ),
      createField(
        getStandardFieldLabel('third_party', 'companyName'),
        thirdParty.CompanyName || '-'
      ),
      createField(
        getStandardFieldLabel('third_party', 'companiesHouseNumber'),
        thirdParty.CompaniesHouseNumber || '-'
      ),
      createField(
        getStandardFieldLabel('third_party', 'address'),
        thirdParty.Address || '-'
      ),
      createField(
        getStandardFieldLabel('third_party', 'cityTown'),
        thirdParty.CityTown || '-'
      ),
      createField(
        getStandardFieldLabel('third_party', 'postcode'),
        thirdParty.Postcode || '-'
      ),
      createField(
        getStandardFieldLabel('third_party', 'country'),
        thirdParty.Country || '-'
      ),
      createField(
        getStandardFieldLabel('third_party', 'primaryContactName'),
        thirdParty.PrimaryContactName || '-'
      ),
      createField(
        getStandardFieldLabel('third_party', 'contactName'),
        thirdParty.ContactName || '-'
      ),
      createField(
        getStandardFieldLabel('third_party', 'contactEmail'),
        thirdParty.ContactEmail || '-'
      ),
      createField(
        getStandardFieldLabel('third_party', 'companyDomain'),
        thirdParty.CompanyDomain || '-'
      ),
      createField(
        getStandardFieldLabel('third_party', 'type'),
        typeRating.getLabel(thirdParty.Type) || '-'
      ),
      createField(
        getStandardFieldLabel('third_party', 'status'),
        statusRating.getLabel(thirdParty.Status) || '-'
      ),
      createField(
        getStandardFieldLabel('third_party', 'criticality'),
        criticalityRating.getLabel(thirdParty.Criticality) || '-'
      ),
      createField(
        getStandardFieldLabel('third_party', 'Owners'),
        getOwnerValue(thirdParty)
      ),
      createField(
        getStandardFieldLabel('third_party', 'Contributors'),
        getContributorValue(thirdParty)
      ),
      createField(
        getStandardFieldLabel('third_party', 'tags'),
        getTagsValue(thirdParty)
      ),
      createField(
        getStandardFieldLabel('third_party', 'departments'),
        getDepartmentsValue(thirdParty)
      ),
      ...(await getCustomAttribute(thirdParty)),
    ];

    const docDefinition = createDocument(title, [
      createHeading(title),
      createSubHeading(t('details')),
      twoColumns(detailFields),
      optionalTableSection(t('controls.tab_title'), controlsTable),
      optionalTableSection(t('issues.tab_title'), issuesTable),
      optionalTableSection(t('actions.tab_title'), actionsTable),
    ]);

    download(docDefinition);
  };

  return [exportFunc, { loading }] as const;
};
