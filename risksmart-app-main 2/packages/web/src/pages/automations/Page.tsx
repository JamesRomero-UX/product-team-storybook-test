import type { IntegrationCardLang } from '@risksmart-app/atomic-ui';
import {
  Alert,
  AlertDescription,
  AlertInfo,
  Button,
  Dialog,
  DialogClose,
  DialogTitle,
  Icon,
  IntegrationCard,
} from '@risksmart-app/atomic-ui';
import type { ModuleKey } from '@risksmart-app/modules/src/index';
import type { FC } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useModulesStore } from 'src/context/moduleContext';
import { PageLayout } from 'src/layouts';
import {
  ExternalApiProvider,
  useExternalApi,
} from 'src/providers/ExternalApiProvider';
import { useHasPermissionQuery } from 'src/rbac/useHasPermission';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

interface ActionConfig {
  labelKey: string;
  href?: string;
  isExternal?: boolean;
}

interface IntegrationConfig {
  key: string;
  iconUrl: string;
  moduleKey?: ModuleKey;
  actions: ActionConfig[];
  isComingSoon?: boolean;
}

const integrations: IntegrationConfig[] = [
  {
    key: 'zapier_self_managed',
    iconUrl: '/automations/zapier.svg',
    moduleKey: 'integrations.subModules.zapier_self_managed',
    actions: [
      {
        labelKey: 'create_zap',
        href: 'https://zapier.com/app/zaps',
        isExternal: true,
      },
      {
        labelKey: 'browse_apps',
        href: 'https://zapier.com/apps',
        isExternal: true,
      },
      { labelKey: 'manage_credentials', href: '/settings/external-api' },
    ],
  },
  {
    key: 'zapier_by_risksmart',
    iconUrl: '/automations/zapier.svg',
    moduleKey: 'integrations.subModules.zapier_by_risksmart',
    actions: [],
  },
  {
    key: 'mcp_server_integrations',
    iconUrl: '/automations/mcp.svg',
    moduleKey: 'integrations.subModules.mcp_server_integrations',
    actions: [],
  },
  {
    key: 'mcp_personal',
    iconUrl: '/automations/mcp.svg',
    moduleKey: 'integrations.subModules.mcp_personal',
    actions: [],
  },
  {
    key: 'rest_api',
    iconUrl: '/automations/rest-api.svg',
    moduleKey: 'integrations.subModules.rest_api',
    actions: [
      { labelKey: 'manage_credentials', href: '/settings/external-api' },
    ],
  },
  {
    key: 'slack',
    iconUrl: '/automations/slack.svg',
    actions: [],
    isComingSoon: true,
  },
];

const ActionButton: FC<{
  action: ActionConfig;
  label: string;
  isPrimary: boolean;
}> = ({ action, label, isPrimary }) => {
  const variant = isPrimary ? 'default' : 'neutral';
  const buttonStyle = isPrimary ? 'default' : 'outline';

  if (action.href) {
    return (
      <Button
        className={'no-underline'}
        variant={variant}
        style={buttonStyle}
        size={'md'}
        render={
          <a
            href={action.href}
            target={action.isExternal ? '_blank' : undefined}
            rel={action.isExternal ? 'noopener noreferrer' : undefined}
          />
        }
      >
        {label}
        {action.isExternal && <Icon name={'link-external-01'} size={'sm'} />}
      </Button>
    );
  }

  return (
    <DialogClose
      render={
        <Button variant={variant} style={buttonStyle} size={'md'}>
          {label}
        </Button>
      }
    />
  );
};

const IntegrationDialogCard: FC<{
  config: IntegrationConfig;
  cardLang: IntegrationCardLang;
  isModulesEnabled: boolean;
  hasManageCredentials: boolean;
  docsUrl?: string;
}> = ({
  config,
  cardLang,
  isModulesEnabled,
  hasManageCredentials,
  docsUrl,
}) => {
  const { t } = useTranslation('common');
  const prefix = `automations.cards.${config.key}`;
  const tk = (key: string) => t(`${prefix}.${key}` as never) as string;

  const isEnabled = useModulesStore(
    (s) =>
      !config.moduleKey ||
      !isModulesEnabled ||
      s.isModuleEnabled(config.moduleKey)
  );

  const card = (
    <IntegrationCard
      name={tk('name')}
      description={tk('description')}
      content={tk('content')}
      iconUrl={config.iconUrl}
      lang={cardLang}
      isDisabled={!isEnabled && !config.isComingSoon}
      isComingSoon={config.isComingSoon}
    />
  );

  if (!isEnabled || config.isComingSoon) {
    return card;
  }

  const allActions = [...config.actions].filter(
    (a) => a.labelKey !== 'manage_credentials' || hasManageCredentials
  );
  if (config.key === 'rest_api' && docsUrl) {
    allActions.push({
      labelKey: 'view_docs',
      href: docsUrl,
      isExternal: true,
    });
  }

  const showCredentialsNotice =
    !hasManageCredentials &&
    config.actions.some((a) => a.labelKey === 'manage_credentials');

  return (
    <Dialog trigger={card} size={'lg'}>
      <Dialog.Header>
        <div className={'flex items-center gap-2'}>
          <img
            src={config.iconUrl}
            alt={''}
            width={24}
            height={24}
            className={'shrink-0'}
          />
          <DialogTitle>{tk('modal_title')}</DialogTitle>
        </div>
      </Dialog.Header>
      <Dialog.Body>
        <div className={'flex flex-col gap-6'}>
          <p className={'text-base text-foreground/70'}>
            {tk('modal_description')}
          </p>
          <div className={'flex flex-col gap-2'}>
            <span className={'text-base font-medium text-foreground/70'}>
              {tk('features_title')}
            </span>
            <p className={'text-base text-foreground/60'}>
              {tk('features_description')}
            </p>
          </div>
          {showCredentialsNotice && (
            <Alert variant={'active'} size={'sm'}>
              <AlertInfo />
              <AlertDescription>
                {t('automations.credentials_contact_notice')}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </Dialog.Body>
      <Dialog.Footer>
        {allActions.map((action, index) => (
          <ActionButton
            key={action.labelKey}
            action={action}
            label={tk(action.labelKey)}
            isPrimary={index === 0}
          />
        ))}
      </Dialog.Footer>
    </Dialog>
  );
};

const AutomationsPageContent: FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'automations' });
  const isModulesEnabled = useIsFeatureFlagEnabled('modules');
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const { hasPermission: canViewExternalApi } = useHasPermissionQuery(
    'update:external_api'
  );
  const { docsUrl } = useExternalApi();

  const hasManageCredentials =
    canViewExternalApi && trpcEnabled && isModulesEnabled;

  const cardLang: IntegrationCardLang = useMemo(
    () => ({
      getStarted: t('get_started'),
      comingSoon: t('coming_soon'),
      earlyAccess: t('early_access'),
      contactMessage: t('contact_customer_success'),
    }),
    [t]
  );

  return (
    <PageLayout title={t('page_title')}>
      <div className={'grid grid-cols-3 gap-4'}>
        {integrations.map((config) => (
          <IntegrationDialogCard
            key={config.key}
            config={config}
            cardLang={cardLang}
            isModulesEnabled={isModulesEnabled}
            hasManageCredentials={hasManageCredentials}
            docsUrl={docsUrl ?? undefined}
          />
        ))}
      </div>
    </PageLayout>
  );
};

const Page: FC = () => {
  return (
    <ExternalApiProvider>
      <AutomationsPageContent />
    </ExternalApiProvider>
  );
};

export default Page;
