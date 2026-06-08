import i18n from '@risksmart-app/i18n/src/i18n';

import type { FormConfig } from '../types';

export const getThirdPartyFormConfig = () => {
  return {
    title: {
      fieldId: 'title',
      formLabel: i18n.t('third_party.fields.title'),
      columnHeader: i18n.t('third_party.columns.title'),
      allowAsConditionSource: true,
    },
    description: {
      fieldId: 'description',
      formLabel: i18n.t('third_party.fields.description'),
      columnHeader: i18n.t('third_party.columns.description'),
      allowTargetConditions: true,
    },
    companyName: {
      fieldId: 'companyName',
      formLabel: i18n.t('third_party.fields.companyName'),
      columnHeader: i18n.t('third_party.columns.companyName'),
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    companiesHouseNumber: {
      fieldId: 'companiesHouseNumber',
      formLabel: i18n.t('third_party.fields.companiesHouseNumber'),
      columnHeader: i18n.t('third_party.columns.companiesHouseNumber'),
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    address: {
      fieldId: 'address',
      formLabel: i18n.t('third_party.fields.address'),
      columnHeader: i18n.t('third_party.columns.address'),
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    cityTown: {
      fieldId: 'cityTown',
      formLabel: i18n.t('third_party.fields.cityTown'),
      columnHeader: i18n.t('third_party.columns.cityTown'),
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    postcode: {
      fieldId: 'postcode',
      formLabel: i18n.t('third_party.fields.postcode'),
      columnHeader: i18n.t('third_party.columns.postcode'),
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    country: {
      fieldId: 'country',
      formLabel: i18n.t('third_party.fields.country'),
      columnHeader: i18n.t('third_party.columns.country'),
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    primaryContactName: {
      fieldId: 'primaryContactName',
      formLabel: i18n.t('third_party.fields.primaryContactName'),
      columnHeader: i18n.t('third_party.columns.primaryContactName'),
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    contactName: {
      fieldId: 'contactName',
      formLabel: i18n.t('third_party.fields.contactName'),
      columnHeader: i18n.t('third_party.columns.contactName'),
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    contactEmail: {
      fieldId: 'contactEmail',
      formLabel: i18n.t('third_party.fields.contactEmail'),
      columnHeader: i18n.t('third_party.columns.contactEmail'),
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    companyDomain: {
      fieldId: 'companyDomain',
      formLabel: i18n.t('third_party.fields.companyDomain'),
      columnHeader: i18n.t('third_party.columns.companyDomain'),
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    type: {
      fieldId: 'type',
      formLabel: i18n.t('third_party.fields.type'),
      columnHeader: i18n.t('columns.type'),
      displayType: { displayType: 'rating', ratingKey: 'third_party_type' },
      allowAsConditionSource: true,
    },
    status: {
      fieldId: 'status',
      formLabel: i18n.t('third_party.fields.status'),
      columnHeader: i18n.t('columns.status'),
      allowAsConditionSource: true,
      displayType: { displayType: 'rating', ratingKey: 'third_party_status' },
    },
    criticality: {
      fieldId: 'criticality',
      formLabel: i18n.t('third_party.fields.criticality'),
      columnHeader: i18n.t('third_party.columns.criticality'),
      displayType: {
        displayType: 'rating',
        ratingKey: 'third_party_criticality',
      },
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    Owners: {
      fieldId: 'Owners',
      formLabel: i18n.t('fields.Owner'),
      columnHeader: i18n.t('columns.owners'),
      displayType: {
        displayType: 'users',
        multiple: true,
      },
      allowAsConditionSource: true,
    },
    Contributors: {
      fieldId: 'Contributors',
      formLabel: i18n.t('fields.Contributor'),
      columnHeader: i18n.t('columns.contributors'),
      displayType: {
        displayType: 'users',
        multiple: true,
      },
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    tags: {
      fieldId: 'tags',
      formLabel: i18n.t('fields.Tags'),
      columnHeader: i18n.t('columns.tags'),
      displayType: {
        displayType: 'tags',
      },
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    departments: {
      fieldId: 'departments',
      formLabel: i18n.t('fields.Departments'),
      columnHeader: i18n.t('columns.departments'),
      displayType: {
        displayType: 'departments',
      },
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    files: {
      fieldId: 'files',
      formLabel: i18n.t('third_party.fields.newFiles'),
      allowTargetConditions: true,
    },
  } as const satisfies FormConfig;
};
