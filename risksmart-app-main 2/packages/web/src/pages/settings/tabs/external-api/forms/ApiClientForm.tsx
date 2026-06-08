import Alert from '@risk-smart/themed-cloudscape-components/alert';
import Button from '@risk-smart/themed-cloudscape-components/button';
import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import Input from '@risk-smart/themed-cloudscape-components/input';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useExternalApi } from 'src/providers/ExternalApiProvider';

import type { ResourceSelection } from './components/ResourceActions';
import ResourceActions from './components/ResourceActions';
import ResourceSelector from './components/ResourceSelector';
import {
  getPrimaryResources,
  groupScopesByResource,
  parseScopeName,
} from './utils/scopeParser';

interface FormData {
  name: string;
  scopes: string[];
}

interface Props {
  formData: FormData;
  onChange: (data: FormData) => void;
}

const ApiClientForm: FC<Props> = ({ formData, onChange }) => {
  const { t } = useTranslation(['common'], { keyPrefix: 'externalApi.fields' });
  const { allowedScopes } = useExternalApi();

  // Group scopes by resource
  const groupedScopes = useMemo(
    () => groupScopesByResource(allowedScopes),
    [allowedScopes]
  );

  // Get primary resources from allowed scopes
  const primaryResources = useMemo(
    () => getPrimaryResources(allowedScopes),
    [allowedScopes]
  );

  // Internal state: resource selections
  const [resourceSelections, setResourceSelections] = useState<
    ResourceSelection[]
  >([]);
  const [isConfigureMode, setIsConfigureMode] = useState(false);

  // Initialize resource selections from formData.scopes on mount or when formData changes
  useEffect(() => {
    if (formData.scopes.length > 0) {
      // Check if using wildcard scopes
      const hasWildcards = formData.scopes.some((s) => s.startsWith('*:'));

      if (!hasWildcards) {
        // Not using wildcards, enable configure mode
        setIsConfigureMode(true);

        // Detect which resources are used
        const resourcesUsed = new Set<string>();
        formData.scopes.forEach((scopeName) => {
          const parsed = parseScopeName(scopeName);
          if (primaryResources.includes(parsed.resource)) {
            resourcesUsed.add(parsed.resource);
          }
        });

        // Build resource selections
        const selections: ResourceSelection[] = Array.from(resourcesUsed).map(
          (resource) => ({
            resource,
            selectedScopes: formData.scopes.filter((scopeName) => {
              const parsed = parseScopeName(scopeName);

              return parsed.resource === resource;
            }),
          })
        );

        setResourceSelections(selections);
      }
    }
  }, [primaryResources, formData.scopes]);

  const handleNameChange = (value: string) => {
    // Only allow letters, numbers, spaces, '.', and '-'
    const sanitized = value.replace(/[^a-zA-Z0-9\s.-]/g, '');
    // Enforce max length of 512 characters
    const truncated = sanitized.slice(0, 512);
    onChange({ ...formData, name: truncated });
  };

  const handleAddResource = (resource: string) => {
    setResourceSelections((prev) => [
      ...prev,
      { resource, selectedScopes: [] },
    ]);
  };

  const handleRemoveResource = (resource: string) => {
    const updated = resourceSelections.filter(
      (sel) => sel.resource !== resource
    );
    setResourceSelections(updated);

    // Update formData scopes
    const allScopes = updated.flatMap((sel) => sel.selectedScopes);
    onChange({ ...formData, scopes: allScopes });
  };

  const handleResourceChange = (selection: ResourceSelection) => {
    const updated = resourceSelections.map((sel) =>
      sel.resource === selection.resource ? selection : sel
    );
    setResourceSelections(updated);

    // Update formData scopes
    const allScopes = updated.flatMap((sel) => sel.selectedScopes);
    const uniqueScopes = Array.from(new Set(allScopes));
    onChange({ ...formData, scopes: uniqueScopes });
  };

  const handleReadAllResources = useCallback(() => {
    // Toggle wildcard read scope
    const hasReadWildcard = formData.scopes.includes('*:read');
    const hasWriteWildcard = formData.scopes.includes('*:write');

    if (hasReadWildcard) {
      // Remove *:read
      const newScopes = formData.scopes.filter((s) => s !== '*:read');
      onChange({ ...formData, scopes: newScopes });
    } else {
      // Add *:read, keep *:write if present
      const newScopes = hasWriteWildcard ? ['*:read', '*:write'] : ['*:read'];
      onChange({ ...formData, scopes: newScopes });
      // Clear configure mode and resource selections
      setIsConfigureMode(false);
      setResourceSelections([]);
    }
  }, [formData, onChange]);

  const handleWriteAllResources = useCallback(() => {
    // Toggle wildcard write scope
    const hasReadWildcard = formData.scopes.includes('*:read');
    const hasWriteWildcard = formData.scopes.includes('*:write');

    if (hasWriteWildcard) {
      // Remove *:write
      const newScopes = formData.scopes.filter((s) => s !== '*:write');
      onChange({ ...formData, scopes: newScopes });
    } else {
      // Add *:write, keep *:read if present
      const newScopes = hasReadWildcard ? ['*:read', '*:write'] : ['*:write'];
      onChange({ ...formData, scopes: newScopes });
      // Clear configure mode and resource selections
      setIsConfigureMode(false);
      setResourceSelections([]);
    }
  }, [formData, onChange]);

  const handleClearAllResources = useCallback(() => {
    setResourceSelections([]);
    setIsConfigureMode(false);
    onChange({ ...formData, scopes: [] });
  }, [formData, onChange]);

  const handleEnableConfigure = useCallback(() => {
    setIsConfigureMode(true);
    // Clear any wildcard scopes
    const nonWildcardScopes = formData.scopes.filter(
      (s) => !s.startsWith('*:')
    );
    onChange({ ...formData, scopes: nonWildcardScopes });
  }, [formData, onChange]);

  return (
    <SpaceBetween size={'l'}>
      <FormField label={t('name')} description={t('name_description')}>
        <Input
          value={formData.name}
          onChange={({ detail }) => handleNameChange(detail.value)}
          placeholder={t('name_placeholder')}
        />
      </FormField>

      <FormField label={t('scopes')} description={t('scopes_description')}>
        <SpaceBetween size={'m'}>
          {/* Global Quick Actions */}
          <SpaceBetween direction={'horizontal'} size={'xs'}>
            <Button
              variant={
                formData.scopes.includes('*:read') ? 'primary' : 'normal'
              }
              onClick={handleReadAllResources}
            >
              {t('read_all_resources')}
            </Button>
            <Button
              variant={
                formData.scopes.includes('*:write') ? 'primary' : 'normal'
              }
              onClick={handleWriteAllResources}
            >
              {t('write_all_resources')}
            </Button>
            <Button
              variant={isConfigureMode ? 'primary' : 'normal'}
              onClick={handleEnableConfigure}
            >
              {t('configure_custom')}
            </Button>
            <Button variant={'normal'} onClick={handleClearAllResources}>
              {t('clear_all_resources')}
            </Button>
          </SpaceBetween>

          {/* Show current scope mode */}
          {!isConfigureMode && formData.scopes.length > 0 ? (
            <Alert type={'info'}>
              {formData.scopes.includes('*:read') &&
              formData.scopes.includes('*:write')
                ? t('using_wildcard_both')
                : formData.scopes.includes('*:read')
                  ? t('using_wildcard_read')
                  : formData.scopes.includes('*:write')
                    ? t('using_wildcard_write')
                    : null}
            </Alert>
          ) : null}

          {/* Only show resource configuration when in configure mode */}
          {isConfigureMode ? (
            <>
              {/* Show ResourceSelector to add resources - placed at top for static positioning */}
              <FormField label={t('select_resource')}>
                <ResourceSelector
                  availableResources={primaryResources}
                  selectedResources={resourceSelections.map(
                    (sel) => sel.resource
                  )}
                  onAdd={handleAddResource}
                />
              </FormField>

              {/* Show ResourceActions for each selected resource */}
              {resourceSelections.map((selection) => (
                <ResourceActions
                  key={selection.resource}
                  selection={selection}
                  resourceScopes={groupedScopes[selection.resource]}
                  allScopes={allowedScopes}
                  onChange={handleResourceChange}
                  onRemove={() => handleRemoveResource(selection.resource)}
                />
              ))}
            </>
          ) : null}
        </SpaceBetween>
      </FormField>
    </SpaceBetween>
  );
};

export default ApiClientForm;
