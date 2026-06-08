import Button from '@risk-smart/themed-cloudscape-components/button';
import Checkbox from '@risk-smart/themed-cloudscape-components/checkbox';
import Container from '@risk-smart/themed-cloudscape-components/container';
import ExpandableSection from '@risk-smart/themed-cloudscape-components/expandable-section';
import Header from '@risk-smart/themed-cloudscape-components/header';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import type { FC } from 'react';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { AllowedScope } from 'src/providers/ExternalApiProvider';

import type { ResourceScopes } from '../utils/scopeParser';
import { getAllReadScopes, getAllWriteScopes } from '../utils/scopeParser';

export interface ResourceSelection {
  resource: string;
  selectedScopes: string[];
}

interface Props {
  selection: ResourceSelection;
  resourceScopes: ResourceScopes;
  allScopes: AllowedScope[];
  onChange: (selection: ResourceSelection) => void;
  onRemove: () => void;
}

// Helper function to group scopes by action (excluding :read and :write)
const groupScopesByAction = (scopes: AllowedScope[]) => {
  const grouped: Record<string, AllowedScope> = {};
  scopes.forEach((scope) => {
    const action = scope.name.split(':')[1];
    // Exclude aggregate read and write scopes
    if (action !== 'read' && action !== 'write') {
      grouped[action] = scope;
    }
  });

  return grouped;
};

// Component to render horizontal action checkboxes
const ActionCheckboxes: FC<{
  scopesByAction: Record<string, AllowedScope>;
  isScopeSelected: (scopeName: string) => boolean;
  onToggle: (scopeName: string, checked: boolean) => void;
}> = ({ scopesByAction, isScopeSelected, onToggle }) => {
  // Define standard action order - always show these in this order
  const standardActions = ['list', 'get', 'create', 'update', 'delete'];

  return (
    <SpaceBetween direction={'horizontal'} size={'m'}>
      {standardActions.map((action) => {
        const scope = scopesByAction[action];
        const isDisabled = !scope;

        return (
          <Checkbox
            key={scope ? scope.name : action}
            checked={scope ? isScopeSelected(scope.name) : false}
            disabled={isDisabled}
            onChange={({ detail }) => {
              if (scope) {
                onToggle(scope.name, detail.checked);
              }
            }}
          >
            {action}
          </Checkbox>
        );
      })}
    </SpaceBetween>
  );
};

const ResourceActions: FC<Props> = ({
  selection,
  resourceScopes,
  allScopes,
  onChange,
  onRemove,
}) => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'externalApi.fields',
  });

  const isScopeSelected = useCallback(
    (scopeName: string) => selection.selectedScopes.includes(scopeName),
    [selection.selectedScopes]
  );

  const handleScopeToggle = useCallback(
    (scopeName: string, checked: boolean) => {
      const newScopes = checked
        ? [...selection.selectedScopes, scopeName]
        : selection.selectedScopes.filter((s) => s !== scopeName);

      onChange({
        ...selection,
        selectedScopes: newScopes,
      });
    },
    [selection, onChange]
  );

  const handleSelectAllRead = useCallback(() => {
    const readScopes = getAllReadScopes(selection.resource, allScopes);

    // Check if all read scopes are already selected
    const allReadSelected = readScopes.every((scope) =>
      selection.selectedScopes.includes(scope)
    );

    let newScopes: string[];
    if (allReadSelected) {
      // Remove all read scopes
      newScopes = selection.selectedScopes.filter(
        (scope) => !readScopes.includes(scope)
      );
    } else {
      // Add all read scopes
      newScopes = Array.from(
        new Set([...selection.selectedScopes, ...readScopes])
      );
    }

    onChange({
      ...selection,
      selectedScopes: newScopes,
    });
  }, [selection, allScopes, onChange]);

  const handleSelectAllWrite = useCallback(() => {
    const writeScopes = getAllWriteScopes(selection.resource, allScopes);

    // Check if all write scopes are already selected
    const allWriteSelected = writeScopes.every((scope) =>
      selection.selectedScopes.includes(scope)
    );

    let newScopes: string[];
    if (allWriteSelected) {
      // Remove all write scopes
      newScopes = selection.selectedScopes.filter(
        (scope) => !writeScopes.includes(scope)
      );
    } else {
      // Add all write scopes
      newScopes = Array.from(
        new Set([...selection.selectedScopes, ...writeScopes])
      );
    }

    onChange({
      ...selection,
      selectedScopes: newScopes,
    });
  }, [selection, allScopes, onChange]);

  const handleClearAll = useCallback(() => {
    onChange({
      ...selection,
      selectedScopes: [],
    });
  }, [selection, onChange]);

  // Group top-level scopes by action
  const topLevelScopesByAction = useMemo(
    () => groupScopesByAction(resourceScopes.topLevelScopes),
    [resourceScopes.topLevelScopes]
  );

  // Check if we have any nestedResource
  const hasNestedResource = useMemo(
    () => resourceScopes.subresourceGroups.length > 0,
    [resourceScopes.subresourceGroups]
  );

  // Check if all read scopes are selected
  const allReadSelected = useMemo(() => {
    const readScopes = getAllReadScopes(selection.resource, allScopes);

    return (
      readScopes.length > 0 &&
      readScopes.every((scope) => selection.selectedScopes.includes(scope))
    );
  }, [selection.resource, selection.selectedScopes, allScopes]);

  // Check if all write scopes are selected
  const allWriteSelected = useMemo(() => {
    const writeScopes = getAllWriteScopes(selection.resource, allScopes);

    return (
      writeScopes.length > 0 &&
      writeScopes.every((scope) => selection.selectedScopes.includes(scope))
    );
  }, [selection.resource, selection.selectedScopes, allScopes]);

  return (
    <div className={'my-3'}>
      <Container
        header={
          <Header
            variant={'h3'}
            actions={
              <Button
                variant={'icon'}
                iconName={'close'}
                onClick={onRemove}
                ariaLabel={t('remove_resource')}
              />
            }
          >
            {resourceScopes.displayName}
          </Header>
        }
      >
        <SpaceBetween size={'m'}>
          {/* Helper Buttons */}
          <SpaceBetween direction={'horizontal'} size={'xs'}>
            <Button
              variant={allReadSelected ? 'primary' : 'normal'}
              onClick={handleSelectAllRead}
              disabled={!resourceScopes.hasRead}
            >
              {t('select_all_read')}
            </Button>
            <Button
              variant={allWriteSelected ? 'primary' : 'normal'}
              onClick={handleSelectAllWrite}
              disabled={!resourceScopes.hasWrite}
            >
              {t('select_all_write')}
            </Button>
            <Button variant={'normal'} onClick={handleClearAll}>
              {t('clear_all')}
            </Button>
          </SpaceBetween>

          {/* Top-level Scopes - Horizontal Layout */}
          {Object.keys(topLevelScopesByAction).length > 0 && (
            <SpaceBetween direction={'horizontal'} size={'xs'}>
              <ActionCheckboxes
                scopesByAction={topLevelScopesByAction}
                isScopeSelected={isScopeSelected}
                onToggle={handleScopeToggle}
              />
            </SpaceBetween>
          )}

          {/* NestedResource Section */}
          {hasNestedResource && (
            <ExpandableSection
              headerText={t('nested_resources')}
              variant={'footer'}
            >
              <SpaceBetween size={'s'}>
                {resourceScopes.subresourceGroups.map((group) => {
                  const scopesByAction = groupScopesByAction(group.scopes);

                  return (
                    <div key={group.name}>
                      <Header variant={'h3'}>{group.displayName}</Header>
                      <ActionCheckboxes
                        scopesByAction={scopesByAction}
                        isScopeSelected={isScopeSelected}
                        onToggle={handleScopeToggle}
                      />
                    </div>
                  );
                })}
              </SpaceBetween>
            </ExpandableSection>
          )}
        </SpaceBetween>
      </Container>
    </div>
  );
};

export default ResourceActions;
