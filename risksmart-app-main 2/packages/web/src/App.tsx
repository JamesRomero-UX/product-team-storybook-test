import '@cloudscape-design/global-styles/index.css';

import { wrapCreateBrowserRouterV7 } from '@sentry/react';
import { createBrowserRouter, RouterProvider } from 'react-router';

import routes from './routes/routes.config';

const sentryCreateBrowserRouter =
  wrapCreateBrowserRouterV7(createBrowserRouter);

const router = sentryCreateBrowserRouter(routes, {});

export const App = () => {
  return <RouterProvider router={router} />;
};
