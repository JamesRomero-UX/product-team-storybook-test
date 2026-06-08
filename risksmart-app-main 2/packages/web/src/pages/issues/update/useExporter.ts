import { useLazyQuery } from '@apollo/client';
import type { ParentIssueType } from '@risksmart-app/domain/src/types/consts';
import { GetIssueByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useTranslation } from 'react-i18next';
import { useFormCustomisation } from 'src/hooks/forms/useFormCustomisation';
import useActionExportTable from 'src/pages/actions/update/useActionExportTable';

import { toLocalDate } from '@/utils/dateUtils';
import { getFriendlyId } from '@/utils/friendlyId';
import { IssueTypeMapping } from '@/utils/issueVariantUtils';
import { getContributorValue } from '@/utils/pdf/contributorValue';
import { getDepartmentsValue } from '@/utils/pdf/departmentValue';
import { createDocument } from '@/utils/pdf/document';
import { download } from '@/utils/pdf/downloader';
import { createField, createYesNoField } from '@/utils/pdf/field';
import { createHeading, createSubHeading } from '@/utils/pdf/headings';
import { getOwnerValue } from '@/utils/pdf/ownerValue';
import { optionalTableSection } from '@/utils/pdf/tableSection';
import { getTagsValue } from '@/utils/pdf/tagsValue';
import { twoColumns } from '@/utils/pdf/twoColumns';
import useCustomAttributeDataForExport from '@/utils/pdf/useCustomAttributeDataForExport';

import useCausesExportTable from './useCausesExportTable';
import useConsequenceExportTable from './useConsequenceExportTable';
import useExportAssessmentDetails from './useExportAssessmentDetails';
import useUpdatesExportTable from './useUpdatesExportTable';

const useExporter = (
  issueId: string,
  issueType: ParentIssueType
): [() => void, { loading: boolean }] => {
  const { getStandardFieldLabel } = useFormCustomisation([
    'action',
    'issue',
    'issue_update',
    'cause',
    'consequence',
    'issue_assessment',
  ]);
  const issueTypeMap = IssueTypeMapping[issueType];
  const [getCustomAttribute, customAttributesLoading] =
    useCustomAttributeDataForExport(issueType);
  const [createActionTable, actionsLoading] = useActionExportTable(
    issueId,
    getStandardFieldLabel
  );
  const [createUpdatesTable, updatesLoading] = useUpdatesExportTable(
    issueId,
    getStandardFieldLabel
  );
  const [createCausesTable, causesLoading] = useCausesExportTable(
    issueId,
    getStandardFieldLabel
  );
  const [createConsequenceTable, consequenceLoading] =
    useConsequenceExportTable(issueId, getStandardFieldLabel);
  const [createAssessmentDetails, assessmentDetailsLoading] =
    useExportAssessmentDetails(issueId, issueType, getStandardFieldLabel);

  const { t } = useTranslation(['common']);
  const { t: st } = useTranslation(['common'], {
    keyPrefix: issueTypeMap.taxonomy,
  });

  const [geIssue, getIssueResult] = useLazyQuery(GetIssueByIdDocument, {
    variables: {
      _eq: issueId,
    },
  });

  const loading =
    getIssueResult.loading ||
    actionsLoading ||
    customAttributesLoading ||
    updatesLoading ||
    causesLoading ||
    consequenceLoading ||
    assessmentDetailsLoading;
  const exportFunc = async () => {
    const getIssuePromise = geIssue();

    const { data: issueData } = await getIssuePromise;
    const createActionTablePromise = await createActionTable();
    const createUpdatesTablePromise = await createUpdatesTable();
    const createCausesTablePromise = await createCausesTable();
    const createConsequenceTablePromise = await createConsequenceTable();
    const createAssessmentDetailsPromise = await createAssessmentDetails();
    const issue = issueData?.issue?.[0];

    const actionTable = await createActionTablePromise;
    const updatesTable = await createUpdatesTablePromise;
    const causesTable = await createCausesTablePromise;
    const consequenceTable = await createConsequenceTablePromise;
    const assessmentDetails = await createAssessmentDetailsPromise;

    if (!issue) {
      return;
    }

    const title = `${issue.Title} (${getFriendlyId(
      issue.Type,
      issue.SequentialId
    )})`;

    const detailFields = [
      createField(getStandardFieldLabel('issue', 'Title'), issue.Title),
      createField(getStandardFieldLabel('issue', 'Details'), issue.Details),
      createYesNoField(
        getStandardFieldLabel('issue', 'ImpactsCustomer'),
        issue.ImpactsCustomer
      ),
      createField(
        getStandardFieldLabel('issue', 'IsExternalIssue'),
        issue.IsExternalIssue ? st('external') : st('internal')
      ),
      createField(
        getStandardFieldLabel('issue', 'DateOccurred'),
        toLocalDate(issue.DateOccurred)
      ),
      createField(
        getStandardFieldLabel('issue', 'DateIdentified'),
        toLocalDate(issue.DateIdentified)
      ),
      createField(
        getStandardFieldLabel('issue', 'Owners'),
        getOwnerValue(issue)
      ),
      createField(
        getStandardFieldLabel('issue', 'Contributors'),
        getContributorValue(issue)
      ),
      createField(getStandardFieldLabel('issue', 'tags'), getTagsValue(issue)),
      createField(
        getStandardFieldLabel('issue', 'departments'),
        getDepartmentsValue(issue)
      ),
      ...(await getCustomAttribute(issue)),
    ];

    const docDefinition = createDocument(title, [
      createHeading(title),
      createSubHeading(t('details')),
      twoColumns(detailFields),
      optionalTableSection(t('actionUpdates.tab_title'), updatesTable),
      optionalTableSection(t('actions.tab_title'), actionTable),
      optionalTableSection(t('causes.tab_title'), causesTable),
      optionalTableSection(t('consequences.tab_title'), consequenceTable),
      createSubHeading(t(`${issueTypeMap.assessmentTaxonomy}.tab_title`)),
      assessmentDetails,
    ]);

    download(docDefinition);
  };

  return [exportFunc, { loading }];
};

export default useExporter;
