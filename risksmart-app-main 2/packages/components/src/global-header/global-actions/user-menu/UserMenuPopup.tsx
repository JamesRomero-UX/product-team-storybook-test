import type { FC } from 'react';

import { PopupContainer } from '../PopupContainer';
import { MenuActionsRow } from './MenuActionsRow';
import { OrganisationInfoRow } from './OrganisationInfoRow';
import { VersionInfoRow } from './VersionInfoRow';

interface Props {
  role: string | undefined;
  logoKey: string | undefined;
  customLogoUrl?: () => Promise<string>;
  logoutUrl: string;
  handleOrgSwitch: () => void;
}

const UserMenuPopup: FC<Props> = ({
  role,
  logoKey,
  customLogoUrl,
  logoutUrl,
  handleOrgSwitch,
}) => {
  return (
    <PopupContainer>
      <div className={'flex flex-col px-3'}>
        <OrganisationInfoRow
          organisation={role}
          logoKey={logoKey}
          customLogoUrl={customLogoUrl}
        />
        <MenuActionsRow
          logoutUrl={logoutUrl}
          handleOrgSwitch={handleOrgSwitch}
        />
        <VersionInfoRow />
      </div>
    </PopupContainer>
  );
};

export default UserMenuPopup;
