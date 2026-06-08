import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import type { Document_File } from '@risksmart-app/web-graphql-client/derived-types';
import type { ChangeRequestPartsFragment } from '@risksmart-app/web-graphql-client/generated/graphql';
import { Approval_Status_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import SimpleRatingBadge from 'src/components/simple-rating-badge';

type Props = {
  item: Pick<Document_File, 'Status'>;
  changeRequests?: Pick<ChangeRequestPartsFragment, 'ChangeRequestStatus'>[];
};

const PolicyDocumentStatusBadge = ({ item, changeRequests }: Props) => {
  const { getByValue: getDocumentFileStatus } = useRating(
    'document_file_status'
  );

  const status = useMemo(() => {
    if (
      changeRequests?.some(
        (cr) => cr.ChangeRequestStatus === Approval_Status_Enum.Pending
      )
    ) {
      return 'pending_approval';
    }

    return item.Status;
  }, [item.Status, changeRequests]);

  const rating = useMemo(
    () => getDocumentFileStatus(status),
    [status, getDocumentFileStatus]
  );

  return <SimpleRatingBadge rating={rating} />;
};

export default PolicyDocumentStatusBadge;
