import { useQuery } from '@apollo/client';
import Badge from '@risk-smart/themed-cloudscape-components/badge';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import Spinner from '@risk-smart/themed-cloudscape-components/spinner';
import { GetIndicatorTitlesByParentIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';

type Props = {
  parentId: string;
};

const IndicatorPopoverContent: FC<Props> = ({ parentId }) => {
  const { data, loading } = useQuery(GetIndicatorTitlesByParentIdDocument, {
    variables: { parentId },
  });

  return (
    <SpaceBetween direction={'horizontal'} size={'xs'}>
      {loading && <Spinner size={'normal'} />}
      {data?.indicator?.map((indicator) => (
        <Badge key={indicator.Id}>{indicator.Title}</Badge>
      ))}
    </SpaceBetween>
  );
};

export default IndicatorPopoverContent;
