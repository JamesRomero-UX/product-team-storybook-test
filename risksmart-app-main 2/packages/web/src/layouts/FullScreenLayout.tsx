import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { useChatSocketInitializer } from '@risksmart-app/components/src/stores/chat-socket/useChatSocketInitializer';
import { isUserInOrganization } from '@risksmart-app/components/src/utils/authUtils';
import type { FC, ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useModulesHydration } from 'src/context/moduleContext';
import { FeaturesProvider } from 'src/rbac/FeatureProvider';
import { PermissionsProvider } from 'src/rbac/PermissionProvider';

import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';
import { logoutUrl } from '@/utils/urls';

interface Props {
  children?: ReactNode | ReactNode[];
  title?: string;
}

const FullscreenLayout: FC<Props> = ({ children }) => {
  const { user } = useRisksmartUser();

  if (!isUserInOrganization(user)) {
    console.warn('User is not part of an organisation, logging out');

    return <Navigate to={logoutUrl()} />;
  }

  return (
    <FeaturesProvider>
      <FullscreenLayoutContent>{children}</FullscreenLayoutContent>
    </FeaturesProvider>
  );
};

const FullscreenLayoutContent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { getAccessTokenSilently, isAuthenticated } = useRisksmartUser();
  useModulesHydration();
  const isChatFeatureEnabled = useIsModuleEnabled('ai.subModules.chat');

  // Initialize chat socket connection
  useChatSocketInitializer({
    isAuthenticated,
    isChatFeatureEnabled,
    getAccessToken: getAccessTokenSilently,
  });

  return (
    <PermissionsProvider>
      <div className={'w-full h-full'}>{children}</div>
    </PermissionsProvider>
  );
};

export default FullscreenLayout;
