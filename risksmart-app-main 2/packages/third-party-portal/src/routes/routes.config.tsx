import LoginPage from '@risksmart-app/components/src/auth-pages/Login';
import LogoutPage from '@risksmart-app/components/src/auth-pages/Logout';
import AccessDeniedPage from '@risksmart-app/components/src/error-pages/AccessDeniedPage';
import AuthErrorPage from '@risksmart-app/components/src/error-pages/AuthErrorPage';
import ErrorPage from '@risksmart-app/components/src/error-pages/ErrorPage';
import InvitationExpiredPage from '@risksmart-app/components/src/error-pages/InvitationExpiredPage';
import OrgNotFoundPage from '@risksmart-app/components/src/error-pages/OrgNotFoundPage';
import UserNotFoundPage from '@risksmart-app/components/src/error-pages/UserNotFoundPage';
import type { RouteObject } from 'react-router';
import Home from 'src/pages/home';
import Questionnaire from 'src/pages/questionnaire';
import Providers from 'src/providers/Providers';
import { ThirdPartyAuth0Context } from 'src/providers/ThirdPartyAuth0Context';

import { ProtectedLayout } from '../layouts';
import ProtectedErrorPage from '../pages/ProtectedErrorPage';
import { accessDeniedUrl, loginUrl, logoutUrl } from './urls';

const routes: RouteObject[] = [
  {
    element: <Providers />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: loginUrl(),
        element: <LoginPage authContext={ThirdPartyAuth0Context} />,
        handle: {
          title: 'Login',
        },
      },
      {
        children: [
          {
            path: '/error',
            element: <ErrorPage />,
            handle: {
              title: 'Error',
            },
          },
          {
            path: '/auth-error',
            element: <AuthErrorPage />,
          },
          {
            path: '/noorg',
            element: <OrgNotFoundPage />,
            handle: {
              title: 'No organisation found',
            },
          },
          {
            path: '/user-not-found',
            element: <UserNotFoundPage />,
            handle: {
              title: 'User not found',
            },
          },
          {
            path: '/invitation-expired',
            element: <InvitationExpiredPage />,
            handle: {
              title: 'Invitation expired',
            },
          },
          {
            path: accessDeniedUrl(),
            element: <AccessDeniedPage />,
            handle: {
              title: 'Access denied',
            },
          },
        ],
      },
      {
        path: logoutUrl(),
        element: (
          <LogoutPage
            loginUrl={() => loginUrl()}
            authContext={ThirdPartyAuth0Context}
          />
        ),
        handle: {
          title: 'Logout',
        },
      },
      {
        element: <ProtectedLayout />,
        path: '/',
        errorElement: <ErrorPage />,
        children: [
          {
            errorElement: <ProtectedErrorPage />,
            children: [
              {
                path: '/',
                element: <Home />,
              },
              {
                path: '/questionnaire/:id',
                element: <Questionnaire />,
              },
            ],
          },
          {
            path: '*',
            element: <div>{'Not Found'}</div>,
          },
        ],
      },
    ],
  },
];

export default routes;
