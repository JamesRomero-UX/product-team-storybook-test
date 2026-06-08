import Table from '@risksmart-app/components/src/table';
import type {
  GetAppetitesGroupedByImpactQuery,
  GetImpactRatingsQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { useGetCollectionStatelessTableProps } from 'src/pages/impacts/ratings/config';

import type { CollectionData } from '@/utils/collectionUtils';
import { assessmentResultsEditUrl } from '@/utils/urls';

type ImpactRating = CollectionData<
  GetImpactRatingsQuery['impact_rating'][number]
>;
type ImpactAppetites = CollectionData<
  GetAppetitesGroupedByImpactQuery['impact']
>;

interface Props {
  loading: boolean;
  assessmentId: string;
  records: ImpactRating[] | undefined;
  impactAppetites?: ImpactAppetites;
}

const SecondLineImpactRatingRegister: FC<Props> = ({
  loading,
  assessmentId,
  records,
  impactAppetites,
}) => {
  const navigate = useNavigate();
  const tableProps = useGetCollectionStatelessTableProps(
    records,
    impactAppetites,
    (item) => navigate(assessmentResultsEditUrl(assessmentId, item.Id))
  );

  return <Table variant={'embedded'} {...tableProps} loading={loading} />;
};

export default SecondLineImpactRatingRegister;
