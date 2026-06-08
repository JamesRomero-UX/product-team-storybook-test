import Button from '@risk-smart/themed-cloudscape-components/button';
import type {
  ChannelTypes,
  PreferenceCategory,
  PreferencesChannel,
  PreferencesSet,
} from '@risksmart-app/shared/knock/schemas';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import NotificationChannelSwitchesRow from '@/components/notification-settings-modal/NotificationChannelSwitchesRow';
import style from '@/components/notification-settings-modal/style.module.scss';
import type { WorkflowTemplate } from '@/components/notification-settings-modal/util';

type Props = {
  category: PreferenceCategory;
  workflows: WorkflowTemplate[];
  channels: readonly PreferencesChannel[];
  disabledChannels: readonly PreferencesChannel[];
  collapsed?: boolean;
  onToggle?: (category: PreferenceCategory) => void;
};

export const CategorySwitchesSection = ({
  category,
  workflows,
  channels,
  disabledChannels,
  collapsed = false,
  onToggle,
}: Props) => {
  const { watch } = useFormContext<PreferencesSet>();
  const { t } = useTranslation(['common'], {
    keyPrefix: 'notification_settings.categories',
  });

  const categoryChannels: ChannelTypes = watch(
    `categories.${category}.channel_types`
  );
  const categoryRoot = watch(`categories.${category}` as const) as
    | { __strategy__?: string }
    | undefined;
  const categoryReadOnly = categoryRoot?.__strategy__ === 'replace';

  const disabledCategoryChannels = useMemo(() => {
    if (!categoryChannels) {
      return [];
    }

    return channels.filter((channel) => !(categoryChannels ?? {})[channel]);
  }, [categoryChannels, channels]);

  return (
    <>
      <NotificationChannelSwitchesRow
        label={t(category)}
        variant={'header'}
        channelTypes={channels}
        name={`categories.${category}.channel_types`}
        disabledChannels={disabledChannels}
        forceReadOnly={categoryReadOnly}
        labelNode={
          <div className={'flex items-center'}>
            <span
              className={'inline-block min-w-20 cursor-pointer select-none'}
              role={'button'}
              tabIndex={0}
              aria-expanded={!collapsed}
              aria-controls={`cat-${category}`}
              onClick={() => onToggle?.(category)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onToggle?.(category);
                }
              }}
            >
              {t(category)}
            </span>
            <Button
              variant={'link'}
              iconName={collapsed ? 'angle-down' : 'angle-up'}
              onClick={() => onToggle?.(category)}
              ariaLabel={
                (collapsed
                  ? t('expand', { defaultValue: 'Expand' })
                  : t('collapse', { defaultValue: 'Collapse' })) as string
              }
            />
          </div>
        }
      />
      {!collapsed &&
        workflows.map((workflow, i) => (
          <div key={workflow.key} className={i > 0 ? style.borderedRow : ''}>
            <NotificationChannelSwitchesRow
              label={workflow.label}
              channelTypes={channels}
              name={`workflows.${workflow.key}.channel_types`}
              disabledChannels={[
                ...disabledChannels,
                ...disabledCategoryChannels,
              ]}
            />
          </div>
        ))}
    </>
  );
};
