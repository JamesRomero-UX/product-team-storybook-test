import { PageNotFound } from '@risksmart-app/components/src/errors/errors';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import ControlledTabs from 'src/components/controlled-tabs/ControlledTabs';
import Loading from 'src/components/loading';
import { useGetDetailPath } from 'src/routes/useGetDetailParentPath';

import { useGetDocumentFileById } from '@/hooks/queries';
import useTabs from '@/hooks/useTabs';

import { PageLayout } from '../../../../../../layouts';

type Props = {
  activeTabId: 'attestations' | 'details';
};

const DocumentFileModal: FC<Props> = ({ activeTabId }) => {
  const documentFileId = useGetGuidParam('id');
  const parentUrl = useGetDetailPath(documentFileId);

  const { data: documentFileData, loading } = useGetDocumentFileById({
    queryArgs: { id: documentFileId },
    shouldSkip: !documentFileId,
  });

  const tabs = useTabs({
    parentType: Parent_Type_Enum.DocumentFile,
    parent: undefined,
    hrefRoot: parentUrl,
  });

  if (loading) {
    return (
      <PageLayout>
        <Loading />
      </PageLayout>
    );
  }

  if (documentFileData?.document_file.length === 0) {
    throw new PageNotFound(`Version with id ${documentFileId} not found`);
  }

  const entity = documentFileData?.document_file?.[0];
  const title = entity?.parent?.Title ? `${entity.parent.Title}` : 'Version';
  const counter = entity?.Version ? `(${entity.Version})` : '';

  return (
    <PageLayout title={title} counter={counter}>
      <ControlledTabs
        activeTabId={activeTabId}
        tabs={tabs}
        variant={'container'}
        parentType={Parent_Type_Enum.DocumentFile}
      />
    </PageLayout>
  );
};

export default DocumentFileModal;
