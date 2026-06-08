import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import { Navigate } from 'react-router';

import { publicPolicyFileUrl } from '@/utils/urls';

const Page = () => {
  const fileId = useGetGuidParam('fileId');
  const documentId = useGetGuidParam('documentId');

  return <Navigate to={publicPolicyFileUrl(documentId, fileId)} replace />;
};

export default Page;
