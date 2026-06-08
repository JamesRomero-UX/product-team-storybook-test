import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import ControlledTabs from 'src/components/controlled-tabs/ControlledTabs';

import useTabs from '@/hooks/useTabs';
import { policyDetailsUrl } from '@/utils/urls';

import { PageLayout } from '../../../../../../layouts';

const DocumentFileModal: FC = () => {
  const parentDocumentId = useGetGuidParam('documentId');
  const tabs = useTabs({
    parentType: Parent_Type_Enum.DocumentFile,
    parent: undefined,
    hrefRoot: policyDetailsUrl(parentDocumentId),
    disabled: true,
  });

  return (
    <PageLayout title={'Create Document Version'}>
      <ControlledTabs
        activeTabId={'details'}
        tabs={tabs}
        variant={'container'}
        parentType={Parent_Type_Enum.DocumentFile}
        disableSettings
      />
    </PageLayout>
  );
};

export default DocumentFileModal;
