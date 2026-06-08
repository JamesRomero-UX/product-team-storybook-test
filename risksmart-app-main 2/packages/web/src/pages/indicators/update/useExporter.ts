import { useLazyQuery } from '@apollo/client';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import i18n from '@risksmart-app/i18n/src/i18n';
import {
  GetIndicatorByIdDocument,
  GetIndicatorResultsByIndicatorIdDocument,
  Indicator_Type_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useTranslation } from 'react-i18next';
import { useFormCustomisation } from 'src/hooks/forms/useFormCustomisation';

import { toLocalDate } from '@/utils/dateUtils';
import { getFriendlyId } from '@/utils/friendlyId';
import { getContributorValue } from '@/utils/pdf/contributorValue';
import { getDepartmentsValue } from '@/utils/pdf/departmentValue';
import { createDocument } from '@/utils/pdf/document';
import { download } from '@/utils/pdf/downloader';
import { createField } from '@/utils/pdf/field';
import { createHeading, createSubHeading } from '@/utils/pdf/headings';
import { getOwnerValue } from '@/utils/pdf/ownerValue';
import { createTable, tableHeaders } from '@/utils/pdf/table';
import { optionalTableSection } from '@/utils/pdf/tableSection';
import { getTagsValue } from '@/utils/pdf/tagsValue';
import { twoColumns } from '@/utils/pdf/twoColumns';
import useCustomAttributeDataForExport from '@/utils/pdf/useCustomAttributeDataForExport';

import {
  conformanceIndicatorRating,
  getConformanceTrendRating,
} from '../calculateConformanceRating';

const useExporter = (
  indicatorId: string
): [() => void, { loading: boolean }] => {
  const { getStandardFieldLabel } = useFormCustomisation([
    'indicator',
    'indicator_result',
  ]);
  const [getCustomAttribute, customAttributesLoading] =
    useCustomAttributeDataForExport(Parent_Type_Enum.Indicator);
  const { getLabel: trendGetByValue } = useRating(
    'indicator_conformance_trend'
  );
  const { getLabel: statusGetByValue } = useRating(
    'indicator_conformance_status'
  );
  const { getLabel: getIndicatorTypeLabel } = useRating('indicator_type');
  const { getLabel: getTestFreqLabel } = useRating('frequency');
  const { t: indicatorFields } = useTranslation(['common'], {
    keyPrefix: 'indicators.fields',
  });

  const { t } = useTranslation(['common']);
  const { t: indicatorResultsColumns } = useTranslation(['common'], {
    keyPrefix: 'indicator_results.columns',
  });

  const [getIndicator, getIndicatorResult] = useLazyQuery(
    GetIndicatorByIdDocument,
    {
      variables: {
        id: indicatorId,
      },
      fetchPolicy: 'no-cache',
    }
  );
  const [getIndicatorResults, getIndicatorResultsResult] = useLazyQuery(
    GetIndicatorResultsByIndicatorIdDocument,
    {
      variables: {
        indicatorId,
      },
      fetchPolicy: 'no-cache',
    }
  );

  const loading =
    getIndicatorResult.loading ||
    getIndicatorResultsResult.loading ||
    customAttributesLoading;

  const exportFunc = async () => {
    const indicatorPromise = getIndicator();
    const indicatorResultsPromise = getIndicatorResults();

    const { data: indicatorData } = await indicatorPromise;
    const { data: indicatorResultsData } = await indicatorResultsPromise;

    const indicator = indicatorData?.indicator?.[0];
    const indicatorResults = indicatorResultsData?.indicator_result;

    if (!indicator || !indicatorResults) {
      return;
    }
    const indicatorResultsWithPrevious = indicatorResults.map((result, i) => ({
      ...result,
      previous: indicatorResults[i - 1],
    }));
    const indicatorResultsTableData = indicatorResultsWithPrevious.map((au) => [
      toLocalDate(au.ResultDate),
      au.Description ?? '',
      au.modifiedBy?.FriendlyName ?? '',
      au.TargetValueNum ?? au.TargetValueTxt ?? '',

      statusGetByValue(conformanceIndicatorRating(indicator, au)),

      trendGetByValue(
        getConformanceTrendRating(
          indicator,
          au.previous ? [au, au.previous] : [au]
        )
      ),
    ]);

    const detailsTextFields =
      indicator.Type === Indicator_Type_Enum.Text
        ? [
            createField(
              getStandardFieldLabel('indicator', 'TargetValueTxt'),
              indicator.TargetValueTxt
            ),
          ]
        : [];
    const detailsNumberFields =
      indicator.Type === Indicator_Type_Enum.Number
        ? [
            createField(
              getStandardFieldLabel('indicator', 'Unit'),
              indicator.Unit
            ),
            createField(
              getStandardFieldLabel('indicator', 'LowerToleranceNum'),
              indicator.LowerToleranceNum
            ),
            createField(
              getStandardFieldLabel('indicator', 'UpperToleranceNum'),
              indicator.UpperToleranceNum
            ),
          ]
        : [];
    const detailFields = [
      createField(getStandardFieldLabel('indicator', 'Title'), indicator.Title),
      createField(
        indicatorFields('test_frequency'),
        getTestFreqLabel(indicator.schedule?.Frequency)
      ),
      createField(
        getStandardFieldLabel('indicator', 'Type'),
        getIndicatorTypeLabel(indicator.Type)
      ),
      ...detailsNumberFields,
      ...detailsTextFields,
      createField(
        getStandardFieldLabel('indicator', 'Description'),
        indicator.Description ?? ''
      ),
      createField(
        getStandardFieldLabel('indicator', 'Owners'),
        getOwnerValue(indicator)
      ),
      createField(
        getStandardFieldLabel('indicator', 'Contributors'),
        getContributorValue(indicator)
      ),
      createField(
        getStandardFieldLabel('indicator', 'tags'),
        getTagsValue(indicator)
      ),
      createField(
        getStandardFieldLabel('indicator', 'departments'),
        getDepartmentsValue(indicator)
      ),
      ...(await getCustomAttribute(indicator)),
    ];
    const title = `${indicator.Title} (${getFriendlyId(
      Parent_Type_Enum.Indicator,
      indicator.SequentialId
    )})`;
    const docDefinition = createDocument(title, [
      createHeading(title),
      createSubHeading(t('details')),
      twoColumns(detailFields),
      optionalTableSection(
        i18n.format(t('indicator_result_other'), 'capitalize'),
        createTable({
          widths: ['*', '*', 70, 50, 70, 70],
          body: [
            tableHeaders([
              getStandardFieldLabel('indicator_result', 'ResultDate'),
              getStandardFieldLabel('indicator_result', 'Description'),
              indicatorResultsColumns('modified_by'),
              indicatorResultsColumns('result'),
              indicatorResultsColumns('conformance'),
              indicatorResultsColumns('conformance_trend'),
            ]),
            ...indicatorResultsTableData,
          ],
        })
      ),
    ]);
    download(docDefinition);
  };

  return [exportFunc, { loading }];
};

export default useExporter;
