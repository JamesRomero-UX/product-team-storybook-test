import { useMutation } from '@apollo/client';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Alert from '@risk-smart/themed-cloudscape-components/alert';
import Icon from '@risk-smart/themed-cloudscape-components/icon';
import Input from '@risk-smart/themed-cloudscape-components/input';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import TextContent from '@risk-smart/themed-cloudscape-components/text-content';
import Toggle from '@risk-smart/themed-cloudscape-components/toggle';
import Button from '@risksmart-app/components/src/button/Button';
import Modal from '@risksmart-app/components/src/modal/Modal';
import type { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  UpdateOrganisationTabPreferencesDocument,
  UpdateUserTabPreferencesDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ObjectWithContributors } from 'src/rbac/Permission';

import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';
import useTabLabels from '@/hooks/useTabLabels';
import type { TabId } from '@/hooks/useTabPreferences';
import useTabPreferences from '@/hooks/useTabPreferences';
import useTabVisibility from '@/hooks/useTabVisibility';
import { evictField } from '@/utils/graphqlUtils';

import styles from './style.module.scss';

interface ListItem {
  id: string;
  label: string;
  enabled: boolean;
}

interface Props {
  isVisible: boolean;
  onDismiss: () => void;
  parentType?: Parent_Type_Enum;
  isOrgLevel?: boolean;
  parent?: ObjectWithContributors;
}

const TabItem: FC<
  ListItem & {
    toggleItem: (id: string) => void;
    renameTab: (id: string, newLabel: string) => void;
    isOrgLevel?: boolean;
  }
> = ({ id, label, enabled, toggleItem, renameTab, isOrgLevel }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
  });

  const rcsaWizardEnabled = useIsModuleEnabled('risk.subModules.rcsa_wizard');

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    cursor: 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      className={
        isDragging
          ? 'flex border-0 border-grey150 border-solid border-t-[0.5px] dragging !p-0'
          : 'flex border-0 border-grey150 border-solid border-t-[0.5px] !p-0 '
      }
      style={style}
      {...listeners}
      {...attributes}
    >
      <div>
        <Icon name={'drag-indicator'} />
      </div>
      <div className={'flex items-center justify-between w-full'}>
        <div className={'!text-left w-full'}>
          {!isOrgLevel && <div className={'!p-0 !m-0'}>{label}</div>}
          {isOrgLevel && (
            <div className={'!p-0 !m-0'}>
              <Input
                placeholder={'Display name'}
                value={label}
                onChange={(e) => renameTab(id, e.detail.value)}
                disabled={!isOrgLevel}
              />
            </div>
          )}
        </div>
        <Toggle
          checked={enabled}
          onChange={() => toggleItem(id)}
          ariaLabel={`Toggle ${label}`}
          disabled={
            id === 'details' ||
            // Prevent hiding tabs that are essential for the RCSA wizard
            (rcsaWizardEnabled && id === 'assessments') ||
            (rcsaWizardEnabled && id === 'controls')
          }
        />
      </div>
    </div>
  );
};

const TabSettingsModal: FC<Props> = ({
  isVisible,
  onDismiss,
  parentType,
  isOrgLevel,
  parent,
}) => {
  const [mutate] = useMutation(UpdateUserTabPreferencesDocument, {
    update: (cache) => {
      evictField(cache, 'user_tab_preference');
    },
  });
  const [mutateOrgLevel] = useMutation(
    UpdateOrganisationTabPreferencesDocument,
    {
      update: (cache) => {
        evictField(cache, 'organisation_tab_preference');
      },
    }
  );

  const { t } = useTranslation('common', { keyPrefix: 'modules' });
  const { tabs } = useTabPreferences(parentType, isOrgLevel);
  const tabVisibility = useTabVisibility(parent, parentType);
  const [items, setItems] = useState<ListItem[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const tabLabels = useTabLabels(parentType);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  useEffect(() => {
    if (!tabs) {
      return;
    }

    setItems(
      tabs
        ?.filter((tab) => tabVisibility[tab.id])
        ?.map((tab) => ({
          id: tab.id,
          label: tab.label || tabLabels[tab.id as TabId],
          enabled: !tab.hidden,
        })) || []
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs, tabVisibility]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
      setIsDirty(true);
    }
  };

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
    setIsDirty(true);
  };

  const renameTab = (id: string, newLabel: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, label: newLabel } : item))
    );
    setIsDirty(true);
  };

  const onSave = async () => {
    if (!parentType) {
      console.error('Attempted to save tab settings without parentType');

      return;
    }

    if (isOrgLevel) {
      await mutateOrgLevel({
        variables: {
          Preferences: {
            default: items.map((item) => ({
              id: item.id,
              hidden: !item.enabled,
              label: item.label,
            })),
          },
          ObjectType: parentType,
        },
      });
    } else {
      await mutate({
        variables: {
          Preferences: items.map((item) => ({
            id: item.id,
            hidden: !item.enabled,
          })),
          ObjectType: parentType,
        },
      });
    }

    setIsDirty(false);
    onDismiss();
  };

  return (
    <Modal
      visible={isVisible}
      onDismiss={onDismiss}
      header={'Tab Settings'}
      footer={
        <SpaceBetween direction={'horizontal'} size={'xs'} alignItems={'end'}>
          <Button variant={'primary'} onClick={onSave}>
            {'Save'}
          </Button>
          <Button onClick={onDismiss}>{'Cancel'}</Button>
        </SpaceBetween>
      }
    >
      <TextContent>
        <SpaceBetween direction={'vertical'} size={'s'}>
          <strong>{'Visible tabs'}</strong>
          {isDirty && isOrgLevel && (
            <Alert type={'warning'}>{t('alertMessage')}</Alert>
          )}
        </SpaceBetween>
      </TextContent>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className={styles.tabList}>
            {items.map((item) => (
              <TabItem
                key={item.id}
                toggleItem={toggleItem}
                renameTab={renameTab}
                isOrgLevel={isOrgLevel}
                {...item}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </Modal>
  );
};

export default TabSettingsModal;
