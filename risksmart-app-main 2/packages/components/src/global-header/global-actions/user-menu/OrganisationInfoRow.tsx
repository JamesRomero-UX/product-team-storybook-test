import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import OrganisationLogo from './OrganisationLogo';
import { UserInfo } from './UserInfo';
import UserMenuRow from './UserMenuRow';

interface OrganizationInfoRowProps {
  organisation: string | undefined;
  logoKey: string | undefined;
  customLogoUrl?: () => Promise<string>;
}

export const OrganisationInfoRow: FC<OrganizationInfoRowProps> = ({
  organisation,
  logoKey,
  customLogoUrl: _customLogoUrl,
}) => {
  const { t } = useTranslation(['common']);

  return (
    <UserMenuRow showSeparator={true} className={'flex items-center gap-4'}>
      {logoKey ? (
        <OrganisationLogo
          logoKey={logoKey}
          customLogoUrl={_customLogoUrl}
          size={'small'}
        />
      ) : (
        <div
          className={
            'size-8 rounded-full flex items-center justify-center bg-navy_light'
          }
        >
          <span className={'text-white font-bold text-sm'}>
            {organisation
              ?.split(' ')
              .map((name) => name[0])
              .join('')
              .toUpperCase()
              .slice(0, 2) || 'ORG'}
          </span>
        </div>
      )}

      <UserInfo primaryText={organisation} secondaryText={t('signedIn')} />
    </UserMenuRow>
  );
};
