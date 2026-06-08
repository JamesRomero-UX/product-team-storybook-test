import AccessDeniedPage from '@risksmart-app/components/src/error-pages/AccessDeniedPage';
import type { FC } from 'react';
import { AuthenticatedAppLayout } from 'src/layouts/AuthenticatedAppLayout';

interface Props {
  hideBackToHome?: boolean;
}

const Page: FC<Props> = ({ hideBackToHome }) => {
  return (
    <AuthenticatedAppLayout>
      <AccessDeniedPage hideBackToHome={hideBackToHome} />
    </AuthenticatedAppLayout>
  );
};

export default Page;
