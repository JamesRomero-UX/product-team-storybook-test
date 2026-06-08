import i18n from 'i18next';

import type { WidgetDataSource } from '../gigawidget/types';
import { dataSources } from './data-sources';
import type { GigawidgetDataSources, GigawidgetSettings } from './util';
import { getString } from './util';

export const settingsToTitle = <
  T extends keyof GigawidgetDataSources = keyof GigawidgetDataSources,
>(
  settings: Omit<GigawidgetSettings<T>, 'title'>
) => {
  const dataSource = dataSources[settings.dataSource] as WidgetDataSource;
  const categoryGetter = dataSource.categoryGetters.find(
    (getter) => getter.id === settings.categoryGetter
  );
  const subCategoryGetter = dataSource.categoryGetters.find(
    (getter) => getter.id === settings.subCategoryGetter
  );
  const entityNamePlural = i18n.format(
    i18n.t(dataSource.entityNamePlural),
    'capitalizeAll'
  );
  const entityNameSingular = i18n.format(
    i18n.t(dataSource.entityNameSingular),
    'capitalizeAll'
  );
  if (!categoryGetter) {
    return `${entityNamePlural}`;
  }

  if (subCategoryGetter) {
    return `${entityNamePlural} ${getString(
      subCategoryGetter.name
    )} by ${getString(categoryGetter.name)}`;
  }

  const translationKeys = i18n.t(dataSource.fields, { returnObjects: true });
  const aggregationFieldLabel =
    translationKeys[
      settings.aggregationField as keyof typeof translationKeys
    ] ?? settings.aggregationField;

  if (settings.aggregationType === 'sum') {
    return `Sum of ${entityNameSingular} ${aggregationFieldLabel} by ${getString(
      categoryGetter.name
    )}`;
  }
  if (settings.aggregationType === 'mean') {
    return `Mean of ${entityNameSingular} ${aggregationFieldLabel} by ${getString(
      categoryGetter.name
    )}`;
  }

  return `${entityNamePlural} by ${getString(categoryGetter.name)}`;
};
