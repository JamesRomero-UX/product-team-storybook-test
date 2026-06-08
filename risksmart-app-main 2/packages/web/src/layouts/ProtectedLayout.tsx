import { withAuthenticationRequired } from '@auth0/auth0-react';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { useChatSocketInitializer } from '@risksmart-app/components/src/stores/chat-socket/useChatSocketInitializer';
import { isUserInOrganization } from '@risksmart-app/components/src/utils/authUtils';
import { Suspense } from 'react';
import { Navigate, Outlet, ScrollRestoration } from 'react-router';
import { MessagesRequester } from 'src/components/messages/MessageRequester';
import { MessagesProvider } from 'src/components/messages/MessagesProvider';
import { useModulesHydration } from 'src/context/moduleContext';
import { TaxonomyProvider } from 'src/providers/TaxonomyProvider';
import { FeaturesProvider } from 'src/rbac/FeatureProvider';
import { PermissionsProvider } from 'src/rbac/PermissionProvider';

import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';
import { logoutUrl } from '@/utils/urls';

import PageLayout from './PageLayout';

function ProtectedLayout() {
  const { user } = useRisksmartUser();

  if (!isUserInOrganization(user)) {
    console.warn('User is not part of an organisation, logging out');

    return <Navigate to={logoutUrl()} />;
  }

  return (
    <FeaturesProvider>
      <ProtectedLayoutContent />
    </FeaturesProvider>
  );
}

function ProtectedLayoutContent() {
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
      <TaxonomyProvider>
        <MessagesProvider>
          <MessagesRequester>
            <>
              <ScrollRestoration />
              <Suspense fallback={<PageLayout></PageLayout>}>
                <Outlet />
              </Suspense>
            </>
          </MessagesRequester>
        </MessagesProvider>
      </TaxonomyProvider>
    </PermissionsProvider>
  );
}
const ProtectedLayoutAuthRequired = withAuthenticationRequired(ProtectedLayout);

export default ProtectedLayoutAuthRequired;
