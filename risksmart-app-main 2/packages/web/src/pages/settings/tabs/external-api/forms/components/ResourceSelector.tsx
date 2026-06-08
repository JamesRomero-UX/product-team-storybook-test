import type { SelectProps } from '@risk-smart/themed-cloudscape-components/select';
import Select from '@risk-smart/themed-cloudscape-components/select';
import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { RESOURCE_DISPLAY_NAMES } from '../utils/scopeParser';

interface Props {
  availableResources: string[];
  selectedResources: string[];
  onAdd: (resource: string) => void;
}

const ResourceSelector: FC<Props> = ({
  availableResources,
  selectedResources,
  onAdd,
}) => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'externalApi.fields',
  });
  const [selectedOption, setSelectedOption] =
    useState<SelectProps.Option | null>(null);

  // Filter out already-selected resources
  const options = useMemo<SelectProps.Option[]>(() => {
    return availableResources
      .filter((resource) => !selectedResources.includes(resource))
      .map((resource) => ({
        label: RESOURCE_DISPLAY_NAMES[resource] || resource,
        value: resource,
      }));
  }, [availableResources, selectedResources]);

  const handleChange = ({ detail }: { detail: SelectProps.ChangeDetail }) => {
    if (detail.selectedOption) {
      setSelectedOption(detail.selectedOption);
      onAdd(detail.selectedOption.value!);
      // Clear selection after adding
      setSelectedOption(null);
    }
  };

  return (
    <Select
      selectedOption={selectedOption}
      onChange={handleChange}
      options={options}
      placeholder={t('select_resource')}
      empty={t('no_resources_available')}
      disabled={options.length === 0}
    />
  );
};

export default ResourceSelector;
