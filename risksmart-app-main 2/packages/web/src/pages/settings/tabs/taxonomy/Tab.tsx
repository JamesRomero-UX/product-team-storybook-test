import { useMutation, useQuery } from '@apollo/client';
import type { SelectProps } from '@risk-smart/themed-cloudscape-components';
import Checkbox from '@risk-smart/themed-cloudscape-components/checkbox';
import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import type { SegmentedControlProps } from '@risk-smart/themed-cloudscape-components/segmented-control';
import SegmentedControl from '@risk-smart/themed-cloudscape-components/segmented-control';
import Select from '@risk-smart/themed-cloudscape-components/select';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Button from '@risksmart-app/components/src/button';
import { downloadBlob } from '@risksmart-app/components/src/file/fileUtils';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import Loading from '@risksmart-app/components/src/loading';
import { handleError } from '@risksmart-app/components/src/utils/errorUtils';
import i18next from '@risksmart-app/i18n/src/i18n';
import Common from '@risksmart-app/i18n/src/locales/default/en/common.json';
import InternalAuditRating from '@risksmart-app/i18n/src/locales/default/en/internal_audit_ratings.json';
import Library from '@risksmart-app/i18n/src/locales/default/en/library.json';
import Rating from '@risksmart-app/i18n/src/locales/default/en/ratings.json';
import Taxonomy from '@risksmart-app/i18n/src/locales/default/en/taxonomy.json';
import {
  DeleteTaxonomyOrgDocument,
  GetTaxonomyAuditDocument,
  InsertTaxonomyDocument,
  UpdateTaxonomyDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import dayjs from 'dayjs';
import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteModal from 'src/components/delete-modal';
import { useI18NSummaryHelpContent } from 'src/components/help-panel/useSummaryHelpContent';
import TabHeader from 'src/components/tab-header';

import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';
import {
  useCreateResultNotification,
  useDeleteResultNotification,
} from '@/hooks/useMutationResultNotification';

import TaxonomyForm from './forms/TaxonomyForm';
import type { TaxonomyDataFields } from './forms/taxonomySchema';

const Tab: FC = () => {
  useI18NSummaryHelpContent('taxonomy.help');
  const { user } = useRisksmartUser();

  const [insertTaxonomy] = useMutation(InsertTaxonomyDocument);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [showDefault, setShowDefault] = useState<boolean>(false);
  const [deleteTaxonomyOrg, deleteResult] = useMutation(
    DeleteTaxonomyOrgDocument
  );
  const [updateTaxonomy] = useMutation(UpdateTaxonomyDocument);
  const [selectedModifiedDate, setSelectedModifiedDate] = useState('');
  const { data, loading, refetch } = useQuery(GetTaxonomyAuditDocument, {
    variables: {
      Locale: i18next.language,
      OrgKey: user!.orgKey,
    },
    fetchPolicy: 'no-cache',
    onCompleted: (data) => {
      setSelectedModifiedDate(data.taxonomy_audit?.[0]?.ModifiedAtTimestamp);
    },

    onError: (error) => {
      console.warn(
        `Error attempting to load translations for ${user?.orgKey} : ${i18next.language}`
      );
      handleError(error);
    },
  });

  const latestTaxonomy = data?.taxonomy_audit?.[0];

  const defaults = {
    Taxonomy,
    Rating,
    Common,
    Library,
    InternalAuditRating,
  };

  const taxonomyFields = useMemo(
    () =>
      data?.taxonomy_audit.find(
        (ta) => ta.ModifiedAtTimestamp === selectedModifiedDate
      ),
    [data?.taxonomy_audit, selectedModifiedDate]
  );

  const taxonomyToDisplay = showDefault ? defaults : taxonomyFields;

  const { t } = useTranslation(['common']);
  const isInternalAuditFeatureEnabled = useIsModuleEnabled(
    'internal_audit_entity'
  );

  const taxonomyTypes: SegmentedControlProps.Option[] = [
    { id: 'Common', text: t('taxonomy.taxonomyTypes.common') },
    { id: 'Rating', text: t('taxonomy.taxonomyTypes.ratings') },
    { id: 'Taxonomy', text: t('taxonomy.taxonomyTypes.taxonomy') },
    { id: 'Library', text: t('taxonomy.taxonomyTypes.library') },
  ];

  if (isInternalAuditFeatureEnabled) {
    taxonomyTypes.push({
      id: 'InternalAuditRating',
      text: t('taxonomy.taxonomyTypes.internalAuditRatings'),
    });
  }

  const [selectedTaxonomy, setSelectedTaxonomy] = useState<string>(
    taxonomyTypes[0].id
  );

  const download = () => {
    const jsonObj =
      taxonomyToDisplay?.[selectedTaxonomy as keyof typeof taxonomyToDisplay];
    const json = JSON.stringify(jsonObj, null, 4);
    const blob = new Blob([json], {
      type: 'application/json',
    });
    downloadBlob(`${selectedTaxonomy}.json`, blob);
  };

  const onInsert = useCreateResultNotification({
    entityName: t('taxonomy.entity_name'),
    asyncAction: async () => {
      await insertTaxonomy();
      const { data: auditData } = await refetch();
      setSelectedModifiedDate(
        auditData?.taxonomy_audit[0].ModifiedAtTimestamp ?? ''
      );

      return true;
    },
  });

  const onDelete = useDeleteResultNotification({
    entityName: t('taxonomy.entity_name'),
    asyncAction: async () => {
      await deleteTaxonomyOrg({
        variables: {
          TaxonomyId: taxonomyFields!.Id,
          OrgKey: user!.orgKey,
        },
      });

      await refetch();
      setIsDeleteModalVisible(false);

      return true;
    },
  });

  const onUpdate = async (data: TaxonomyDataFields) => {
    if (!taxonomyFields) {
      throw new Error('taxonomyFields not defined');
    }
    const result = await updateTaxonomy({
      variables: {
        Library: JSON.parse(data.Library),
        Rating: JSON.parse(data.Rating),
        Common: JSON.parse(data.Common),
        Taxonomy: JSON.parse(data.Taxonomy),
        InternalAuditRating: JSON.parse(data.InternalAuditRating || '{}'),
        Id: taxonomyFields.Id,
        OriginalTimestamp: latestTaxonomy?.ModifiedAtTimestamp,
      },
    });
    if (result.data?.update_taxonomy?.affected_rows !== 1) {
      const { data: auditData } = await refetch();
      setSelectedModifiedDate(
        auditData?.taxonomy_audit[0].ModifiedAtTimestamp ?? ''
      );
      throw new Error(
        'Records not updated. Record may have been updated by another user'
      );
    }
    const { data: auditData } = await refetch();
    setSelectedModifiedDate(
      auditData?.taxonomy_audit[0].ModifiedAtTimestamp ?? ''
    );
  };

  const versions = useMemo(
    () =>
      data?.taxonomy_audit.map((a) => ({
        label:
          a.ModifiedAtTimestamp === data?.taxonomy_audit[0].ModifiedAtTimestamp
            ? 'Latest'
            : dayjs(a.ModifiedAtTimestamp).format('YYYY-MM-DD HH:mm:ss'),
        value: a.ModifiedAtTimestamp,
      })),
    [data?.taxonomy_audit]
  );
  const selectedVersion = useMemo<null | SelectProps.Option>(
    () => versions?.find((v) => v.value === selectedModifiedDate) || null,
    [selectedModifiedDate, versions]
  );

  const selectedLatest =
    selectedModifiedDate === latestTaxonomy?.ModifiedAtTimestamp;

  const numberOfOrgsUsingTaxonomy =
    latestTaxonomy?.organisations_aggregate.aggregate?.count;

  return (
    <>
      <SpaceBetween size={'m'}>
        <TabHeader
          actions={
            <SpaceBetween direction={'horizontal'} size={'xs'}>
              <Button
                disabled={loading || !taxonomyFields || showDefault}
                onClick={() => {
                  setIsDeleteModalVisible(true);
                }}
              >
                {t('delete')}
              </Button>
              <Button
                iconName={'download'}
                disabled={loading || !taxonomyToDisplay}
                onClick={download}
              >
                {t('export.export')}
              </Button>
            </SpaceBetween>
          }
        >
          {t('taxonomy.taxonomyTableTitle')}
        </TabHeader>
      </SpaceBetween>
      {loading ? (
        <Loading testId={'loading-taxonomy'} />
      ) : (
        <>
          {taxonomyFields ? (
            <div>
              <div>
                {t('taxonomy.organisationCountMessage', {
                  count: (numberOfOrgsUsingTaxonomy ?? 1) - 1,
                })}
              </div>
              <div className={'mt-4'}>
                <FormField label={'Show defaults'}>
                  <Checkbox
                    checked={showDefault}
                    onChange={(e) => setShowDefault(e.detail.checked)}
                  />
                </FormField>
              </div>
              {!showDefault && (
                <div className={'mt-4'}>
                  <FormField label={'Version'}>
                    <Select
                      selectedOption={selectedVersion}
                      options={versions}
                      statusType={loading ? 'loading' : undefined}
                      onChange={(e) =>
                        setSelectedModifiedDate(
                          e.detail.selectedOption.value ?? ''
                        )
                      }
                    />
                  </FormField>
                </div>
              )}
              <div className={'my-4'}>
                <SegmentedControl
                  selectedId={selectedTaxonomy}
                  onChange={({ detail }) =>
                    setSelectedTaxonomy(detail.selectedId)
                  }
                  label={'Select taxonomy'}
                  options={taxonomyTypes}
                />
              </div>
              <TaxonomyForm
                i18n={t('taxonomy')}
                // Force rerender of form when date changes
                key={selectedModifiedDate}
                values={{
                  Library: JSON.stringify(taxonomyToDisplay?.Library, null, 4),
                  Rating: JSON.stringify(taxonomyToDisplay?.Rating, null, 4),
                  Common: JSON.stringify(taxonomyToDisplay?.Common, null, 4),
                  Taxonomy: JSON.stringify(
                    taxonomyToDisplay?.Taxonomy,
                    null,
                    4
                  ),
                  InternalAuditRating: JSON.stringify(
                    taxonomyToDisplay &&
                      'InternalAuditRating' in taxonomyToDisplay
                      ? taxonomyToDisplay.InternalAuditRating || {}
                      : {},
                    null,
                    4
                  ),
                }}
                selectedTaxonomy={selectedTaxonomy}
                onSave={onUpdate}
                readOnly={showDefault || !selectedLatest}
              />
            </div>
          ) : (
            <div className={'my-4 text-center'}>
              {t('taxonomy.noTaxonomyFound')}
              <div className={'mt-4'}>
                <Button onClick={onInsert}>{t('taxonomy.add_button')}</Button>
              </div>
            </div>
          )}
        </>
      )}
      <DeleteModal
        loading={deleteResult.loading}
        isVisible={isDeleteModalVisible}
        header={t('delete')}
        onDelete={onDelete}
        onDismiss={() => setIsDeleteModalVisible(false)}
      >
        {t('taxonomy.confirm_delete_message')}
      </DeleteModal>
    </>
  );
};

export default Tab;
