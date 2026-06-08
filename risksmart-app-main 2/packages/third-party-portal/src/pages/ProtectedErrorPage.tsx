import ErrorPage from '@risksmart-app/components/src/error-pages/ErrorPage';
import type { FC } from 'react';
import { AuthenticatedAppLayout } from 'src/layouts/AuthenticatedAppLayout';

const Page: FC = () => {
  return (
    <AuthenticatedAppLayout>
      <ErrorPage />
    </AuthenticatedAppLayout>
  );
};

export default Page;
