import { useQuery } from '@apollo/client';
import type { PropertyFilterOperatorFormProps } from '@cloudscape-design/collection-hooks';
import { GetUserSearchPreferencesDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectWithNumberSupport } from 'src/components/form/controlled-select/SelectWithNumberSupport';
import { useGroupAndUserOptions } from 'src/components/user-search-preferences/useGroupAndUserOptions';

export const UserSelectFilter: FC<PropertyFilterOperatorFormProps<string>> = ({
  onChange,
  value,
}) => {
  const { t } = useTranslation();
  const { data: userSearchPreferencesData } = useQuery(
    GetUserSearchPreferencesDocument
  );

  const userSearchPreferences =
    userSearchPreferencesData?.user_search_preferences?.[0];
  const { optionItems, statusType } = useGroupAndUserOptions({
    addEmptyOption: false,
    includeGroups: true,

    displayedAttributes: userSearchPreferences,
    hideGroups: !userSearchPreferences?.ShowGroups,
    // Ideally we would show the user preferences dialog, but was having issues with this inside the filter popover...
    // in some cases it'd close the browser to refresh, and in others it would just not open the dialog
    // So showing in active and archived users for now, and can revisit later
    hideInActiveUsers: false,
    hideArchivedUsers: false,
  });

  return (
    <SelectWithNumberSupport
      statusType={statusType}
      filteringType={'auto'}
      onChange={(e) => {
        onChange(e as string | null);
      }}
      options={optionItems}
      placeholder={t('select')}
      value={value}
      expandToViewport={true}
    />
  );
};
